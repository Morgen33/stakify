import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Layers, Settings, Users, DollarSign, RefreshCw,
  Save, Calculator, FileText, AlertTriangle, CreditCard,
  Eye, Gift, Send, Image, Sliders
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ProjectPanel = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<any>(null);
  const [pools, setPools] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [stakes, setStakes] = useState<any[]>([]);
  const [airdrops, setAirdrops] = useState<any[]>([]);
  const [stakers, setStakers] = useState<any[]>([]);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  const [newAirdrop, setNewAirdrop] = useState({ recipient_user_id: "", airdrop_type: "token", asset_name: "", asset_image_url: "", amount: "1", message: "" });
  const [loadingData, setLoadingData] = useState(true);

  // Calculator state
  const [calcStakers, setCalcStakers] = useState("100");
  const [calcAvgStake, setCalcAvgStake] = useState("5");
  const [calcApy, setCalcApy] = useState("45");
  const [calcDays, setCalcDays] = useState("30");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (user) checkAccess();
  }, [user, loading]);

  const checkAccess = async () => {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user!.id)
      .eq("role", "project_owner")
      .maybeSingle();

    if (!roleData) {
      navigate("/", { replace: true });
      return;
    }
    setIsProjectOwner(true);
    fetchAll();
  };

  const fetchAll = useCallback(async () => {
    setLoadingData(true);
    // Get project account owned by this user
    const { data: projData } = await supabase
      .from("project_accounts")
      .select("*")
      .eq("owner_id", user!.id)
      .maybeSingle();

    if (!projData) {
      setLoadingData(false);
      return;
    }
    setProject(projData);

    // Fetch pools and payments for this project
    const [poolsRes, paymentsRes] = await Promise.all([
      supabase.from("staking_pools").select("*").eq("project_account_id", projData.id).order("created_at", { ascending: false }),
      supabase.from("project_payments").select("*").eq("project_id", projData.id).order("created_at", { ascending: false }),
    ]);

    const fetchedPools = poolsRes.data || [];
    setPools(fetchedPools);
    setPayments(paymentsRes.data || []);

    // Fetch stakes for these pools + airdrops
    if (fetchedPools.length > 0) {
      const poolIds = fetchedPools.map((p: any) => p.id);
      const [stakesRes2, airdropsRes] = await Promise.all([
        supabase.from("stakes").select("*").in("pool_id", poolIds),
        supabase.from("airdrops").select("*").eq("project_account_id", projData.id).order("created_at", { ascending: false }),
      ]);
      setStakes(stakesRes2.data || []);
      setAirdrops(airdropsRes.data || []);
      // Get unique staker user IDs for the dropdown
      const userIds = [...new Set((stakesRes2.data || []).map((s: any) => s.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
        setStakers(profilesData || []);
      }
    } else {
      const { data: airdropsRes } = await supabase.from("airdrops").select("*").eq("project_account_id", projData.id).order("created_at", { ascending: false });
      setAirdrops(airdropsRes || []);
    }
    setLoadingData(false);
  }, [user]);

  const sendAirdrop = async () => {
    if (!project || !newAirdrop.recipient_user_id || !newAirdrop.asset_name) {
      toast({ title: "Missing fields", description: "Recipient and asset name are required.", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("airdrops").insert({
      project_account_id: project.id,
      recipient_user_id: newAirdrop.recipient_user_id,
      airdrop_type: newAirdrop.airdrop_type,
      asset_name: newAirdrop.asset_name,
      asset_image_url: newAirdrop.asset_image_url || null,
      amount: parseFloat(newAirdrop.amount) || 1,
      message: newAirdrop.message || null,
      status: "pending",
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "🎁 Airdrop sent!" });
      setNewAirdrop({ recipient_user_id: "", airdrop_type: "token", asset_name: "", asset_image_url: "", amount: "1", message: "" });
      fetchAll();
    }
  };

  const updateProjectInfo = async (field: string, value: string) => {
    if (!project) return;
    // Can't change platform_fee_pct
    if (field === "platform_fee_pct") {
      toast({ title: "Restricted", description: "Platform fee is set by STAKEFORGE and cannot be changed.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("project_accounts").update({ [field]: value } as any).eq("id", project.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Updated" });
      fetchAll();
    }
  };

  // Reward calculator
  const calcResults = () => {
    const stakers = parseInt(calcStakers) || 0;
    const avgStake = parseFloat(calcAvgStake) || 0;
    const apy = parseFloat(calcApy) || 0;
    const days = parseInt(calcDays) || 0;
    const totalStaked = stakers * avgStake;
    const dailyRate = apy / 100 / 365;
    const totalRewards = totalStaked * dailyRate * days;
    const platformFee = totalRewards * ((project?.platform_fee_pct || 10) / 100);
    const netRewards = totalRewards - platformFee;
    return { totalStaked, totalRewards: totalRewards.toFixed(4), platformFee: platformFee.toFixed(4), netRewards: netRewards.toFixed(4) };
  };

  if (loading || !isProjectOwner) return null;

  const calc = calcResults();
  const totalStakedInPools = pools.reduce((sum, p) => sum + Number(p.total_staked), 0);
  const activeStakes = stakes.filter((s) => s.status === "active").length;

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Nav */}
      <nav className="border-b border-border bg-card/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Layers className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-display text-lg text-foreground tracking-widest">
              {project?.project_name || "PROJECT"} <span className="text-accent">PANEL</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] px-2 py-1 rounded-full border font-display ${
              project?.status === "active" ? "border-primary/30 text-primary" :
              project?.status === "suspended" ? "border-destructive/30 text-destructive" :
              "border-border text-muted-foreground"
            }`}>
              {project?.status?.toUpperCase() || "LOADING"}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">
              ← Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Suspended/Blacklisted Warning */}
      {project && (project.status === "suspended" || project.status === "blacklisted") && (
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-display text-sm text-destructive">
                {project.status === "blacklisted" ? "PROJECT BLACKLISTED" : "PROJECT SUSPENDED"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {project.status === "blacklisted"
                  ? `Your project has been blacklisted. Reason: ${project.blacklist_reason || "Contact STAKEFORGE support."}. All stakes have been unlocked and returned to users.`
                  : "Your project is suspended due to overdue payments. Please settle outstanding payments to restore access."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="container max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Your Pools", value: pools.length, icon: Layers, color: "text-primary" },
            { label: "Active Stakes", value: activeStakes, icon: Users, color: "text-accent" },
            { label: "Total Staked", value: totalStakedInPools, icon: DollarSign, color: "text-primary" },
            { label: "Platform Fee", value: `${project?.platform_fee_pct || 10}%`, icon: CreditCard, color: "text-destructive" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-3 text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className="font-display text-lg text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <main className="container max-w-6xl mx-auto px-4 pb-10">
        <Tabs defaultValue="overview">
          <TabsList className="bg-card border border-border mb-6 flex-wrap">
            <TabsTrigger value="overview" className="font-display gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="pools" className="font-display gap-1.5 text-xs">
              <Sliders className="w-3.5 h-3.5" /> Staking Config
            </TabsTrigger>
            <TabsTrigger value="payments" className="font-display gap-1.5 text-xs">
              <CreditCard className="w-3.5 h-3.5" /> Payments
            </TabsTrigger>
            <TabsTrigger value="airdrops" className="font-display gap-1.5 text-xs">
              <Gift className="w-3.5 h-3.5" /> Airdrops
            </TabsTrigger>
            <TabsTrigger value="calculator" className="font-display gap-1.5 text-xs">
              <Calculator className="w-3.5 h-3.5" /> Calculator
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-display gap-1.5 text-xs">
              <Settings className="w-3.5 h-3.5" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* ═══ OVERVIEW ═══ */}
          <TabsContent value="overview" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">PROJECT INFORMATION</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Project Name</span>
                  <p className="font-display text-foreground">{project?.project_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Slug</span>
                  <p className="text-primary font-display">/project/{project?.slug}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Payment Plan</span>
                  <p className="font-display text-foreground capitalize">{project?.payment_plan}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Payment Status</span>
                  <p className={`font-display capitalize ${
                    project?.payment_status === "active" ? "text-primary" :
                    project?.payment_status === "overdue" ? "text-destructive" : "text-muted-foreground"
                  }`}>{project?.payment_status}</p>
                </div>
              </div>
            </div>

            {/* Platform fee disclaimer */}
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-display text-sm text-accent">PLATFORM FEE: {project?.platform_fee_pct}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This fee is set by STAKEFORGE and applied to all staking rewards in your pools.
                  <strong className="text-foreground"> This percentage is non-negotiable</strong> and subject to change
                  at the platform operator's discretion. Contact STAKEFORGE for fee discussions.
                </p>
              </div>
            </div>

            {/* Terms disclaimer */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                  <p className="font-display text-foreground text-sm tracking-wider mb-2">TERMS & CONDITIONS</p>
                  <p>• All payments are <strong className="text-foreground">upfront only</strong> unless a gradual payment plan has been negotiated and approved.</p>
                  <p>• If payment is missed or overdue, your project will be <strong className="text-destructive">suspended</strong> immediately. Staking pools will be paused.</p>
                  <p>• If a project is found to be engaging in fraudulent activity (rug pull, exit scam), all stakes will be <strong className="text-destructive">emergency unlocked</strong> and returned to users. The project will be permanently blacklisted.</p>
                  <p>• Blacklisted projects <strong className="text-destructive">cannot rejoin</strong> the STAKEFORGE platform.</p>
                  <p>• STAKEFORGE reserves the right to modify fees, terms, and conditions. Changes are subject to notice.</p>
                  <p>• Project owners are solely responsible for their community rewards, token distribution, and liquidity.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══ MY POOLS ═══ */}
          <TabsContent value="pools" className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">YOUR STAKING POOLS ({pools.length})</h3>
              {pools.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No pools assigned to your project yet. Contact STAKEFORGE admin to create pools.
                </p>
              ) : (
                <div className="space-y-6">
                  {pools.map((pool) => {
                    const poolStakes = stakes.filter((s) => s.pool_id === pool.id);
                    const activeCount = poolStakes.filter((s) => s.status === "active").length;
                    return (
                      <PoolConfigCard
                        key={pool.id}
                        pool={pool}
                        activeCount={activeCount}
                        onSave={async (updates) => {
                          const { error } = await supabase.from("staking_pools").update(updates as any).eq("id", pool.id);
                          if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
                          else { toast({ title: "✅ Pool config saved" }); fetchAll(); }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ═══ PAYMENTS ═══ */}
          <TabsContent value="payments" className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">PAYMENT HISTORY</h3>
              {payments.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No payment records yet.</p>
              ) : (
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            p.status === "paid" ? "bg-primary" :
                            p.status === "overdue" ? "bg-destructive" : "bg-accent"
                          }`} />
                          <span className="font-display text-xs text-foreground capitalize">{p.payment_type.replace("_", " ")}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                            {p.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {p.notes || "No notes"}
                          {p.due_date && ` • Due: ${new Date(p.due_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-sm text-foreground">{p.amount} {p.currency}</p>
                        {p.paid_at && <p className="text-[10px] text-muted-foreground">Paid {new Date(p.paid_at).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment disclaimer */}
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-destructive">PAYMENT POLICY:</strong> Missed payments result in immediate project suspension.
                Continued non-payment will lead to permanent blacklisting. All outstanding balances must be settled
                before reactivation. STAKEFORGE reserves the right to emergency-unlock all stakes in suspended projects.
              </p>
            </div>
          </TabsContent>

          {/* ═══ AIRDROPS ═══ */}
          <TabsContent value="airdrops" className="space-y-4">
            {/* Send Airdrop Form */}
            <div className="rounded-lg border border-accent/20 bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider flex items-center gap-2">
                <Send className="w-4 h-4 text-accent" /> SEND AIRDROP TO HOLDER
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">RECIPIENT (STAKER)</label>
                  <select
                    value={newAirdrop.recipient_user_id}
                    onChange={(e) => setNewAirdrop({ ...newAirdrop, recipient_user_id: e.target.value })}
                    className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground mt-1"
                  >
                    <option value="">Select a staker...</option>
                    {stakers.map((s: any) => (
                      <option key={s.user_id} value={s.user_id}>{s.display_name || s.user_id.slice(0, 8)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">TYPE</label>
                  <select
                    value={newAirdrop.airdrop_type}
                    onChange={(e) => setNewAirdrop({ ...newAirdrop, airdrop_type: e.target.value })}
                    className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground mt-1"
                  >
                    <option value="token">Token</option>
                    <option value="nft">NFT</option>
                    <option value="reward">Reward</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">ASSET NAME</label>
                  <Input value={newAirdrop.asset_name} onChange={(e) => setNewAirdrop({ ...newAirdrop, asset_name: e.target.value })} placeholder="e.g. 500 $TOKEN or CoolNFT #42" className="bg-secondary border-border text-sm mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">AMOUNT</label>
                  <Input type="number" value={newAirdrop.amount} onChange={(e) => setNewAirdrop({ ...newAirdrop, amount: e.target.value })} className="bg-secondary border-border text-sm mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">IMAGE URL (OPTIONAL)</label>
                  <Input value={newAirdrop.asset_image_url} onChange={(e) => setNewAirdrop({ ...newAirdrop, asset_image_url: e.target.value })} placeholder="https://..." className="bg-secondary border-border text-sm mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">MESSAGE (OPTIONAL)</label>
                  <Input value={newAirdrop.message} onChange={(e) => setNewAirdrop({ ...newAirdrop, message: e.target.value })} placeholder="Thank you for staking!" className="bg-secondary border-border text-sm mt-1" />
                </div>
              </div>
              <Button onClick={sendAirdrop} className="bg-accent text-accent-foreground font-display text-xs">
                <Gift className="w-3.5 h-3.5 mr-1.5" /> Send Airdrop
              </Button>
            </div>

            {/* Sent Airdrops History */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">SENT AIRDROPS ({airdrops.length})</h3>
              {airdrops.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No airdrops sent yet. Send rewards to your community holders above!</p>
              ) : (
                <div className="space-y-2">
                  {airdrops.map((a: any) => {
                    const recipientName = stakers.find((s: any) => s.user_id === a.recipient_user_id)?.display_name || a.recipient_user_id.slice(0, 8);
                    return (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                        <div className="flex items-center gap-3">
                          {a.asset_image_url ? (
                            <img src={a.asset_image_url} alt={a.asset_name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                              {a.airdrop_type === "nft" ? <Image className="w-4 h-4 text-accent" /> : <Gift className="w-4 h-4 text-accent" />}
                            </div>
                          )}
                          <div>
                            <p className="font-display text-xs text-foreground">{a.asset_name}</p>
                            <p className="text-[10px] text-muted-foreground">To: {recipientName} • {a.airdrop_type.toUpperCase()} • Qty: {a.amount}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-display ${
                            a.status === "claimed" ? "border-primary/30 text-primary" : "border-accent/30 text-accent"
                          }`}>{a.status.toUpperCase()}</span>
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" /> REWARD DISTRIBUTION CALCULATOR
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Estimate how many rewards you'll need to distribute to your holders based on pool parameters.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">NUMBER OF STAKERS</label>
                  <Input type="number" value={calcStakers} onChange={(e) => setCalcStakers(e.target.value)} className="bg-secondary border-border text-sm mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">AVG STAKE (NFTs/ETH)</label>
                  <Input type="number" value={calcAvgStake} onChange={(e) => setCalcAvgStake(e.target.value)} className="bg-secondary border-border text-sm mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">REWARD RATE %</label>
                  <Input type="number" value={calcApy} onChange={(e) => setCalcApy(e.target.value)} className="bg-secondary border-border text-sm mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">PERIOD (DAYS)</label>
                  <Input type="number" value={calcDays} onChange={(e) => setCalcDays(e.target.value)} className="bg-secondary border-border text-sm mt-1" />
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Staked", value: calc.totalStaked, color: "text-foreground" },
                  { label: "Total Rewards", value: calc.totalRewards, color: "text-primary" },
                  { label: `Platform Fee (${project?.platform_fee_pct || 10}%)`, value: calc.platformFee, color: "text-destructive" },
                  { label: "Net to Holders", value: calc.netRewards, color: "text-accent" },
                ].map((r) => (
                  <div key={r.label} className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
                    <p className={`font-display text-lg ${r.color}`}>{r.value}</p>
                    <p className="text-[10px] text-muted-foreground font-display tracking-wide">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ═══ SETTINGS ═══ */}
          <TabsContent value="settings" className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-sm text-foreground mb-4 tracking-wider">PROJECT SETTINGS</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">PROJECT NAME</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      defaultValue={project?.project_name}
                      id="proj-name"
                      className="bg-secondary border-border text-sm"
                    />
                    <Button size="sm" onClick={() => {
                      const val = (document.getElementById("proj-name") as HTMLInputElement)?.value;
                      if (val) updateProjectInfo("project_name", val);
                    }} className="bg-primary text-primary-foreground font-display text-xs">
                      <Save className="w-3 h-3 mr-1" /> Save
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">DESCRIPTION</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      defaultValue={project?.description || ""}
                      id="proj-desc"
                      className="bg-secondary border-border text-sm"
                    />
                    <Button size="sm" onClick={() => {
                      const val = (document.getElementById("proj-desc") as HTMLInputElement)?.value;
                      updateProjectInfo("description", val || "");
                    }} className="bg-primary text-primary-foreground font-display text-xs">
                      <Save className="w-3 h-3 mr-1" /> Save
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">CONTACT EMAIL</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      defaultValue={project?.contact_email || ""}
                      id="proj-email"
                      className="bg-secondary border-border text-sm"
                    />
                    <Button size="sm" onClick={() => {
                      const val = (document.getElementById("proj-email") as HTMLInputElement)?.value;
                      updateProjectInfo("contact_email", val || "");
                    }} className="bg-primary text-primary-foreground font-display text-xs">
                      <Save className="w-3 h-3 mr-1" /> Save
                    </Button>
                  </div>
                </div>

                {/* Locked fee display */}
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider">PLATFORM FEE (LOCKED)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={`${project?.platform_fee_pct}%`}
                      disabled
                      className="bg-muted border-border text-sm max-w-[120px] opacity-60"
                    />
                    <span className="text-[10px] text-destructive font-display">🔒 SET BY STAKEFORGE — NON-NEGOTIABLE</span>
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

export default ProjectPanel;
