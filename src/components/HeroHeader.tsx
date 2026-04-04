import { motion } from "framer-motion";
import { Wallet, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileRing from "./ProfileRing";
import heroBg from "@/assets/hero-bg.jpg";

const HeroHeader = () => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Glow effects */}
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
            The ultimate NFT staking platform. Lock your assets, earn rewards, climb the ranks.
            Built for projects. Powered by the community.
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button className="bg-primary text-primary-foreground font-display text-base px-6 py-5 box-glow-cyan hover:bg-primary/90 transition-shadow">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
            <Button variant="outline" className="font-display text-base px-6 py-5 border-border text-foreground hover:bg-secondary">
              <Shield className="w-4 h-4 mr-2" />
              View Audits
            </Button>
          </motion.div>

          <motion.div
            className="flex items-center gap-4 mt-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-neon-green" />
              <span>5-Layer Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-neon-gold" />
              <span>Instant Rewards</span>
            </div>
          </motion.div>
        </div>

        {/* Profile showcase */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <ProfileRing
            name="You"
            level={1}
            points={0}
            rank="Bronze"
            size="lg"
          />
          <p className="font-display text-sm text-muted-foreground">Your Profile</p>
          <p className="text-xs text-primary">Connect wallet to begin</p>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroHeader;
