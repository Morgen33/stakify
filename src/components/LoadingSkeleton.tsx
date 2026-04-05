import { motion } from "framer-motion";
import { Layers } from "lucide-react";

/** Full-page loading skeleton for lazy-loaded routes */
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Layers className="w-10 h-10 text-primary" />
      </motion.div>
      <p className="font-display text-sm text-muted-foreground tracking-widest animate-pulse">LOADING...</p>
    </motion.div>
  </div>
);

export default LoadingSkeleton;
