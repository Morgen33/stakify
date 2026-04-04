import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const StartupDisclaimer = () => {
  const [accepted, setAccepted] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const hasAccepted = sessionStorage.getItem("stakeforge_disclaimer_accepted");
    if (hasAccepted === "true") setAccepted(true);
  }, []);

  const disclaimerPoints = [
    "I understand that staking digital assets involves significant risk, including the possible loss of my entire principal.",
    "I acknowledge that APY/reward figures are estimates only and may fluctuate or cease without notice.",
    "I understand that locked assets cannot be withdrawn until the lock period expires, except in platform-authorized emergency situations.",
    "I accept that smart contracts, while audited, carry inherent risks and I use this platform at my own discretion.",
    "I confirm that STAKEFORGE is a staking facilitation platform and does not provide financial, investment, or legal advice.",
    "I acknowledge that STAKEFORGE charges a platform fee on staking rewards and that fee rates may be adjusted by the platform operator.",
    "I understand that individual project teams control their own reward distribution and STAKEFORGE is not liable for any project's actions, including potential rug pulls.",
  ];

  const allChecked = disclaimerPoints.every((_, i) => checkedItems[i]);

  const handleAccept = () => {
    sessionStorage.setItem("stakeforge_disclaimer_accepted", "true");
    setAccepted(true);
  };

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (accepted) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="max-w-2xl w-full mx-4 rounded-xl border border-border bg-card p-8 space-y-6 max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-accent/10 border border-accent/20">
                <Shield className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h1 className="font-display text-2xl text-foreground tracking-wider">
              STAKEFORGE <span className="text-primary text-glow-cyan">DISCLAIMER</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Please read and acknowledge each point before proceeding.
            </p>
          </div>

          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-destructive">RISK WARNING:</strong> Digital asset staking is speculative
              and carries a high degree of risk. You should not stake more than you can afford to lose.
              Regulatory actions, market volatility, and smart contract vulnerabilities may result in
              total loss of staked assets.
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            {disclaimerPoints.map((point, index) => (
              <button
                key={index}
                onClick={() => toggleCheck(index)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                  checkedItems[index]
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-secondary/30 hover:bg-secondary/50"
                }`}
              >
                <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  checkedItems[index] ? "bg-primary border-primary" : "border-muted-foreground/40"
                }`}>
                  {checkedItems[index] && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{point}</p>
              </button>
            ))}
          </div>

          {/* Lock icon + Accept */}
          <div className="space-y-3">
            <Button
              onClick={handleAccept}
              disabled={!allChecked}
              className="w-full font-display tracking-wider bg-primary text-primary-foreground box-glow-cyan disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4 mr-2" />
              I UNDERSTAND AND ACCEPT ALL RISKS
            </Button>
            <p className="text-[10px] text-center text-muted-foreground/60">
              By clicking above, you agree to the STAKEFORGE Terms of Service and Privacy Policy.
              This acknowledgement is required once per session.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StartupDisclaimer;
