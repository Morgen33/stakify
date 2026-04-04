import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorToastProps {
  errorCode: string;
  message: string;
}

const ErrorToast = ({ errorCode, message }: ErrorToastProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(errorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-body">{message}</p>
      <div className="flex items-center gap-2 bg-secondary/50 rounded-md px-3 py-1.5">
        <code className="font-display text-xs text-destructive tracking-wider flex-1">{errorCode}</code>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopy}>
          {copied ? <CheckCircle2 className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">Copy this code if you need to contact support.</p>
    </div>
  );
};

export default ErrorToast;
