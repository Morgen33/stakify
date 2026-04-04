import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";
import ProfileRing from "./ProfileRing";

interface LeaderEntry {
  rank: number;
  name: string;
  wallet: string;
  totalStaked: number;
  points: number;
  level: number;
  tier: string;
}

const mockLeaders: LeaderEntry[] = [
  { rank: 1, name: "CryptoKing", wallet: "0x1a2b...9f3e", totalStaked: 142, points: 8750, level: 42, tier: "Diamond" },
  { rank: 2, name: "NFTWhale", wallet: "0x4c5d...2a1b", totalStaked: 98, points: 6200, level: 35, tier: "Platinum" },
  { rank: 3, name: "StakeMax", wallet: "0x7e8f...5c4d", totalStaked: 76, points: 5100, level: 28, tier: "Platinum" },
  { rank: 4, name: "DiamondH", wallet: "0x9g0h...7e6f", totalStaked: 54, points: 3800, level: 22, tier: "Gold" },
  { rank: 5, name: "HODLer99", wallet: "0x2i3j...8g9h", totalStaked: 43, points: 2900, level: 18, tier: "Gold" },
  { rank: 6, name: "MetaVault", wallet: "0x5k6l...1i2j", totalStaked: 31, points: 2100, level: 14, tier: "Silver" },
  { rank: 7, name: "BlockDev", wallet: "0x8m9n...4k5l", totalStaked: 22, points: 1500, level: 10, tier: "Silver" },
];

const rankIcons = [
  <Crown className="w-5 h-5 text-neon-gold" />,
  <Medal className="w-5 h-5 text-muted-foreground" />,
  <Medal className="w-5 h-5 text-neon-gold/60" />,
];

const Leaderboard = () => {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Trophy className="w-5 h-5 text-neon-gold" />
        <h2 className="font-display text-lg text-foreground">Top Stakers</h2>
      </div>
      <div className="divide-y divide-border">
        {mockLeaders.map((entry, i) => (
          <motion.div
            key={entry.rank}
            className="flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="w-8 flex justify-center">
              {i < 3 ? rankIcons[i] : (
                <span className="font-display text-sm text-muted-foreground">#{entry.rank}</span>
              )}
            </div>
            <ProfileRing
              name={entry.name}
              level={entry.level}
              points={entry.points}
              rank={entry.tier}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm text-foreground truncate">{entry.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{entry.wallet}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-sm text-primary">{entry.totalStaked} NFTs</p>
              <p className="text-xs text-neon-gold">{entry.points.toLocaleString()} pts</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
