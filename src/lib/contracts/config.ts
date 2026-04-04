/**
 * Contract deployment addresses.
 *
 * ⚠️  UPDATE THESE after deploying contracts via Hardhat.
 *     The "sepolia" addresses are for testing; "mainnet" for production.
 */
export const CONTRACT_ADDRESSES: Record<number, { vault: string }> = {
  // Sepolia testnet — deploy here first!
  11155111: {
    vault: "0x0000000000000000000000000000000000000000", // ← Replace after deploy
  },
  // Ethereum mainnet — only after audit
  1: {
    vault: "0x0000000000000000000000000000000000000000", // ← Replace after deploy
  },
  // Polygon
  137: {
    vault: "0x0000000000000000000000000000000000000000",
  },
  // Base
  8453: {
    vault: "0x0000000000000000000000000000000000000000",
  },
  // Arbitrum
  42161: {
    vault: "0x0000000000000000000000000000000000000000",
  },
};

/**
 * Whether we're in testnet mode.
 * When true, the UI will show testnet badges and warnings.
 */
export const IS_TESTNET = true; // ← Set to false for production

/**
 * Default chain to prompt users to connect to
 */
export const DEFAULT_CHAIN_ID = IS_TESTNET ? 11155111 : 1;

/**
 * Sepolia testnet chain config for wallet_addEthereumChain
 */
export const SEPOLIA_CHAIN = {
  chainId: "0xaa36a7",
  chainName: "Sepolia Testnet",
  rpcUrls: ["https://rpc.sepolia.org"],
  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

export function getVaultAddress(chainId: number): string | null {
  const addr = CONTRACT_ADDRESSES[chainId]?.vault;
  if (!addr || addr === "0x0000000000000000000000000000000000000000") return null;
  return addr;
}
