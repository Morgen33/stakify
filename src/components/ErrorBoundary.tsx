import { Component, ReactNode } from "react";
import { AlertTriangle, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateErrorCode } from "@/lib/activity-logger";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorCode: string;
  errorMessage: string;
  copied: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorCode: "", errorMessage: "", copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, errorMessage: error.message, errorCode: generateErrorCode() };
  }

  componentDidCatch(error: Error, info: any) {
    // Log to activity_log
    supabase.auth.getUser().then(({ data: { user } }) => {
      supabase.from("activity_log").insert({
        event_type: "error",
        severity: "critical",
        message: `Unhandled UI crash: ${error.message}`,
        error_code: this.state.errorCode,
        source: "error_boundary",
        user_id: user?.id || null,
        details: {
          errorMessage: error.message,
          stack: error.stack?.slice(0, 1000),
          componentStack: info?.componentStack?.slice(0, 500),
        },
      });
    });
  }

  handleCopy = () => {
    navigator.clipboard.writeText(this.state.errorCode);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  handleRetry = () => {
    this.setState({ hasError: false, errorCode: "", errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-xl border border-destructive/30 bg-card p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground tracking-wider mb-2">
                SOMETHING WENT WRONG
              </h2>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. Please copy the error code below and contact support.
              </p>
            </div>

            {/* Error Code - Copyable */}
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-[10px] text-muted-foreground font-display tracking-wider mb-2">ERROR CODE</p>
              <div className="flex items-center justify-center gap-2">
                <code className="font-display text-lg text-destructive tracking-widest">
                  {this.state.errorCode}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={this.handleCopy}
                >
                  {this.state.copied ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/60">
              {this.state.errorMessage}
            </p>

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleRetry} className="font-display bg-primary text-primary-foreground box-glow-cyan">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/"} className="font-display">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
