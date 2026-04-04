import { motion } from "framer-motion";
import { Copy, Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const ReferralPanel = () => {
  const { toast } = useToast();
  const referralCode = "STAKE-X7K9M2";
  const referralLink = `https://stakeplatform.io/ref/${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-neon-purple" />
        <h2 className="font-display text-lg text-foreground">Refer & Earn</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Earn <span className="text-neon-gold font-display">250 pts</span> for every friend who stakes. 
        Your referrals also get a bonus!
      </p>

      <div className="bg-secondary/50 rounded-md p-3 flex items-center gap-2 mb-3">
        <code className="flex-1 text-xs text-primary font-mono truncate">{referralLink}</code>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-primary"
              onClick={copyToClipboard}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-card border-border">
            <p className="text-xs">Copy referral link</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="font-display text-lg text-foreground">3</p>
          <p className="text-[10px] text-muted-foreground">Referrals</p>
        </div>
        <div>
          <p className="font-display text-lg text-neon-gold">750</p>
          <p className="text-[10px] text-muted-foreground">Pts Earned</p>
        </div>
        <div>
          <p className="font-display text-lg text-neon-green">2</p>
          <p className="text-[10px] text-muted-foreground">Active</p>
        </div>
      </div>

      <Button className="w-full mt-3 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/30 font-display" variant="outline">
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </div>
  );
};

export default ReferralPanel;
