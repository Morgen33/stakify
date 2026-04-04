import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
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

const Index = () => {
  const { user, isAdmin, isOperator, signOut } = useAuth();
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

  // Fallback to demo data if no pools in DB
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
    <div className="min-h-screen bg-background">
      <StartupDisclaimer />
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="font-display text-xl text-primary tracking-widest text-glow-cyan">
            STAKEFORGE
          </h2>
          <div className="flex items-center gap-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Dashboard</a>
              </TooltipTrigger>
              <TooltipContent>View your personal staking dashboard with all your active positions.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Pools</a>
              </TooltipTrigger>
              <TooltipContent>Browse all available staking pools from verified projects.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Leaderboard</a>
              </TooltipTrigger>
              <TooltipContent>See top stakers and compete for badges and rewards.</TooltipContent>
            </Tooltip>
            <Link to="/arcade" className="text-sm text-accent hover:text-accent/80 transition-colors font-display">Arcade</Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Docs</a>
              </TooltipTrigger>
              <TooltipContent>Read the platform documentation, FAQs, and security audits.</TooltipContent>
            </Tooltip>
            {isOperator && !isAdmin && (
              <Link to="/operator" className="text-sm text-accent hover:text-accent/80 transition-colors font-display">
                Operator
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-sm text-neon-green hover:text-neon-green/80 transition-colors font-display">
                Admin
              </Link>
            )}

            {/* Wallet connect or status */}
            <WalletModal />

            {user ? (
              <Button variant="outline" size="sm" onClick={signOut} className="font-display border-border text-xs">
                Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="font-display text-xs text-muted-foreground">
                  Email Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        <DisclaimerBanner />
        <HeroHeader />
        <StatsBar />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-6">
            <TopNFTProjects />
            <BadgesPanel />
          </div>

          {/* Center column */}
          <div className="lg:col-span-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2">
                Active Staking Pools
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Each pool is managed by a verified project. Stake your assets to earn rewards. Fees and terms are set by the project, with a small platform micro-fee on each action.</p>
                  </TooltipContent>
                </Tooltip>
              </h2>
              <span className="text-xs text-muted-foreground font-body">
                Platform fee: variable per pool + $0.03/action
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayPools.map((pool) => (
                <StakingCard key={pool.projectName} {...pool} />
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-3 space-y-6">
            <Leaderboard />
            <ReferralPanel />
          </div>
        </div>

        {/* Footer disclaimer */}
        <footer className="border-t border-border pt-6 pb-8 text-center">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            ⚠️ <span className="font-display text-foreground/60">DISCLAIMER:</span> Staking digital assets involves significant risk including possible loss of principal.
            This platform facilitates staking services and does not provide financial advice.
            All rewards and APY figures are estimates and subject to change. A fixed platform micro-fee of $0.03 USDC equivalent
            applies to every stake and unstake action. Smart contracts have been audited
            but are used at your own risk. By using this platform, you agree to our Terms of Service
            and acknowledge the inherent risks of DeFi protocols. Fees and terms are subject to change.
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
