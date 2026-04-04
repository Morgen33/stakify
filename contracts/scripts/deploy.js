// Hardhat deployment script for StakeForgeVault
// Usage: npx hardhat run scripts/deploy.js --network sepolia

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // ═══════════════════════════════════════════════
  // CONFIGURE THESE BEFORE DEPLOYING
  // ═══════════════════════════════════════════════

  const ADMIN_WALLET        = deployer.address;           // Your wallet — receives $0.12 micro-fee
  const ADMIN_BACKUP_WALLET = deployer.address;           // Emergency backup wallet
  const OPERATOR_WALLET     = deployer.address;           // Your employer's wallet

  // $0.12 in ETH at ~$3800/ETH ≈ 0.0000316 ETH ≈ 31578947368421 wei
  // This should be updated via the contract's setAdminMicroFee() or via the price feed
  const MICRO_FEE_WEI = ethers.parseUnits("0.0000316", "ether");

  // ═══════════════════════════════════════════════

  console.log("\nDeploying StakeForgeVault...");
  console.log("  Admin wallet:", ADMIN_WALLET);
  console.log("  Backup wallet:", ADMIN_BACKUP_WALLET);
  console.log("  Operator wallet:", OPERATOR_WALLET);
  console.log("  Micro-fee:", ethers.formatEther(MICRO_FEE_WEI), "ETH");

  const StakeForgeVault = await ethers.getContractFactory("StakeForgeVault");
  const vault = await StakeForgeVault.deploy(
    ADMIN_WALLET,
    ADMIN_BACKUP_WALLET,
    OPERATOR_WALLET,
    MICRO_FEE_WEI
  );

  await vault.waitForDeployment();
  const address = await vault.getAddress();

  console.log("\n✅ StakeForgeVault deployed to:", address);
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Copy this address into src/lib/contracts/config.ts");
  console.log("2. Verify on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${address} ${ADMIN_WALLET} ${ADMIN_BACKUP_WALLET} ${OPERATOR_WALLET} ${MICRO_FEE_WEI}`);
  console.log("3. Test staking flow end-to-end on testnet");
  console.log("4. GET A PROFESSIONAL AUDIT before mainnet");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
