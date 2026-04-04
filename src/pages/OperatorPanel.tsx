import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Layers, Users, DollarSign, Lock, Zap, Building2,
  CreditCard, Calculator, Settings, Eye, Save, Power,
  ScrollText, AlertTriangle, RefreshCw
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import BattleLog from "@/components/BattleLog";

const OperatorPanel = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isOperator, setIsOperator] = useState(false);
  const [pools, setPools] = useState<any[]>([]);
  const [stakes, setStakes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);

  // Calculator
  const [calcStakers, setCalcStakers] = useState("100");
  const [calcAvgStake, setCalcAvgStake] = useState("5");
  const [calcApy, setCalcApy] = useState("45");
  const [calcDays, setCalcDays] = useState("30");
  const [calcFee, setCalcFee] = useState("10");

  useEffect(() => {
    if (!loading && !user) { navigate("/auth", { replace: true }); return; }
    if (user) checkAccess();
  }, [user, loading]);

  const checkAccess = async () => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).eq("role", "operator").maybeSingle();
    if (!data) { navigate("/", { replace: true }); return; }
    setIsOperator(true);
    fetchAll();
  };

  const fetchAll = useCallback(async () => {
    const [poolsRes, stakesRes, profilesRes, settingsRes, projectsRes, paymentsRes, walletsRes] = await Promise.all([
      supabase.from("staking_pools").select("*").order("created_at", { ascending: false }),
      supabase.from("stakes").select("*").order("staked_at", { ascending: false }),
      supabase.from("profiles").select("*").order("points", { ascending: false }),
      supabase.from("platform_settings").select("*"),
      supabase.from("project_accounts").select("*").order("created_at", { ascending: false }),
      supabase.from("project_payments").select("*").order("created_at", { ascending: false }),
      supabase.from("platform_wallets").select("*").order("created_at", { ascending: false }),
    ]);
    setPools(poolsRes.data || []);
    setStakes(stakesRes.data || []);
    setProfiles(profilesRes.data || []);
    setSettings(settingsRes.data || []);
    setProjects(projectsRes.data || []);
    setPayments(paymentsRes.data || []);
    setWallets(walletsRes.data || []);
  }, [user]);

  const togglePoolStatus = async (id: string, current: string) => {
    const { error } = await supabase.from("staking_pools").update({ status: current === "active" ? "paused" : "active" }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "✅ Pool updated" }); fetchAll(); }
  };

  const updateProjectFee = async (id: string, fee: string) => {
    const { error } = await supabase.from("project_accounts").update({ platform_fee_pct: parseFloat(fee) }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "✅ Fee updated" }); fetchAll(); }
  };

  const calc = (() => {
    const s = parseInt(calcStakers) || 0, a = parseFloat(calcAvgStake) || 0;
    const apy = parseFloat(calcApy) || 0, d = parseInt(calcDays) || 0, f = parseFloat(calcFee) || 0;
    const total = s * a, daily = apy / 100 / 365, rewards = total * daily * d;
    const fee = rewards * (f / 100);
    return { total, rewards: rewards.toFixed(4), fee: fee.toFixed(4), net: (rewards - fee).toFixed(4) };
  })();

  if (loading || !isOperator) return null;

  const activeStakes = stakes.filter(s => s.status === "active");
  const totalStaked = stakes.reduce((sum, s) => sum + Number(s.amount), 0);
  const activeWallet = wallets.find(w => w.is_active);

  return (
    <div className="min-h-screen bg-background bg-grid">
      <nav className="border-b border-border bg-card/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-display text-lg text-foreground tracking-widest">
              STAKEFORGE <span className="text-accent">OPERATOR</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-display">🔑 OPERATOR ACCESS</span>
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">← Dashboard</Button>
          </div>
        </div>
      </nav>

      {/* Stats */}
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Pools", value: pools.length, icon: Layers, color: "text-primary" },
            { label: "Stakes", value: activeStakes.length, icon: Zap, color: "text-accent" },
            { label: "Staked", value: totalStaked.toLocaleString(), icon: DollarSign, color: "text-primary" },
            { label: "Users", value: profiles.length, icon: Users, color: "text-accent" },
            { label: "Projects", value: projects.length, icon: Building2, color: "text-primary" },
            { label: "Wallet", value: activeWallet ? "Active" : "None", icon: CreditCard, color: activeWallet ? "text-primary" : "text-destructive" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-3 text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className="font-display text-lg text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <main className="container max-w-7xl mx-auto px-4 pb-10">
        <Tabs defaultValue="overview">
          <TabsList className="bg-card border border-border mb-6 flex-wrap">
            <TabsTrigger value="overview" className="font-display gap-1.5 text-xs"><Eye className="w-3.5 h-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="pools" className="font-display gap-1.5 text-xs"><Layers className="w-3.5 h-3.5" /> Pools</TabsTrigger>
            <TabsTrigger value="projects" className="font-display gap-1.5 text-xs"><Building2 className="w-3.5 h-3.5" /> Projects</TabsTrigger>
            <TabsTrigger value="users" className="font-display gap-1.5 text-xs"><Users className="w-3.5 h-3.5" /> Users</TabsTrigger>
            <TabsTrigger value="calculator" className="font-display gap-1.5 text-xs"><Calculator className="w-3.5 h-3.5" /> Calculator</TabsTrigger>
            <TabsTrigger value="battlelog" className="font-display gap-1.5 text-xs text-primary"><ScrollText className="w-3.5 h-3.5" /> Battle Log</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            {/* Active wallet */}
            {activeWallet && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <span className="font-display text-sm text-primary tracking-wider">ACTIVE RECEIVING WALLET</span>
                </div>
                <p className="font-display text-lg text-foreground">{activeWallet.label}</p>
                <code className="text-xs text-primary/80 break-all">{activeWallet.address}</code>
              </div>
            )}

            {/* Platform settings read-only */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">PLATFORM SETTINGS</h3>
              <div className="space-y-2">
                {settings.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <span className="font-display text-xs text-foreground min-w-[180px] tracking-wider">{s.key}</span>
                    <span className="text-sm text-muted-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
              <p className="text-xs text-muted-foreground">
                <strong className="text-accent font-display">OPERATOR ACCESS:</strong> You can view all platform data, manage pools and project fees.
                Emergency controls and wallet management are restricted to the platform admin.
              </p>
            </div>
          </TabsContent>

          {/* Pools - can toggle status */}
          <TabsContent value="pools" className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm text-foreground tracking-wider">ALL POOLS ({pools.length})</h3>
                <Button variant="ghost" size="sm" onClick={fetchAll} className="text-xs"><RefreshCw className="w-3 h-3 mr-1" /> Refresh</Button>
              </div>
              <div className="space-y-3">
                {pools.map(pool => (
                  <div key={pool.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${pool.status === "active" ? "bg-primary" : "bg-destructive"}`} />
                        <span className="font-display text-sm text-foreground">{pool.project_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground font-display">{pool.status.toUpperCase()}</span>
                      </div>
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePoolStatus(pool.id, pool.status)}>
                          <Power className={`w-3.5 h-3.5 ${pool.status === "active" ? "text-accent" : "text-primary"}`} />
                        </Button>
                      </TooltipTrigger><TooltipContent>{pool.status === "active" ? "Pause" : "Activate"}</TooltipContent></Tooltip>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>APY: <strong className="text-foreground">{pool.apy}%</strong></span>
                      <span>Fee: <strong className="text-foreground">{pool.platform_fee_pct}%</strong></span>
                      <span>Lock: <strong className="text-foreground">{pool.lock_period_days}d</strong></span>
                      <span>Staked: <strong className="text-foreground">{pool.total_staked}</strong></span>
                      <span>Token: <strong className="text-accent">{pool.reward_token}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Projects - can adjust fees */}
          <TabsContent value="projects" className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">PROJECTS ({projects.length})</h3>
              <div className="space-y-3">
                {projects.map(proj => (
                  <div key={proj.id} className={`rounded-lg border p-4 ${
                    proj.status === "blacklisted" ? "border-destructive/30 bg-destructive/5" : "border-border bg-secondary/30"
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-2 h-2 rounded-full ${proj.status === "active" ? "bg-primary" : "bg-destructive"}`} />
                      <span className="font-display text-sm text-foreground">{proj.project_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground font-display">{proj.status.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Fee: <strong className="text-foreground">{proj.platform_fee_pct}%</strong></span>
                      <span>Plan: <strong className="text-foreground capitalize">{proj.payment_plan}</strong></span>
                      <span>Payment: <strong className={proj.payment_status === "active" ? "text-primary" : "text-destructive"}>{proj.payment_status}</strong></span>
                    </div>
                    {proj.status !== "blacklisted" && (
                      <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-display">ADJUST FEE:</span>
                        <Input type="number" defaultValue={proj.platform_fee_pct} id={`op-fee-${proj.id}`} className="bg-background border-border text-xs max-w-[80px]" />
                        <Button size="sm" variant="outline" className="text-xs h-7 font-display" onClick={() => {
                          const val = (document.getElementById(`op-fee-${proj.id}`) as HTMLInputElement)?.value;
                          if (val) updateProjectFee(proj.id, val);
                        }}>
                          <Save className="w-3 h-3 mr-1" /> Set
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">USERS ({profiles.length})</h3>
              <div className="space-y-2">
                {profiles.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-display text-primary">
                        {(p.display_name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-display text-sm text-foreground">{p.display_name || "Unnamed"}</span>
                        <div className="flex gap-3 text-[11px] text-muted-foreground">
                          <span>Lvl {p.level}</span><span>{p.points} pts</span><span className="text-accent">{p.rank}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Calculator */}
          <TabsContent value="calculator">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" /> REWARD CALCULATOR
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div><label className="text-[10px] text-muted-foreground font-display">STAKERS</label><Input type="number" value={calcStakers} onChange={e => setCalcStakers(e.target.value)} className="bg-secondary border-border text-sm mt-1" /></div>
                <div><label className="text-[10px] text-muted-foreground font-display">AVG STAKE</label><Input type="number" value={calcAvgStake} onChange={e => setCalcAvgStake(e.target.value)} className="bg-secondary border-border text-sm mt-1" /></div>
                <div><label className="text-[10px] text-muted-foreground font-display">APY %</label><Input type="number" value={calcApy} onChange={e => setCalcApy(e.target.value)} className="bg-secondary border-border text-sm mt-1" /></div>
                <div><label className="text-[10px] text-muted-foreground font-display">DAYS</label><Input type="number" value={calcDays} onChange={e => setCalcDays(e.target.value)} className="bg-secondary border-border text-sm mt-1" /></div>
                <div><label className="text-[10px] text-muted-foreground font-display">FEE %</label><Input type="number" value={calcFee} onChange={e => setCalcFee(e.target.value)} className="bg-secondary border-border text-sm mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Staked", value: calc.total, color: "text-foreground" },
                  { label: "Total Rewards", value: calc.rewards, color: "text-primary" },
                  { label: `Fee (${calcFee}%)`, value: calc.fee, color: "text-destructive" },
                  { label: "Net to Holders", value: calc.net, color: "text-accent" },
                ].map(r => (
                  <div key={r.label} className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
                    <p className={`font-display text-lg ${r.color}`}>{r.value}</p>
                    <p className="text-[10px] text-muted-foreground font-display tracking-wide">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Battle Log */}
          <TabsContent value="battlelog">
            <div className="rounded-lg border border-border bg-card p-6">
              <BattleLog />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OperatorPanel;
