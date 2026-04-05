import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, HelpCircle, AlertTriangle, Zap, Shield, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useStakeForge, StakeMode } from "@/lib/contracts/useStakeForge";
import { getEthPrice, formatMicroFee } from "@/lib/contracts/priceFeed";
import { IS_TESTNET } from "@/lib/contracts/config";

// Platform maintenance fee per stake/unstake action
const PLATFORM_MICRO_FEE_USDC = 0.12;

type StakeType = "soft" | "hard" | "flexible";

interface StakeModalProps {
  poolName: string;
  poolId?: number;
  nftContract?: string;
  apy: number;
  rewardToken: string;
  lockPeriodDays: number;
  platformFeePct: number;
  trigger?: React.ReactNode;
}

const stakeTypes: { type: StakeType; mode: StakeMode; label: string; icon: typeof Lock; tip: string; desc: string }[] = [
  {
    type: "soft", mode: 0,
    label: "Soft Stake", icon: Unlock,
    tip: "You can unstake at any time, but rewards may be reduced for early withdrawal.",
    desc: "Withdraw anytime • Reduced rewards",
  },
  {
    type: "hard", mode: 1,
    label: "Hard Stake", icon: Lock,
    tip: "Your assets are locked for the full duration. Higher rewards but no early withdrawal.",
    desc: "Full lock period • Maximum rewards",
  },
  {
    type: "flexible", mode: 2,
    label: "Flexible", icon: Zap,
    tip: "Choose your own lock duration. Longer locks earn higher reward boosts.",
    desc: "Custom duration • Scaled rewards",
  },
];

const durationOptions = [7, 14, 30, 60, 90, 180, 365];

