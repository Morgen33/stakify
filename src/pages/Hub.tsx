import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layers, TrendingUp, Trophy, Coins, Gift, HelpCircle,
  Clock, Unlock, Lock, RefreshCw, Zap, Image, CheckCircle2, Gamepad2, DollarSign, ArrowLeftRight, Sparkles,
  User, Palette, Star, Crown, Wand2, ChevronDown, ChevronRight, Hash, Folder, Settings, Wallet, Copy, Save, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WalletModal from "@/components/WalletModal";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

/* ── Collection Card ── */
const CollectionCard = ({
  collectionName, logo, rewardToken, stakes, onEarlyUnlock,
}: {
  collectionName: string; logo?: string | null; rewardToken: string; stakes: any[]; onEarlyUnlock: (stake: any) => void;
}) => {
  const [open, setOpen] = useState(false);
  const totalStaked = stakes.reduce((s, st) => s + Number(st.amount), 0);
  const totalRewards = stakes.reduce((s, st) => s + Number(st.rewards_earned), 0);
  const activeCount = stakes.filter(s => s.status === "active").length;

  return (
    <motion.div className="rounded-xl border border-border bg-card overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors text-left">
        {logo ? (
          <img src={logo} alt={collectionName} className="w-12 h-12 rounded-lg object-cover border border-border shadow" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-border flex items-center justify-center">
            <Folder className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm text-foreground truncate">{collectionName}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] text-muted-foreground font-display">{activeCount} active</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground font-display">{totalStaked} staked</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-accent font-display">{rewardToken}</span>
          </div>
        </div>
        <div className="text-right mr-2 hidden sm:block">
          <p className="font-display text-lg text-primary">{totalRewards.toFixed(4)}</p>
          <p className="text-[9px] text-muted-foreground font-display tracking-wider">REWARDS</p>
        </div>
        <div className="flex-shrink-0">
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="border-t border-border bg-secondary/10 divide-y divide-border/50">
              {stakes.map((stake) => {
                const isLocked = stake.unlock_at && new Date(stake.unlock_at) > new Date();
                return (
                  <div key={stake.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-border flex items-center justify-center flex-shrink-0">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isLocked ? <Lock className="w-3 h-3 text-accent" /> : <Unlock className="w-3 h-3 text-primary" />}
                        <p className="font-display text-xs text-foreground">Stake #{stake.id.slice(0, 8)}</p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                        <span>Amt: <strong className="text-foreground">{stake.amount}</strong></span>
                        <span>Earned: <strong className="text-accent">{Number(stake.rewards_earned).toFixed(4)}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className={`text-[9px] font-display ${
                        stake.status === "active" ? "border-primary/30 text-primary" :
                        stake.status === "emergency_unlocked" ? "border-destructive/30 text-destructive" :
                        "border-border text-muted-foreground"
                      }`}>{stake.status.toUpperCase().replace("_", " ")}</Badge>
                      {stake.unlock_at && (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {isLocked ? new Date(stake.unlock_at).toLocaleDateString() : "Ready"}
                        </span>
                      )}
                      {stake.status === "active" && isLocked && (
                        <Button variant="outline" size="sm" onClick={() => onEarlyUnlock(stake)} className="border-accent/30 text-accent hover:bg-accent/10 text-[9px] font-display h-6 px-2">
                          <Unlock className="w-3 h-3 mr-0.5" /> Unlock
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Main Hub ── */
const Hub = () => {
  const { user } = useAuth();
  const { isConnected, shortAddress, address } = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [stakes, setStakes] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [airdrops, setAirdrops] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gate: must have wallet connected
  useEffect(() => {
    if (!isConnected) {
      navigate("/", { replace: true });
    }
  }, [isConnected]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Max 5MB allowed.", variant: "destructive" }); return; }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
      if (updateError) throw updateError;
      setProfile((prev: any) => prev ? { ...prev, avatar_url: avatarUrl } : prev);
      toast({ title: "✅ Profile picture updated!" });
    } catch (err: any) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
    finally { setUploadingAvatar(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const saveDisplayName = async () => {
    if (!user || !editDisplayName.trim()) return;
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ display_name: editDisplayName.trim() }).eq("user_id", user.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setProfile((p: any) => p ? { ...p, display_name: editDisplayName.trim() } : p); toast({ title: "✅ Display name updated!" }); }
    setSavingName(false);
  };

  useEffect(() => {
    if (user) fetchAll();
    else setLoadingData(false);
  }, [user]);

  const fetchAll = async () => {
    setLoadingData(true);
    const [profileRes, stakesRes, poolsRes, badgesRes, userBadgesRes, airdropsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle(),
      supabase.from("stakes").select("*").eq("user_id", user!.id).order("staked_at", { ascending: false }),
      supabase.from("staking_pools").select("*"),
      supabase.from("badges").select("*"),
      supabase.from("user_badges").select("*, badges(*)").eq("user_id", user!.id),
      supabase.from("airdrops").select("*").eq("recipient_user_id", user!.id).order("created_at", { ascending: false }),
    ]);
    setProfile(profileRes.data);
    if (profileRes.data) setEditDisplayName(profileRes.data.display_name || "");
    setStakes(stakesRes.data || []);
    setPools(poolsRes.data || []);
    setBadges(badgesRes.data || []);
    setUserBadges(userBadgesRes.data || []);
    setAirdrops(airdropsRes.data || []);
    setLoadingData(false);
  };

  const claimAirdrop = async (id: string) => {
    const { error } = await supabase.from("airdrops").update({ status: "claimed", claimed_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "🎁 Airdrop claimed!" }); fetchAll(); }
  };

  const getPool = (poolId: string) => pools.find(p => p.id === poolId);

  const requestEarlyUnlock = async (stake: any) => {
    const pool = getPool(stake.pool_id);
    if (!pool) return;
    const feePct = pool.early_unlock_fee_pct || 5;
    const feeAmount = (Number(stake.amount) * feePct / 100).toFixed(4);
    if (!window.confirm(`⚠️ Early unlock fee: ${feeAmount} (${feePct}% of staked amount). Proceed?`)) return;
    const { error } = await supabase.from("early_unlock_requests").insert({
      stake_id: stake.id, user_id: user!.id, pool_id: stake.pool_id,
      fee_amount: parseFloat(feeAmount), fee_currency: "ETH",
      admin_share: parseFloat(feeAmount) * 0.5, operator_share: parseFloat(feeAmount) * 0.5,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "🔓 Early unlock requested!", description: "The admin will process your request shortly." });
  };

  const collections = useMemo(() => {
    const map = new Map<string, { pool: any; stakes: any[] }>();
    for (const stake of stakes) {
      const pool = getPool(stake.pool_id);
      const key = stake.pool_id;
      if (!map.has(key)) map.set(key, { pool: pool || { project_name: "Unknown Collection", reward_token: "ETH" }, stakes: [] });
      map.get(key)!.stakes.push(stake);
    }
    return Array.from(map.values());
  }, [stakes, pools]);

  if (!isConnected) return null;

  const activeStakes = stakes.filter(s => s.status === "active");
  const totalStaked = stakes.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalRewards = stakes.reduce((sum, s) => sum + Number(s.rewards_earned), 0);
  const pendingAirdrops = airdrops.filter(a => a.status === "pending");
  const storedName = localStorage.getItem("sf_display_name");
  const displayName = profile?.display_name || storedName || "Staker";

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* ── Nav ── */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-display text-lg text-primary tracking-widest text-glow-cyan hover:opacity-80 transition-opacity">
              STAKEFORGE
            </Link>
            <div className="hidden sm:flex items-center gap-1 ml-2">
              <Badge className="bg-primary/10 text-primary border-primary/30 font-display text-[10px] px-2 py-0.5 animate-pulse">
                <Zap className="w-3 h-3 mr-1" /> STAKING HUB
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WalletModal />
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">← Home</Button>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* ── Profile Card ── */}
        <motion.div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card to-secondary/20 p-6 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-6">
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <button
              onClick={() => user && fileInputRef.current?.click()}
              disabled={uploadingAvatar || !user}
              className="relative w-20 h-20 rounded-full border-2 border-primary/40 overflow-hidden group flex-shrink-0 shadow-xl hover:border-primary/70 transition-colors"
              title={user ? "Change profile picture" : "Sign in to change PFP"}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl font-display text-primary">
                  {displayName[0].toUpperCase()}
                </div>
              )}
              {user && (
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar ? <RefreshCw className="w-5 h-5 text-primary animate-spin" /> : <Palette className="w-5 h-5 text-primary" />}
                </div>
              )}
            </button>
            <div className="flex-1">
              <h2 className="font-display text-2xl text-foreground">{displayName}</h2>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                <Badge variant="outline" className="border-accent/30 text-accent font-display text-xs">{profile?.rank || "Bronze"}</Badge>
                <span className="text-xs text-muted-foreground font-display">Level {profile?.level || 1}</span>
                <span className="text-xs text-primary font-display">{shortAddress}</span>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="font-display text-4xl text-primary text-glow-cyan">{profile?.points || 0}</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">HONDRO POINTS</p>
            </div>
          </div>
        </motion.div>

        {/* ── Airdrop Banner ── */}
        {pendingAirdrops.length > 0 && (
          <motion.div className="rounded-lg border border-accent/30 bg-accent/10 p-4 flex items-center gap-3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Gift className="w-6 h-6 text-accent animate-bounce" />
            <div className="flex-1">
              <p className="font-display text-sm text-accent">🎁 You have {pendingAirdrops.length} unclaimed airdrop{pendingAirdrops.length > 1 ? "s" : ""}!</p>
              <p className="text-[10px] text-muted-foreground">Go to the Airdrops tab to claim your rewards</p>
            </div>
          </motion.div>
        )}

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Collections", value: collections.length, icon: Folder, color: "text-primary" },
            { label: "Active Stakes", value: activeStakes.length, icon: Zap, color: "text-accent" },
            { label: "Total Staked", value: totalStaked, icon: Layers, color: "text-primary" },
            { label: "Rewards Earned", value: totalRewards.toFixed(4), icon: TrendingUp, color: "text-accent" },
            { label: "Badges", value: userBadges.length, icon: Trophy, color: "text-primary" },
          ].map((stat) => (
            <motion.div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center hover:border-primary/30 transition-colors" whileHover={{ y: -2 }}>
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
              <p className="font-display text-xl text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="collections">
          <TabsList className="bg-card border border-border mb-4 flex-wrap h-auto gap-1 p-1.5">
            <TabsTrigger value="collections" className="font-display gap-1.5 text-xs"><Folder className="w-3.5 h-3.5" /> My NFTs</TabsTrigger>
            <TabsTrigger value="airdrops" className="font-display gap-1.5 text-xs relative">
              <Gift className="w-3.5 h-3.5" /> Airdrops
              {pendingAirdrops.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[9px] text-accent-foreground flex items-center justify-center font-display">{pendingAirdrops.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="rewards" className="font-display gap-1.5 text-xs"><Coins className="w-3.5 h-3.5" /> Rewards</TabsTrigger>
            <TabsTrigger value="badges" className="font-display gap-1.5 text-xs"><Trophy className="w-3.5 h-3.5" /> Badges</TabsTrigger>
            <TabsTrigger value="leaderboard" className="font-display gap-1.5 text-xs"><Crown className="w-3.5 h-3.5" /> Leaderboard</TabsTrigger>
            <TabsTrigger value="arcade" className="font-display gap-1.5 text-xs"><Gamepad2 className="w-3.5 h-3.5" /> Arcade</TabsTrigger>
            <TabsTrigger value="settings" className="font-display gap-1.5 text-xs"><Settings className="w-3.5 h-3.5" /> Settings</TabsTrigger>
          </TabsList>

          {/* ── My NFTs ── */}
          <TabsContent value="collections" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm text-foreground tracking-wider">MY NFTs BY COLLECTION</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Click a collection to see all your staked NFTs inside it</p>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchAll} className="text-xs"><RefreshCw className="w-3 h-3 mr-1" /> Refresh</Button>
            </div>
            {loadingData ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
            ) : collections.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="font-display text-sm text-muted-foreground">No collections yet</p>
                <p className="text-xs text-muted-foreground mt-1">Stake in a pool to see your NFTs grouped by collection here!</p>
                <Button variant="outline" size="sm" className="mt-4 font-display" onClick={() => navigate("/")}>Browse Pools</Button>
              </div>
            ) : (
              collections.map(({ pool, stakes: poolStakes }) => (
                <CollectionCard key={pool.id || pool.project_name} collectionName={pool.project_name} logo={pool.project_logo} rewardToken={pool.reward_token} stakes={poolStakes} onEarlyUnlock={requestEarlyUnlock} />
              ))
            )}
          </TabsContent>

          {/* ── Airdrops ── */}
          <TabsContent value="airdrops" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm text-foreground tracking-wider">YOUR AIRDROPS</h3>
              <Button variant="ghost" size="sm" onClick={fetchAll} className="text-xs"><RefreshCw className="w-3 h-3 mr-1" /> Refresh</Button>
            </div>
            {airdrops.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Gift className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-display text-sm text-muted-foreground">No airdrops yet</p>
                <p className="text-xs text-muted-foreground mt-1">Stake in pools to receive airdrops from projects!</p>
              </div>
            ) : (
              airdrops.map((airdrop) => (
                <motion.div key={airdrop.id} className={`rounded-xl border p-4 ${airdrop.status === "pending" ? "border-accent/30 bg-accent/5" : "border-border bg-card"}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-4">
                    {airdrop.asset_image_url ? (
                      <img src={airdrop.asset_image_url} alt={airdrop.asset_name} className="w-14 h-14 rounded-lg object-cover border-2 border-accent/20 shadow-lg" />
                    ) : (
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${airdrop.airdrop_type === "nft" ? "bg-primary/10 border-primary/20" : "bg-accent/10 border-accent/20"}`}>
                        {airdrop.airdrop_type === "nft" ? <Image className="w-6 h-6 text-primary" /> : <Coins className="w-6 h-6 text-accent" />}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-display text-sm text-foreground">{airdrop.asset_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-display ${airdrop.airdrop_type === "nft" ? "border-primary/30 text-primary" : "border-accent/30 text-accent"}`}>{airdrop.airdrop_type.toUpperCase()}</span>
                        <span className="text-[10px] text-muted-foreground">Qty: {airdrop.amount}</span>
                        <span className="text-[10px] text-muted-foreground">• {new Date(airdrop.created_at).toLocaleDateString()}</span>
                      </div>
                      {airdrop.message && <p className="text-[11px] text-muted-foreground mt-1 italic">"{airdrop.message}"</p>}
                    </div>
                    <div>
                      {airdrop.status === "pending" ? (
                        <Button size="sm" onClick={() => claimAirdrop(airdrop.id)} className="bg-accent text-accent-foreground font-display text-xs">
                          <Gift className="w-3 h-3 mr-1" /> Claim
                        </Button>
                      ) : (
                        <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-display">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> CLAIMED
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* ── Rewards ── */}
          <TabsContent value="rewards">
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <TrendingUp className="w-10 h-10 text-accent mx-auto mb-3" />
              <p className="font-display text-3xl text-accent">{totalRewards.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground font-display mt-1 tracking-wider">TOTAL REWARDS EARNED</p>
              <p className="text-[10px] text-muted-foreground mt-4 max-w-md mx-auto">
                Rewards accumulate from your staking positions. They are distributed according to each pool's APY and your staking duration.
              </p>
            </div>
          </TabsContent>

          {/* ── Badges ── */}
          <TabsContent value="badges">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {badges.map((badge) => {
                const earned = userBadges.some((ub: any) => ub.badge_id === badge.id);
                return (
                  <motion.div key={badge.id} className={`rounded-xl border p-4 text-center transition-colors ${earned ? "border-accent/30 bg-accent/5 hover:border-accent/50" : "border-border bg-card opacity-40"}`} whileHover={earned ? { scale: 1.03 } : {}}>
                    <span className="text-3xl">{badge.icon || "🏆"}</span>
                    <p className="font-display text-xs text-foreground mt-2">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{badge.description}</p>
                    {earned ? (
                      <Badge variant="outline" className="mt-2 text-[9px] border-accent/30 text-accent">EARNED</Badge>
                    ) : (
                      <Badge variant="outline" className="mt-2 text-[9px] border-border text-muted-foreground">LOCKED</Badge>
                    )}
                  </motion.div>
                );
              })}
              {badges.length === 0 && <div className="col-span-full text-center py-8 text-muted-foreground text-sm">No badges available yet. Check back soon!</div>}
            </div>
          </TabsContent>

          {/* ── Leaderboard ── */}
          <TabsContent value="leaderboard">
            <motion.div className="rounded-xl border border-primary/20 bg-card p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Trophy className="w-14 h-14 text-accent mx-auto mb-4 opacity-60" />
              <h3 className="font-display text-2xl text-foreground tracking-wider mb-2">LEADERBOARD</h3>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">
                Compete with stakers worldwide. Climb the ranks by staking more, earning badges, and accumulating Hondro Points.
              </p>
              <Badge variant="outline" className="mt-4 font-display text-xs border-accent/40 text-accent px-4 py-1.5 animate-pulse">
                🏆 COMING SOON
              </Badge>
            </motion.div>
          </TabsContent>

          {/* ── Arcade ── */}
          <TabsContent value="arcade">
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Gamepad2 className="w-14 h-14 text-accent mx-auto mb-4 opacity-60" />
              <h3 className="font-display text-xl text-foreground mb-2">ARCADE</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">Use your earned points to play games, spin the prize wheel, and win exclusive rewards!</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto mb-6">
                {[
                  { name: "Prize Wheel", icon: "🎡", status: "live" },
                  { name: "Loot Boxes", icon: "📦", status: "coming_soon" },
                  { name: "NFT Raffle", icon: "🎟️", status: "coming_soon" },
                  { name: "Prediction", icon: "🔮", status: "coming_soon" },
                  { name: "Trivia", icon: "🧠", status: "coming_soon" },
                  { name: "Battle Arena", icon: "⚔️", status: "coming_soon" },
                ].map((game) => (
                  <div key={game.name} className={`rounded-xl border p-4 text-center transition-all ${game.status === "live" ? "border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10" : "border-border bg-card/50 opacity-50"}`} onClick={() => game.status === "live" && navigate("/arcade")}>
                    <span className="text-2xl">{game.icon}</span>
                    <p className="font-display text-[10px] text-foreground mt-1">{game.name}</p>
                    {game.status === "coming_soon" && <span className="text-[8px] text-muted-foreground font-display">COMING SOON</span>}
                    {game.status === "live" && <span className="text-[8px] text-primary font-display">PLAY NOW →</span>}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="font-display text-xs" onClick={() => navigate("/arcade")}>
                <Gamepad2 className="w-3.5 h-3.5 mr-1.5" /> Go to Arcade
              </Button>
            </div>
          </TabsContent>

          {/* ── Settings ── */}
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Profile Settings */}
              <motion.div className="rounded-xl border border-border bg-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="font-display text-sm text-foreground tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> PROFILE SETTINGS
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-display mb-1 block">DISPLAY NAME</label>
                    <div className="flex gap-2">
                      <Input value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} placeholder="Your display name" className="bg-secondary border-border" maxLength={30} disabled={!user} />
                      <Button onClick={saveDisplayName} disabled={savingName || !user} size="sm" className="font-display"><Save className="w-3 h-3 mr-1" /> Save</Button>
                    </div>
                    {!user && <p className="text-[10px] text-muted-foreground mt-1">Sign in with email to edit your profile name</p>}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-display mb-1 block">PROFILE PICTURE</label>
                    <Button variant="outline" size="sm" onClick={() => user && fileInputRef.current?.click()} disabled={!user} className="font-display text-xs">
                      <Palette className="w-3 h-3 mr-1" /> {user ? "Upload New PFP" : "Sign in to upload"}
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Wallet Info */}
              <motion.div className="rounded-xl border border-border bg-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <h3 className="font-display text-sm text-foreground tracking-wider mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" /> WALLET
                </h3>
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="text-[10px] text-muted-foreground font-display mb-1">CONNECTED ADDRESS</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-primary break-all flex-1">{address}</code>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => { navigator.clipboard.writeText(address || ""); toast({ title: "Copied!" }); }}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  Your wallet is stored on your profile so project owners can verify your identity. You can disconnect anytime from the wallet menu.
                </p>
              </motion.div>

              {/* Account Info */}
              <motion.div className="rounded-xl border border-border bg-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <h3 className="font-display text-sm text-foreground tracking-wider mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> ACCOUNT
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="text-[10px] text-muted-foreground font-display">RANK</p>
                    <p className="font-display text-foreground">{profile?.rank || "Bronze"}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="text-[10px] text-muted-foreground font-display">LEVEL</p>
                    <p className="font-display text-foreground">{profile?.level || 1}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="text-[10px] text-muted-foreground font-display">HONDRO POINTS</p>
                    <p className="font-display text-primary">{profile?.points || 0}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="text-[10px] text-muted-foreground font-display">REFERRAL CODE</p>
                    <p className="font-display text-accent text-sm">{profile?.referral_code || "—"}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Hub;
