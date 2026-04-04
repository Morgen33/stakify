import { motion } from "framer-motion";
import { Users, Layers, Coins, Shield } from "lucide-react";

const stats = [
  { label: "Total Stakers", value: "12,847", icon: Users, color: "text-primary" },
  { label: "NFTs Staked", value: "43,291", icon: Layers, color: "text-neon-purple" },
  { label: "Rewards Paid", value: "892 ETH", icon: Coins, color: "text-neon-gold" },
  { label: "Security Score", value: "99.8%", icon: Shield, color: "text-neon-green" },
];

const StatsBar = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="bg-card border border-border rounded-lg p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
          <p className={`font-display text-2xl ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsBar;
