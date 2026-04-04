import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Loader2 } from "lucide-react";

interface Prize {
  label: string;
  icon: string;
  color: string;
  weight: number; // Higher = more likely
}

interface PrizeWheelProps {
  prizes?: Prize[];
  onSpin?: (prize: Prize) => void;
  disabled?: boolean;
  spinCost?: number;
}

const defaultPrizes: Prize[] = [
  { label: "50 Points", icon: "⭐", color: "hsl(var(--primary))", weight: 30 },
  { label: "100 Points", icon: "🌟", color: "hsl(var(--accent))", weight: 25 },
  { label: "Try Again", icon: "🔄", color: "hsl(var(--muted))", weight: 20 },
  { label: "250 Points", icon: "💫", color: "hsl(var(--primary))", weight: 12 },
  { label: "Fee Discount", icon: "💰", color: "hsl(var(--accent))", weight: 8 },
  { label: "500 Points", icon: "🎯", color: "hsl(var(--primary))", weight: 3 },
  { label: "Rare Badge", icon: "🏆", color: "hsl(var(--accent))", weight: 1.5 },
  { label: "JACKPOT", icon: "💎", color: "hsl(var(--destructive))", weight: 0.5 },
];

function weightedRandom(prizes: Prize[]): number {
  const total = prizes.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < prizes.length; i++) {
    r -= prizes[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}

const PrizeWheel = ({ prizes = defaultPrizes, onSpin, disabled = false, spinCost = 100 }: PrizeWheelProps) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const segmentAngle = 360 / prizes.length;

  const handleSpin = () => {
    if (spinning || disabled) return;

    setSpinning(true);
    setResult(null);

    const winIndex = weightedRandom(prizes);
    // Calculate rotation: multiple full spins + land on the winning segment
    // The pointer is at top (0°), so we need the winning segment centered there
    const targetAngle = 360 - (winIndex * segmentAngle + segmentAngle / 2);
    const fullSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const finalRotation = rotation + fullSpins * 360 + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(prizes[winIndex]);
      onSpin?.(prizes[winIndex]);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Wheel */}
      <div className="relative w-72 h-72">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
        </div>

        {/* Wheel circle */}
        <motion.div
          className="w-full h-full rounded-full border-4 border-primary/30 relative overflow-hidden shadow-2xl"
          style={{ rotate: rotation }}
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
        >
          {prizes.map((prize, i) => {
            const startAngle = i * segmentAngle;
            const skew = 90 - segmentAngle;
            return (
              <div
                key={i}
                className="absolute w-1/2 h-1/2 origin-bottom-right"
                style={{
                  transform: `rotate(${startAngle}deg) skewY(-${skew}deg)`,
                  top: 0,
                  right: "50%",
                }}
              >
                <div
                  className="w-full h-full border-r border-border/20"
                  style={{
                    background: i % 2 === 0
                      ? "hsl(var(--card))"
                      : "hsl(var(--secondary))",
                  }}
                />
              </div>
            );
          })}
          {/* Prize labels (positioned in center of segments) */}
          {prizes.map((prize, i) => {
            const angle = i * segmentAngle + segmentAngle / 2;
            const rad = (angle - 90) * (Math.PI / 180);
            const x = 50 + 30 * Math.cos(rad);
            const y = 50 + 30 * Math.sin(rad);
            return (
              <div
                key={`label-${i}`}
                className="absolute text-center pointer-events-none"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                }}
              >
                <span className="text-lg">{prize.icon}</span>
                <p className="text-[8px] font-display text-foreground/80 whitespace-nowrap">{prize.label}</p>
              </div>
            );
          })}
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center shadow-lg">
            <Gift className="w-6 h-6 text-primary" />
          </div>
        </motion.div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && !spinning && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-4xl mb-2">{result.icon}</p>
            <p className="font-display text-xl text-foreground">{result.label}</p>
            <p className="text-xs text-muted-foreground mt-1">Congratulations!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={spinning || disabled}
        className="font-display bg-primary text-primary-foreground box-glow-cyan px-8"
        size="lg"
      >
        {spinning ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Spinning...</>
        ) : (
          <><Gift className="w-4 h-4 mr-2" /> Spin ({spinCost} pts)</>
        )}
      </Button>

      <p className="text-[10px] text-muted-foreground text-center max-w-xs">
        Each spin costs {spinCost} points. Prizes are subject to availability. 
        Win rates are set by the platform and may change without notice.
      </p>
    </div>
  );
};

export default PrizeWheel;
