import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Snowflake, Sun, Leaf, Heart, PartyPopper, Sparkles } from "lucide-react";

const THEMES: Record<string, { icon: any; colors: string; particles: string[] }> = {
  winter: { icon: Snowflake, colors: "from-blue-500/10 to-cyan-500/10 border-blue-500/20", particles: ["❄️", "🌨️", "⛄", "✨"] },
  summer: { icon: Sun, colors: "from-yellow-500/10 to-orange-500/10 border-yellow-500/20", particles: ["☀️", "🌴", "🏖️", "🌊"] },
  fall: { icon: Leaf, colors: "from-orange-500/10 to-red-500/10 border-orange-500/20", particles: ["🍂", "🍁", "🎃", "🍄"] },
  spring: { icon: Sparkles, colors: "from-green-500/10 to-emerald-500/10 border-green-500/20", particles: ["🌸", "🌷", "🦋", "🌱"] },
  valentines: { icon: Heart, colors: "from-pink-500/10 to-red-500/10 border-pink-500/20", particles: ["❤️", "💕", "🌹", "💝"] },
  holiday: { icon: PartyPopper, colors: "from-red-500/10 to-green-500/10 border-red-500/20", particles: ["🎄", "🎁", "⭐", "🔔"] },
  celebration: { icon: PartyPopper, colors: "from-accent/10 to-primary/10 border-accent/20", particles: ["🎉", "🎊", "🥳", "✨"] },
};

const SeasonalBanner = () => {
  const [theme, setTheme] = useState<string>("none");
  const [message, setMessage] = useState<string>("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("platform_settings").select("*").in("key", ["seasonal_theme", "seasonal_message", "feature_seasonal_decorations"]);
      const settings = Object.fromEntries((data || []).map(s => [s.key, s.value]));
      if (settings.feature_seasonal_decorations === "false") return;
      setTheme(settings.seasonal_theme || "none");
      setMessage(settings.seasonal_message || "");
    };
    fetchSettings();
  }, []);

  if (theme === "none" || !THEMES[theme] || dismissed) return null;

  const t = THEMES[theme];
  const Icon = t.icon;

  return (
    <AnimatePresence>
      <motion.div
        className={`relative overflow-hidden border-b bg-gradient-to-r ${t.colors} py-2.5 px-4`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {t.particles.map((p, i) => (
            <motion.span
              key={i}
              className="absolute text-sm opacity-40"
              initial={{ x: `${Math.random() * 100}%`, y: -20 }}
              animate={{ y: "120%", x: `${Math.random() * 100}%` }}
              transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
            >
              {p}
            </motion.span>
          ))}
        </div>

        <div className="container max-w-7xl mx-auto flex items-center justify-center gap-3 relative z-10">
          <Icon className="w-4 h-4 text-foreground/70" />
          <p className="text-xs text-foreground/80 font-display tracking-wide">
            {message || `${theme.charAt(0).toUpperCase() + theme.slice(1)} event is live!`}
          </p>
          <button onClick={() => setDismissed(true)} className="text-foreground/40 hover:text-foreground/70 ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SeasonalBanner;
