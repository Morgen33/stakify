import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Trophy, Gamepad2, Gift, Shield, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const SLIDES = [
  {
    icon: Zap,
    title: "STAKE & EARN",
    subtitle: "Double Rewards",
    desc: "Earn your project's rewards AND StakeForge points simultaneously. The more you stake, the more you earn.",
    color: "text-primary",
    glow: "bg-primary/20",
  },
  {
    icon: Gamepad2,
    title: "PLAY & WIN",
    subtitle: "Gamified Arcade",
    desc: "Spend your points in the arcade. Play games, compete on leaderboards, and win NFTs, tokens, and exclusive rewards.",
    color: "text-accent",
    glow: "bg-accent/20",
  },
  {
    icon: Gift,
    title: "SPIN & CLAIM",
    subtitle: "Prize Wheel",
    desc: "Spin the StakeForge wheel for a chance to win NFTs, ETH, tokens, and mystery prizes. Coming soon!",
    color: "text-neon-purple",
    glow: "bg-neon-purple/20",
  },
  {
    icon: TrendingUp,
    title: "RANK & RISE",
    subtitle: "Leaderboard System",
    desc: "Climb the ranks. Earn badges. Show off your profile ring. Top stakers get bonus rewards and airdrops.",
    color: "text-neon-green",
    glow: "bg-neon-green/20",
  },
  {
    icon: Sparkles,
    title: "POINTS → TOKENS?",
    subtitle: "Future Potential",
    desc: "Your accumulated points could become tokens in the future. Early participants benefit the most. Who knows what's coming?",
    color: "text-neon-gold",
    glow: "bg-neon-gold/20",
  },
];

const WelcomeSplash = () => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("sf_welcome_seen");
    if (!seen) setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem("sf_welcome_seen", "true");
  };

  const next = () => {
    if (current < SLIDES.length - 1) setCurrent(current + 1);
    else dismiss();
  };

  if (!visible) return null;

  const slide = SLIDES[current];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={dismiss} />

        <motion.div
          className="relative w-full max-w-lg rounded-2xl border border-border bg-card overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Glow effect */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 ${slide.glow} rounded-full blur-[100px] opacity-40`} />

          {/* Close */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
                <X className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Skip intro</TooltipContent>
          </Tooltip>

          <div className="relative p-8 text-center">
            {/* Icon */}
            <motion.div
              key={current}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="mx-auto mb-6"
            >
              <div className={`w-20 h-20 rounded-2xl ${slide.glow} border border-border flex items-center justify-center mx-auto`}>
                <slide.icon className={`w-10 h-10 ${slide.color}`} />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div key={`text-${current}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <p className={`font-display text-xs tracking-[0.3em] ${slide.color} mb-2`}>{slide.subtitle}</p>
              <h2 className="font-display text-3xl text-foreground mb-4 tracking-wider">{slide.title}</h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">{slide.desc}</p>
            </motion.div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mt-8 mb-6">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? `w-8 ${slide.color.replace("text-", "bg-")}` : "bg-border"}`}
                />
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" size="sm" className="font-display text-muted-foreground text-xs" onClick={dismiss}>
                Skip
              </Button>
              <Button size="sm" className="font-display bg-primary text-primary-foreground box-glow-cyan gap-1" onClick={next}>
                {current < SLIDES.length - 1 ? (
                  <>Next <ChevronRight className="w-3 h-3" /></>
                ) : (
                  <>Let's Go! <Zap className="w-3 h-3" /></>
                )}
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-[9px] text-muted-foreground/40 mt-6">
              Points and rewards are subject to platform terms. Token conversion is not guaranteed.
              All rewards, airdrops, and prize wheels are at the discretion of project owners and platform admins.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeSplash;
