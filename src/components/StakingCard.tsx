import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Info, Lock, Unlock, TrendingUp, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import StakeModal from "./StakeModal";

interface StakingCardProps {
  id?: string;
  projectName: string;
  projectLogo?: string;
  apy: number;
  totalStaked: number;
  yourStake: number;
  lockPeriod: string;
  lockPeriodDays?: number;
  rewardToken: string;
  platformFeePct?: number;
  status: "active" | "locked" | "ended" | "paused";
}

const statusStyles: Record<string, string> = {
  active: "bg-neon-green/10 text-neon-green border-neon-green/30",
  locked: "bg-neon-gold/10 text-neon-gold border-neon-gold/30",
  paused: "bg-neon-gold/10 text-neon-gold border-neon-gold/30",
  ended: "bg-muted text-muted-foreground border-border",
};

const StakingCard = ({
  projectName,
  apy,
  totalStaked,
  yourStake,
  lockPeriod,
  lockPeriodDays = 30,
  rewardToken,
  platformFeePct = 2.5,
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
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            Reward: {rewardToken}
            <Tooltip>
              <TooltipTrigger><HelpCircle className="w-3 h-3" /></TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">You earn {rewardToken} tokens as rewards for staking. Rewards are distributed proportionally based on your stake amount and duration.</p>
              </TooltipContent>
            </Tooltip>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusStyles[status] || statusStyles.ended}>
            {status === "active" ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
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
                ⚠️ Staking involves risks. Your assets will be locked for the duration of the staking period.
                Rewards are subject to project terms. A platform fee of {platformFeePct}% applies to rewards,
                 plus a fixed $0.12 network maintenance fee on each stake/unstake. Always DYOR before staking.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-secondary/50 rounded-md p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-neon-green" />
            <span className="text-xs text-muted-foreground">Reward Rate</span>
            <Tooltip>
              <TooltipTrigger><HelpCircle className="w-2.5 h-2.5 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent>The estimated reward rate set by the project — earned as tokens &amp; badges, not financial yield.</TooltipContent>
            </Tooltip>
          </div>
          <p className="font-display text-xl text-neon-green">{apy}%</p>
        </div>
        <div className="bg-secondary/50 rounded-md p-3">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            Lock Period
            <Tooltip>
              <TooltipTrigger><HelpCircle className="w-2.5 h-2.5" /></TooltipTrigger>
              <TooltipContent>How long your assets stay locked. Soft stakes can be withdrawn anytime.</TooltipContent>
            </Tooltip>
          </p>
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
        {status === "active" ? (
          <StakeModal
            poolName={projectName}
            apy={apy}
            rewardToken={rewardToken}
            lockPeriodDays={lockPeriodDays}
            platformFeePct={platformFeePct}
          />
        ) : (
          <Button className="flex-1 font-display" disabled>
            {status === "paused" ? "Paused" : status === "locked" ? "Locked" : "Ended"}
          </Button>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary font-display">
              Details
            </Button>
          </TooltipTrigger>
          <TooltipContent>View full pool details, history, and project information.</TooltipContent>
        </Tooltip>
      </div>

      {/* Fee notice */}
      <p className="text-[9px] text-muted-foreground/50 mt-2 text-center">
        Fee: {platformFeePct}% on rewards + $0.12/action
      </p>
    </motion.div>
  );
};

export default StakingCard;
