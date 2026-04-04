import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft, Ticket, Trophy, Sparkles, Lock, Zap, Users, DollarSign, Dice1, Dice3, Dice5
} from "lucide-react";
import WalletModal from "@/components/WalletModal";

const digits4 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const Lottery = () => {
  const [picks, setPicks] = useState(["0", "0", "0", "0"]);

  const setDigit = (index: number, val: string) => {
    const updated = [...picks];
    updated[index] = val;
    setPicks(updated);
  };

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
        {/* Blur overlay */}
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
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              The Lottery is being built behind the scenes. Pick your lucky numbers, bet your points or tokens, 
              and compete for massive jackpots. Admin-controlled draws ensure fairness and transparency.
            </p>
            <Badge className="bg-accent/20 text-accent border-accent/30 font-display text-xs px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1" /> Stay tuned — something legendary is coming
            </Badge>
          </motion.div>
        </div>

        {/* Blurred content preview */}
        <div className="pointer-events-none select-none">
          {/* Hero */}
          <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <h1 className="font-display text-4xl text-foreground mb-3 tracking-wider">
              🎰 PICK YOUR <span className="text-accent">NUMBERS</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Choose 3 or 4 digits and bet with your points or tokens. Match the winning numbers and take home the jackpot!
            </p>
          </motion.div>

          {/* Number picker */}
          <div className="flex items-center justify-center gap-4 py-8">
            {picks.map((digit, i) => (
              <div key={i} className="w-20 h-28 rounded-xl border-2 border-primary/30 bg-card flex items-center justify-center">
                <span className="font-display text-5xl text-primary">{digit}</span>
              </div>
            ))}
          </div>

          {/* Digit selector row */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {digits4.map((d) => (
              <div
                key={d}
                className="w-10 h-10 rounded-lg border border-border bg-secondary/50 flex items-center justify-center font-display text-lg text-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Bet section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-sm text-foreground mb-1">BET WITH POINTS</h3>
              <p className="text-xs text-muted-foreground">Use your earned points to enter the draw</p>
              <div className="mt-3 rounded-lg bg-secondary/50 p-3">
                <span className="font-display text-2xl text-primary">500</span>
                <span className="text-xs text-muted-foreground ml-1">PTS</span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Trophy className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-display text-sm text-foreground mb-1">CURRENT JACKPOT</h3>
              <p className="text-xs text-muted-foreground">Growing with every ticket sold</p>
              <div className="mt-3 rounded-lg bg-accent/10 p-3">
                <span className="font-display text-2xl text-accent">25,000</span>
                <span className="text-xs text-muted-foreground ml-1">PTS</span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-sm text-foreground mb-1">ENTRIES</h3>
              <p className="text-xs text-muted-foreground">Players in the current round</p>
              <div className="mt-3 rounded-lg bg-secondary/50 p-3">
                <span className="font-display text-2xl text-foreground">142</span>
                <span className="text-xs text-muted-foreground ml-1">players</span>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8 mt-8">
            <h3 className="font-display text-lg text-foreground text-center tracking-wider mb-6">HOW IT WORKS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div>
                <Dice1 className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-xs text-foreground">PICK NUMBERS</p>
                <p className="text-[10px] text-muted-foreground">Choose 3 or 4 digits</p>
              </div>
              <div>
                <DollarSign className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-display text-xs text-foreground">PLACE BET</p>
                <p className="text-[10px] text-muted-foreground">Points or tokens</p>
              </div>
              <div>
                <Dice5 className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-xs text-foreground">ADMIN DRAW</p>
                <p className="text-[10px] text-muted-foreground">Fair & transparent</p>
              </div>
              <div>
                <Trophy className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-display text-xs text-foreground">WIN BIG</p>
                <p className="text-[10px] text-muted-foreground">Take the jackpot</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lottery;
