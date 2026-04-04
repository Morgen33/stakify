import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, AlertCircle, Info, Shield, Zap,
  CheckCircle2, RefreshCw, Bell, BellOff, XCircle
} from "lucide-react";

const severityConfig: Record<string, { color: string; icon: any; pulse: boolean }> = {
  critical: { color: "text-destructive", icon: XCircle, pulse: true },
  high: { color: "text-destructive", icon: AlertTriangle, pulse: true },
  medium: { color: "text-accent", icon: AlertCircle, pulse: false },
  low: { color: "text-muted-foreground", icon: Info, pulse: false },
  info: { color: "text-primary", icon: Info, pulse: false },
};

const typeIcons: Record<string, any> = {
  error: AlertTriangle,
  warning: AlertCircle,
  security: Shield,
  action: Zap,
  info: Info,
  payment: Info,
  system: Info,
};

const BattleLog = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [liveMode, setLiveMode] = useState(true);
  const [unresolved, setUnresolved] = useState(0);

  const fetchLogs = useCallback(async () => {
    const { data } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    const fetched = data || [];
    setLogs(fetched);
    setUnresolved(fetched.filter((l: any) => !l.resolved && (l.severity === "critical" || l.severity === "high")).length);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Realtime subscription
  useEffect(() => {
    if (!liveMode) return;
    const channel = supabase
      .channel("battle-log")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, (payload) => {
        setLogs((prev) => [payload.new as any, ...prev].slice(0, 100));
        const newLog = payload.new as any;
        if (newLog.severity === "critical" || newLog.severity === "high") {
          setUnresolved((prev) => prev + 1);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [liveMode]);

  const resolveLog = async (id: string) => {
    await supabase.from("activity_log").update({ resolved: true, resolved_at: new Date().toISOString() }).eq("id", id);
    fetchLogs();
  };

  const timeSince = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-sm text-foreground tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> BATTLE LOG
          </h3>
          {unresolved > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-display animate-pulse-glow">
              {unresolved} UNRESOLVED
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLiveMode(!liveMode)}
            className={`text-xs font-display gap-1 ${liveMode ? "text-primary" : "text-muted-foreground"}`}
          >
            {liveMode ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
            {liveMode ? "LIVE" : "PAUSED"}
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchLogs} className="text-xs">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Live indicator */}
      {liveMode && (
        <div className="flex items-center gap-2 text-[10px] text-primary font-display">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          LIVE MONITORING ACTIVE
        </div>
      )}

      {/* Log entries */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {logs.map((log) => {
          const config = severityConfig[log.severity] || severityConfig.info;
          const TypeIcon = typeIcons[log.event_type] || Info;
          const SevIcon = config.icon;
          return (
            <div
              key={log.id}
              className={`rounded-lg border p-3 transition-all ${
                log.resolved
                  ? "border-border bg-secondary/20 opacity-60"
                  : log.severity === "critical"
                  ? "border-destructive/40 bg-destructive/5"
                  : log.severity === "high"
                  ? "border-destructive/20 bg-destructive/5"
                  : "border-border bg-secondary/30"
              } ${config.pulse && !log.resolved ? "animate-pulse-glow" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <SevIcon className={`w-4 h-4 shrink-0 mt-0.5 ${config.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-display ${
                        log.event_type === "error" ? "bg-destructive/10 text-destructive" :
                        log.event_type === "security" ? "bg-accent/10 text-accent" :
                        log.event_type === "warning" ? "bg-accent/10 text-accent" :
                        "bg-primary/10 text-primary"
                      }`}>
                        {log.event_type.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-display ${config.color}`}>
                        {log.severity.toUpperCase()}
                      </span>
                      {log.error_code && (
                        <code className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                          {log.error_code}
                        </code>
                      )}
                      <span className="text-[10px] text-muted-foreground/60">{timeSince(log.created_at)}</span>
                    </div>
                    <p className="text-xs text-foreground mt-1">{log.message}</p>
                    {log.source && (
                      <span className="text-[10px] text-muted-foreground">Source: {log.source}</span>
                    )}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <details className="mt-1">
                        <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">Details</summary>
                        <pre className="text-[10px] text-muted-foreground mt-1 overflow-x-auto bg-background/50 p-2 rounded max-h-32 overflow-y-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                {!log.resolved && (log.severity === "critical" || log.severity === "high" || log.severity === "medium") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => resolveLog(log.id)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-8 h-8 text-primary/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-display">ALL CLEAR — NO EVENTS LOGGED</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleLog;
