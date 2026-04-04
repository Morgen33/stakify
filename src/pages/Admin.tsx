import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Plus, Trash2, Settings, Users, Layers, Award,
  AlertTriangle, Unlock, Lock, DollarSign, RefreshCw,
  Wallet, Power, Save, Ban, Zap, FileText, Building2,
  CreditCard, Calculator, XCircle, CheckCircle2, ScrollText
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BattleLog from "@/components/BattleLog";
import { logAction } from "@/lib/activity-logger";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pools, setPools] = useState<any[]>([]);
  const [stakes, setStakes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [editingPool, setEditingPool] = useState<string | null>(null);
  const [editPoolData, setEditPoolData] = useState<any>({});

  const [newPool, setNewPool] = useState({
    project_name: "", apy: "45", lock_period_days: "30", reward_token: "", platform_fee_pct: "2.5", project_account_id: "",
  });
  const [newBadge, setNewBadge] = useState({ name: "", description: "", icon: "🏆", requirement: "" });
  const [newSettingKey, setNewSettingKey] = useState("");
  const [newSettingValue, setNewSettingValue] = useState("");
  const [newProject, setNewProject] = useState({
    project_name: "", slug: "", contact_email: "", owner_id: "", payment_plan: "upfront", platform_fee_pct: "10",
  });
  const [newPayment, setNewPayment] = useState({
    project_id: "", amount: "", currency: "ETH", payment_type: "platform_fee", status: "pending", notes: "", due_date: "",
  });
  const [newWallet, setNewWallet] = useState({ label: "", address: "", wallet_type: "primary", notes: "" });

  // Calculator
  const [calcStakers, setCalcStakers] = useState("100");
  const [calcAvgStake, setCalcAvgStake] = useState("5");
  const [calcApy, setCalcApy] = useState("45");
  const [calcDays, setCalcDays] = useState("30");
  const [calcFee, setCalcFee] = useState("10");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/", { replace: true });
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = useCallback(async () => {
    const [poolsRes, stakesRes, profilesRes, settingsRes, badgesRes, projectsRes, paymentsRes, walletsRes] = await Promise.all([
      supabase.from("staking_pools").select("*").order("created_at", { ascending: false }),
      supabase.from("stakes").select("*").order("staked_at", { ascending: false }),
      supabase.from("profiles").select("*").order("points", { ascending: false }),
      supabase.from("platform_settings").select("*"),
      supabase.from("badges").select("*"),
      supabase.from("project_accounts").select("*").order("created_at", { ascending: false }),
      supabase.from("project_payments").select("*").order("created_at", { ascending: false }),
      supabase.from("platform_wallets").select("*").order("created_at", { ascending: false }),
    ]);
    setPools(poolsRes.data || []);
    setStakes(stakesRes.data || []);
    setProfiles(profilesRes.data || []);
    setSettings(settingsRes.data || []);
    setBadges(badgesRes.data || []);
    setProjects(projectsRes.data || []);
    setPayments(paymentsRes.data || []);
    setWallets(walletsRes.data || []);
  }, []);

  // ─── Pool CRUD ───
  const createPool = async () => {
    if (!newPool.project_name || !newPool.reward_token) {
      toast({ title: "Missing fields", description: "Project name and reward token are required.", variant: "destructive" });
      return;
    }
    const insertData: any = {
      project_name: newPool.project_name,
      apy: parseFloat(newPool.apy),
      lock_period_days: parseInt(newPool.lock_period_days),
      reward_token: newPool.reward_token,
      platform_fee_pct: parseFloat(newPool.platform_fee_pct),
      created_by: user?.id,
    };
    if (newPool.project_account_id) insertData.project_account_id = newPool.project_account_id;
    const { error } = await supabase.from("staking_pools").insert(insertData);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Pool created" });
      setNewPool({ project_name: "", apy: "45", lock_period_days: "30", reward_token: "", platform_fee_pct: "2.5", project_account_id: "" });
      fetchAll();
    }
  };

  const updatePool = async (id: string, data: any) => {
    const { error } = await supabase.from("staking_pools").update(data).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "✅ Pool updated" }); setEditingPool(null); fetchAll(); }
  };

  const togglePoolStatus = async (id: string, currentStatus: string) => {
    await updatePool(id, { status: currentStatus === "active" ? "paused" : "active" });
  };

  const deletePool = async (id: string) => {
    if (!window.confirm("⚠️ Delete this pool permanently?")) return;
    await supabase.from("staking_pools").delete().eq("id", id);
    toast({ title: "Pool deleted" }); fetchAll();
  };

  // ─── Emergency ───
  const emergencyUnlockStake = async (stakeId: string) => {
    if (!window.confirm("🚨 EMERGENCY UNLOCK this stake?")) return;
    const { error } = await supabase.from("stakes").update({ status: "emergency_unlocked", unlock_at: new Date().toISOString() }).eq("id", stakeId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "🔓 Stake unlocked" }); fetchAll(); }
  };

  const emergencyUnlockAll = async (poolId: string) => {
    if (!window.confirm("🚨 CRITICAL: Unlock ALL stakes in this pool?")) return;
    const poolStakes = stakes.filter((s) => s.pool_id === poolId && s.status === "active");
    for (const s of poolStakes) {
      await supabase.from("stakes").update({ status: "emergency_unlocked", unlock_at: new Date().toISOString() }).eq("id", s.id);
    }
    toast({ title: `🔓 ${poolStakes.length} stakes unlocked` }); fetchAll();
  };

  // ─── Settings ───
  const updateSetting = async (id: string, value: string) => {
    const { error } = await supabase.from("platform_settings").update({ value }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "✅ Setting saved" }); fetchAll(); }
  };
  const createSetting = async () => {
    if (!newSettingKey) return;
    const { error } = await supabase.from("platform_settings").insert({ key: newSettingKey, value: newSettingValue });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "✅ Setting created" }); setNewSettingKey(""); setNewSettingValue(""); fetchAll(); }
  };
  const deleteSetting = async (id: string) => { await supabase.from("platform_settings").delete().eq("id", id); fetchAll(); };

  // ─── Badges ───
  const createBadge = async () => {
    if (!newBadge.name) return;
    const { error } = await supabase.from("badges").insert(newBadge);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "✅ Badge created" }); setNewBadge({ name: "", description: "", icon: "🏆", requirement: "" }); fetchAll(); }
  };
  const deleteBadge = async (id: string) => { await supabase.from("badges").delete().eq("id", id); fetchAll(); };

  // ─── Project Accounts ───
  const createProject = async () => {
    if (!newProject.project_name || !newProject.slug || !newProject.owner_id) {
      toast({ title: "Missing fields", description: "Name, slug, and owner ID are required.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("project_accounts").insert({
      project_name: newProject.project_name,
      slug: newProject.slug,
      contact_email: newProject.contact_email,
      owner_id: newProject.owner_id,
      payment_plan: newProject.payment_plan,
      platform_fee_pct: parseFloat(newProject.platform_fee_pct),
      status: "active",
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      // Also assign project_owner role
      await supabase.from("user_roles").insert({ user_id: newProject.owner_id, role: "project_owner" });
      toast({ title: "✅ Project onboarded & owner role assigned" });
      setNewProject({ project_name: "", slug: "", contact_email: "", owner_id: "", payment_plan: "upfront", platform_fee_pct: "10" });
      fetchAll();
    }
  };

  const updateProjectStatus = async (id: string, status: string, reason?: string) => {
    const updateData: any = { status, payment_status: status === "blacklisted" ? "blacklisted" : status === "suspended" ? "suspended" : "active" };
    if (status === "blacklisted") { updateData.blacklisted_at = new Date().toISOString(); updateData.blacklist_reason = reason || "Violation of terms"; }
    const { error } = await supabase.from("project_accounts").update(updateData).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      // If blacklisted, emergency unlock all their pools
      if (status === "blacklisted") {
        const projPools = pools.filter((p) => p.project_account_id === id);
        for (const pool of projPools) {
          await supabase.from("staking_pools").update({ status: "paused" }).eq("id", pool.id);
          await emergencyUnlockAll(pool.id);
        }
      }
      toast({ title: `Project ${status}` }); fetchAll();
    }
  };

  const updateProjectFee = async (id: string, fee: string) => {
    const { error } = await supabase.from("project_accounts").update({ platform_fee_pct: parseFloat(fee) }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "✅ Fee updated" }); fetchAll(); }
  };

  // ─── Payments ───
  const createPayment = async () => {
    if (!newPayment.project_id || !newPayment.amount) {
      toast({ title: "Missing fields", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("project_payments").insert({
      project_id: newPayment.project_id,
      amount: parseFloat(newPayment.amount),
      currency: newPayment.currency,
      payment_type: newPayment.payment_type,
      status: newPayment.status,
      notes: newPayment.notes,
      due_date: newPayment.due_date || null,
      paid_at: newPayment.status === "paid" ? new Date().toISOString() : null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "✅ Payment recorded" });
      setNewPayment({ project_id: "", amount: "", currency: "ETH", payment_type: "platform_fee", status: "pending", notes: "", due_date: "" });
      fetchAll();
    }
  };

  const markPaymentPaid = async (id: string) => {
    await supabase.from("project_payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id);
    toast({ title: "✅ Marked as paid" }); fetchAll();
  };

  // Calculator
  const calcResults = () => {
    const s = parseInt(calcStakers) || 0, a = parseFloat(calcAvgStake) || 0;
    const apy = parseFloat(calcApy) || 0, d = parseInt(calcDays) || 0, f = parseFloat(calcFee) || 0;
    const total = s * a, daily = apy / 100 / 365, rewards = total * daily * d;
    const fee = rewards * (f / 100);
    return { total, rewards: rewards.toFixed(4), fee: fee.toFixed(4), net: (rewards - fee).toFixed(4) };
  };

  if (loading || !isAdmin) return null;

  const activeStakes = stakes.filter((s) => s.status === "active");
  const totalStakedValue = stakes.reduce((sum, s) => sum + Number(s.amount), 0);
  const calc = calcResults();

  return (
    <div className="min-h-screen bg-background bg-grid">
      <nav className="border-b border-border bg-card/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="font-display text-lg text-foreground tracking-widest">
              STAKEFORGE <span className="text-destructive">ADMIN</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-display">🔒 OWNER ONLY</span>
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">← Dashboard</Button>
          </div>
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Pools", value: pools.length, icon: Layers, color: "text-primary" },
            { label: "Stakes", value: activeStakes.length, icon: Zap, color: "text-accent" },
            { label: "Staked", value: totalStakedValue.toLocaleString(), icon: DollarSign, color: "text-primary" },
            { label: "Users", value: profiles.length, icon: Users, color: "text-accent" },
            { label: "Projects", value: projects.length, icon: Building2, color: "text-primary" },
            { label: "Badges", value: badges.length, icon: Award, color: "text-accent" },
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
        <Tabs defaultValue="pools">
          <TabsList className="bg-card border border-border mb-6 flex-wrap">
            <TabsTrigger value="pools" className="font-display gap-1.5 text-xs"><Layers className="w-3.5 h-3.5" /> Pools</TabsTrigger>
            <TabsTrigger value="projects" className="font-display gap-1.5 text-xs"><Building2 className="w-3.5 h-3.5" /> Projects</TabsTrigger>
            <TabsTrigger value="stakes" className="font-display gap-1.5 text-xs"><Lock className="w-3.5 h-3.5" /> Stakes</TabsTrigger>
            <TabsTrigger value="users" className="font-display gap-1.5 text-xs"><Users className="w-3.5 h-3.5" /> Users</TabsTrigger>
            <TabsTrigger value="fees" className="font-display gap-1.5 text-xs"><DollarSign className="w-3.5 h-3.5" /> Fees</TabsTrigger>
            <TabsTrigger value="badges" className="font-display gap-1.5 text-xs"><Award className="w-3.5 h-3.5" /> Badges</TabsTrigger>
            <TabsTrigger value="calculator" className="font-display gap-1.5 text-xs"><Calculator className="w-3.5 h-3.5" /> Calculator</TabsTrigger>
            <TabsTrigger value="battlelog" className="font-display gap-1.5 text-xs text-primary"><ScrollText className="w-3.5 h-3.5" /> Battle Log</TabsTrigger>
            <TabsTrigger value="emergency" className="font-display gap-1.5 text-xs text-destructive"><AlertTriangle className="w-3.5 h-3.5" /> Emergency</TabsTrigger>
          </TabsList>

          {/* ═══ POOLS ═══ */}
          <TabsContent value="pools" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 flex items-center gap-2 tracking-wider">
                <Plus className="w-4 h-4 text-primary" /> CREATE POOL
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Project Name" value={newPool.project_name} onChange={(e) => setNewPool({ ...newPool, project_name: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input placeholder="Reward Token ($APE)" value={newPool.reward_token} onChange={(e) => setNewPool({ ...newPool, reward_token: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input type="number" placeholder="APY %" value={newPool.apy} onChange={(e) => setNewPool({ ...newPool, apy: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input type="number" placeholder="Lock Days" value={newPool.lock_period_days} onChange={(e) => setNewPool({ ...newPool, lock_period_days: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input type="number" placeholder="Fee %" value={newPool.platform_fee_pct} onChange={(e) => setNewPool({ ...newPool, platform_fee_pct: e.target.value })} className="bg-secondary border-border text-sm" />
                <select value={newPool.project_account_id} onChange={(e) => setNewPool({ ...newPool, project_account_id: e.target.value })} className="bg-secondary border border-border rounded-md text-sm text-foreground px-3">
                  <option value="">No project link</option>
                  {projects.filter(p => p.status === "active").map(p => (
                    <option key={p.id} value={p.id}>{p.project_name}</option>
                  ))}
                </select>
              </div>
              <Button onClick={createPool} className="mt-3 bg-primary text-primary-foreground font-display text-xs box-glow-cyan">
                <Plus className="w-3.5 h-3.5 mr-1" /> Create Pool
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">ALL POOLS ({pools.length})</h3>
              <div className="space-y-3">
                {pools.map((pool) => {
                  const proj = projects.find(p => p.id === pool.project_account_id);
                  return (
                    <div key={pool.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${pool.status === "active" ? "bg-primary" : "bg-destructive"}`} />
                          <span className="font-display text-sm text-foreground">{pool.project_name}</span>
                          {proj && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-display">{proj.project_name}</span>}
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground font-display">{pool.status.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePoolStatus(pool.id, pool.status)}><Power className={`w-3.5 h-3.5 ${pool.status === "active" ? "text-accent" : "text-primary"}`} /></Button></TooltipTrigger><TooltipContent>{pool.status === "active" ? "Pause" : "Activate"}</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingPool(editingPool === pool.id ? null : pool.id); setEditPoolData({ apy: pool.apy, platform_fee_pct: pool.platform_fee_pct, lock_period_days: pool.lock_period_days }); }}><Settings className="w-3.5 h-3.5 text-muted-foreground" /></Button></TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => emergencyUnlockAll(pool.id)}><Unlock className="w-3.5 h-3.5 text-destructive" /></Button></TooltipTrigger><TooltipContent>Emergency Unlock All</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deletePool(pool.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button></TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>APY: <strong className="text-foreground">{pool.apy}%</strong></span>
                        <span>Fee: <strong className="text-foreground">{pool.platform_fee_pct}%</strong></span>
                        <span>Lock: <strong className="text-foreground">{pool.lock_period_days}d</strong></span>
                        <span>Staked: <strong className="text-foreground">{pool.total_staked}</strong></span>
                        <span>Token: <strong className="text-accent">{pool.reward_token}</strong></span>
                      </div>
                      {editingPool === pool.id && (
                        <div className="mt-3 pt-3 border-t border-border grid grid-cols-4 gap-2">
                          <Input type="number" placeholder="APY" value={editPoolData.apy} onChange={(e) => setEditPoolData({ ...editPoolData, apy: e.target.value })} className="bg-background border-border text-xs" />
                          <Input type="number" placeholder="Fee %" value={editPoolData.platform_fee_pct} onChange={(e) => setEditPoolData({ ...editPoolData, platform_fee_pct: e.target.value })} className="bg-background border-border text-xs" />
                          <Input type="number" placeholder="Lock Days" value={editPoolData.lock_period_days} onChange={(e) => setEditPoolData({ ...editPoolData, lock_period_days: e.target.value })} className="bg-background border-border text-xs" />
                          <Button size="sm" onClick={() => updatePool(pool.id, { apy: parseFloat(editPoolData.apy), platform_fee_pct: parseFloat(editPoolData.platform_fee_pct), lock_period_days: parseInt(editPoolData.lock_period_days) })} className="bg-primary text-primary-foreground font-display text-xs"><Save className="w-3 h-3 mr-1" /> Save</Button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {pools.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No pools yet.</p>}
              </div>
            </div>
          </TabsContent>

          {/* ═══ PROJECTS ═══ */}
          <TabsContent value="projects" className="space-y-6">
            {/* Onboard new project */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 flex items-center gap-2 tracking-wider">
                <Plus className="w-4 h-4 text-accent" /> ONBOARD NEW PROJECT
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Project Name" value={newProject.project_name} onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input placeholder="Slug (e.g. bored-ape)" value={newProject.slug} onChange={(e) => setNewProject({ ...newProject, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className="bg-secondary border-border text-sm" />
                <Input placeholder="Owner User ID" value={newProject.owner_id} onChange={(e) => setNewProject({ ...newProject, owner_id: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input placeholder="Contact Email" value={newProject.contact_email} onChange={(e) => setNewProject({ ...newProject, contact_email: e.target.value })} className="bg-secondary border-border text-sm" />
                <select value={newProject.payment_plan} onChange={(e) => setNewProject({ ...newProject, payment_plan: e.target.value })} className="bg-secondary border border-border rounded-md text-sm text-foreground px-3">
                  <option value="upfront">Upfront Payment</option>
                  <option value="gradual">Gradual Payment</option>
                </select>
                <Input type="number" placeholder="Platform Fee %" value={newProject.platform_fee_pct} onChange={(e) => setNewProject({ ...newProject, platform_fee_pct: e.target.value })} className="bg-secondary border-border text-sm" />
              </div>
              <Button onClick={createProject} className="mt-3 bg-accent text-accent-foreground font-display text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Onboard Project
              </Button>
            </div>

            {/* Project list */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">ALL PROJECTS ({projects.length})</h3>
              <div className="space-y-3">
                {projects.map((proj) => {
                  const projPayments = payments.filter(p => p.project_id === proj.id);
                  const overdue = projPayments.filter(p => p.status === "overdue").length;
                  return (
                    <div key={proj.id} className={`rounded-lg border p-4 ${
                      proj.status === "blacklisted" ? "border-destructive/30 bg-destructive/5" :
                      proj.status === "suspended" ? "border-accent/30 bg-accent/5" :
                      "border-border bg-secondary/30"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${
                            proj.status === "active" ? "bg-primary" :
                            proj.status === "blacklisted" ? "bg-destructive" :
                            "bg-accent"
                          }`} />
                          <span className="font-display text-sm text-foreground">{proj.project_name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground font-display">{proj.status.toUpperCase()}</span>
                          {proj.payment_plan === "gradual" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-display">GRADUAL</span>}
                          {overdue > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-display">{overdue} OVERDUE</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          {proj.status !== "blacklisted" && (
                            <>
                              <Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateProjectStatus(proj.id, proj.status === "active" ? "suspended" : "active")}>
                                  <Power className={`w-3.5 h-3.5 ${proj.status === "active" ? "text-accent" : "text-primary"}`} />
                                </Button>
                              </TooltipTrigger><TooltipContent>{proj.status === "active" ? "Suspend" : "Reactivate"}</TooltipContent></Tooltip>
                              <Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                  const reason = window.prompt("Blacklist reason (shown to project owner):");
                                  if (reason !== null) updateProjectStatus(proj.id, "blacklisted", reason);
                                }}>
                                  <Ban className="w-3.5 h-3.5 text-destructive" />
                                </Button>
                              </TooltipTrigger><TooltipContent>Blacklist Project</TooltipContent></Tooltip>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>Fee: <strong className="text-foreground">{proj.platform_fee_pct}%</strong></span>
                        <span>Slug: <strong className="text-primary">/project/{proj.slug}</strong></span>
                        <span>Email: <strong className="text-foreground">{proj.contact_email || "—"}</strong></span>
                        <span>Owner: <code className="text-primary/70">{proj.owner_id.slice(0, 8)}...</code></span>
                        {proj.blacklist_reason && <span className="text-destructive">Reason: {proj.blacklist_reason}</span>}
                      </div>
                      {/* Inline fee edit */}
                      {proj.status !== "blacklisted" && (
                        <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground font-display">ADJUST FEE:</span>
                          <Input type="number" defaultValue={proj.platform_fee_pct} id={`fee-${proj.id}`} className="bg-background border-border text-xs max-w-[80px]" />
                          <Button size="sm" variant="outline" className="text-xs h-7 font-display" onClick={() => {
                            const val = (document.getElementById(`fee-${proj.id}`) as HTMLInputElement)?.value;
                            if (val) updateProjectFee(proj.id, val);
                          }}>
                            <Save className="w-3 h-3 mr-1" /> Set
                          </Button>
                          <span className="text-[10px] text-muted-foreground italic">Subject to change at operator's discretion</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {projects.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No projects onboarded yet.</p>}
              </div>
            </div>

            {/* Payments */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 flex items-center gap-2 tracking-wider">
                <CreditCard className="w-4 h-4 text-primary" /> RECORD PAYMENT
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select value={newPayment.project_id} onChange={(e) => setNewPayment({ ...newPayment, project_id: e.target.value })} className="bg-secondary border border-border rounded-md text-sm text-foreground px-3">
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                </select>
                <Input type="number" placeholder="Amount" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input placeholder="Currency (ETH)" value={newPayment.currency} onChange={(e) => setNewPayment({ ...newPayment, currency: e.target.value })} className="bg-secondary border-border text-sm" />
                <select value={newPayment.payment_type} onChange={(e) => setNewPayment({ ...newPayment, payment_type: e.target.value })} className="bg-secondary border border-border rounded-md text-sm text-foreground px-3">
                  <option value="platform_fee">Platform Fee</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="penalty">Penalty</option>
                  <option value="other">Other</option>
                </select>
                <select value={newPayment.status} onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value })} className="bg-secondary border border-border rounded-md text-sm text-foreground px-3">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="waived">Waived</option>
                </select>
                <Input type="date" placeholder="Due Date" value={newPayment.due_date} onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })} className="bg-secondary border-border text-sm" />
              </div>
              <Input placeholder="Notes" value={newPayment.notes} onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })} className="bg-secondary border-border text-sm mt-3" />
              <Button onClick={createPayment} className="mt-3 bg-primary text-primary-foreground font-display text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Record Payment
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">PAYMENT HISTORY ({payments.length})</h3>
              <div className="space-y-2">
                {payments.map((p) => {
                  const proj = projects.find(pr => pr.id === p.project_id);
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${p.status === "paid" ? "bg-primary" : p.status === "overdue" ? "bg-destructive" : "bg-accent"}`} />
                          <span className="font-display text-xs text-foreground">{proj?.project_name || "Unknown"}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground capitalize">{p.payment_type.replace("_", " ")}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-display ${p.status === "paid" ? "bg-primary/10 text-primary" : p.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>{p.status.toUpperCase()}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{p.notes || "—"}{p.due_date && ` • Due: ${new Date(p.due_date).toLocaleDateString()}`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm text-foreground">{p.amount} {p.currency}</span>
                        {p.status !== "paid" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markPaymentPaid(p.id)}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {payments.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No payments recorded.</p>}
              </div>
            </div>

            {/* Disclaimers */}
            <div className="rounded-lg border border-accent/20 bg-card p-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                  <p className="font-display text-foreground text-sm tracking-wider mb-2">PROJECT ONBOARDING TERMS</p>
                  <p>• Platform fee is set at <strong className="text-foreground">10% default</strong> and is negotiable only by the platform operator.</p>
                  <p>• All payments are <strong className="text-foreground">upfront only</strong> unless a gradual plan is negotiated and approved.</p>
                  <p>• Gradual payment projects: if any payment is missed, the project is <strong className="text-destructive">immediately suspended</strong>.</p>
                  <p>• If a project rugs or engages in fraud, all stakes are <strong className="text-destructive">emergency unlocked</strong>, assets returned to users, and the project is <strong className="text-destructive">permanently blacklisted</strong>.</p>
                  <p>• <strong className="text-destructive">Blacklisted projects cannot rejoin STAKEFORGE.</strong></p>
                  <p>• All fees, terms, and conditions are <strong className="text-foreground">subject to change</strong> at the platform operator's discretion.</p>
                  <p>• STAKEFORGE reserves the right to modify, suspend, or terminate any project without prior notice in emergency situations.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══ STAKES ═══ */}
          <TabsContent value="stakes" className="space-y-6">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-display text-sm text-destructive">Emergency Controls Active</p>
                <p className="text-xs text-muted-foreground mt-1">Force-unlock any stake instantly. Use only in emergencies. Logged and irreversible.</p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">ALL STAKES ({stakes.length})</h3>
              <div className="space-y-2">
                {stakes.map((s) => {
                  const pool = pools.find((p) => p.id === s.pool_id);
                  return (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${s.status === "active" ? "bg-primary" : s.status === "emergency_unlocked" ? "bg-destructive" : "bg-muted-foreground"}`} />
                          <span className="font-display text-xs text-foreground">{pool?.project_name || "Unknown"}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">{s.status.toUpperCase()}</span>
                        </div>
                        <div className="flex gap-3 mt-1 text-[11px] text-muted-foreground">
                          <span>Amount: <strong className="text-foreground">{s.amount}</strong></span>
                          <span>Rewards: <strong className="text-foreground">{s.rewards_earned}</strong></span>
                          <span>User: <code className="text-primary/70">{s.user_id.slice(0, 8)}...</code></span>
                        </div>
                      </div>
                      {s.status === "active" && (
                        <Button variant="outline" size="sm" onClick={() => emergencyUnlockStake(s.id)} className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-display">
                          <Unlock className="w-3 h-3 mr-1" /> Unlock
                        </Button>
                      )}
                    </div>
                  );
                })}
                {stakes.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No stakes yet.</p>}
              </div>
            </div>
          </TabsContent>

          {/* ═══ USERS ═══ */}
          <TabsContent value="users">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">USERS ({profiles.length})</h3>
              <div className="space-y-2">
                {profiles.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-display text-primary">
                        {(p.display_name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-display text-sm text-foreground">{p.display_name || "Unnamed"}</span>
                        <div className="flex gap-3 text-[11px] text-muted-foreground">
                          <span>Lvl {p.level}</span>
                          <span>{p.points} pts</span>
                          <span className="text-accent">{p.rank}</span>
                          <span>ID: <code className="text-primary/70">{p.user_id.slice(0, 8)}...</code></span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ═══ FEES ═══ */}
          <TabsContent value="fees" className="space-y-6">
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-display text-sm text-accent">Platform Fee Control</p>
                <p className="text-xs text-muted-foreground mt-1">Change default fees here and override per-pool in Pools tab or per-project in Projects tab.</p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm text-foreground tracking-wider">SETTINGS</h3>
                <Button variant="ghost" size="sm" onClick={fetchAll} className="text-xs"><RefreshCw className="w-3 h-3 mr-1" /> Refresh</Button>
              </div>
              <div className="space-y-3">
                {settings.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <span className="font-display text-xs text-foreground min-w-[180px] tracking-wider">{s.key}</span>
                    <Input defaultValue={s.value} onBlur={(e) => { if (e.target.value !== s.value) updateSetting(s.id, e.target.value); }} className="bg-background border-border max-w-xs text-sm" />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSetting(s.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2">
                <Input placeholder="Key" value={newSettingKey} onChange={(e) => setNewSettingKey(e.target.value)} className="bg-background border-border text-xs" />
                <Input placeholder="Value" value={newSettingValue} onChange={(e) => setNewSettingValue(e.target.value)} className="bg-background border-border text-xs" />
                <Button onClick={createSetting} size="sm" className="bg-primary text-primary-foreground font-display text-xs"><Plus className="w-3 h-3 mr-1" /> Add</Button>
              </div>
            </div>
          </TabsContent>

          {/* ═══ BADGES ═══ */}
          <TabsContent value="badges" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">CREATE BADGE</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input placeholder="Name" value={newBadge.name} onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input placeholder="Description" value={newBadge.description} onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input placeholder="Icon 🏆" value={newBadge.icon} onChange={(e) => setNewBadge({ ...newBadge, icon: e.target.value })} className="bg-secondary border-border text-sm" />
                <Button onClick={createBadge} className="bg-primary text-primary-foreground font-display text-xs"><Plus className="w-3 h-3 mr-1" /> Create</Button>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">BADGES ({badges.length})</h3>
              <div className="space-y-2">
                {badges.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{b.icon}</span>
                      <div><span className="font-display text-sm text-foreground">{b.name}</span><p className="text-xs text-muted-foreground">{b.description}</p></div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteBadge(b.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                ))}
                {badges.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No badges.</p>}
              </div>
            </div>
          </TabsContent>

          {/* ═══ CALCULATOR ═══ */}
          <TabsContent value="calculator" className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" /> MASTER REWARD CALCULATOR
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">STAKERS</label>
                  <Input type="number" value={calcStakers} onChange={(e) => setCalcStakers(e.target.value)} className="bg-secondary border-border text-sm mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">AVG STAKE</label>
                  <Input type="number" value={calcAvgStake} onChange={(e) => setCalcAvgStake(e.target.value)} className="bg-secondary border-border text-sm mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">APY %</label>
                  <Input type="number" value={calcApy} onChange={(e) => setCalcApy(e.target.value)} className="bg-secondary border-border text-sm mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">DAYS</label>
                  <Input type="number" value={calcDays} onChange={(e) => setCalcDays(e.target.value)} className="bg-secondary border-border text-sm mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">FEE %</label>
                  <Input type="number" value={calcFee} onChange={(e) => setCalcFee(e.target.value)} className="bg-secondary border-border text-sm mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Staked", value: calc.total, color: "text-foreground" },
                  { label: "Total Rewards", value: calc.rewards, color: "text-primary" },
                  { label: `Fee (${calcFee}%)`, value: calc.fee, color: "text-destructive" },
                  { label: "Net to Holders", value: calc.net, color: "text-accent" },
                ].map((r) => (
                  <div key={r.label} className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
                    <p className={`font-display text-lg ${r.color}`}>{r.value}</p>
                    <p className="text-[10px] text-muted-foreground font-display tracking-wide">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ═══ BATTLE LOG ═══ */}
          <TabsContent value="battlelog">
            <div className="rounded-lg border border-border bg-card p-6">
              <BattleLog />
            </div>
          </TabsContent>

          {/* ═══ EMERGENCY ═══ */}
          <TabsContent value="emergency" className="space-y-6">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
              <div className="flex items-start gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
                <div>
                  <h3 className="font-display text-lg text-destructive tracking-wider">EMERGENCY CONTROLS</h3>
                  <p className="text-xs text-muted-foreground mt-2">Critical safety actions. All logged, cannot be undone.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Unlock className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="font-display text-sm text-foreground">Emergency Unlock — By Pool</p>
                      <p className="text-[11px] text-muted-foreground">Force-unlock all active stakes if a project rugs.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pools.filter((p) => p.status === "active").map((pool) => {
                      const count = stakes.filter((s) => s.pool_id === pool.id && s.status === "active").length;
                      return (
                        <Button key={pool.id} variant="outline" size="sm" onClick={() => emergencyUnlockAll(pool.id)} className="justify-between border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-display">
                          <span>{pool.project_name}</span><span className="text-muted-foreground">{count} active</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-display text-sm text-foreground">Emergency Wallet Switch</p>
                      <p className="text-[11px] text-muted-foreground">Update <strong className="text-foreground">emergency_wallet</strong> in Fees tab to redirect transactions.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ban className="w-5 h-5 text-destructive" />
                      <div>
                        <p className="font-display text-sm text-foreground">Pause All Pools</p>
                        <p className="text-[11px] text-muted-foreground">Stop all new stakes immediately.</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={async () => {
                      if (!window.confirm("⚠️ Pause ALL pools?")) return;
                      for (const pool of pools.filter((p) => p.status === "active")) {
                        await supabase.from("staking_pools").update({ status: "paused" }).eq("id", pool.id);
                      }
                      toast({ title: "⏸️ All pools paused" }); fetchAll();
                    }} className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-display">
                      <Ban className="w-3 h-3 mr-1" /> Pause All
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-destructive" />
                      <div>
                        <p className="font-display text-sm text-foreground">Blacklist Project — Emergency</p>
                        <p className="text-[11px] text-muted-foreground">Instantly blacklist a project, pause pools, and unlock all stakes.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {projects.filter(p => p.status === "active").map((proj) => (
                      <Button key={proj.id} variant="outline" size="sm" onClick={() => {
                        const reason = window.prompt(`Blacklist ${proj.project_name}? Enter reason:`);
                        if (reason !== null) updateProjectStatus(proj.id, "blacklisted", reason);
                      }} className="justify-between border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-display">
                        <span>{proj.project_name}</span><span className="text-muted-foreground">BLACKLIST</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
