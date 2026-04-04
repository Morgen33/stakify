import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Power, Gamepad2, Trophy, Ticket, Gift, Snowflake } from "lucide-react";

const FEATURE_TOGGLES = [
  { key: "feature_arcade", label: "Arcade", icon: Gamepad2, description: "Enable/disable the arcade games section" },
  { key: "feature_leaderboard", label: "Leaderboard", icon: Trophy, description: "Show/hide the leaderboard on the homepage" },
  { key: "feature_raffle", label: "Raffle House", icon: Ticket, description: "Enable/disable the raffle ticket system" },
  { key: "feature_prize_wheel", label: "Prize Wheel", icon: Gift, description: "Enable/disable the prize wheel in the arcade" },
  { key: "feature_seasonal_decorations", label: "Seasonal Decorations", icon: Snowflake, description: "Show seasonal themed banners and animations" },
];

const SEASONAL_THEMES = ["none", "winter", "summer", "fall", "spring", "valentines", "holiday", "celebration"];

interface FeatureTogglesProps {
  isAdmin?: boolean;
}

const FeatureToggles = ({ isAdmin = false }: FeatureTogglesProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [seasonalMessage, setSeasonalMessage] = useState("");
  const [seasonalTheme, setSeasonalTheme] = useState("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("platform_settings").select("*");
    const map: Record<string, string> = {};
    (data || []).forEach(s => { map[s.key] = s.value; });
    setSettings(map);
    setSeasonalMessage(map.seasonal_message || "");
    setSeasonalTheme(map.seasonal_theme || "none");
    setLoading(false);
  };

  const toggleFeature = async (key: string, currentValue: string) => {
    const newValue = currentValue === "true" ? "false" : "true";
    const { error } = await supabase.from("platform_settings").update({ value: newValue }).eq("key", key);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: `${newValue === "true" ? "✅ Enabled" : "⏸️ Disabled"}` });
      setSettings({ ...settings, [key]: newValue });
    }
  };

  const saveSeasonal = async () => {
    await Promise.all([
      supabase.from("platform_settings").update({ value: seasonalTheme }).eq("key", "seasonal_theme"),
      supabase.from("platform_settings").update({ value: seasonalMessage }).eq("key", "seasonal_message"),
    ]);
    toast({ title: "✅ Seasonal settings saved" });
    setSettings({ ...settings, seasonal_theme: seasonalTheme, seasonal_message: seasonalMessage });
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Feature Toggles */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-display text-sm text-foreground mb-4 tracking-wider flex items-center gap-2">
          <Power className="w-4 h-4 text-primary" /> FEATURE CONTROLS
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Toggle platform features on and off instantly. Changes take effect immediately.</p>
        <div className="space-y-3">
          {FEATURE_TOGGLES.map((feature) => {
            const isEnabled = settings[feature.key] === "true";
            return (
              <div key={feature.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center gap-3">
                  <feature.icon className={`w-4 h-4 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-display text-xs text-foreground">{feature.label}</p>
                    <p className="text-[10px] text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => toggleFeature(feature.key, settings[feature.key] || "false")}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Seasonal Decorations */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-display text-sm text-foreground mb-4 tracking-wider flex items-center gap-2">
          <Snowflake className="w-4 h-4 text-accent" /> SEASONAL DECORATIONS
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-muted-foreground font-display tracking-wider">THEME</label>
            <select
              value={seasonalTheme}
              onChange={(e) => setSeasonalTheme(e.target.value)}
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground mt-1"
            >
              {SEASONAL_THEMES.map((t) => (
                <option key={t} value={t}>{t === "none" ? "None (disabled)" : t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground font-display tracking-wider">CUSTOM MESSAGE</label>
            <Input
              value={seasonalMessage}
              onChange={(e) => setSeasonalMessage(e.target.value)}
              placeholder="e.g. Happy Holidays from StakeForge! 🎄"
              className="bg-secondary border-border text-sm mt-1"
            />
          </div>
          <Button onClick={saveSeasonal} size="sm" className="bg-accent text-accent-foreground font-display text-xs">
            <Save className="w-3 h-3 mr-1" /> Save Seasonal Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeatureToggles;
