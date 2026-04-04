import { motion } from "framer-motion";
import { Info, Lock, Unlock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface StakingCardProps {
  projectName: string;
  projectLogo?: string;
  apy: number;
  totalStaked: number;
  yourStake: number;
  lockPeriod: string;
  rewardToken: string;
  status: "active" | "locked" | "ended";
}

const statusStyles = {
  active: "bg-neon-green/10 text-neon-green border-neon-green/30",
  locked: "bg-neon-gold/10 text-neon-gold border-neon-gold/30",
  ended: "bg-muted text-muted-foreground border-border",
};

const StakingCard = ({
  projectName,
  apy,
  totalStaked,
  yourStake,
  lockPeriod,
  rewardToken,
  status,
}: StakingCardProps) => {
  return (
    <motion.div
      className="relative rounded-lg overflow-hidden gradient-border bg-card p-5 group"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg text-foreground">{projectName}</h3>
          <p className="text-muted-foreground text-sm">Reward: {rewardToken}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusStyles[status]}>
            {status === "locked" ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
            {status}
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-card border-border max-w-xs">
              <p className="text-xs">
                ⚠️ Staking involves risks. Your NFTs will be locked for the duration of the staking period.
                Rewards are subject to project terms. A small platform fee applies to all rewards.
                Always DYOR before staking.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-secondary/50 rounded-md p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-neon-green" />
            <span className="text-xs text-muted-foreground">APY</span>
          </div>
          <p className="font-display text-xl text-neon-green">{apy}%</p>
        </div>
        <div className="bg-secondary/50 rounded-md p-3">
          <p className="text-xs text-muted-foreground mb-1">Lock Period</p>
          <p className="font-display text-lg text-foreground">{lockPeriod}</p>
        </div>
        <div className="bg-secondary/50 rounded-md p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Staked</p>
          <p className="font-display text-lg text-primary">{totalStaked.toLocaleString()}</p>
        </div>
        <div className="bg-secondary/50 rounded-md p-3">
          <p className="text-xs text-muted-foreground mb-1">Your Stake</p>
          <p className="font-display text-lg text-neon-gold">{yourStake.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1 bg-primary text-primary-foreground font-display hover:bg-primary/90 box-glow-cyan transition-shadow">
          Stake Now
        </Button>
        <Button variant="outline" className="border-border text-foreground hover:bg-secondary font-display">
          Details
        </Button>
      </div>
    </motion.div>
  );
};

export default StakingCard;
