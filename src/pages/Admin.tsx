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
  Wallet, Power, Eye, EyeOff, Save, Ban, CheckCircle2,
  Zap, FileText
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pools, setPools] = useState<any[]>([]);
  const [stakes, setStakes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [editingPool, setEditingPool] = useState<string | null>(null);
  const [editPoolData, setEditPoolData] = useState<any>({});

  const [newPool, setNewPool] = useState({
    project_name: "",
    apy: "45",
    lock_period_days: "30",
    reward_token: "",
    platform_fee_pct: "2.5",
  });

  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    icon: "🏆",
    requirement: "",
  });

  const [newSettingKey, setNewSettingKey] = useState("");
  const [newSettingValue, setNewSettingValue] = useState("");

  // Redirect non-admins immediately — show nothing
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = useCallback(async () => {
    const [poolsRes, stakesRes, profilesRes, settingsRes, badgesRes] = await Promise.all([
      supabase.from("staking_pools").select("*").order("created_at", { ascending: false }),
      supabase.from("stakes").select("*").order("staked_at", { ascending: false }),
      supabase.from("profiles").select("*").order("points", { ascending: false }),
      supabase.from("platform_settings").select("*"),
      supabase.from("badges").select("*"),
    ]);
    setPools(poolsRes.data || []);
    setStakes(stakesRes.data || []);
    setProfiles(profilesRes.data || []);
    setSettings(settingsRes.data || []);
    setBadges(badgesRes.data || []);
  }, []);

  // ─── Pool CRUD ───
  const createPool = async () => {
    if (!newPool.project_name || !newPool.reward_token) {
      toast({ title: "Missing fields", description: "Project name and reward token are required.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("staking_pools").insert({
      project_name: newPool.project_name,
      apy: parseFloat(newPool.apy),
      lock_period_days: parseInt(newPool.lock_period_days),
      reward_token: newPool.reward_token,
      platform_fee_pct: parseFloat(newPool.platform_fee_pct),
      created_by: user?.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Pool created successfully" });
      setNewPool({ project_name: "", apy: "45", lock_period_days: "30", reward_token: "", platform_fee_pct: "2.5" });
      fetchAll();
    }
  };

  const updatePool = async (id: string, data: any) => {
    const { error } = await supabase.from("staking_pools").update(data).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Pool updated" });
      setEditingPool(null);
      fetchAll();
    }
  };

  const togglePoolStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    await updatePool(id, { status: newStatus });
  };

  const deletePool = async (id: string) => {
    if (!window.confirm("⚠️ Are you sure? This will permanently delete this pool.")) return;
    await supabase.from("staking_pools").delete().eq("id", id);
    toast({ title: "Pool deleted" });
    fetchAll();
  };

  // ─── Emergency Unlock ───
  const emergencyUnlockStake = async (stakeId: string) => {
    if (!window.confirm("🚨 EMERGENCY UNLOCK: This will immediately unlock this stake and return assets to the user. Continue?")) return;
    const { error } = await supabase.from("stakes").update({
      status: "emergency_unlocked",
      unlock_at: new Date().toISOString(),
    }).eq("id", stakeId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "🔓 Stake emergency unlocked" });
      fetchAll();
    }
  };

  const emergencyUnlockAll = async (poolId: string) => {
    if (!window.confirm("🚨 CRITICAL: This will emergency-unlock ALL stakes in this pool. This action is irreversible. Continue?")) return;
    const poolStakes = stakes.filter((s) => s.pool_id === poolId && s.status === "active");
    for (const s of poolStakes) {
      await supabase.from("stakes").update({
        status: "emergency_unlocked",
        unlock_at: new Date().toISOString(),
      }).eq("id", s.id);
    }
    toast({ title: `🔓 ${poolStakes.length} stakes emergency unlocked` });
    fetchAll();
  };

  // ─── Settings ───
  const updateSetting = async (id: string, value: string) => {
    const { error } = await supabase.from("platform_settings").update({ value }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Setting saved" });
      fetchAll();
    }
  };

  const createSetting = async () => {
    if (!newSettingKey) return;
    const { error } = await supabase.from("platform_settings").insert({
      key: newSettingKey,
      value: newSettingValue,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Setting created" });
      setNewSettingKey("");
      setNewSettingValue("");
      fetchAll();
    }
  };

  const deleteSetting = async (id: string) => {
    await supabase.from("platform_settings").delete().eq("id", id);
    fetchAll();
  };

  // ─── Badges ───
  const createBadge = async () => {
    if (!newBadge.name) return;
    const { error } = await supabase.from("badges").insert(newBadge);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Badge created" });
      setNewBadge({ name: "", description: "", icon: "🏆", requirement: "" });
      fetchAll();
    }
  };

  const deleteBadge = async (id: string) => {
    await supabase.from("badges").delete().eq("id", id);
    fetchAll();
  };

  if (loading || !isAdmin) return null;

  const activeStakes = stakes.filter((s) => s.status === "active");
  const totalStakedValue = stakes.reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Admin Nav — clean, no external links */}
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
            <span className="text-xs text-muted-foreground font-display">
              🔒 OWNER ONLY
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">
              ← Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Pools", value: pools.length, icon: Layers, color: "text-primary" },
            { label: "Active Stakes", value: activeStakes.length, icon: Zap, color: "text-accent" },
            { label: "Total Staked", value: totalStakedValue.toLocaleString(), icon: DollarSign, color: "text-primary" },
            { label: "Users", value: profiles.length, icon: Users, color: "text-accent" },
            { label: "Badges", value: badges.length, icon: Award, color: "text-primary" },
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
            <TabsTrigger value="pools" className="font-display gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5" /> Pools
            </TabsTrigger>
            <TabsTrigger value="stakes" className="font-display gap-1.5 text-xs">
              <Lock className="w-3.5 h-3.5" /> Stakes & Emergency
            </TabsTrigger>
            <TabsTrigger value="users" className="font-display gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="fees" className="font-display gap-1.5 text-xs">
              <DollarSign className="w-3.5 h-3.5" /> Fees & Settings
            </TabsTrigger>
            <TabsTrigger value="badges" className="font-display gap-1.5 text-xs">
              <Award className="w-3.5 h-3.5" /> Badges
            </TabsTrigger>
            <TabsTrigger value="emergency" className="font-display gap-1.5 text-xs text-destructive">
              <AlertTriangle className="w-3.5 h-3.5" /> Emergency
            </TabsTrigger>
          </TabsList>

          {/* ═══ POOLS TAB ═══ */}
          <TabsContent value="pools" className="space-y-6">
            {/* Create Pool */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 flex items-center gap-2 tracking-wider">
                <Plus className="w-4 h-4 text-primary" /> CREATE NEW POOL
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Project Name" value={newPool.project_name} onChange={(e) => setNewPool({ ...newPool, project_name: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input placeholder="Reward Token (e.g. $APE)" value={newPool.reward_token} onChange={(e) => setNewPool({ ...newPool, reward_token: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input type="number" placeholder="APY %" value={newPool.apy} onChange={(e) => setNewPool({ ...newPool, apy: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input type="number" placeholder="Lock Period (days)" value={newPool.lock_period_days} onChange={(e) => setNewPool({ ...newPool, lock_period_days: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input type="number" placeholder="Platform Fee %" value={newPool.platform_fee_pct} onChange={(e) => setNewPool({ ...newPool, platform_fee_pct: e.target.value })} className="bg-secondary border-border text-sm" />
                <Button onClick={createPool} className="bg-primary text-primary-foreground font-display text-xs box-glow-cyan">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Create Pool
                </Button>
              </div>
            </div>

            {/* Pool List */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">ALL POOLS ({pools.length})</h3>
              <div className="space-y-3">
                {pools.map((pool) => (
                  <div key={pool.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${pool.status === "active" ? "bg-primary" : "bg-destructive"}`} />
                        <span className="font-display text-sm text-foreground">{pool.project_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground font-display">
                          {pool.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePoolStatus(pool.id, pool.status)}>
                              {pool.status === "active" ? <Power className="w-3.5 h-3.5 text-accent" /> : <Power className="w-3.5 h-3.5 text-primary" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{pool.status === "active" ? "Pause Pool" : "Activate Pool"}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                              setEditingPool(editingPool === pool.id ? null : pool.id);
                              setEditPoolData({ apy: pool.apy, platform_fee_pct: pool.platform_fee_pct, lock_period_days: pool.lock_period_days });
                            }}>
                              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Pool</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => emergencyUnlockAll(pool.id)}>
                              <Unlock className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Emergency Unlock All Stakes</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deletePool(pool.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Pool</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>APY: <strong className="text-foreground">{pool.apy}%</strong></span>
                      <span>Fee: <strong className="text-foreground">{pool.platform_fee_pct}%</strong></span>
                      <span>Lock: <strong className="text-foreground">{pool.lock_period_days}d</strong></span>
                      <span>Staked: <strong className="text-foreground">{pool.total_staked}</strong></span>
                      <span>Token: <strong className="text-accent">{pool.reward_token}</strong></span>
                    </div>
                    {/* Inline edit */}
                    {editingPool === pool.id && (
                      <div className="mt-3 pt-3 border-t border-border grid grid-cols-4 gap-2">
                        <Input type="number" placeholder="APY" value={editPoolData.apy} onChange={(e) => setEditPoolData({ ...editPoolData, apy: e.target.value })} className="bg-background border-border text-xs" />
                        <Input type="number" placeholder="Fee %" value={editPoolData.platform_fee_pct} onChange={(e) => setEditPoolData({ ...editPoolData, platform_fee_pct: e.target.value })} className="bg-background border-border text-xs" />
                        <Input type="number" placeholder="Lock Days" value={editPoolData.lock_period_days} onChange={(e) => setEditPoolData({ ...editPoolData, lock_period_days: e.target.value })} className="bg-background border-border text-xs" />
                        <Button size="sm" onClick={() => updatePool(pool.id, {
                          apy: parseFloat(editPoolData.apy),
                          platform_fee_pct: parseFloat(editPoolData.platform_fee_pct),
                          lock_period_days: parseInt(editPoolData.lock_period_days),
                        })} className="bg-primary text-primary-foreground font-display text-xs">
                          <Save className="w-3 h-3 mr-1" /> Save
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {pools.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No pools created yet.</p>}
              </div>
            </div>
          </TabsContent>

          {/* ═══ STAKES TAB ═══ */}
          <TabsContent value="stakes" className="space-y-6">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-display text-sm text-destructive">Emergency Controls Active</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You can force-unlock any stake instantly. Use only in emergencies (project rug, security breach, etc).
                  This action is logged and irreversible.
                </p>
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
                          <span className={`w-2 h-2 rounded-full ${
                            s.status === "active" ? "bg-primary" : s.status === "emergency_unlocked" ? "bg-destructive" : "bg-muted-foreground"
                          }`} />
                          <span className="font-display text-xs text-foreground">
                            {pool?.project_name || "Unknown Pool"}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                            {s.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-1 text-[11px] text-muted-foreground">
                          <span>Amount: <strong className="text-foreground">{s.amount}</strong></span>
                          <span>Rewards: <strong className="text-foreground">{s.rewards_earned}</strong></span>
                          <span>User: <code className="text-primary/70">{s.user_id.slice(0, 8)}...</code></span>
                          <span>{new Date(s.staked_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {s.status === "active" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => emergencyUnlockStake(s.id)} className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-display">
                              <Unlock className="w-3 h-3 mr-1" /> Unlock
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Emergency unlock this stake immediately</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  );
                })}
                {stakes.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No stakes recorded yet.</p>}
              </div>
            </div>
          </TabsContent>

          {/* ═══ USERS TAB ═══ */}
          <TabsContent value="users">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">REGISTERED USERS ({profiles.length})</h3>
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
                          <span>Ref: {p.referral_code || "—"}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ═══ FEES & SETTINGS TAB ═══ */}
          <TabsContent value="fees" className="space-y-6">
            {/* Fee Info */}
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-display text-sm text-accent">Platform Fee Control</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your platform fee is applied to all staking rewards. You can change the default fee here
                  and also override per-pool in the Pools tab. Changes apply to future reward calculations only.
                </p>
              </div>
            </div>

            {/* Current Settings */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm text-foreground tracking-wider">PLATFORM SETTINGS</h3>
                <Button variant="ghost" size="sm" onClick={fetchAll} className="text-xs">
                  <RefreshCw className="w-3 h-3 mr-1" /> Refresh
                </Button>
              </div>
              <div className="space-y-3">
                {settings.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <span className="font-display text-xs text-foreground min-w-[180px] tracking-wider">{s.key}</span>
                    <Input
                      defaultValue={s.value}
                      onBlur={(e) => {
                        if (e.target.value !== s.value) updateSetting(s.id, e.target.value);
                      }}
                      className="bg-background border-border max-w-xs text-sm"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSetting(s.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete setting</TooltipContent>
                    </Tooltip>
                  </div>
                ))}
                {settings.length === 0 && <p className="text-muted-foreground text-xs text-center py-4">No settings configured. Add defaults below.</p>}
              </div>

              {/* Add Setting */}
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2">
                <Input placeholder="Setting key (e.g. default_fee_pct)" value={newSettingKey} onChange={(e) => setNewSettingKey(e.target.value)} className="bg-background border-border text-xs" />
                <Input placeholder="Value" value={newSettingValue} onChange={(e) => setNewSettingValue(e.target.value)} className="bg-background border-border text-xs" />
                <Button onClick={createSetting} size="sm" className="bg-primary text-primary-foreground font-display text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Setting
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ═══ BADGES TAB ═══ */}
          <TabsContent value="badges" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">CREATE BADGE</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input placeholder="Badge Name" value={newBadge.name} onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input placeholder="Description" value={newBadge.description} onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input placeholder="Icon emoji (🏆)" value={newBadge.icon} onChange={(e) => setNewBadge({ ...newBadge, icon: e.target.value })} className="bg-secondary border-border text-sm" />
                <Button onClick={createBadge} className="bg-primary text-primary-foreground font-display text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Create Badge
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">ALL BADGES ({badges.length})</h3>
              <div className="space-y-2">
                {badges.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{b.icon}</span>
                      <div>
                        <span className="font-display text-sm text-foreground">{b.name}</span>
                        <p className="text-xs text-muted-foreground">{b.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteBadge(b.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
                {badges.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No badges yet.</p>}
              </div>
            </div>
          </TabsContent>

          {/* ═══ EMERGENCY TAB ═══ */}
          <TabsContent value="emergency" className="space-y-6">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
              <div className="flex items-start gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
                <div>
                  <h3 className="font-display text-lg text-destructive tracking-wider">EMERGENCY CONTROLS</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    These are critical safety actions that should only be used in emergencies.
                    All actions are logged and cannot be undone.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Emergency Unlock All */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Unlock className="w-5 h-5 text-destructive" />
                      <div>
                        <p className="font-display text-sm text-foreground">Emergency Unlock — By Pool</p>
                        <p className="text-[11px] text-muted-foreground">
                          Force-unlock all active stakes in a specific pool. Use if a project rugs or becomes malicious.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pools.filter((p) => p.status === "active").map((pool) => {
                      const poolActiveStakes = stakes.filter((s) => s.pool_id === pool.id && s.status === "active").length;
                      return (
                        <Button
                          key={pool.id}
                          variant="outline"
                          size="sm"
                          onClick={() => emergencyUnlockAll(pool.id)}
                          className="justify-between border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-display"
                        >
                          <span>{pool.project_name}</span>
                          <span className="text-muted-foreground">{poolActiveStakes} active</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Wallet Switch Reminder */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-display text-sm text-foreground">Emergency Wallet Switch</p>
                      <p className="text-[11px] text-muted-foreground">
                        To switch the platform's receiving wallet in case of compromise, update the
                        <strong className="text-foreground"> emergency_wallet</strong> setting in the Fees & Settings tab.
                        This will redirect all new staking transactions to the new wallet address.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pause All Pools */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ban className="w-5 h-5 text-destructive" />
                      <div>
                        <p className="font-display text-sm text-foreground">Pause All Pools</p>
                        <p className="text-[11px] text-muted-foreground">
                          Immediately pause all active staking pools. No new stakes can be created.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (!window.confirm("⚠️ Pause ALL active pools? No new stakes will be accepted.")) return;
                        for (const pool of pools.filter((p) => p.status === "active")) {
                          await supabase.from("staking_pools").update({ status: "paused" }).eq("id", pool.id);
                        }
                        toast({ title: "⏸️ All pools paused" });
                        fetchAll();
                      }}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-display"
                    >
                      <Ban className="w-3 h-3 mr-1" /> Pause All
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Disclaimer for Admins */}
            <div className="rounded-lg border border-accent/20 bg-card p-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display text-sm text-accent tracking-wider mb-2">PROJECT ONBOARDING DISCLAIMER</h3>
                  <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                    <p>All projects onboarded to STAKEFORGE agree to the following terms:</p>
                    <p>• STAKEFORGE reserves the right to <strong className="text-foreground">emergency-unlock all stakes</strong> in any pool at any time if the platform operator deems the project to be engaging in fraudulent, malicious, or unsafe behavior (including but not limited to rug pulls).</p>
                    <p>• Projects are solely responsible for their reward token distribution and liquidity.</p>
                    <p>• STAKEFORGE charges a non-negotiable platform fee on all staking rewards. The fee percentage is set by the platform operator and may be adjusted.</p>
                    <p>• STAKEFORGE is not liable for losses incurred by stakers due to project actions, smart contract vulnerabilities, or market conditions.</p>
                    <p>• The platform operator retains the right to pause, modify, or terminate any staking pool without prior notice in emergency situations.</p>
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
