import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft, Ticket, Trophy, Sparkles, Lock, Zap, Users, DollarSign,
  Dice1, Dice5, Clock, Timer, Calendar, Image, Coins
} from "lucide-react";
import WalletModal from "@/components/WalletModal";

const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const drawTypes = [
  { label: "Hourly", icon: Timer, duration: "Every hour", color: "text-primary" },
  { label: "Daily", icon: Clock, duration: "Every 24h", color: "text-accent" },
  { label: "Weekly", icon: Calendar, duration: "Every 7 days", color: "text-primary" },
];

const prizeTypes = [
  { name: "ETH", icon: "⟠", desc: "Ethereum", gradient: "from-primary/20 to-primary/5" },
  { name: "SOL", icon: "◎", desc: "Solana", gradient: "from-accent/20 to-accent/5" },
  { name: "USDC", icon: "💲", desc: "Stablecoin", gradient: "from-primary/15 to-accent/10" },
  { name: "NFT", icon: "🖼️", desc: "Digital Art", gradient: "from-accent/20 to-primary/5" },
];

const Lottery = () => {
  const [picks, setPicks] = useState(["0", "0", "0", "0"]);

  return (
    <div className="min-h-screen bg-background bg-grid">
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ticket className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl text-accent tracking-widest">LOTTERY</h2>
            <Badge variant="outline" className="font-display text-[9px] border-accent/40 text-accent animate-pulse">COMING SOON</Badge>
          </div>
          <div className="flex items-center gap-3">
            <WalletModal />
            <Button variant="outline" size="sm" asChild className="font-display text-xs">
              <Link to="/"><ArrowLeft className="w-3 h-3 mr-1" /> Home</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container max-w-5xl mx-auto px-4 py-10 space-y-10 relative">
        {/* Coming Soon overlay */}
        <div className="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm bg-background/40 rounded-xl">
          <motion.div
            className="text-center space-y-4 p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mx-auto w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
              <Lock className="w-12 h-12 text-accent" />
            </div>
            <h2 className="font-display text-3xl text-foreground tracking-wider">COMING SOON</h2>
            <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
              The Lottery is being built behind the scenes. Pick your lucky 3 or 4 digit numbers, 
              bet with points, tokens, ETH, SOL, or USDC — and compete for massive jackpots including 
              NFTs and crypto prizes. Admin-controlled timed draws (hourly, daily, or weekly) ensure 
              fairness, transparency, and maximum excitement.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {prizeTypes.map((p) => (
                <Badge key={p.name} variant="outline" className="font-display text-[10px] border-border text-muted-foreground gap-1">
                  <span>{p.icon}</span> {p.name}
                </Badge>
              ))}
            </div>
            <Badge className="bg-accent/20 text-accent border-accent/30 font-display text-xs px-4 py-1.5 animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" /> Something legendary is coming
            </Badge>
          </motion.div>
        </div>

        {/* Blurred preview content */}
        <div className="pointer-events-none select-none">
          {/* Hero */}
          <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 0.35 }}>
            <h1 className="font-display text-4xl text-foreground mb-3 tracking-wider">
              🎰 PICK YOUR <span className="text-accent">NUMBERS</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Choose 3 or 4 digits, bet with points, crypto, or tokens. Match the winning draw and take the pot!
            </p>
          </motion.div>

          {/* Draw type selector */}
          <div className="flex items-center justify-center gap-4 pt-4">
            {drawTypes.map((dt) => (
              <div key={dt.label} className="rounded-xl border border-border bg-card px-5 py-3 text-center min-w-[110px]">
                <dt.icon className={`w-5 h-5 mx-auto mb-1 ${dt.color}`} />
                <p className="font-display text-xs text-foreground">{dt.label}</p>
                <p className="text-[9px] text-muted-foreground">{dt.duration}</p>
              </div>
            ))}
          </div>

          {/* Number picker */}
          <div className="flex items-center justify-center gap-4 py-6">
            {picks.map((digit, i) => (
              <div key={i} className="w-20 h-28 rounded-xl border-2 border-primary/30 bg-card flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <span className="font-display text-5xl text-primary relative">{digit}</span>
              </div>
            ))}
          </div>

          {/* Digit buttons */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {digits.map((d) => (
              <div key={d} className="w-10 h-10 rounded-lg border border-border bg-secondary/50 flex items-center justify-center font-display text-lg text-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Prize types showcase */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {prizeTypes.map((p) => (
              <div key={p.name} className={`rounded-xl border border-border bg-gradient-to-br ${p.gradient} p-5 text-center`}>
                <span className="text-3xl block mb-2">{p.icon}</span>
                <p className="font-display text-sm text-foreground">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Bet & jackpot section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Coins className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-sm text-foreground mb-1">BET WITH</h3>
              <p className="text-xs text-muted-foreground">Points · ETH · SOL · USDC · Tokens</p>
              <div className="mt-3 rounded-lg bg-secondary/50 p-3 flex items-center justify-center gap-2">
                <span className="font-display text-xl text-primary">500</span>
                <span className="text-xs text-muted-foreground">PTS</span>
                <span className="text-muted-foreground">|</span>
                <span className="font-display text-xl text-accent">0.01</span>
                <span className="text-xs text-muted-foreground">ETH</span>
              </div>
            </div>
            <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 p-6 text-center">
              <Trophy className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-display text-sm text-foreground mb-1">JACKPOT</h3>
              <p className="text-xs text-muted-foreground">Grows with every ticket</p>
              <div className="mt-3 rounded-lg bg-accent/10 p-3">
                <span className="font-display text-2xl text-accent">2.5 ETH</span>
                <p className="text-[9px] text-muted-foreground mt-1">+ 50,000 PTS + 1 NFT</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-sm text-foreground mb-1">THIS ROUND</h3>
              <p className="text-xs text-muted-foreground">Players entered</p>
              <div className="mt-3 rounded-lg bg-secondary/50 p-3">
                <span className="font-display text-2xl text-foreground">142</span>
                <span className="text-xs text-muted-foreground ml-1">players</span>
              </div>
            </div>
          </div>

          {/* Timer countdown */}
          <div className="rounded-xl border border-primary/20 bg-card p-6 text-center mt-6">
            <p className="font-display text-xs text-muted-foreground tracking-widest mb-3">NEXT DRAW IN</p>
            <div className="flex items-center justify-center gap-3">
              {[
                { val: "00", label: "DAYS" },
                { val: "04", label: "HRS" },
                { val: "32", label: "MIN" },
                { val: "17", label: "SEC" },
              ].map((t, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-lg border border-primary/20 bg-secondary/30 flex items-center justify-center">
                    <span className="font-display text-2xl text-primary">{t.val}</span>
                  </div>
                  <p className="text-[8px] text-muted-foreground font-display mt-1">{t.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8 mt-8">
            <h3 className="font-display text-lg text-foreground text-center tracking-wider mb-6">HOW IT WORKS</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
              <div>
                <Dice1 className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-xs text-foreground">PICK NUMBERS</p>
                <p className="text-[10px] text-muted-foreground">3 or 4 digits</p>
              </div>
              <div>
                <DollarSign className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-display text-xs text-foreground">PLACE BET</p>
                <p className="text-[10px] text-muted-foreground">Crypto or points</p>
              </div>
              <div>
                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-xs text-foreground">TIMED DRAW</p>
                <p className="text-[10px] text-muted-foreground">Hourly to weekly</p>
              </div>
              <div>
                <Dice5 className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-display text-xs text-foreground">ADMIN DRAW</p>
                <p className="text-[10px] text-muted-foreground">Fair & transparent</p>
              </div>
              <div>
                <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-xs text-foreground">WIN BIG</p>
                <p className="text-[10px] text-muted-foreground">ETH · NFTs · Tokens</p>
              </div>
            </div>
          </div>

          {/* Prize gallery preview */}
          <div className="mt-8">
            <h3 className="font-display text-sm text-foreground text-center tracking-wider mb-4">POTENTIAL PRIZES</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { emoji: "⟠", label: "0.5 ETH", sub: "Ethereum" },
                { emoji: "◎", label: "10 SOL", sub: "Solana" },
                { emoji: "🖼️", label: "Rare NFT", sub: "Blue Chip Collection" },
                { emoji: "🪙", label: "10,000 PTS", sub: "Platform Points" },
              ].map((prize, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center text-2xl mx-auto mb-2">
                    {prize.emoji}
                  </div>
                  <p className="font-display text-sm text-foreground">{prize.label}</p>
                  <p className="text-[9px] text-muted-foreground">{prize.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lottery;
