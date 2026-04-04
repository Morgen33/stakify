import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner, formatEther } from "ethers";

type ChainType = "evm" | "solana";

interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  chainType: ChainType;
  isConnecting: boolean;
  isConnected: boolean;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

interface WalletContextType extends WalletState {
  connectMetaMask: () => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  connectCoinbase: () => Promise<void>;
  connectGenericEVM: (providerKey: string) => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
  shortAddress: string;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: null,
  chainId: null,
  chainType: "evm",
  isConnecting: false,
  isConnected: false,
  provider: null,
  signer: null,
  connectMetaMask: async () => {},
  connectWalletConnect: async () => {},
  connectCoinbase: async () => {},
  connectGenericEVM: async () => {},
  disconnect: () => {},
  switchChain: async () => {},
  shortAddress: "",
});

export const useWallet = () => useContext(WalletContext);

// Supported EVM chains
export const EVM_CHAINS: Record<number, { name: string; symbol: string; rpcUrl: string }> = {
  1: { name: "Ethereum", symbol: "ETH", rpcUrl: "https://eth.drpc.org" },
  137: { name: "Polygon", symbol: "MATIC", rpcUrl: "https://polygon-rpc.com" },
  56: { name: "BNB Chain", symbol: "BNB", rpcUrl: "https://bsc-dataseed.binance.org" },
  42161: { name: "Arbitrum", symbol: "ETH", rpcUrl: "https://arb1.arbitrum.io/rpc" },
  10: { name: "Optimism", symbol: "ETH", rpcUrl: "https://mainnet.optimism.io" },
  8453: { name: "Base", symbol: "ETH", rpcUrl: "https://mainnet.base.org" },
  43114: { name: "Avalanche", symbol: "AVAX", rpcUrl: "https://api.avax.network/ext/bc/C/rpc" },
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: null,
    chainId: null,
    chainType: "evm",
    isConnecting: false,
    isConnected: false,
    provider: null,
    signer: null,
  });

  const getEthereumProvider = (key?: string): any => {
    const win = window as any;
    if (key && win.ethereum?.providers) {
      return win.ethereum.providers.find((p: any) => p[key]) || win.ethereum;
    }
    return win.ethereum;
  };

  const connectEVM = useCallback(async (providerKey?: string) => {
    const ethereum = getEthereumProvider(providerKey);
    if (!ethereum) {
      throw new Error("No EVM wallet detected. Please install MetaMask or another wallet.");
    }
    setState(s => ({ ...s, isConnecting: true }));
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const balance = formatEther(await provider.getBalance(accounts[0]));
      
      setState({
        address: accounts[0],
        balance: parseFloat(balance).toFixed(4),
        chainId: Number(network.chainId),
        chainType: "evm",
        isConnecting: false,
        isConnected: true,
        provider,
        signer,
      });

      // Save to localStorage for reconnect
      localStorage.setItem("sf_wallet_connected", "true");
      localStorage.setItem("sf_wallet_provider", providerKey || "default");
    } catch (err: any) {
      setState(s => ({ ...s, isConnecting: false }));
      throw err;
    }
  }, []);

  const connectMetaMask = useCallback(() => connectEVM("isMetaMask"), [connectEVM]);
  const connectWalletConnect = useCallback(async () => {
    // WalletConnect v2 integration placeholder — requires project ID
    // For now, fallback to injected provider
    return connectEVM();
  }, [connectEVM]);
  const connectCoinbase = useCallback(() => connectEVM("isCoinbaseWallet"), [connectEVM]);
  const connectGenericEVM = useCallback((key: string) => connectEVM(key), [connectEVM]);

  const disconnect = useCallback(() => {
    setState({
      address: null, balance: null, chainId: null, chainType: "evm",
      isConnecting: false, isConnected: false, provider: null, signer: null,
    });
    localStorage.removeItem("sf_wallet_connected");
    localStorage.removeItem("sf_wallet_provider");
  }, []);

  const switchChain = useCallback(async (chainId: number) => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;
    const hex = "0x" + chainId.toString(16);
    try {
      await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hex }] });
    } catch (err: any) {
      if (err.code === 4902) {
        const chain = EVM_CHAINS[chainId];
        if (chain) {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId: hex, chainName: chain.name, rpcUrls: [chain.rpcUrl], nativeCurrency: { name: chain.symbol, symbol: chain.symbol, decimals: 18 } }],
          });
        }
      }
    }
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnect();
      else setState(s => ({ ...s, address: accounts[0] }));
    };
    const handleChainChanged = () => window.location.reload();

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  // Auto-reconnect on load
  useEffect(() => {
    const wasConnected = localStorage.getItem("sf_wallet_connected");
    const providerKey = localStorage.getItem("sf_wallet_provider");
    if (wasConnected === "true") {
      connectEVM(providerKey === "default" ? undefined : providerKey || undefined).catch(() => {});
    }
  }, [connectEVM]);

  const shortAddress = state.address
    ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
    : "";

  return (
    <WalletContext.Provider value={{
      ...state, connectMetaMask, connectWalletConnect, connectCoinbase,
      connectGenericEVM, disconnect, switchChain, shortAddress,
    }}>
      {children}
    </WalletContext.Provider>
  );
};
