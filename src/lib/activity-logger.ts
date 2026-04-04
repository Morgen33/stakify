import { supabase } from "@/integrations/supabase/client";

type EventType = "error" | "warning" | "info" | "action" | "security" | "payment" | "system";
type Severity = "critical" | "high" | "medium" | "low" | "info";

interface LogEntry {
  event_type: EventType;
  severity: Severity;
  message: string;
  details?: Record<string, any>;
  error_code?: string;
  source?: string;
}

export const generateErrorCode = () => {
  const prefix = "SF";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const logActivity = async (entry: LogEntry) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("activity_log").insert({
      ...entry,
      user_id: user?.id || null,
      details: entry.details || {},
    });
  } catch (e) {
    console.error("[ActivityLogger] Failed to log:", e);
  }
};

export const logError = async (message: string, error: any, source?: string) => {
  const errorCode = generateErrorCode();
  await logActivity({
    event_type: "error",
    severity: "high",
    message,
    error_code: errorCode,
    source: source || "client",
    details: {
      errorMessage: error?.message || String(error),
      stack: error?.stack?.slice(0, 500),
    },
  });
  return errorCode;
};

export const logAction = async (message: string, details?: Record<string, any>) => {
  await logActivity({
    event_type: "action",
    severity: "info",
    message,
    source: "admin",
    details,
  });
};

export const logSecurity = async (message: string, severity: Severity = "high", details?: Record<string, any>) => {
  await logActivity({
    event_type: "security",
    severity,
    message,
    source: "system",
    details,
  });
};
