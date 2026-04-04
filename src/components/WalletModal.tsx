import { useState } from "react";
import { useWallet, EVM_CHAINS } from "@/contexts/WalletContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Wallet, ExternalLink, Copy, LogOut, ChevronDown, Check, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const walletOptions = [
  { name: "MetaMask", icon: "🦊", key: "metamask", action: "connectMetaMask" as const, tip: "Most popular EVM wallet. Works on desktop and mobile browsers." },
  { name: "Phantom", icon: "👻", key: "phantom", action: "connectGenericEVM" as const, providerKey: "isPhantom", tip: "Multi-chain wallet popular in Solana & EVM ecosystems." },
  { name: "Backpack", icon: "🎒", key: "backpack", action: "connectGenericEVM" as const, providerKey: "isBackpack", tip: "xNFT-powered wallet for Solana & EVM. Built for power users." },
  { name: "Coinbase Wallet", icon: "🔵", key: "coinbase", action: "connectCoinbase" as const, tip: "Coinbase's self-custody wallet. Great for beginners." },
  { name: "WalletConnect", icon: "🔗", key: "walletconnect", action: "connectWalletConnect" as const, tip: "Connect any mobile wallet by scanning a QR code." },
  { name: "Browser Wallet", icon: "🌐", key: "injected", action: "connectGenericEVM" as const, tip: "Use whatever wallet extension is installed in your browser." },
];

interface WalletModalProps {
  trigger?: React.ReactNode;
}

const WalletModal = ({ trigger }: WalletModalProps) => {
  const { isConnected, isConnecting, address, balance, chainId, shortAddress, disconnect, connectMetaMask, connectWalletConnect, connectCoinbase, connectGenericEVM, switchChain } = useWallet();
  const [open, setOpen] = useState(false);
  const [showChains, setShowChains] = useState(false);
  const { toast } = useToast();

  const handleConnect = async (wallet: typeof walletOptions[number]) => {
    try {
      if (wallet.action === "connectMetaMask") await connectMetaMask();
      else if (wallet.action === "connectCoinbase") await connectCoinbase();
      else if (wallet.action === "connectWalletConnect") await connectWalletConnect();
      else await connectGenericEVM((wallet as any).providerKey || "isMetaMask");
      setOpen(false);
      toast({ title: "🔗 Wallet Connected", description: "You're now connected." });
    } catch (err: any) {
      toast({ title: "Connection Failed", description: err.message, variant: "destructive" });
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({ title: "Copied!", description: "Wallet address copied to clipboard." });
    }
  };

  const currentChain = chainId ? EVM_CHAINS[chainId] : null;

  if (isConnected) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className="font-display border-primary/30 text-primary gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              {shortAddress}
              <ChevronDown className="w-3 h-3" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground tracking-wider">WALLET</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Address */}
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <p className="text-xs text-muted-foreground mb-1 font-display">ADDRESS</p>
              <div className="flex items-center gap-2">
                <code className="text-sm text-primary break-all flex-1">{address}</code>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copyAddress}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy address</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Balance + Chain */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <p className="text-[10px] text-muted-foreground font-display">BALANCE</p>
                <p className="font-display text-lg text-foreground">{balance} {currentChain?.symbol || "ETH"}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <p className="text-[10px] text-muted-foreground font-display">NETWORK</p>
                <p className="font-display text-sm text-accent">{currentChain?.name || `Chain ${chainId}`}</p>
              </div>
            </div>

            {/* Chain switcher */}
            <div>
              <Button variant="outline" size="sm" className="w-full text-xs font-display" onClick={() => setShowChains(!showChains)}>
                Switch Network <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showChains ? "rotate-180" : ""}`} />
              </Button>
              {showChains && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(EVM_CHAINS).map(([id, chain]) => (
                    <Button
                      key={id}
                      variant="ghost"
                      size="sm"
                      className={`text-xs justify-start font-display ${Number(id) === chainId ? "text-primary border border-primary/30" : "text-muted-foreground"}`}
                      onClick={() => { switchChain(Number(id)); setShowChains(false); }}
                    >
                      {Number(id) === chainId && <Check className="w-3 h-3 mr-1" />}
                      {chain.name}
                    </Button>
                  ))}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 p-2 text-[10px] text-muted-foreground">
                        <HelpCircle className="w-3 h-3" />
                        Solana coming soon
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Solana integration is being prepared for a future update.</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Disconnect */}
            <Button variant="destructive" size="sm" className="w-full font-display" onClick={() => { disconnect(); setOpen(false); }}>
              <LogOut className="w-3 h-3 mr-2" /> Disconnect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="font-display bg-primary text-primary-foreground box-glow-cyan gap-2">
            <Wallet className="w-4 h-4" /> Connect Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground tracking-wider">CONNECT WALLET</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Connect your EVM wallet to stake, earn rewards, and climb the leaderboard.
          </p>

          {walletOptions.map((w) => (
            <Tooltip key={w.key}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-14 font-display border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                  onClick={() => handleConnect(w)}
                  disabled={isConnecting}
                >
                  <span className="text-2xl">{w.icon}</span>
                  <span className="text-sm">{w.name}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">{w.tip}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          <div className="pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center">
              🔒 We never access your private keys. Connection is read-only until you approve a transaction.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
