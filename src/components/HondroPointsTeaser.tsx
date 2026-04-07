import { motion } from "framer-motion";
import { Coins, ArrowRight, Store, Gamepad2, Trophy, Gift, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const flowSteps = [
  { icon: Coins, label: "Stake", desc: "Stake NFTs or tokens in any pool" },
  { icon: Star, label: "Earn", desc: "Earn Hondro Points automatically" },
  { icon: Store, label: "Spend", desc: "Use in Store, Games, Casino & more" },
];

const HondroPointsTeaser = () => {
  return (
    <section className="py-12">
      <motion.div
        className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/5 via-card to-primary/5 p-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Coins className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-xl text-foreground tracking-widest">
                HONDRO <span className="text-accent text-glow-gold">POINTS</span>
              </h2>
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">
                POWERED BY HONDRO · CROSS-PLATFORM REWARDS
              </p>
            </div>
            <Badge variant="outline" className="ml-auto font-display text-[10px] border-accent/40 text-accent animate-pulse">
              🚧 COMING SOON
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mt-4 max-w-xl leading-relaxed">
            <span className="text-foreground font-display">Hondro Points</span> are a universal reward currency created by <span className="text-accent font-display">Hondro</span> —
            completely separate from any project owner's tokens. Earn them through staking, playing games, completing challenges,
            and engaging with the platform. Spend them in the <span className="text-accent">Store</span>, <span className="text-accent">Marketplace</span>,
            <span className="text-accent"> Casino</span>, and more.
          </p>

          {/* Points Flow */}
          <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            {flowSteps.map((step, i) => (
              <motion.div
                key={step.label}
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.15 }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-2">
                    <step.icon className="w-6 h-6 text-accent" />
                  </div>
                  <p className="font-display text-xs text-foreground tracking-wider">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground max-w-[120px]">{step.desc}</p>
                </div>
                {i < flowSteps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-accent/40 mb-6" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Where to spend */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Store, label: "Store" },
              { icon: Gift, label: "Prizes" },
              { icon: Gamepad2, label: "Casino" },
              { icon: Trophy, label: "Tournaments" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-[10px] text-accent font-display tracking-wider"
              >
                <item.icon className="w-3 h-3" /> {item.label}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HondroPointsTeaser;
