import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import HeroHeader from "@/components/HeroHeader";
import StatsBar from "@/components/StatsBar";
import StakingCard from "@/components/StakingCard";
import Leaderboard from "@/components/Leaderboard";
import TopNFTProjects from "@/components/TopNFTProjects";
import BadgesPanel from "@/components/BadgesPanel";
import ReferralPanel from "@/components/ReferralPanel";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const stakingPools = [
  { projectName: "Bored Ape Yacht Club", apy: 45, totalStaked: 1243, yourStake: 0, lockPeriod: "30 Days", rewardToken: "$APE", status: "active" as const },
  { projectName: "Azuki", apy: 62, totalStaked: 756, yourStake: 0, lockPeriod: "14 Days", rewardToken: "$AZUKI", status: "active" as const },
  { projectName: "Doodles", apy: 38, totalStaked: 432, yourStake: 0, lockPeriod: "60 Days", rewardToken: "$DOOD", status: "locked" as const },
  { projectName: "Moonbirds", apy: 85, totalStaked: 321, yourStake: 0, lockPeriod: "7 Days", rewardToken: "$NEST", status: "active" as const },
];

const Index = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="font-display text-xl text-primary tracking-widest text-glow-cyan">
            STAKEFORGE
          </h2>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Dashboard</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Pools</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Leaderboard</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Docs</a>
            {isAdmin && (
              <Link to="/admin" className="text-sm text-neon-green hover:text-neon-green/80 transition-colors font-display">
                Admin
              </Link>
            )}
            {user ? (
              <Button variant="outline" size="sm" onClick={signOut} className="font-display border-border">
                Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="font-display bg-primary text-primary-foreground box-glow-cyan">
                  Sign In
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

        {/* Main grid: Left (NFT projects) | Center (Staking pools) | Right (Leaderboard) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-6">
            <TopNFTProjects />
            <BadgesPanel />
          </div>

          {/* Center column */}
          <div className="lg:col-span-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground">Active Staking Pools</h2>
              <span className="text-xs text-muted-foreground font-body">
                Platform fee: 2.5% on rewards
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stakingPools.map((pool) => (
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
            All rewards and APY figures are estimates and subject to change. Smart contracts have been audited
            but are used at your own risk. By using this platform, you agree to our Terms of Service
            and acknowledge the inherent risks of DeFi protocols.
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
