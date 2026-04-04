import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Coins, Gift, Zap, Lock, Star, Target, Swords } from "lucide-react";
import { motion } from "framer-motion";

const comingSoonGames = [
  { name: "STAKE WARS", description: "Compete against other stakers in prediction battles", icon: Swords, reward: "500 pts", status: "coming_soon" },
  { name: "NFT SLOTS", description: "Spin to win bonus rewards and rare badges", icon: Star, reward: "Variable", status: "coming_soon" },
  { name: "FORGE QUEST", description: "Complete daily challenges to earn multipliers", icon: Target, reward: "100-1000 pts", status: "coming_soon" },
  { name: "LEADERBOARD CLASH", description: "Weekly tournaments with prize pools", icon: Trophy, reward: "Prize Pool", status: "coming_soon" },
];

const rewardTiers = [
  { points: 500, reward: "Bronze Loot Box", icon: "🎁", unlocked: false },
  { points: 1000, reward: "Fee Discount (1%)", icon: "💰", unlocked: false },
  { points: 2500, reward: "Silver Loot Box", icon: "🎁", unlocked: false },
  { points: 5000, reward: "Exclusive Badge", icon: "🏆", unlocked: false },
  { points: 10000, reward: "Gold Loot Box + VIP", icon: "👑", unlocked: false },
  { points: 25000, reward: "Diamond Status", icon: "💎", unlocked: false },
];

const Arcade = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl text-primary tracking-widest text-glow-cyan">
              STAKEFORGE <span className="text-accent">ARCADE</span>
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">
            ← Dashboard
          </Button>
        </div>
      </nav>

      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Hero */}
        <motion.div
          className="text-center py-12 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20 box-glow-cyan">
              <Gamepad2 className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-4xl text-foreground tracking-wider">
            THE <span className="text-primary text-glow-cyan">ARCADE</span>
          </h1>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            Use your staking points to play games, win rewards, and climb the ranks.
            The more you stake, the more you play.
          </p>
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="rounded-lg border border-primary/20 bg-card px-6 py-3 text-center">
              <Coins className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display text-2xl text-primary">0</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">YOUR POINTS</p>
            </div>
            <div className="rounded-lg border border-accent/20 bg-card px-6 py-3 text-center">
              <Trophy className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="font-display text-2xl text-accent">Bronze</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">YOUR RANK</p>
            </div>
          </div>
        </motion.div>

        {/* Games Grid */}
        <div>
          <h2 className="font-display text-lg text-foreground tracking-wider mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" /> GAMES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comingSoonGames.map((game, i) => (
              <motion.div
                key={game.name}
                className="rounded-xl border border-border bg-card p-6 text-center space-y-3 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Coming soon overlay */}
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center">
                    <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <span className="font-display text-xs text-muted-foreground tracking-wider">COMING SOON</span>
                  </div>
                </div>
                <game.icon className="w-10 h-10 text-primary mx-auto" />
                <h3 className="font-display text-sm text-foreground tracking-wider">{game.name}</h3>
                <p className="text-xs text-muted-foreground">{game.description}</p>
                <div className="rounded-full bg-accent/10 px-3 py-1 inline-block">
                  <span className="text-[10px] font-display text-accent">{game.reward}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Points Rewards Tiers */}
        <div>
          <h2 className="font-display text-lg text-foreground tracking-wider mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-accent" /> POINT REWARDS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {rewardTiers.map((tier) => (
              <div
                key={tier.points}
                className="rounded-lg border border-border bg-card p-4 text-center space-y-2 opacity-60"
              >
                <span className="text-3xl">{tier.icon}</span>
                <p className="font-display text-xs text-foreground tracking-wider">{tier.reward}</p>
                <div className="rounded-full bg-secondary px-2 py-0.5">
                  <span className="text-[10px] font-display text-muted-foreground">{tier.points.toLocaleString()} PTS</span>
                </div>
                <Lock className="w-3 h-3 text-muted-foreground mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {!user && (
          <div className="text-center py-8">
            <Link to="/auth">
              <Button className="font-display bg-primary text-primary-foreground box-glow-cyan text-lg px-8 py-6">
                SIGN UP TO START EARNING
              </Button>
            </Link>
          </div>
        )}

        <footer className="text-center py-6 border-t border-border">
          <p className="text-[10px] text-muted-foreground/60 font-display tracking-wider">
            STAKEFORGE ARCADE — POINTS ARE NON-TRANSFERABLE AND HAVE NO MONETARY VALUE
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Arcade;
