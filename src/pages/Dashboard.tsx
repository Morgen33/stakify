import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layers, TrendingUp, Trophy, Coins, Gift, HelpCircle,
  Clock, Unlock, Lock, RefreshCw, ExternalLink, Zap, Image, CheckCircle2, Gamepad2, AlertTriangle, DollarSign, ArrowLeftRight, Sparkles,
  User, Palette, Star, Crown, Shield, Wand2, ChevronDown, ChevronRight, Hash, Folder
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WalletModal from "@/components/WalletModal";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

/* ── Collection Card ── */
const CollectionCard = ({
  collectionName,
  logo,
  rewardToken,
  stakes,
  onEarlyUnlock,
}: {
  collectionName: string;
  logo?: string | null;
  rewardToken: string;
  stakes: any[];
  onEarlyUnlock: (stake: any) => void;
}) => {
  const [open, setOpen] = useState(false);
  const totalStaked = stakes.reduce((s, st) => s + Number(st.amount), 0);
  const totalRewards = stakes.reduce((s, st) => s + Number(st.rewards_earned), 0);
  const activeCount = stakes.filter(s => s.status === "active").length;

  return (
    <motion.div
      className="rounded-xl border border-border bg-card overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Collection Header — click to expand */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors text-left"
      >
        {/* Logo */}
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

      {/* Expanded NFT list */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border bg-secondary/10 divide-y divide-border/50">
              {stakes.map((stake) => {
                const isLocked = stake.unlock_at && new Date(stake.unlock_at) > new Date();
                return (
                  <div key={stake.id} className="flex items-center gap-4 px-5 py-3">
                    {/* NFT thumbnail placeholder */}
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
                      }`}>
                        {stake.status.toUpperCase().replace("_", " ")}
                      </Badge>
                      {stake.unlock_at && (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {isLocked
                            ? new Date(stake.unlock_at).toLocaleDateString()
                            : "Ready"}
                        </span>
                      )}
                      {stake.status === "active" && isLocked && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEarlyUnlock(stake)}
                          className="border-accent/30 text-accent hover:bg-accent/10 text-[9px] font-display h-6 px-2"
                        >
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

/* ── Main Dashboard ── */
const Dashboard = () => {
  const { user, loading } = useAuth();
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

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (user) fetchAll();
  }, [user, loading]);

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
      stake_id: stake.id,
      user_id: user!.id,
      pool_id: stake.pool_id,
      fee_amount: parseFloat(feeAmount),
      fee_currency: "ETH",
      admin_share: parseFloat(feeAmount) * 0.5,
      operator_share: parseFloat(feeAmount) * 0.5,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "🔓 Early unlock requested!", description: "The admin will process your request shortly." });
  };

  /* Group stakes by collection (pool) */
  const collections = useMemo(() => {
    const map = new Map<string, { pool: any; stakes: any[] }>();
    for (const stake of stakes) {
      const pool = getPool(stake.pool_id);
      const key = stake.pool_id;
      if (!map.has(key)) {
        map.set(key, { pool: pool || { project_name: "Unknown Collection", reward_token: "ETH" }, stakes: [] });
      }
      map.get(key)!.stakes.push(stake);
    }
    return Array.from(map.values());
  }, [stakes, pools]);

  if (loading) return null;

  const activeStakes = stakes.filter(s => s.status === "active");
  const totalStaked = stakes.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalRewards = stakes.reduce((sum, s) => sum + Number(s.rewards_earned), 0);
  const pendingAirdrops = airdrops.filter(a => a.status === "pending");

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* ── Nav ── */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl text-primary tracking-widest text-glow-cyan">MY DASHBOARD</h2>
          </div>
          <div className="flex items-center gap-3">
            <WalletModal />
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">← Home</Button>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* ── Profile Card ── */}
        <motion.div className="rounded-xl border border-border bg-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex items-center justify-center text-2xl font-display text-primary shadow-lg">
              {(profile?.display_name || "?")[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl text-foreground">{profile?.display_name || "Staker"}</h2>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <Badge variant="outline" className="border-accent/30 text-accent font-display text-xs">{profile?.rank || "Bronze"}</Badge>
                <span className="text-xs text-muted-foreground font-display">Level {profile?.level || 1}</span>
                {isConnected && <span className="text-xs text-primary font-display">{shortAddress}</span>}
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="font-display text-3xl text-primary">{profile?.points || 0}</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">TOTAL POINTS</p>
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
            <motion.div
              key={stat.label}
              className="rounded-lg border border-border bg-card p-4 text-center hover:border-primary/30 transition-colors"
              whileHover={{ y: -2 }}
            >
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
            <TabsTrigger value="arcade" className="font-display gap-1.5 text-xs"><Gamepad2 className="w-3.5 h-3.5" /> Arcade</TabsTrigger>
            <TabsTrigger value="swap" className="font-display gap-1.5 text-xs relative"><ArrowLeftRight className="w-3.5 h-3.5" /> Swap <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent/20 text-accent text-[8px] font-display">SOON</span></TabsTrigger>
            <TabsTrigger value="profile" className="font-display gap-1.5 text-xs relative"><User className="w-3.5 h-3.5" /> My Profile <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-display">SOON</span></TabsTrigger>
          </TabsList>

          {/* ── My NFTs by Collection ── */}
          <TabsContent value="collections" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm text-foreground tracking-wider">MY NFTs BY COLLECTION</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Click a collection to see all your staked NFTs inside it</p>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchAll} className="text-xs">
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>
            </div>

            {collections.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="font-display text-sm text-muted-foreground">No collections yet</p>
                <p className="text-xs text-muted-foreground mt-1">Stake in a pool to see your NFTs grouped by collection here!</p>
                <Button variant="outline" size="sm" className="mt-4 font-display" onClick={() => navigate("/")}>Browse Pools</Button>
              </div>
            ) : (
              collections.map(({ pool, stakes: poolStakes }) => (
                <CollectionCard
                  key={pool.id || pool.project_name}
                  collectionName={pool.project_name}
                  logo={pool.project_logo}
                  rewardToken={pool.reward_token}
                  stakes={poolStakes}
                  onEarlyUnlock={requestEarlyUnlock}
                />
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
                <motion.div
                  key={airdrop.id}
                  className={`rounded-xl border p-4 ${airdrop.status === "pending" ? "border-accent/30 bg-accent/5" : "border-border bg-card"}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-4">
                    {airdrop.asset_image_url ? (
                      <img src={airdrop.asset_image_url} alt={airdrop.asset_name} className="w-14 h-14 rounded-lg object-cover border-2 border-accent/20 shadow-lg" />
                    ) : (
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${
                        airdrop.airdrop_type === "nft" ? "bg-primary/10 border-primary/20" :
                        airdrop.airdrop_type === "token" ? "bg-accent/10 border-accent/20" :
                        "bg-primary/10 border-primary/20"
                      }`}>
                        {airdrop.airdrop_type === "nft" ? <Image className="w-6 h-6 text-primary" /> :
                         airdrop.airdrop_type === "token" ? <Coins className="w-6 h-6 text-accent" /> :
                         <Gift className="w-6 h-6 text-primary" />}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-display text-sm text-foreground">{airdrop.asset_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-display ${
                          airdrop.airdrop_type === "nft" ? "border-primary/30 text-primary" :
                          "border-accent/30 text-accent"
                        }`}>{airdrop.airdrop_type.toUpperCase()}</span>
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
                A platform fee is deducted before distribution.
              </p>
            </div>
          </TabsContent>

          {/* ── Badges ── */}
          <TabsContent value="badges">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {badges.map((badge) => {
                const earned = userBadges.some((ub: any) => ub.badge_id === badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    className={`rounded-xl border p-4 text-center transition-colors ${
                      earned ? "border-accent/30 bg-accent/5 hover:border-accent/50" : "border-border bg-card opacity-40"
                    }`}
                    whileHover={earned ? { scale: 1.03 } : {}}
                  >
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
              {badges.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground text-sm">No badges available yet. Check back soon!</div>
              )}
            </div>
          </TabsContent>

          {/* ── Arcade ── */}
          <TabsContent value="arcade">
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Gamepad2 className="w-14 h-14 text-accent mx-auto mb-4 opacity-60" />
              <h3 className="font-display text-xl text-foreground mb-2">ARCADE</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                Use your earned points to play games, spin the prize wheel, and win exclusive rewards!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto mb-6">
                {[
                  { name: "Prize Wheel", icon: "🎡", status: "live" },
                  { name: "Loot Boxes", icon: "📦", status: "coming_soon" },
                  { name: "NFT Raffle", icon: "🎟️", status: "coming_soon" },
                  { name: "Prediction", icon: "🔮", status: "coming_soon" },
                  { name: "Trivia", icon: "🧠", status: "coming_soon" },
                  { name: "Battle Arena", icon: "⚔️", status: "coming_soon" },
                ].map((game) => (
                  <div
                    key={game.name}
                    className={`rounded-xl border p-4 text-center transition-all ${
                      game.status === "live" ? "border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 hover:border-primary/50" : "border-border bg-card/50 opacity-50"
                    }`}
                    onClick={() => game.status === "live" && navigate("/arcade")}
                  >
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

          {/* ── Swap (Coming Soon) ── */}
          <TabsContent value="swap">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowLeftRight className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-foreground tracking-wider flex items-center justify-center gap-2">
                  TOKEN SWAP <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                </h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm leading-relaxed">
                  A brand new, intuitive way to swap tokens — right from your dashboard. 
                  Trade across chains with lightning speed and ultra-low fees.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                {[
                  { icon: Zap, title: "Instant Swaps", sub: "Cross-chain routing" },
                  { icon: DollarSign, title: "Micro Fees", sub: "Fractions of a penny" },
                  { icon: TrendingUp, title: "Best Rates", sub: "DEX aggregation" },
                ].map((f) => (
                  <div key={f.title} className="rounded-xl border border-border bg-secondary/30 p-4">
                    <f.icon className="w-5 h-5 text-accent mx-auto mb-1" />
                    <p className="font-display text-xs text-foreground">{f.title}</p>
                    <p className="text-[10px] text-muted-foreground">{f.sub}</p>
                  </div>
                ))}
              </div>
              <Badge variant="outline" className="font-display text-xs border-accent/40 text-accent px-4 py-1.5 animate-pulse">
                🚀 COMING SOON — Something big is brewing
              </Badge>
            </motion.div>
          </TabsContent>

          {/* ── Custom Profile (Coming Soon) ── */}
          <TabsContent value="profile">
            <motion.div
              className="rounded-xl border border-primary/20 bg-card p-8 text-center relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="absolute inset-0 pointer-events-none select-none">
                <div className="blur-[6px] opacity-30 p-8 space-y-6">
                  <div className="flex items-center gap-6 justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border-4 border-primary/20" />
                    <div className="space-y-2 text-left">
                      <div className="h-6 w-40 rounded bg-foreground/20" />
                      <div className="h-4 w-56 rounded bg-foreground/10" />
                      <div className="flex gap-2">
                        <div className="h-6 w-16 rounded-full bg-primary/30" />
                        <div className="h-6 w-16 rounded-full bg-accent/30" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-border" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative z-10 py-12 space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto">
                  <Palette className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-2xl text-foreground tracking-wider">CUSTOM PROFILES</h3>
                <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
                  Express yourself with custom PFPs, animated frames, profile themes, and exclusive collectible badges.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                  {[
                    { icon: User, label: "Custom PFPs" },
                    { icon: Sparkles, label: "Animations" },
                    { icon: Crown, label: "Rare Badges" },
                    { icon: Wand2, label: "Profile Themes" },
                  ].map((f) => (
                    <div key={f.label} className="rounded-xl border border-border bg-secondary/30 p-3">
                      <f.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="font-display text-[10px] text-foreground">{f.label}</p>
                    </div>
                  ))}
                </div>
                <Badge variant="outline" className="font-display text-xs border-primary/40 text-primary px-4 py-1.5 animate-pulse">
                  ✨ COMING SOON — Custom Profiles
                </Badge>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
