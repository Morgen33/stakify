import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Layers, TrendingUp, Users, Lock, Unlock, HelpCircle,
  ExternalLink, ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import StakeModal from "@/components/StakeModal";
import WalletModal from "@/components/WalletModal";

const ProjectPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    setLoading(true);
    // Fetch project by slug
    const { data: projData } = await supabase
      .from("project_accounts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (!projData) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setProject(projData);

    // Fetch active pools for this project
    const { data: poolsData } = await supabase
      .from("staking_pools")
      .select("*")
      .eq("project_account_id", projData.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    setPools(poolsData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-display">Loading project...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-6xl">🔍</p>
          <h1 className="font-display text-2xl text-foreground">PROJECT NOT FOUND</h1>
          <p className="text-sm text-muted-foreground">This project doesn't exist or has been removed.</p>
          <Button variant="outline" onClick={() => navigate("/")} className="font-display">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {project.logo_url && (
              <img src={project.logo_url} alt={project.project_name} className="w-8 h-8 rounded-full" />
            )}
            <h2 className="font-display text-xl text-foreground tracking-widest">
              {project.project_name}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <WalletModal />
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">
              ← Home
            </Button>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Project Hero */}
        <motion.div
          className="rounded-xl border border-border bg-card p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {project.logo_url && (
            <img src={project.logo_url} alt={project.project_name} className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-primary/30" />
          )}
          <h1 className="font-display text-3xl text-foreground tracking-wider">{project.project_name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">{project.description}</p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="border-primary/30 text-primary font-display">
              {pools.length} Active Pool{pools.length !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="border-accent/30 text-accent font-display">
              Powered by STAKEFORGE
            </Badge>
          </div>
        </motion.div>

        {/* Staking Pools */}
        <div>
          <h2 className="font-display text-lg text-foreground tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> STAKING POOLS
          </h2>
          {pools.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-display text-sm text-muted-foreground">No active pools</p>
              <p className="text-xs text-muted-foreground mt-1">This project hasn't set up staking pools yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pools.map((pool) => (
                <motion.div
                  key={pool.id}
                  className="rounded-lg border border-border bg-card p-5 gradient-border"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display text-lg text-foreground">{pool.project_name}</h3>
                      <p className="text-muted-foreground text-sm">Reward: {pool.reward_token}</p>
                    </div>
                    <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                      <Unlock className="w-3 h-3 mr-1" /> Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-secondary/50 rounded-md p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-neon-green" />
                        <span className="text-xs text-muted-foreground">APY</span>
                      </div>
                      <p className="font-display text-xl text-neon-green">{pool.apy}%</p>
                    </div>
                    <div className="bg-secondary/50 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">Lock Period</p>
                      <p className="font-display text-lg text-foreground">{pool.lock_period_days} Days</p>
                    </div>
                    <div className="bg-secondary/50 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">Total Staked</p>
                      <p className="font-display text-lg text-primary">{pool.total_staked.toLocaleString()}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">Fee</p>
                      <p className="font-display text-lg text-foreground">{pool.platform_fee_pct}%</p>
                    </div>
                  </div>
                  <StakeModal
                    poolName={pool.project_name}
                    apy={pool.apy}
                    rewardToken={pool.reward_token}
                    lockPeriodDays={pool.lock_period_days}
                    platformFeePct={pool.platform_fee_pct}
                  />
                  <p className="text-[9px] text-muted-foreground/50 mt-2 text-center">
                    Fee: {pool.platform_fee_pct}% on rewards + $0.12/action
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong className="text-accent">DISCLAIMER:</strong> Staking involves risk. Rewards are estimates. 
            This project page is provided as-is by the project owner through the STAKEFORGE platform. 
            STAKEFORGE does not guarantee or endorse any specific project. A platform maintenance fee of $0.12 applies per action. 
            All fees and terms are subject to change. DYOR.
          </p>
        </div>

        <footer className="text-center py-6 border-t border-border">
          <p className="text-[10px] text-muted-foreground/60 font-display tracking-wider">
            Powered by STAKEFORGE — Gamified NFT Staking
          </p>
        </footer>
      </main>
    </div>
  );
};

export default ProjectPage;
