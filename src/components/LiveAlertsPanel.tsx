import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Info, Zap, XCircle, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveAlert {
  id: string;
  event_type: string;
  message: string;
  severity: string;
  source: string | null;
  error_code: string | null;
  created_at: string;
  resolved: boolean;
}

const severityConfig: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-primary", bg: "bg-primary/5 border-primary/20" },
  warning: { icon: AlertTriangle, color: "text-accent", bg: "bg-accent/5 border-accent/20" },
  error: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/5 border-destructive/20" },
  critical: { icon: Zap, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
  success: { icon: CheckCircle2, color: "text-neon-green", bg: "bg-neon-green/5 border-neon-green/20" },
};

interface LiveAlertsPanelProps {
  maxAlerts?: number;
}

const LiveAlertsPanel = ({ maxAlerts = 50 }: LiveAlertsPanelProps) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [newAlertCount, setNewAlertCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAlerts();

    // Subscribe to realtime alerts
    const channel = supabase
      .channel("live-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => {
          const newAlert = payload.new as LiveAlert;
          setAlerts((prev) => [newAlert, ...prev].slice(0, maxAlerts));
          setNewAlertCount((c) => c + 1);

          // Auto-scroll
          if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(maxAlerts);
    if (data) setAlerts(data as LiveAlert[]);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-display text-xs text-foreground tracking-wider">LIVE ALERTS</span>
          {newAlertCount > 0 && (
            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary font-display">
              +{newAlertCount}
            </Badge>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">{alerts.length} events</span>
      </div>

      <div ref={scrollRef} className="max-h-[400px] overflow-y-auto divide-y divide-border/50">
        <AnimatePresence>
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity] || severityConfig.info;
            const Icon = config.icon;
            return (
              <motion.div
                key={alert.id}
                className={`p-3 ${config.bg} border-l-2`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-display text-[10px] tracking-wider ${config.color}`}>
                        {alert.event_type.toUpperCase()}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{formatTime(alert.created_at)}</span>
                      {alert.error_code && (
                        <code className="text-[9px] px-1 py-0.5 rounded bg-secondary text-destructive font-mono">
                          {alert.error_code}
                        </code>
                      )}
                      {alert.resolved && (
                        <CheckCircle2 className="w-3 h-3 text-neon-green" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 break-words">{alert.message}</p>
                    {alert.source && (
                      <span className="text-[9px] text-muted-foreground/60">Source: {alert.source}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {alerts.length === 0 && (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-display">No alerts — all systems operational</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAlertsPanel;
