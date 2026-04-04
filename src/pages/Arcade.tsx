import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Coins, Gift, Zap, Lock, Star, Target, Swords } from "lucide-react";
import { motion } from "framer-motion";
import PrizeWheel from "@/components/PrizeWheel";
import WalletModal from "@/components/WalletModal";

const comingSoonGames = [
  { name: "STAKE WARS", description: "Compete against other stakers in prediction battles", icon: Swords, reward: "500 pts", status: "coming_soon" },
  { name: "NFT SLOTS", description: "Spin to win bonus rewards and rare badges", icon: Star, reward: "Variable", status: "coming_soon" },
  { name: "FORGE QUEST", description: "Complete daily challenges to earn multipliers", icon: Target, reward: "100-1000 pts", status: "coming_soon" },
  { name: "LEADERBOARD CLASH", description: "Weekly tournaments with prize pools", icon: Trophy, reward: "Prize Pool", status: "coming_soon" },
];

const rewardTiers = [
  { points: 500, reward: "Bronze Loot Box", icon: "🎁" },
  { points: 1000, reward: "Fee Discount (1%)", icon: "💰" },
  { points: 2500, reward: "Silver Loot Box", icon: "🎁" },
  { points: 5000, reward: "Exclusive Badge", icon: "🏆" },
  { points: 10000, reward: "Gold Loot Box + VIP", icon: "👑" },
  { points: 25000, reward: "Diamond Status", icon: "💎" },
];

const Arcade = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    if (data) setProfile(data);
  };

  const userPoints = profile?.points || 0;
  const canSpin = userPoints >= 100;

  const handleSpinResult = async (prize: any) => {
    // In a real implementation, this would deduct points and award the prize
    // For now, log it
    if (user) {
      await supabase.from("activity_log").insert({
        user_id: user.id,
        event_type: "action",
        severity: "info",
        message: `Prize wheel spin: Won "${prize.label}"`,
        source: "arcade",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl text-primary tracking-widest text-glow-cyan">
              STAKEFORGE <span className="text-accent">ARCADE</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <WalletModal />
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">
              ← Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Hero */}
        <motion.div
          className="text-center py-8 space-y-4"
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
          </p>
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="rounded-lg border border-primary/20 bg-card px-6 py-3 text-center">
              <Coins className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display text-2xl text-primary">{userPoints.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">YOUR POINTS</p>
            </div>
            <div className="rounded-lg border border-accent/20 bg-card px-6 py-3 text-center">
              <Trophy className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="font-display text-2xl text-accent">{profile?.rank || "Bronze"}</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">YOUR RANK</p>
            </div>
          </div>
        </motion.div>

        {/* Prize Wheel */}
        <motion.div
          className="rounded-xl border border-primary/20 bg-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-display text-lg text-foreground tracking-wider mb-6 text-center flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 text-accent" /> PRIZE WHEEL
          </h2>
          <PrizeWheel
            disabled={!canSpin || !user}
            spinCost={100}
            onSpin={handleSpinResult}
          />
          {!user && (
            <p className="text-center text-xs text-accent mt-4 font-display">Sign in to spin the wheel!</p>
          )}
          {user && !canSpin && (
            <p className="text-center text-xs text-accent mt-4 font-display">
              You need at least 100 points to spin. Stake more to earn points!
            </p>
          )}
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
            {rewardTiers.map((tier) => {
              const unlocked = userPoints >= tier.points;
              return (
                <div
                  key={tier.points}
                  className={`rounded-lg border bg-card p-4 text-center space-y-2 ${
                    unlocked ? "border-accent/30 opacity-100" : "border-border opacity-50"
                  }`}
                >
                  <span className="text-3xl">{tier.icon}</span>
                  <p className="font-display text-xs text-foreground tracking-wider">{tier.reward}</p>
                  <div className="rounded-full bg-secondary px-2 py-0.5">
                    <span className="text-[10px] font-display text-muted-foreground">{tier.points.toLocaleString()} PTS</span>
                  </div>
                  {unlocked ? (
                    <span className="text-[9px] text-accent font-display">UNLOCKED</span>
                  ) : (
                    <Lock className="w-3 h-3 text-muted-foreground mx-auto" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