const StakeModal = ({ poolName, poolId, nftContract, apy, rewardToken, lockPeriodDays, platformFeePct, trigger }: StakeModalProps) => {
  const [open, setOpen] = useState(false);
  const [stakeType, setStakeType] = useState<StakeType>("soft");
  const [amount, setAmount] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [customDays, setCustomDays] = useState(lockPeriodDays);
  const [agreed, setAgreed] = useState(false);
  const [ethPrice, setEthPrice] = useState<number>(3800);
  const [step, setStep] = useState<"input" | "approve" | "confirm" | "done">("input");

  const { isConnected } = useWallet();
  const { isReady, stake, approveNFT, isLoading } = useStakeForge();

  // Fetch ETH price when modal opens
  useEffect(() => {
    if (open) {
      getEthPrice().then(data => setEthPrice(data.ethPrice));
      setStep("input");
    }
  }, [open]);

  const parsedAmount = parseFloat(amount) || 0;
  const parsedTokenId = parseInt(tokenId) || 0;

  const getEffectiveApy = () => {
    if (stakeType === "hard") return apy * 1.2;
    if (stakeType === "flexible") {
      const multiplier = Math.min(customDays / lockPeriodDays, 2);
      return apy * (0.5 + multiplier * 0.5);
    }
    return apy * 0.8;
  };

  const effectiveApy = getEffectiveApy();
  const days = stakeType === "flexible" ? customDays : stakeType === "hard" ? lockPeriodDays : 0;
  const dailyRate = effectiveApy / 100 / 365;
  const estimatedRewards = parsedAmount * dailyRate * (days || 30);
  const projectFee = estimatedRewards * (platformFeePct / 100);
  const netRewards = estimatedRewards - projectFee;

  const stakeMode: StakeMode = stakeType === "soft" ? 0 : stakeType === "hard" ? 1 : 2;
  const customLockSeconds = stakeType === "flexible" ? customDays * 86400 : 0;

  const handleStake = async () => {
    if (!isReady || poolId === undefined) return;

    // Step 1: Approve NFT
    if (step === "input" && nftContract) {
      setStep("approve");
      const approved = await approveNFT(nftContract, parsedTokenId);
      if (approved) {
        setStep("confirm");
      } else {
        setStep("input");
      }
      return;
    }

    // Step 2: Execute stake
    if (step === "confirm" || step === "input") {
      const txHash = await stake(poolId, parsedTokenId, stakeMode, customLockSeconds);
      if (txHash) {
        setStep("done");
        setTimeout(() => setOpen(false), 2000);
      } else {
        setStep("input");
      }
    }
  };

  const contractReady = isReady && poolId !== undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex-1 bg-primary text-primary-foreground font-display hover:bg-primary/90 box-glow-cyan transition-shadow">
            Stake Now
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground tracking-wider flex items-center gap-2">
            STAKE — {poolName}
            {IS_TESTNET && <Badge variant="outline" className="text-[9px] border-accent text-accent">TESTNET</Badge>}
            <Tooltip>
              <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">Choose how you want to stake. Each mode has different reward rates and withdrawal rules. A small platform fee applies on every stake and unstake action.</p>
              </TooltipContent>
            </Tooltip>
          </DialogTitle>
        </DialogHeader>

        {step === "done" ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-display text-xl text-neon-green">NFT STAKED!</p>
            <p className="text-sm text-muted-foreground mt-2">Your NFT is now earning rewards.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Connection status */}
            {!isConnected && (
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-center">
                <p className="text-xs text-accent font-display">Connect your wallet to stake</p>
              </div>
            )}
            {isConnected && !contractReady && (
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-center">
                <p className="text-xs text-accent font-display">Contract not deployed on this network yet</p>
                <p className="text-[10px] text-muted-foreground mt-1">Switch to a supported network or wait for deployment</p>
              </div>
            )}

            {/* Stake Type Selection */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-display tracking-wider flex items-center gap-1">
                STAKING MODE
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="w-3 h-3" /></TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Soft = withdraw anytime (lower APY). Hard = locked (higher APY). Flexible = you choose the duration.</p>
                  </TooltipContent>
                </Tooltip>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {stakeTypes.map((st) => (
                  <Tooltip key={st.type}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setStakeType(st.type)}
                        className={`rounded-lg border p-3 text-center transition-all ${
                          stakeType === st.type
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <st.icon className="w-5 h-5 mx-auto mb-1" />
                        <p className="font-display text-[11px]">{st.label}</p>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs font-semibold mb-1">{st.label}</p>
                      <p className="text-xs">{st.tip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{stakeTypes.find(s => s.type === stakeType)?.desc}</p>
            </div>

            {/* Duration (for flexible) */}
            {stakeType === "flexible" && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-display tracking-wider flex items-center gap-1">
                  LOCK DURATION
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3 h-3" /></TooltipTrigger>
                    <TooltipContent>Longer locks earn proportionally higher APY.</TooltipContent>
                  </Tooltip>
                </p>
                <div className="flex flex-wrap gap-2">
                  {durationOptions.map(d => (
                    <Button
                      key={d}
                      variant={customDays === d ? "default" : "outline"}
                      size="sm"
                      className={`text-xs font-display ${customDays === d ? "bg-primary text-primary-foreground" : "border-border"}`}
                      onClick={() => setCustomDays(d)}
                    >
                      {d}d
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Token ID */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-display tracking-wider">NFT TOKEN ID</p>
              <Input
                type="number"
                placeholder="Enter your NFT token ID"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="bg-secondary border-border font-display"
                min="0"
              />
            </div>

            {/* Amount (for display/reward calculation) */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-display tracking-wider flex items-center gap-1">
                AMOUNT (NFTs)
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="w-3 h-3" /></TooltipTrigger>
                  <TooltipContent>Number of NFTs you're staking. Enter 1 for a single NFT.</TooltipContent>
                </Tooltip>
              </p>
              <Input
                type="number"
                placeholder="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-secondary border-border text-lg font-display"
                min="1"
                step="1"
              />
            </div>

            {/* Breakdown */}
            <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Effective APY</span>
                <span className="font-display text-neon-green">{effectiveApy.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  Lock Period
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3 h-3" /></TooltipTrigger>
                    <TooltipContent>How long your assets remain locked. Soft stakes have no lock.</TooltipContent>
                  </Tooltip>
                </span>
                <span className="font-display text-foreground">{stakeType === "soft" ? "None" : `${days} days`}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Estimated Rewards</span>
                <span className="font-display text-primary">{estimatedRewards.toFixed(4)} {rewardToken}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  Project Fee ({platformFeePct}%)
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3 h-3" /></TooltipTrigger>
                    <TooltipContent>Fee set by the project. This can be adjusted by the project owner.</TooltipContent>
                  </Tooltip>
                </span>
                <span className="font-display text-destructive">-{projectFee.toFixed(4)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-xs">
                <span className="text-muted-foreground font-bold">Net Rewards</span>
                <span className="font-display text-accent">{netRewards.toFixed(4)} {rewardToken}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground/60 flex items-center gap-1">
                  Network maintenance
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-2.5 h-2.5" /></TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">A small maintenance fee keeps the platform running, secure, and continuously improved.</p>
                    </TooltipContent>
                  </Tooltip>
                </span>
                <span className="text-muted-foreground/60">${PLATFORM_MICRO_FEE_USDC} ({formatMicroFee(ethPrice)})</span>
              </div>
            </div>

            {/* Value proposition */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mb-1">
              <div className="text-[10px] text-muted-foreground leading-relaxed">
                <strong className="text-primary">WHAT YOU GET:</strong> Dual rewards (project + StakeForge points), leaderboard ranking, badge progression, arcade access, prize wheel spins, referral bonuses, and potential future airdrops — all included with every stake.
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  <strong className="text-accent">DISCLAIMER:</strong> Staking involves risk of loss. Rewards are estimates and may vary.
                  {stakeType === "hard" && " Hard-staked assets cannot be withdrawn early under any circumstances except platform emergency."}
                  {" "}A small platform maintenance fee applies to each action. All fees and terms are subject to change.
                  By staking, you accept the Terms of Service.
                </div>
              </div>
            </div>

            {/* Agreement */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="accent-primary" />
              <span className="text-xs text-muted-foreground">I understand the risks and agree to the terms</span>
            </label>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary text-primary-foreground font-display box-glow-cyan"
                disabled={!agreed || parsedTokenId <= 0 || isLoading || (!contractReady && isConnected)}
                onClick={handleStake}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : step === "approve" ? (
                  <><Shield className="w-4 h-4 mr-2" /> Approving NFT...</>
                ) : step === "confirm" ? (
                  <><Shield className="w-4 h-4 mr-2" /> Confirm Stake</>
                ) : !isConnected ? (
                  "Connect Wallet First"
                ) : !contractReady ? (
                  "Contract Not Deployed"
                ) : (
                  <><Shield className="w-4 h-4 mr-2" /> Approve & Stake</>
                )}
              </Button>
              <Button variant="outline" className="font-display border-border" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StakeModal;
