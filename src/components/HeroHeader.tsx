import { motion } from "framer-motion";
import { Shield, Zap, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWallet } from "@/contexts/WalletContext";
import ProfileRing from "./ProfileRing";
import WalletModal from "./WalletModal";
import heroBg from "@/assets/hero-bg.jpg";

const HeroHeader = () => {
  const { isConnected, shortAddress } = useWallet();

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" width={1920} height={800} />
      <div className="relative p-8">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-neon-purple/10 rounded-full blur-[80px]" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <motion.h1
              className="font-display text-4xl lg:text-5xl text-foreground mb-3 text-glow-cyan tracking-wider"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              STAKE. EARN.
              <br />
              <span className="text-primary">DOMINATE.</span>
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg max-w-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              The ultimate NFT staking platform. Lock your assets, earn dual rewards, climb the ranks.
              Your points today could mean something big tomorrow.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <WalletModal
                trigger={
                  <Button className="bg-primary text-primary-foreground font-display text-base px-6 py-5 box-glow-cyan hover:bg-primary/90 transition-shadow">
                    {isConnected ? `🔗 ${shortAddress}` : "🔗 Connect Wallet"}
                  </Button>
                }
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="font-display text-base px-6 py-5 border-border text-foreground hover:bg-secondary">
                    <Shield className="w-4 h-4 mr-2" />
                    View Audits
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View our smart contract security audits and platform safety reports.</TooltipContent>
              </Tooltip>
            </motion.div>

            <motion.div
              className="flex items-center gap-4 mt-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <Shield className="w-3.5 h-3.5 text-neon-green" />
                    <span>5-Layer Security</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">Our 5-layer security: Smart contract audits, RBAC access control, RLS database policies, wallet verification, and real-time monitoring.</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <Zap className="w-3.5 h-3.5 text-neon-gold" />
                    <span>Instant Rewards</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Rewards are calculated in real-time and distributed automatically.</TooltipContent>
              </Tooltip>
            </motion.div>
          </div>

          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <ProfileRing
              name={isConnected ? shortAddress : "You"}
              level={1}
              points={0}
              rank="Bronze"
              size="lg"
            />
            <p className="font-display text-sm text-muted-foreground">Your Profile</p>
            <p className="text-xs text-primary">
              {isConnected ? "Wallet connected ✓" : "Connect wallet to begin"}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
