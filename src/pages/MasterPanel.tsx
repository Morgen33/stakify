import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Wallet, AlertTriangle, Settings, Users, Zap,
  RefreshCw, Save, Trash2, Power, Eye, Lock, Unlock,
  DollarSign, ScrollText, Search, UserX, Crown
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import BattleLog from "@/components/BattleLog";
import FeatureToggles from "@/components/FeatureToggles";
import LiveAlertsPanel from "@/components/LiveAlertsPanel";
import { logAction } from "@/lib/activity-logger";

const MasterPanel = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isMaster, setIsMaster] = useState(false);
  const [masterWallets, setMasterWallets] = useState<any[]>([]);
  const [feeWaivers, setFeeWaivers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [stakes, setStakes] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);

  const [newMasterWallet, setNewMasterWallet] = useState({ label: "", address: "", wallet_purpose: "fee_collection", notes: "" });
  const [newWaiver, setNewWaiver] = useState({ user_id: "", project_account_id: "", waiver_type: "full", reason: "" });
  const [waiverSearch, setWaiverSearch] = useState("");
  const [newSettingKey, setNewSettingKey] = useState("");
  const [newSettingValue, setNewSettingValue] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [assignRole, setAssignRole] = useState({ user_id: "", role: "admin" });

  useEffect(() => {
    if (!loading && !user) { navigate("/auth", { replace: true }); return; }
    if (user) checkAccess();
  }, [user, loading]);

  const checkAccess = async () => {
    const { data } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", user!.id).eq("role", "master").maybeSingle();
    if (!data) { navigate("/", { replace: true }); return; }
    setIsMaster(true);
    fetchAll();
  };

  const fetchAll = useCallback(async () => {
    const [mwRes, fwRes, profRes, setRes, stakesRes, poolsRes, projRes, rolesRes, walletsRes] = await Promise.all([
      supabase.from("master_wallets").select("*").order("created_at", { ascending: false }),
      supabase.from("fee_waivers").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("points", { ascending: false }),
      supabase.from("platform_settings").select("*"),
      supabase.from("stakes").select("*").order("staked_at", { ascending: false }),
      supabase.from("staking_pools").select("*").order("created_at", { ascending: false }),
      supabase.from("project_accounts").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("platform_wallets").select("*").order("created_at", { ascending: false }),
    ]);
    setMasterWallets(mwRes.data || []);
    setFeeWaivers(fwRes.data || []);
    setProfiles(profRes.data || []);
    setSettings(setRes.data || []);
    setStakes(stakesRes.data || []);
    setPools(poolsRes.data || []);
    setProjects(projRes.data || []);
    setRoles(rolesRes.data || []);
    setWallets(walletsRes.data || []);
  }, []);

  // ─── Master Wallets ───
  const createMasterWallet = async () => {
    if (!newMasterWallet.label || !newMasterWallet.address) {
      toast({ title: "Missing fields", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("master_wallets").insert({
      ...newMasterWallet, user_id: user!.id,
      is_active: masterWallets.filter(w => w.wallet_purpose === newMasterWallet.wallet_purpose).length === 0,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      logAction("Master wallet created", { label: newMasterWallet.label, purpose: newMasterWallet.wallet_purpose });
      toast({ title: "✅ Master wallet added" });
      setNewMasterWallet({ label: "", address: "", wallet_purpose: "fee_collection", notes: "" });
      fetchAll();
    }
  };

  const setActiveMasterWallet = async (id: string, purpose: string) => {
    const sameType = masterWallets.filter(w => w.wallet_purpose === purpose);
    for (const w of sameType) {
      if (w.is_active) await supabase.from("master_wallets").update({ is_active: false }).eq("id", w.id);
    }
    await supabase.from("master_wallets").update({ is_active: true }).eq("id", id);
    logAction("Master wallet activated", { wallet_id: id, purpose });
    toast({ title: "🔄 Active wallet switched" }); fetchAll();
  };

  const deleteMasterWallet = async (id: string) => {
    if (!window.confirm("Delete this master wallet?")) return;
    await supabase.from("master_wallets").delete().eq("id", id);
    toast({ title: "Wallet deleted" }); fetchAll();
  };

  // ─── Fee Waivers ───
  const createFeeWaiver = async () => {
    if (!newWaiver.user_id && !newWaiver.project_account_id) {
      toast({ title: "Select a user or project to waive", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("fee_waivers").insert({
      ...newWaiver,
      user_id: newWaiver.user_id || null,
      project_account_id: newWaiver.project_account_id || null,
      granted_by: user!.id,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      logAction("Fee waiver granted", { ...newWaiver });
      toast({ title: "✅ Fee waiver granted" });
      setNewWaiver({ user_id: "", project_account_id: "", waiver_type: "full", reason: "" });
      fetchAll();
    }
  };

  const revokeFeeWaiver = async (id: string) => {
    await supabase.from("fee_waivers").update({ active: false }).eq("id", id);
    toast({ title: "Waiver revoked" }); fetchAll();
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

  // ─── Emergency ───
  const emergencyUnlockStake = async (stakeId: string) => {
    if (!window.confirm("🚨 EMERGENCY UNLOCK this stake?")) return;
    await supabase.from("stakes").update({ status: "emergency_unlocked", unlock_at: new Date().toISOString() }).eq("id", stakeId);
    logAction("Emergency unlock", { stake_id: stakeId });
    toast({ title: "🔓 Stake unlocked" }); fetchAll();
  };

  const emergencyUnlockAll = async (poolId: string) => {
    if (!window.confirm("🚨 CRITICAL: Unlock ALL stakes in this pool?")) return;
    const poolStakes = stakes.filter(s => s.pool_id === poolId && s.status === "active");
    for (const s of poolStakes) {
      await supabase.from("stakes").update({ status: "emergency_unlocked", unlock_at: new Date().toISOString() }).eq("id", s.id);
    }
    logAction("Emergency unlock all", { pool_id: poolId, count: poolStakes.length });
    toast({ title: `🔓 ${poolStakes.length} stakes unlocked` }); fetchAll();
  };

  // ─── Role Management ───
  const assignUserRole = async () => {
    if (!assignRole.user_id) { toast({ title: "Select a user", variant: "destructive" }); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: assignRole.user_id, role: assignRole.role as any });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      logAction("Role assigned", { user_id: assignRole.user_id, role: assignRole.role });
      toast({ title: `✅ ${assignRole.role} role assigned` });
      setAssignRole({ user_id: "", role: "admin" });
      fetchAll();
    }
  };

  const removeRole = async (roleId: string) => {
    if (!window.confirm("Remove this role?")) return;
    await supabase.from("user_roles").delete().eq("id", roleId);
    toast({ title: "Role removed" }); fetchAll();
  };

  // ─── Take All Fees (override) ───
  const setMasterFeeOverride = async (takesAll: boolean) => {
    const existing = settings.find(s => s.key === "master_takes_all_fees");
    if (existing) {
      await supabase.from("platform_settings").update({ value: takesAll ? "true" : "false" }).eq("id", existing.id);
    } else {
      await supabase.from("platform_settings").insert({ key: "master_takes_all_fees", value: takesAll ? "true" : "false" });
    }
    logAction("Master fee override", { takes_all: takesAll });
    toast({ title: takesAll ? "💰 All fees routed to Master" : "Fees restored to normal split" });
    fetchAll();
  };

  const masterTakesAll = settings.find(s => s.key === "master_takes_all_fees")?.value === "true";

  if (loading || !isMaster) return null;

  const activeStakes = stakes.filter(s => s.status === "active");
  const totalStaked = stakes.reduce((sum, s) => sum + Number(s.amount), 0);
  const feeWallet = masterWallets.find(w => w.wallet_purpose === "fee_collection" && w.is_active);
  const emergencyWallet = masterWallets.find(w => w.wallet_purpose === "emergency" && w.is_active);
  const filteredProfiles = waiverSearch
    ? profiles.filter(p => (p.display_name || "").toLowerCase().includes(waiverSearch.toLowerCase()) || p.user_id?.includes(waiverSearch))
    : profiles;
  const filteredRoleProfiles = roleSearch
    ? profiles.filter(p => (p.display_name || "").toLowerCase().includes(roleSearch.toLowerCase()) || p.user_id?.includes(roleSearch))
    : profiles;

  return (
    <div className="min-h-screen bg-background bg-grid">
      <nav className="border-b border-border bg-card/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display text-lg text-foreground tracking-widest">
              STAKEFORGE <span className="text-primary">MASTER CONTROL</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-display">👑 MASTER DEV ONLY</span>
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">← Dashboard</Button>
          </div>
        </div>
      </nav>

      {/* Stats */}
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Pools", value: pools.length, icon: Settings, color: "text-primary" },
            { label: "Active Stakes", value: activeStakes.length, icon: Zap, color: "text-accent" },
            { label: "Total Staked", value: totalStaked.toLocaleString(), icon: DollarSign, color: "text-primary" },
            { label: "Users", value: profiles.length, icon: Users, color: "text-accent" },
            { label: "Fee Wallet", value: feeWallet ? "✅" : "⚠️", icon: Wallet, color: feeWallet ? "text-primary" : "text-destructive" },
            { label: "Emergency", value: emergencyWallet ? "✅" : "⚠️", icon: AlertTriangle, color: emergencyWallet ? "text-primary" : "text-destructive" },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-3 text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className="font-display text-lg text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <main className="container max-w-7xl mx-auto px-4 pb-10">
        <Tabs defaultValue="wallets">
          <TabsList className="bg-card border border-border mb-6 flex-wrap">
            <TabsTrigger value="wallets" className="font-display gap-1.5 text-xs"><Wallet className="w-3.5 h-3.5" /> My Wallets</TabsTrigger>
            <TabsTrigger value="fees" className="font-display gap-1.5 text-xs"><DollarSign className="w-3.5 h-3.5" /> Fee Control</TabsTrigger>
            <TabsTrigger value="waivers" className="font-display gap-1.5 text-xs"><UserX className="w-3.5 h-3.5" /> Fee Waivers</TabsTrigger>
            <TabsTrigger value="roles" className="font-display gap-1.5 text-xs"><Shield className="w-3.5 h-3.5" /> Roles</TabsTrigger>
            <TabsTrigger value="emergency" className="font-display gap-1.5 text-xs text-destructive"><AlertTriangle className="w-3.5 h-3.5" /> Emergency</TabsTrigger>
            <TabsTrigger value="settings" className="font-display gap-1.5 text-xs"><Settings className="w-3.5 h-3.5" /> Settings</TabsTrigger>
            <TabsTrigger value="diagnostics" className="font-display gap-1.5 text-xs text-primary"><Eye className="w-3.5 h-3.5" /> Diagnostics</TabsTrigger>
            <TabsTrigger value="features" className="font-display gap-1.5 text-xs"><Power className="w-3.5 h-3.5" /> Features</TabsTrigger>
          </TabsList>

          {/* ═══ MY WALLETS ═══ */}
          <TabsContent value="wallets" className="space-y-6">
            {/* Fee Collection Wallet */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
              <h3 className="font-display text-sm text-primary mb-4 tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> FEE COLLECTION WALLET (12¢ Network Fee)
              </h3>
              {feeWallet ? (
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                    <span className="font-display text-sm text-foreground">{feeWallet.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-display">ACTIVE</span>
                  </div>
                  <code className="text-xs text-primary/80 break-all">{feeWallet.address}</code>
                </div>
              ) : (
                <p className="text-sm text-destructive mb-4 font-display">⚠️ No fee collection wallet set — add one below</p>
              )}
            </div>

            {/* Emergency Wallet */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
              <h3 className="font-display text-sm text-destructive mb-4 tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> EMERGENCY WALLET (Quick Exit)
              </h3>
              {emergencyWallet ? (
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                    <span className="font-display text-sm text-foreground">{emergencyWallet.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-display">EMERGENCY</span>
                  </div>
                  <code className="text-xs text-destructive/80 break-all">{emergencyWallet.address}</code>
                </div>
              ) : (
                <p className="text-sm text-destructive mb-4 font-display">⚠️ No emergency wallet set — add one below</p>
              )}
            </div>

            {/* Add Wallet */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">ADD MASTER WALLET</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Label (e.g. My Ledger)" value={newMasterWallet.label} onChange={e => setNewMasterWallet({ ...newMasterWallet, label: e.target.value })} className="bg-secondary border-border text-sm" />
                <Input placeholder="Wallet Address (0x...)" value={newMasterWallet.address} onChange={e => setNewMasterWallet({ ...newMasterWallet, address: e.target.value })} className="bg-secondary border-border text-sm" />
                <select value={newMasterWallet.wallet_purpose} onChange={e => setNewMasterWallet({ ...newMasterWallet, wallet_purpose: e.target.value })} className="bg-secondary border border-border rounded-md text-sm text-foreground px-3">
                  <option value="fee_collection">💰 Fee Collection (12¢)</option>
                  <option value="emergency">🚨 Emergency Wallet</option>
                </select>
                <Input placeholder="Notes (optional)" value={newMasterWallet.notes} onChange={e => setNewMasterWallet({ ...newMasterWallet, notes: e.target.value })} className="bg-secondary border-border text-sm" />
              </div>
              <Button onClick={createMasterWallet} className="mt-3 bg-primary text-primary-foreground font-display text-xs">
                <Save className="w-3.5 h-3.5 mr-1" /> Add Wallet
              </Button>
            </div>

            {/* All Master Wallets */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">ALL MASTER WALLETS ({masterWallets.length})</h3>
              <div className="space-y-3">
                {masterWallets.map(w => (
                  <div key={w.id} className={`rounded-lg border p-4 ${w.wallet_purpose === "emergency" ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        {w.is_active && <span className={`w-2 h-2 rounded-full animate-pulse ${w.wallet_purpose === "emergency" ? "bg-destructive" : "bg-primary"}`} />}
                        <span className="font-display text-sm text-foreground">{w.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground font-display">
                          {w.wallet_purpose === "emergency" ? "🚨 EMERGENCY" : "💰 FEE"}
                        </span>
                        {w.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-display">ACTIVE</span>}
                      </div>
                      <div className="flex gap-1">
                        {!w.is_active && (
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveMasterWallet(w.id, w.wallet_purpose)}>
                              <Power className="w-3.5 h-3.5 text-primary" />
                            </Button>
                          </TooltipTrigger><TooltipContent>Set Active</TooltipContent></Tooltip>
                        )}
                        <Tooltip><TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMasterWallet(w.id)}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                      </div>
                    </div>
                    <code className="text-xs text-muted-foreground break-all">{w.address}</code>
                    {w.notes && <p className="text-xs text-muted-foreground mt-1">{w.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ═══ FEE CONTROL ═══ */}
          <TabsContent value="fees" className="space-y-6">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
              <h3 className="font-display text-sm text-primary mb-4 tracking-wider">MASTER FEE OVERRIDE</h3>
              <p className="text-xs text-muted-foreground mb-4">
                When enabled, <strong className="text-foreground">ALL platform fees</strong> are routed directly to your Master wallet.
                This overrides the normal admin/operator splits entirely.
              </p>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setMasterFeeOverride(!masterTakesAll)}
                  className={`font-display text-xs ${masterTakesAll ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}
                >
                  {masterTakesAll ? <><Lock className="w-3.5 h-3.5 mr-1" /> Disable Override</> : <><DollarSign className="w-3.5 h-3.5 mr-1" /> Take All Fees</>}
                </Button>
                <span className={`text-xs font-display ${masterTakesAll ? "text-primary" : "text-muted-foreground"}`}>
                  {masterTakesAll ? "✅ ALL FEES → MASTER" : "Normal fee split active"}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">CURRENT FEE STRUCTURE</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <span className="font-display">Network Maintenance Fee (Master)</span>
                  <strong className="text-primary">$0.12 USDC / tx</strong>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <span className="font-display">Platform Fee (Admin/Operator)</span>
                  <strong className="text-foreground">Variable % per pool</strong>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <span className="font-display">Project Fee</span>
                  <strong className="text-foreground">Set by project owner</strong>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══ FEE WAIVERS (WeGens) ═══ */}
          <TabsContent value="waivers" className="space-y-6">
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-6">
              <h3 className="font-display text-sm text-accent mb-2 tracking-wider">WEGENS — FEE EXEMPT ACCOUNTS</h3>
              <p className="text-xs text-muted-foreground mb-4">
                First minters, first stakers, and site owners (WeGens) are exempt from all platform fees.
                Grant waivers here — only the Master can create or revoke them.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">SEARCH USER</label>
                  <Input placeholder="Name or user ID..." value={waiverSearch} onChange={e => setWaiverSearch(e.target.value)} className="bg-secondary border-border text-sm mt-1" />
                  {waiverSearch && (
                    <div className="mt-1 max-h-32 overflow-y-auto rounded border border-border bg-card">
                      {filteredProfiles.slice(0, 5).map(p => (
                        <button key={p.id} className="w-full text-left px-3 py-1.5 text-xs hover:bg-secondary/50 flex items-center gap-2"
                          onClick={() => { setNewWaiver({ ...newWaiver, user_id: p.user_id }); setWaiverSearch(p.display_name || p.user_id); }}>
                          <span className="text-foreground font-display">{p.display_name || "Unnamed"}</span>
                          <span className="text-muted-foreground text-[10px]">{p.user_id.slice(0, 8)}...</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">OR SELECT PROJECT</label>
                  <select value={newWaiver.project_account_id} onChange={e => setNewWaiver({ ...newWaiver, project_account_id: e.target.value })} className="w-full bg-secondary border border-border rounded-md text-sm text-foreground px-3 py-2 mt-1">
                    <option value="">No project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">WAIVER TYPE</label>
                  <select value={newWaiver.waiver_type} onChange={e => setNewWaiver({ ...newWaiver, waiver_type: e.target.value })} className="w-full bg-secondary border border-border rounded-md text-sm text-foreground px-3 py-2 mt-1">
                    <option value="full">Full (all fees waived)</option>
                    <option value="network_only">Network fee only</option>
                    <option value="platform_only">Platform fee only</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">REASON</label>
                  <Input placeholder="e.g. WeGen - OG Minter" value={newWaiver.reason} onChange={e => setNewWaiver({ ...newWaiver, reason: e.target.value })} className="bg-secondary border-border text-sm mt-1" />
                </div>
              </div>
              <Button onClick={createFeeWaiver} className="bg-accent text-accent-foreground font-display text-xs">
                <Save className="w-3.5 h-3.5 mr-1" /> Grant Waiver
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">ACTIVE WAIVERS ({feeWaivers.filter(w => w.active).length})</h3>
              <div className="space-y-2">
                {feeWaivers.map(w => {
                  const prof = profiles.find(p => p.user_id === w.user_id);
                  const proj = projects.find(p => p.id === w.project_account_id);
                  return (
                    <div key={w.id} className={`flex items-center justify-between p-3 rounded-lg border ${w.active ? "border-accent/30 bg-accent/5" : "border-border bg-secondary/30 opacity-50"}`}>
                      <div>
                        <span className="font-display text-sm text-foreground">{prof?.display_name || proj?.project_name || "Unknown"}</span>
                        <div className="flex gap-3 text-[10px] text-muted-foreground">
                          <span>{w.waiver_type}</span>
                          <span>{w.reason}</span>
                          <span>{w.active ? "✅ Active" : "❌ Revoked"}</span>
                        </div>
                      </div>
                      {w.active && (
                        <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => revokeFeeWaiver(w.id)}>
                          Revoke
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ═══ ROLES ═══ */}
          <TabsContent value="roles" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">ASSIGN ROLE</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">SEARCH USER</label>
                  <Input placeholder="Name or ID..." value={roleSearch} onChange={e => setRoleSearch(e.target.value)} className="bg-secondary border-border text-sm mt-1" />
                  {roleSearch && (
                    <div className="mt-1 max-h-32 overflow-y-auto rounded border border-border bg-card">
                      {filteredRoleProfiles.slice(0, 5).map(p => (
                        <button key={p.id} className="w-full text-left px-3 py-1.5 text-xs hover:bg-secondary/50"
                          onClick={() => { setAssignRole({ ...assignRole, user_id: p.user_id }); setRoleSearch(p.display_name || p.user_id); }}>
                          <span className="text-foreground font-display">{p.display_name || "Unnamed"}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">ROLE</label>
                  <select value={assignRole.role} onChange={e => setAssignRole({ ...assignRole, role: e.target.value })} className="w-full bg-secondary border border-border rounded-md text-sm text-foreground px-3 py-2 mt-1">
                    <option value="admin">Admin (Site Owner)</option>
                    <option value="operator">Operator</option>
                    <option value="project_owner">Project Owner</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={assignUserRole} className="bg-primary text-primary-foreground font-display text-xs w-full">
                    <Shield className="w-3.5 h-3.5 mr-1" /> Assign Role
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">ALL ROLES ({roles.length})</h3>
              <div className="space-y-2">
                {roles.map(r => {
                  const prof = profiles.find(p => p.user_id === r.user_id);
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-display ${
                          r.role === "master" ? "bg-primary/20 text-primary" :
                          r.role === "admin" ? "bg-destructive/20 text-destructive" :
                          r.role === "operator" ? "bg-accent/20 text-accent" :
                          "bg-secondary text-muted-foreground"
                        }`}>{r.role.toUpperCase()}</span>
                        <span className="font-display text-sm text-foreground">{prof?.display_name || "Unknown"}</span>
                        <span className="text-[10px] text-muted-foreground">{r.user_id.slice(0, 8)}...</span>
                      </div>
                      {r.role !== "master" && (
                        <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => removeRole(r.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ═══ EMERGENCY ═══ */}
          <TabsContent value="emergency" className="space-y-6">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
              <h3 className="font-display text-sm text-destructive mb-4 tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> EMERGENCY CONTROLS — MASTER ONLY
              </h3>
              <p className="text-xs text-muted-foreground mb-4">These actions are irreversible. Only use in emergencies.</p>

              <div className="space-y-3">
                {pools.map(pool => {
                  const poolStakes = stakes.filter(s => s.pool_id === pool.id && s.status === "active");
                  return (
                    <div key={pool.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${pool.status === "active" ? "bg-primary" : "bg-destructive"}`} />
                          <span className="font-display text-sm text-foreground">{pool.project_name}</span>
                          <span className="text-[10px] text-muted-foreground">{poolStakes.length} active stakes</span>
                        </div>
                        <Button variant="destructive" size="sm" className="font-display text-xs" onClick={() => emergencyUnlockAll(pool.id)}>
                          <Unlock className="w-3 h-3 mr-1" /> Unlock All
                        </Button>
                      </div>
                      {poolStakes.slice(0, 3).map(s => (
                        <div key={s.id} className="flex items-center justify-between px-3 py-1 text-xs text-muted-foreground">
                          <span>{s.amount} staked</span>
                          <Button variant="ghost" size="sm" className="text-[10px] text-destructive h-6" onClick={() => emergencyUnlockStake(s.id)}>
                            Unlock
                          </Button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ═══ SETTINGS ═══ */}
          <TabsContent value="settings" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">PLATFORM SETTINGS</h3>
              <div className="space-y-2 mb-4">
                {settings.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <span className="font-display text-xs text-foreground min-w-[180px] tracking-wider">{s.key}</span>
                    <Input defaultValue={s.value} id={`ms-${s.id}`} className="bg-background border-border text-xs flex-1" />
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => {
                      const val = (document.getElementById(`ms-${s.id}`) as HTMLInputElement)?.value;
                      if (val) updateSetting(s.id, val);
                    }}><Save className="w-3 h-3" /></Button>
                    <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive" onClick={() => deleteSetting(s.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Key" value={newSettingKey} onChange={e => setNewSettingKey(e.target.value)} className="bg-secondary border-border text-xs max-w-[200px]" />
                <Input placeholder="Value" value={newSettingValue} onChange={e => setNewSettingValue(e.target.value)} className="bg-secondary border-border text-xs flex-1" />
                <Button size="sm" onClick={createSetting} className="text-xs font-display">Add</Button>
              </div>
            </div>
          </TabsContent>

          {/* ═══ DIAGNOSTICS ═══ */}
          <TabsContent value="diagnostics" className="space-y-6">
            <BattleLog />
            <LiveAlertsPanel />
          </TabsContent>

          {/* ═══ FEATURES ═══ */}
          <TabsContent value="features">
            <FeatureToggles />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MasterPanel;
