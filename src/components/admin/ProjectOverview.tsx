import { motion } from "framer-motion";
import { Building2, Users, Layers, DollarSign, TrendingUp } from "lucide-react";

interface ProjectOverviewProps {
  projects: any[];
  pools: any[];
  stakes: any[];
  payments: any[];
}

const ProjectOverview = ({ projects, pools, stakes, payments }: ProjectOverviewProps) => {
  return (
    <motion.div
      className="rounded-lg border border-border bg-card p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="font-display text-sm text-foreground mb-4 tracking-wider flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" /> PROJECT OVERVIEW — AT A GLANCE
      </h3>
      
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No projects onboarded yet.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((proj, i) => {
            const projPools = pools.filter(p => p.project_account_id === proj.id);
            const projStakes = stakes.filter(s => projPools.some(p => p.id === s.pool_id));
            const activeStakers = projStakes.filter(s => s.status === "active").length;
            const totalStaked = projStakes.reduce((sum, s) => sum + Number(s.amount), 0);
            const projPayments = payments.filter(p => p.project_id === proj.id);
            const totalPaid = projPayments.filter(p => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);

            return (
              <motion.div
                key={proj.id}
                className={`rounded-lg border p-4 ${
                  proj.status === "blacklisted" ? "border-destructive/30 bg-destructive/5" :
                  proj.status === "suspended" ? "border-accent/30 bg-accent/5" :
                  "border-border bg-secondary/20"
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-display text-sm text-foreground">{proj.project_name}</span>
                      <p className="text-[10px] text-muted-foreground">/{proj.slug}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-display ${
                      proj.status === "active" ? "border-primary/30 text-primary" :
                      proj.status === "blacklisted" ? "border-destructive/30 text-destructive" :
                      "border-accent/30 text-accent"
                    }`}>{proj.status.toUpperCase()}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: "Pools", value: projPools.length, icon: Layers, color: "text-primary" },
                    { label: "Stakers", value: activeStakers, icon: Users, color: "text-accent" },
                    { label: "Staked", value: totalStaked, icon: DollarSign, color: "text-neon-green" },
                    { label: "Fee", value: `${proj.platform_fee_pct}%`, icon: DollarSign, color: "text-accent" },
                    { label: "Paid", value: `${totalPaid.toFixed(2)}`, icon: DollarSign, color: "text-primary" },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <p className={`font-display text-base ${stat.color}`}>{stat.value}</p>
                      <p className="text-[9px] text-muted-foreground font-display tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ProjectOverview;
