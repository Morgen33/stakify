import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  DollarSign, Shield, Zap, Trophy, ArrowLeft, CheckCircle2,
  Sparkles, Users, Layers, Gift, Ticket, TrendingUp, Lock, Info
} from "lucide-react";
import WalletModal from "@/components/WalletModal";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    name: "PROJECT LISTING",
    price: "Negotiable",
    subtitle: "One-time or gradual",
    color: "border-primary/30 bg-primary/5",
    accent: "text-primary",
    highlight: "text-neon-green",
    features: [
      "Your own branded staking pool",
      "Custom reward rates & lock periods",
      "Dedicated project page with your branding",
      "Access to the Raffle House for giveaways",
      "Airdrop tool to reward your community",
      "Real-time analytics dashboard",
    ],
  },
  {
    name: "PLATFORM FEES",
    price: "~$0.12",
    subtitle: "Per stake/unstake action",
    color: "border-accent/30 bg-accent/5",
    accent: "text-accent",
    highlight: "text-neon-green",
    features: [
      "Tiny network maintenance fee per action",
      "Covers infrastructure & security costs",
      "Charged in native currency (ETH/SOL)",
      "Auto-calculated at current market rate",
      "Transparent — no hidden charges",
      "Supports ongoing platform development",
    ],
  },
  {
    name: "OPERATOR FEE",
    price: "Customizable %",
    subtitle: "Set by platform owner",
    color: "border-neon-gold/30 bg-neon-gold/5",
    accent: "text-neon-gold",
    highlight: "text-neon-green",
    features: [
      "Percentage of staking rewards",
      "Fully adjustable per pool or project",
      "Funds platform growth & marketing",
      "Supports community events & prizes",
      "Negotiable for high-volume projects",
      "Transparent fee breakdown in dashboard",
    ],
  },
];

const earningBreakdown = [
  { label: "Staking Rewards", pct: "Up to 85%", desc: "Earn rewards from the projects you stake with", icon: TrendingUp },
  { label: "Platform Points", pct: "Every action", desc: "Points unlock arcade games, badges, and future benefits", icon: Sparkles },
  { label: "Raffle Winnings", pct: "Variable", desc: "Win NFTs, tokens, and ETH through the Raffle House", icon: Ticket },
  { label: "Airdrop Rewards", pct: "Surprise drops", desc: "Projects and the platform reward active stakers", icon: Gift },
  { label: "Referral Bonuses", pct: "100 pts each", desc: "Invite friends and earn bonus points for every signup", icon: Users },
  { label: "Leaderboard Prizes", pct: "Top stakers", desc: "Climb the leaderboard for exclusive rewards", icon: Trophy },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl text-primary tracking-widest text-glow-cyan">
              PRICING & EARNINGS
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <WalletModal />
            <Button variant="outline" size="sm" asChild className="font-display text-xs">
              <Link to="/"><ArrowLeft className="w-3 h-3 mr-1" /> Home</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl mx-auto px-4 py-10 space-y-12">
        {/* Hero */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="font-display text-[10px] text-primary tracking-widest">TRANSPARENT PRICING</span>
          </div>
          <h1 className="font-display text-4xl text-foreground mb-3 tracking-wider">
            FAIR FEES. <span className="text-neon-green drop-shadow-[0_0_8px_hsl(var(--neon-green))]">MASSIVE</span> REWARDS.
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            We keep fees minimal so you keep more of your rewards. Every fee supports
            the security, infrastructure, and community that makes this platform thrive.
          </p>
        </motion.div>

        {/* Fee Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className={`rounded-xl border ${tier.color} p-6`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <p className={`font-display text-xs tracking-widest ${tier.accent} mb-2`}>{tier.name}</p>
              <p className={`font-display text-3xl ${tier.highlight} drop-shadow-[0_0_6px_hsl(var(--neon-green)/0.4)]`}>{tier.price}</p>
              <p className="text-xs text-muted-foreground mb-5 mt-1">{tier.subtitle}</p>
              <ul className="space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-foreground/80">
                    <CheckCircle2 className={`w-3.5 h-3.5 text-neon-green shrink-0 mt-0.5`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* What You Earn */}
        <div>
          <h2 className="font-display text-2xl text-foreground text-center mb-2 tracking-wider">
            WHAT <span className="text-neon-green drop-shadow-[0_0_8px_hsl(var(--neon-green))]">YOU</span> EARN
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-8">Every stake is an investment in multiple reward streams</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earningBreakdown.map((item, i) => (
              <motion.div
                key={item.label}
                className="rounded-xl border border-border bg-card p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-neon-green/10 border border-neon-green/20">
                    <item.icon className="w-4 h-4 text-neon-green" />
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground">{item.label}</p>
                    <p className="text-[11px] text-neon-green font-display font-bold">{item.pct}</p>
                  </div>
                </div>
                <p className="text-xs text-foreground/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* For Projects */}
        <motion.div
          className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center max-w-2xl mx-auto">
            <Layers className="w-8 h-8 text-accent mx-auto mb-4" />
            <h3 className="font-display text-xl text-foreground tracking-wider mb-3">FOR NFT PROJECTS</h3>
            <p className="text-sm text-muted-foreground mb-6">
              List your project on STAKEFORGE and give your community a reason to hold.
              We handle the infrastructure, security, and gamification — you bring the community.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <p className="font-display text-sm text-foreground mb-1">💰 Revenue Share</p>
                <p className="text-xs text-foreground/70">Earn kickbacks for bringing users and running successful raffles. Active projects get rewarded with points and future token allocations.</p>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <p className="font-display text-sm text-foreground mb-1">🎟️ Raffle Tools</p>
                <p className="text-xs text-foreground/70">Run raffles for your community with NFT, token, or ETH prizes. We handle payments and winner selection.</p>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <p className="font-display text-sm text-foreground mb-1">📦 Airdrop System</p>
                <p className="text-xs text-foreground/70">Send tokens, NFTs, or reward drops directly to your stakers. Build loyalty and keep your community engaged long-term.</p>
              </div>
            </div>

            {/* Master fee lock notice */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Platform network fee ($0.12/action) is locked — only the Master can change it. Project fees are customizable.</span>
            </div>

            <Button asChild className="mt-4 bg-accent text-accent-foreground font-display">
              <Link to="/auth">Get Started — List Your Project</Link>
            </Button>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground/60 max-w-lg mx-auto">
            ⚠️ All fees are subject to change during beta. Platform maintenance fees are non-negotiable
            and support ongoing security and infrastructure. Project listing fees are negotiated
            individually. No guarantees are made regarding future token launches or conversions.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
