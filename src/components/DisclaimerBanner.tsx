import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";

const DisclaimerBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="bg-neon-gold/5 border border-neon-gold/20 rounded-lg p-4"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-neon-gold shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm text-neon-gold">Important Disclaimer</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Staking involves risk. Always do your own research before staking any assets.
            </p>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2 text-xs text-muted-foreground"
                >
                  <p>• NFTs locked during staking cannot be traded or transferred until the lock period ends.</p>
                  <p>• Rewards are determined by individual project teams and may vary.</p>
                  <p>• A small platform fee is applied to all staking rewards.</p>
                  <p>• Smart contracts are audited but no system is 100% risk-free.</p>
                  <p>• Past performance does not guarantee future results.</p>
                  <p>• This platform does not provide financial advice.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DisclaimerBanner;
