import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet, EVM_CHAINS } from "@/contexts/WalletContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Wallet, ExternalLink, Copy, LogOut, ChevronDown, Check, HelpCircle, Sparkles, Zap, Trophy, Gift, ArrowRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const walletOptions = [
  { name: "MetaMask", icon: "🦊", key: "metamask", action: "connectMetaMask" as const, tip: "Most popular EVM wallet. Works on desktop and mobile browsers." },
  { name: "Phantom", icon: "👻", key: "phantom", action: "connectGenericEVM" as const, providerKey: "isPhantom", tip: "Multi-chain wallet popular in Solana & EVM ecosystems." },
  { name: "Backpack", icon: "🎒", key: "backpack", action: "connectGenericEVM" as const, providerKey: "isBackpack", tip: "xNFT-powered wallet for Solana & EVM. Built for power users." },
  { name: "Coinbase Wallet", icon: "🔵", key: "coinbase", action: "connectCoinbase" as const, tip: "Coinbase's self-custody wallet. Great for beginners." },
  { name: "WalletConnect", icon: "🔗", key: "walletconnect", action: "connectWalletConnect" as const, tip: "Connect any mobile wallet by scanning a QR code." },
  { name: "Browser Wallet", icon: "🌐", key: "injected", action: "connectGenericEVM" as const, tip: "Use whatever wallet extension is installed in your browser." },
];

const teaserFeatures = [
  { icon: Zap, label: "Stake & Earn", desc: "Dual rewards on every stake" },
  { icon: Trophy, label: "Leaderboard", desc: "Compete for the top" },
  { icon: Gift, label: "Airdrops", desc: "Claim rewards from projects" },
  { icon: Sparkles, label: "Hondro Points", desc: "Earn across all platforms" },
];

interface WalletModalProps {
  trigger?: React.ReactNode;
  redirectAfterConnect?: string | false;
}

const WalletModal = ({ trigger, redirectAfterConnect = "/hub" }: WalletModalProps) => {
  const { isConnected, isConnecting, address, balance, chainId, shortAddress, disconnect, connectMetaMask, connectWalletConnect, connectCoinbase, connectGenericEVM, switchChain } = useWallet();
  const [open, setOpen] = useState(false);
  const [showChains, setShowChains] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleConnect = async (wallet: typeof walletOptions[number]) => {
    try {
      if (wallet.action === "connectMetaMask") await connectMetaMask();
      else if (wallet.action === "connectCoinbase") await connectCoinbase();
      else if (wallet.action === "connectWalletConnect") await connectWalletConnect();
      else await connectGenericEVM((wallet as any).providerKey || "isMetaMask");
      toast({ title: "🔗 Wallet Connected", description: "You're now connected." });
      setShowSignup(true);
    } catch (err: any) {
      toast({ title: "Connection Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleSignupComplete = () => {
    if (displayName.trim()) {
      localStorage.setItem("sf_display_name", displayName.trim());
    }
    setShowSignup(false);
    setOpen(false);
    if (redirectAfterConnect) navigate(redirectAfterConnect);
  };

  const handleSkipSignup = () => {
    setShowSignup(false);
    setOpen(false);
    if (redirectAfterConnect) navigate(redirectAfterConnect);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({ title: "Copied!", description: "Wallet address copied to clipboard." });
    }
  };

  const currentChain = chainId ? EVM_CHAINS[chainId] : null;

  if (isConnected && !showSignup) {
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

            {/* Quick link to Hub */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-display border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => { setOpen(false); navigate("/hub"); }}
            >
              <Zap className="w-3 h-3 mr-1.5" /> Go to Staking Hub
            </Button>

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

            <Button variant="destructive" size="sm" className="w-full font-display" onClick={() => { disconnect(); setOpen(false); }}>
              <LogOut className="w-3 h-3 mr-2" /> Disconnect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setShowSignup(false); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="font-display bg-primary text-primary-foreground box-glow-cyan gap-2">
            <Wallet className="w-4 h-4" /> Connect Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <AnimatePresence mode="wait">
          {showSignup ? (
            /* ── Quick Signup After Connect ── */
            <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <DialogHeader>
                <DialogTitle className="font-display text-foreground tracking-wider">WELCOME TO STAKEFORGE</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                  <span className="w-2 h-2 rounded-full bg-neon-green inline-block animate-pulse mr-2" />
                  <span className="text-sm text-primary font-display">{shortAddress}</span>
                  <p className="text-[10px] text-muted-foreground mt-1">Wallet connected successfully</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground font-display">CHOOSE A DISPLAY NAME</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. DiamondHands69"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10 bg-secondary border-border"
                      maxLength={30}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Optional — you can change this later in your hub settings</p>
                </div>

                <Button onClick={handleSignupComplete} className="w-full bg-primary text-primary-foreground font-display box-glow-cyan gap-2">
                  Enter Staking Hub <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" onClick={handleSkipSignup} className="w-full text-xs text-muted-foreground font-display">
                  Skip for now
                </Button>
              </div>
            </motion.div>
          ) : (
            /* ── Wallet Selection with Teasers ── */
            <motion.div key="connect" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <DialogHeader>
                <DialogTitle className="font-display text-foreground tracking-wider">CONNECT WALLET</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Teasers */}
                <div className="grid grid-cols-2 gap-2">
                  {teaserFeatures.map((f) => (
                    <div key={f.label} className="rounded-lg border border-border bg-secondary/30 p-2.5 flex items-center gap-2">
                      <f.icon className="w-4 h-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-display text-foreground">{f.label}</p>
                        <p className="text-[8px] text-muted-foreground">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Connect your EVM wallet to access your Staking Hub.
                  </p>

                  {walletOptions.map((w) => (
                    <Tooltip key={w.key}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-3 h-12 font-display border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                          onClick={() => handleConnect(w)}
                          disabled={isConnecting}
                        >
                          <span className="text-xl">{w.icon}</span>
                          <span className="text-sm">{w.name}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-xs">{w.tip}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground text-center">
                    🔒 We never access your private keys. Connection is read-only until you approve a transaction.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
