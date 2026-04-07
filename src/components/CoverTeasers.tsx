import { motion } from "framer-motion";
import {
  Coins, Store, Gamepad2, Rocket, Globe, Flame,
  Trophy, Sparkles, Zap, ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const teasers = [
  { icon: Zap, title: "Staking Platform", status: "LIVE", desc: "Stake your NFTs & earn rewards across multiple projects", color: "text-primary", borderColor: "border-primary/30", bgColor: "bg-primary/5", live: true },
  { icon: Store, title: "Trade Store", status: "COMING SOON", desc: "Buy, sell, and trade digital collectibles & in-game items", color: "text-accent", borderColor: "border-accent/30", bgColor: "bg-accent/5", live: false },
  { icon: Gamepad2, title: "Casino & Games", status: "COMING SOON", desc: "Play-to-earn arcade games, slots, and mini-games", color: "text-neon-purple", borderColor: "border-neon-purple/30", bgColor: "bg-neon-purple/5", live: false },
  { icon: Rocket, title: "Launchpad", status: "COMING SOON", desc: "Launch your project on Ethereum & Solana — IDOs, mints, & more", color: "text-neon-green", borderColor: "border-neon-green/30", bgColor: "bg-neon-green/5", live: false },
  { icon: Globe, title: "Tokens Across All Platforms", status: "COMING SOON", desc: "One universal token ecosystem — use anywhere, earn everywhere", color: "text-primary", borderColor: "border-primary/30", bgColor: "bg-primary/5", live: false },
  { icon: Flame, title: "All-In-One Degeneracy", status: "HINT", desc: "Everything you need in one platform — stake, play, trade, earn", color: "text-destructive", borderColor: "border-destructive/30", bgColor: "bg-destructive/5", live: false },
];

const CoverTeasers = () => {
  return (
    <section className="py-12">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-display text-2xl text-foreground tracking-widest mb-2">
          THE <span className="text-primary text-glow-cyan">ECOSYSTEM</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          More than staking — a complete Web3 experience. Here's what's live and what's cooking.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {teasers.map((t, i) => (
          <motion.div
            key={t.title}
            className={`relative rounded-xl border ${t.borderColor} ${t.bgColor} p-6 overflow-hidden group`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
          >
            {/* Glow pulse bg */}
            {t.live && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 animate-pulse-glow pointer-events-none" />
            )}
            {!t.live && (
              <div className="absolute inset-0 backdrop-blur-[0.5px] bg-background/10 pointer-events-none" />
            )}

            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl ${t.bgColor} border ${t.borderColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <t.icon className={`w-6 h-6 ${t.color}`} />
              </div>
              <h3 className={`font-display text-sm tracking-wider mb-1 ${t.color}`}>
                {t.title.toUpperCase()}
              </h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{t.desc}</p>
              <Badge
                variant="outline"
                className={`font-display text-[10px] tracking-wider ${
                  t.live
                    ? "border-primary/40 text-primary bg-primary/10"
                    : t.status === "HINT"
                    ? "border-destructive/40 text-destructive animate-pulse"
                    : "border-accent/40 text-accent animate-pulse"
                }`}
              >
                {t.live ? "⚡ LIVE" : t.status === "HINT" ? "🔥 HINT" : `🚧 ${t.status}`}
              </Badge>
            </div>

            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-xl gradient-border pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      {/* Security badge */}
      <motion.div
        className="mt-8 flex items-center justify-center gap-3 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
      >
        <ShieldCheck className="w-4 h-4 text-primary" />
        <span className="font-display tracking-wider">BUILT ON ETHEREUM · SMART CONTRACT AUDITABLE · OPEN SOURCE</span>
      </motion.div>
    </section>
  );
};

export default CoverTeasers;
