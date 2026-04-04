import { motion } from "framer-motion";
import { Award, Star, Flame, Target, Gem, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const badges = [
  { name: "First Stake", icon: Star, earned: true, description: "Staked your first NFT", color: "text-neon-gold" },
  { name: "Loyal Staker", icon: Flame, earned: true, description: "Staked for 30+ consecutive days", color: "text-neon-red" },
  { name: "Whale", icon: Gem, earned: false, description: "Stake 100+ NFTs simultaneously", color: "text-neon-cyan" },
  { name: "Recruiter", icon: Users, earned: false, description: "Refer 10 new stakers", color: "text-neon-purple" },
  { name: "Sharpshooter", icon: Target, earned: true, description: "Claimed rewards at peak APY", color: "text-neon-green" },
  { name: "OG", icon: Award, earned: false, description: "Be among the first 100 platform users", color: "text-neon-gold" },
];

const BadgesPanel = () => {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-neon-gold" />
        <h2 className="font-display text-lg text-foreground">Badges</h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge, i) => (
          <Tooltip key={badge.name}>
            <TooltipTrigger asChild>
              <motion.div
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors cursor-pointer ${
                  badge.earned
                    ? "border-border bg-secondary/50 hover:bg-secondary"
                    : "border-border/50 bg-muted/20 opacity-40"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: badge.earned ? 1 : 0.4, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.05 }}
              >
                <badge.icon className={`w-6 h-6 ${badge.earned ? badge.color : "text-muted-foreground"}`} />
                <span className="text-[10px] font-display text-foreground text-center leading-tight">{badge.name}</span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent className="bg-card border-border">
              <p className="font-display text-xs text-primary">{badge.name}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
              {!badge.earned && <p className="text-xs text-neon-gold mt-1">🔒 Not yet earned</p>}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default BadgesPanel;
