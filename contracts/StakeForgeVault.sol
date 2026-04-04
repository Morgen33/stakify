// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StakeForgeVault
 * @notice NFT staking vault with tiered fee splitting.
 *
 *  Fee hierarchy (per stake/unstake action):
 *    1. Admin micro-fee  — fixed ~$0.12 USDC equivalent in ETH, sent to adminWallet
 *    2. Operator fee %   — percentage of rewards, sent to operatorWallet
 *    3. Project fee %    — percentage of rewards, kept in project pool
 *
 *  Emergency controls:
 *    - ADMIN_ROLE can force-unlock any stake
 *    - ADMIN_ROLE can pause the entire contract
 *    - ADMIN_ROLE can swap wallets instantly
 *
 *  ⚠️  THIS CONTRACT MUST BE PROFESSIONALLY AUDITED BEFORE MAINNET DEPLOYMENT.
 */
contract StakeForgeVault is IERC721Receiver, AccessControl, ReentrancyGuard, Pausable {

    // ──────────────────────────── Roles ────────────────────────────
    bytes32 public constant ADMIN_ROLE   = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant PROJECT_ROLE  = keccak256("PROJECT_ROLE");

    // ──────────────────────────── Structs ──────────────────────────
    enum StakeMode { SOFT, HARD, FLEXIBLE }

    struct StakeInfo {
        address owner;
        address nftContract;
        uint256 tokenId;
        StakeMode mode;
        uint256 stakedAt;
        uint256 unlockAt;       // 0 for soft stakes
        uint256 poolId;
        bool    active;
    }

    struct Pool {
        address nftContract;
        uint256 apyBps;         // basis points (4500 = 45%)
        uint256 lockPeriod;     // seconds
        uint256 operatorFeeBps; // basis points
        uint256 projectFeeBps;  // basis points
        bool    active;
        string  name;
    }

    // ──────────────────────────── State ────────────────────────────
    address payable public adminWallet;
    address payable public adminBackupWallet;
    address payable public operatorWallet;

    uint256 public adminMicroFeeWei;            // ~$0.12 in ETH wei — updatable

    mapping(uint256 => Pool)      public pools;
    uint256 public poolCount;

    mapping(bytes32 => StakeInfo) public stakes; // keccak256(nftContract, tokenId) → StakeInfo
    mapping(address => uint256)   public userStakeCount;

    // ──────────────────────────── Events ───────────────────────────
    event Staked(address indexed user, address indexed nftContract, uint256 tokenId, uint256 poolId, StakeMode mode, uint256 unlockAt);
    event Unstaked(address indexed user, address indexed nftContract, uint256 tokenId, uint256 poolId);
    event EmergencyUnlock(address indexed admin, address indexed nftContract, uint256 tokenId);
    event PoolCreated(uint256 indexed poolId, string name, address nftContract);
    event PoolUpdated(uint256 indexed poolId);
    event AdminWalletChanged(address indexed oldWallet, address indexed newWallet);
    event EmergencyWalletSwitch(address indexed newWallet);
    event MicroFeeUpdated(uint256 oldFee, uint256 newFee);

    // ──────────────────────────── Constructor ─────────────────────
    constructor(
        address payable _adminWallet,
        address payable _adminBackupWallet,
        address payable _operatorWallet,
        uint256 _adminMicroFeeWei
    ) {
        require(_adminWallet      != address(0), "Zero admin wallet");
        require(_operatorWallet   != address(0), "Zero operator wallet");

        adminWallet       = _adminWallet;
        adminBackupWallet = _adminBackupWallet;
        operatorWallet    = _operatorWallet;
        adminMicroFeeWei  = _adminMicroFeeWei;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // ═══════════════════════════ STAKING ═══════════════════════════

    /**
     * @notice Stake an NFT into a pool. Caller must approve this contract first.
     * @param poolId  The pool to stake into
     * @param tokenId The NFT token ID
     * @param mode    0 = SOFT, 1 = HARD, 2 = FLEXIBLE
     * @param customLockSeconds  Only used when mode == FLEXIBLE
     */
    function stake(
        uint256 poolId,
        uint256 tokenId,
        StakeMode mode,
        uint256 customLockSeconds
    ) external payable nonReentrant whenNotPaused {
        Pool storage pool = pools[poolId];
        require(pool.active, "Pool inactive");
        require(msg.value >= adminMicroFeeWei, "Insufficient micro-fee");

        // Transfer micro-fee to admin
        _sendETH(adminWallet, adminMicroFeeWei);

        // Refund excess
        if (msg.value > adminMicroFeeWei) {
            _sendETH(payable(msg.sender), msg.value - adminMicroFeeWei);
        }

        // Transfer NFT to vault
        IERC721(pool.nftContract).safeTransferFrom(msg.sender, address(this), tokenId);

        uint256 unlockAt = 0;
        if (mode == StakeMode.HARD) {
            unlockAt = block.timestamp + pool.lockPeriod;
        } else if (mode == StakeMode.FLEXIBLE) {
            require(customLockSeconds > 0, "Custom lock required");
            unlockAt = block.timestamp + customLockSeconds;
        }
        // SOFT: unlockAt stays 0 (can unstake anytime)

        bytes32 key = _stakeKey(pool.nftContract, tokenId);
        require(!stakes[key].active, "Already staked");

        stakes[key] = StakeInfo({
            owner: msg.sender,
            nftContract: pool.nftContract,
            tokenId: tokenId,
            mode: mode,
            stakedAt: block.timestamp,
            unlockAt: unlockAt,
            poolId: poolId,
            active: true
        });

        userStakeCount[msg.sender]++;

        emit Staked(msg.sender, pool.nftContract, tokenId, poolId, mode, unlockAt);
    }

    /**
     * @notice Unstake an NFT and reclaim it.
     */
    function unstake(
        address nftContract,
        uint256 tokenId
    ) external payable nonReentrant whenNotPaused {
        bytes32 key = _stakeKey(nftContract, tokenId);
        StakeInfo storage info = stakes[key];

        require(info.active, "Not staked");
        require(info.owner == msg.sender, "Not your stake");
        require(msg.value >= adminMicroFeeWei, "Insufficient micro-fee");

        // For HARD / FLEXIBLE stakes, enforce lock period
        if (info.mode != StakeMode.SOFT) {
            require(block.timestamp >= info.unlockAt, "Still locked");
        }

        // Transfer micro-fee
        _sendETH(adminWallet, adminMicroFeeWei);
        if (msg.value > adminMicroFeeWei) {
            _sendETH(payable(msg.sender), msg.value - adminMicroFeeWei);
        }

        // Return NFT
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);

        info.active = false;
        userStakeCount[msg.sender]--;

        emit Unstaked(msg.sender, nftContract, tokenId, info.poolId);
    }

    // ═══════════════════════ ADMIN FUNCTIONS ═══════════════════════

    function createPool(
        address nftContract,
        string calldata name,
        uint256 apyBps,
        uint256 lockPeriodSeconds,
        uint256 operatorFeeBps,
        uint256 projectFeeBps
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(nftContract != address(0), "Zero NFT address");
        uint256 id = poolCount++;
        pools[id] = Pool({
            nftContract: nftContract,
            apyBps: apyBps,
            lockPeriod: lockPeriodSeconds,
            operatorFeeBps: operatorFeeBps,
            projectFeeBps: projectFeeBps,
            active: true,
            name: name
        });
        emit PoolCreated(id, name, nftContract);
        return id;
    }

    function updatePool(
        uint256 poolId,
        uint256 apyBps,
        uint256 lockPeriodSeconds,
        uint256 operatorFeeBps,
        uint256 projectFeeBps,
        bool active
    ) external onlyRole(ADMIN_ROLE) {
        Pool storage pool = pools[poolId];
        pool.apyBps = apyBps;
        pool.lockPeriod = lockPeriodSeconds;
        pool.operatorFeeBps = operatorFeeBps;
        pool.projectFeeBps = projectFeeBps;
        pool.active = active;
        emit PoolUpdated(poolId);
    }

    /**
     * @notice Emergency: force-unlock ANY stake (e.g., project rugged)
     */
    function emergencyUnlock(
        address nftContract,
        uint256 tokenId
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        bytes32 key = _stakeKey(nftContract, tokenId);
        StakeInfo storage info = stakes[key];
        require(info.active, "Not staked");

        IERC721(nftContract).safeTransferFrom(address(this), info.owner, tokenId);
        info.active = false;
        userStakeCount[info.owner]--;

        emit EmergencyUnlock(msg.sender, nftContract, tokenId);
    }

    /**
     * @notice Emergency: bulk unlock all stakes for a given NFT contract (rug protection)
     */
    function emergencyUnlockBulk(
        address nftContract,
        uint256[] calldata tokenIds
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            bytes32 key = _stakeKey(nftContract, tokenIds[i]);
            StakeInfo storage info = stakes[key];
            if (info.active) {
                IERC721(nftContract).safeTransferFrom(address(this), info.owner, tokenIds[i]);
                info.active = false;
                userStakeCount[info.owner]--;
                emit EmergencyUnlock(msg.sender, nftContract, tokenIds[i]);
            }
        }
    }

    // ═══════════════════════ WALLET MANAGEMENT ════════════════════

    function setAdminWallet(address payable newWallet) external onlyRole(ADMIN_ROLE) {
        require(newWallet != address(0), "Zero address");
        emit AdminWalletChanged(adminWallet, newWallet);
        adminWallet = newWallet;
    }

    function setAdminBackupWallet(address payable newWallet) external onlyRole(ADMIN_ROLE) {
        adminBackupWallet = newWallet;
    }

    /**
     * @notice Emergency: instantly redirect all fees to backup wallet
     */
    function emergencyWalletSwitch() external onlyRole(ADMIN_ROLE) {
        require(adminBackupWallet != address(0), "No backup set");
        adminWallet = adminBackupWallet;
        emit EmergencyWalletSwitch(adminBackupWallet);
    }

    function setOperatorWallet(address payable newWallet) external onlyRole(ADMIN_ROLE) {
        require(newWallet != address(0), "Zero address");
        operatorWallet = newWallet;
    }

    function setAdminMicroFee(uint256 newFeeWei) external onlyRole(ADMIN_ROLE) {
        emit MicroFeeUpdated(adminMicroFeeWei, newFeeWei);
        adminMicroFeeWei = newFeeWei;
    }

    // ═══════════════════════ PAUSABLE ═════════════════════════════

    function pause()   external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    // ═══════════════════════ INTERNALS ════════════════════════════

    function _stakeKey(address nftContract, uint256 tokenId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(nftContract, tokenId));
    }

    function _sendETH(address payable to, uint256 amount) internal {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH transfer failed");
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
