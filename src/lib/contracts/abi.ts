// StakeForgeVault ABI — generated from contracts/StakeForgeVault.sol
// Update this after compiling with Hardhat

export const STAKEFORGE_VAULT_ABI = [
  // ──────── Read Functions ────────
  "function adminWallet() view returns (address)",
  "function adminBackupWallet() view returns (address)",
  "function operatorWallet() view returns (address)",
  "function adminMicroFeeWei() view returns (uint256)",
  "function poolCount() view returns (uint256)",
  "function pools(uint256) view returns (address nftContract, uint256 apyBps, uint256 lockPeriod, uint256 operatorFeeBps, uint256 projectFeeBps, bool active, string name)",
  "function stakes(bytes32) view returns (address owner, address nftContract, uint256 tokenId, uint8 mode, uint256 stakedAt, uint256 unlockAt, uint256 poolId, bool active)",
  "function userStakeCount(address) view returns (uint256)",
  "function paused() view returns (bool)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function ADMIN_ROLE() view returns (bytes32)",
  "function OPERATOR_ROLE() view returns (bytes32)",
  "function PROJECT_ROLE() view returns (bytes32)",

  // ──────── Write Functions ────────
  "function stake(uint256 poolId, uint256 tokenId, uint8 mode, uint256 customLockSeconds) payable",
  "function unstake(address nftContract, uint256 tokenId) payable",
  "function createPool(address nftContract, string name, uint256 apyBps, uint256 lockPeriodSeconds, uint256 operatorFeeBps, uint256 projectFeeBps) returns (uint256)",
  "function updatePool(uint256 poolId, uint256 apyBps, uint256 lockPeriodSeconds, uint256 operatorFeeBps, uint256 projectFeeBps, bool active)",
  "function emergencyUnlock(address nftContract, uint256 tokenId)",
  "function emergencyUnlockBulk(address nftContract, uint256[] tokenIds)",
  "function setAdminWallet(address newWallet)",
  "function setAdminBackupWallet(address newWallet)",
  "function emergencyWalletSwitch()",
  "function setOperatorWallet(address newWallet)",
  "function setAdminMicroFee(uint256 newFeeWei)",
  "function pause()",
  "function unpause()",
  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",

  // ──────── Events ────────
  "event Staked(address indexed user, address indexed nftContract, uint256 tokenId, uint256 poolId, uint8 mode, uint256 unlockAt)",
  "event Unstaked(address indexed user, address indexed nftContract, uint256 tokenId, uint256 poolId)",
  "event EmergencyUnlock(address indexed admin, address indexed nftContract, uint256 tokenId)",
  "event PoolCreated(uint256 indexed poolId, string name, address nftContract)",
  "event PoolUpdated(uint256 indexed poolId)",
  "event AdminWalletChanged(address indexed oldWallet, address indexed newWallet)",
  "event EmergencyWalletSwitch(address indexed newWallet)",
  "event MicroFeeUpdated(uint256 oldFee, uint256 newFee)",
] as const;

// ERC-721 ABI (minimal — for approve + balanceOf)
export const ERC721_ABI = [
  "function approve(address to, uint256 tokenId)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
] as const;
