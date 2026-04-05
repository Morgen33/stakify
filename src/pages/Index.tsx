import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Mic, Music, Users, Crown, Radio, Tv, MessageCircle, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import HeroHeader from "@/components/HeroHeader";
import StatsBar from "@/components/StatsBar";
import StakingCard from "@/components/StakingCard";
import Leaderboard from "@/components/Leaderboard";
import TopNFTProjects from "@/components/TopNFTProjects";
import BadgesPanel from "@/components/BadgesPanel";
import ReferralPanel from "@/components/ReferralPanel";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import StartupDisclaimer from "@/components/StartupDisclaimer";
import WalletModal from "@/components/WalletModal";
import WelcomeSplash from "@/components/WelcomeSplash";
import SeasonalBanner from "@/components/SeasonalBanner";
import { Badge } from "@/components/ui/badge";

/* ── Floating spring petals animation ── */
const SpringPetals = () => {
  const petals = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    emoji: ["🌸", "🌿", "🌷", "🍃", "✿", "🌱"][i % 6],
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 10 + Math.random() * 10,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {petals.map((p) => (
        <motion.span
          key={p.id}
          className="absolute opacity-40"
          style={{ left: `${p.left}%`, top: -30, fontSize: p.size }}
          animate={{
            y: ["-30px", "110vh"],
            x: [0, Math.sin(p.id) * 60, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
};

/* ── Social Hub Preview (blurred coming soon) ── */
const SocialHubPreview = () => (
  <motion.div
    className="rounded-xl border border-accent/20 bg-card relative overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    {/* Blurred background content */}
    <div className="blur-[5px] pointer-events-none select-none p-5 space-y-4">
      {/* Stage area */}
      <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-destructive animate-pulse" />
            <span className="font-display text-xs text-foreground">LIVE STAGE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">247 listening</span>
          </div>
        </div>
        {/* Host + co-hosts */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary border-2 border-accent" />
            <span className="text-[8px] text-accent font-display mt-1">HOST</span>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-border" />
              <span className="text-[8px] text-muted-foreground font-display mt-1">CO-HOST</span>
            </div>
          ))}
        </div>
        {/* Speakers row */}
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-secondary border border-border" />
          ))}
          <span className="text-[9px] text-muted-foreground">+42 more</span>
        </div>
      </div>

      {/* Jumbotron */}
      <div className="rounded-lg bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 border border-border p-3 flex items-center gap-3">
        <Tv className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <div className="h-3 w-48 rounded bg-foreground/15 mb-1" />
          <div className="h-2 w-32 rounded bg-foreground/10" />
        </div>
        <Music className="w-4 h-4 text-accent" />
      </div>

      {/* Chat messages */}
      <div className="space-y-2">
        {["Just staked 5 NFTs 🔥", "This collection is fire!", "Who's minting tomorrow?", "Love the community vibes ✨"].map((msg, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-secondary flex-shrink-0" />
            <div className="rounded-lg bg-secondary/50 px-3 py-1.5">
              <span className="text-[10px] text-foreground">{msg}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Music player bar */}
      <div className="rounded-lg bg-secondary/50 border border-border p-3 flex items-center gap-3">
        <Volume2 className="w-4 h-4 text-accent" />
        <div className="flex-1 h-1.5 rounded-full bg-border">
          <div className="h-full w-1/3 rounded-full bg-accent" />
        </div>
        <span className="text-[9px] text-muted-foreground font-display">3:24</span>
      </div>
    </div>

    {/* Coming Soon overlay */}
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/40 backdrop-blur-[2px]">
      <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mb-3">
        <MessageCircle className="w-8 h-8 text-accent" />
      </div>
      <h3 className="font-display text-lg text-foreground tracking-wider mb-1">SOCIAL HUB</h3>
      <p className="text-xs text-muted-foreground text-center max-w-[200px] mb-3">
        Live stages, chat rooms, music & jumbotron — hang out with your community
      </p>
      <div className="flex flex-wrap gap-2 justify-center mb-3">
        {[
          { icon: Crown, label: "Host" },
          { icon: Mic, label: "Speakers" },
          { icon: Music, label: "Music" },
          { icon: Tv, label: "Jumbotron" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-1 px-2 py-1 rounded-full border border-border bg-secondary/30 text-[9px] text-muted-foreground font-display">
            <f.icon className="w-3 h-3" /> {f.label}
          </div>
        ))}
      </div>
      <Badge variant="outline" className="font-display text-[10px] border-accent/40 text-accent px-3 py-1 animate-pulse">
        🚧 UNDER CONSTRUCTION — Coming Soon
      </Badge>
    </div>
  </motion.div>
);

/**
 * 🚀 LAUNCH MODE — flip to `false` to reveal the full platform.
 * When true, only staking pools + essentials are shown.
 */
const LAUNCH_MODE = true;

const Index = () => {
  const { user, isAdmin, isOperator, isMaster, signOut } = useAuth();
  const { isConnected, shortAddress } = useWallet();
  const [pools, setPools] = useState<any[]>([]);

  useEffect(() => {
    const fetchPools = async () => {
      const { data } = await supabase
        .from("staking_pools")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setPools(data);
    };
    fetchPools();
  }, []);

  const displayPools = pools.length > 0 ? pools.map(p => ({
    id: p.id,
    projectName: p.project_name,
    apy: p.apy,
    totalStaked: p.total_staked,
    yourStake: 0,
    lockPeriod: `${p.lock_period_days} Days`,
    lockPeriodDays: p.lock_period_days,
    rewardToken: p.reward_token,
    platformFeePct: p.platform_fee_pct,
    status: p.status as "active" | "locked" | "ended" | "paused",
  })) : [
    { projectName: "Bored Ape Yacht Club", apy: 45, totalStaked: 1243, yourStake: 0, lockPeriod: "30 Days", lockPeriodDays: 30, rewardToken: "$APE", platformFeePct: 2.5, status: "active" as const },
    { projectName: "Azuki", apy: 62, totalStaked: 756, yourStake: 0, lockPeriod: "14 Days", lockPeriodDays: 14, rewardToken: "$AZUKI", platformFeePct: 2.5, status: "active" as const },
    { projectName: "Doodles", apy: 38, totalStaked: 432, yourStake: 0, lockPeriod: "60 Days", lockPeriodDays: 60, rewardToken: "$DOOD", platformFeePct: 2.5, status: "locked" as const },
    { projectName: "Moonbirds", apy: 85, totalStaked: 321, yourStake: 0, lockPeriod: "7 Days", lockPeriodDays: 7, rewardToken: "$NEST", platformFeePct: 2.5, status: "active" as const },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <SpringPetals />
      <WelcomeSplash />
      <StartupDisclaimer />
      <SeasonalBanner />

      {/* ── Enhanced Beta Banner ── */}
      <motion.div
        className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-primary/20 py-2.5 text-center relative overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
        <p className="text-xs text-foreground/80 font-body tracking-wide relative z-10">
          <span className="inline-flex items-center gap-1.5 font-display text-primary text-xs mr-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            🚀 BETA
          </span>
          Platform is in early access — <span className="text-accent font-display">Staking is LIVE!</span> Point system, badge earnings &amp; social features coming soon.
        </p>
      </motion.div>

      {/* ── Nav ── */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="font-display text-xl text-primary tracking-widest text-glow-cyan">
            STAKEFORGE
          </h2>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Dashboard</Link>
            <a href="#pools" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Pools</a>
            <a href="#leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Leaderboard</a>
            <Link to="/arcade" className="text-sm text-accent hover:text-accent/80 transition-colors font-display">Arcade</Link>
            <Link to="/raffle" className="text-sm text-neon-purple hover:text-neon-purple/80 transition-colors font-display">Raffle</Link>
            <Link to="/lottery" className="text-sm text-accent hover:text-accent/80 transition-colors font-display">Lottery</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Pricing</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">About</Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Docs</a>
              </TooltipTrigger>
              <TooltipContent>Read the platform documentation, FAQs, and security audits.</TooltipContent>
            </Tooltip>
            {isOperator && !isAdmin && (
              <Link to="/operator" className="text-sm text-accent hover:text-accent/80 transition-colors font-display">Command Center</Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-sm text-neon-green hover:text-neon-green/80 transition-colors font-display">Admin</Link>
            )}
            {isMaster && (
              <Link to="/master" className="text-sm text-primary hover:text-primary/80 transition-colors font-display">👑 Master</Link>
            )}
            <WalletModal />
            {user ? (
              <Button variant="outline" size="sm" onClick={signOut} className="font-display border-border text-xs">Sign Out</Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="font-display text-xs text-muted-foreground">Email Login</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-6 relative z-10">
        <DisclaimerBanner />
        <HeroHeader />
        <StatsBar />

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column — slides in from left */}
          <motion.div
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TopNFTProjects />
            <BadgesPanel />

            {/* Social Hub Preview (left sidebar) */}
            <SocialHubPreview />
          </motion.div>

          {/* Center column */}
          <div className="lg:col-span-6">
            <div className="flex items-center justify-between mb-4" id="pools">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2">
                Active Staking Pools
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Each pool is managed by a verified project. Stake to earn their rewards AND StakeForge points.</p>
                  </TooltipContent>
                </Tooltip>
              </h2>
              <span className="text-xs text-muted-foreground font-body">
                Earn dual rewards on every stake ✨
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayPools.map((pool, i) => (
                <motion.div
                  key={pool.projectName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                >
                  <StakingCard {...pool} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <motion.div
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div id="leaderboard">
              <Leaderboard />
            </div>

            {/* Raffle Promo */}
            <Link to="/raffle" className="block">
              <motion.div
                className="rounded-xl border border-neon-purple/20 bg-gradient-to-br from-neon-purple/5 to-accent/5 p-5 text-center hover:border-neon-purple/40 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-3xl mb-2 block">🎟️</span>
                <p className="font-display text-sm text-foreground tracking-wider mb-1">RAFFLE HOUSE</p>
                <p className="text-[10px] text-neon-purple font-display tracking-widest mb-2">COMING SOON</p>
                <p className="text-[10px] text-muted-foreground">Win NFTs, tokens & ETH. Buy tickets with ETH, USDC, or SOL!</p>
              </motion.div>
            </Link>

            <ReferralPanel />
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-6 pb-8 text-center">
          <p className="text-xs text-primary/60 max-w-2xl mx-auto mb-3 font-display tracking-wide">
            Every stake earns you points. Points unlock games, badges, prizes, and who knows what else down the road. The earlier you join, the more you accumulate. 🚀
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            ⚠️ <span className="font-display text-foreground/60">DISCLAIMER:</span> Staking digital assets involves significant risk including possible loss of principal.
            This platform facilitates staking services and does not provide financial advice.
            All reward rates are estimates and subject to change. A small platform maintenance fee
            applies to each action to support security, infrastructure, and ongoing development. Smart contracts have been audited
            but are used at your own risk. By using this platform, you agree to our Terms of Service
            and acknowledge the inherent risks of DeFi protocols. Fees, terms, and platform features are subject to change.
            No guarantees are made regarding future token launches, airdrops, or conversion of points.
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-3 font-display tracking-wider">
            STAKEFORGE © 2026 — ALL RIGHTS RESERVED
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
