import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProfileRingProps {
  name: string;
  level: number;
  points: number;
  rank: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
}

const rankColors: Record<string, string> = {
  Bronze: "stroke-neon-gold/50",
  Silver: "stroke-muted-foreground",
  Gold: "stroke-neon-gold",
  Platinum: "stroke-neon-cyan",
  Diamond: "stroke-neon-purple",
};

const rankGlows: Record<string, string> = {
  Bronze: "",
  Silver: "",
  Gold: "box-glow-gold",
  Platinum: "box-glow-cyan",
  Diamond: "box-glow-purple",
};

const sizes = {
  sm: { container: "w-12 h-12", svg: 48, radius: 20, stroke: 3, text: "text-[10px]" },
  md: { container: "w-20 h-20", svg: 80, radius: 34, stroke: 4, text: "text-xs" },
  lg: { container: "w-28 h-28", svg: 112, radius: 48, stroke: 5, text: "text-sm" },
};

const ProfileRing = ({ name, level, points, rank, avatarUrl, size = "md" }: ProfileRingProps) => {
  const s = sizes[size];
  const circumference = 2 * Math.PI * s.radius;
  const progress = Math.min((points % 1000) / 1000, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className={`relative ${s.container} cursor-pointer`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Background ring */}
          <svg className="absolute inset-0" width={s.svg} height={s.svg}>
            <circle
              cx={s.svg / 2}
              cy={s.svg / 2}
              r={s.radius}
              fill="none"
              className="stroke-muted"
              strokeWidth={s.stroke}
            />
            <motion.circle
              cx={s.svg / 2}
              cy={s.svg / 2}
              r={s.radius}
              fill="none"
              className={rankColors[rank] || "stroke-primary"}
              strokeWidth={s.stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              transform={`rotate(-90 ${s.svg / 2} ${s.svg / 2})`}
            />
          </svg>
          {/* Avatar */}
          <div className={`absolute inset-[${s.stroke + 2}px] rounded-full overflow-hidden bg-secondary flex items-center justify-center`}
               style={{ inset: `${s.stroke + 2}px` }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className={`font-display ${s.text} text-foreground`}>
                {name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          {/* Level badge */}
          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-1.5 py-0.5 ${s.text} font-display text-primary`}>
            {level}
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent className="bg-card border-border">
        <div className="text-center">
          <p className="font-display text-primary text-sm">{name}</p>
          <p className="text-muted-foreground text-xs">Rank: {rank}</p>
          <p className="text-neon-gold text-xs">{points.toLocaleString()} pts</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default ProfileRing;
