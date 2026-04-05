import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  /** The blurred preview content */
  children: ReactNode;
  /** Section title */
  title: string;
  /** Short description */
  description: string;
  /** Icon component */
  icon: LucideIcon;
  /** Feature pills to show */
  features?: { icon: LucideIcon; label: string }[];
  /** Custom badge text */
  badgeText?: string;
  /** Blur intensity (default 5) */
  blurIntensity?: number;
}

const ComingSoon = ({
  children,
  title,
  description,
  icon: Icon,
  features = [],
  badgeText = "🚧 COMING SOON",
  blurIntensity = 5,
}: ComingSoonProps) => {
  return (
    <motion.div
      className="rounded-xl border border-accent/20 bg-card relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Blurred preview */}
      <div
        className="pointer-events-none select-none p-5"
        style={{ filter: `blur(${blurIntensity}px)` }}
      >
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/40 backdrop-blur-[2px]">
        <div className="w-14 h-14 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mb-3">
          <Icon className="w-7 h-7 text-accent" />
        </div>
        <h3 className="font-display text-base text-foreground tracking-wider mb-1">{title}</h3>
        <p className="text-[11px] text-muted-foreground text-center max-w-[220px] mb-3">{description}</p>
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mb-3">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-border bg-secondary/30 text-[9px] text-muted-foreground font-display">
                <f.icon className="w-3 h-3" /> {f.label}
              </div>
            ))}
          </div>
        )}
        <Badge variant="outline" className="font-display text-[10px] border-accent/40 text-accent px-3 py-1 animate-pulse">
          {badgeText}
        </Badge>
      </div>
    </motion.div>
  );
};

export default ComingSoon;
