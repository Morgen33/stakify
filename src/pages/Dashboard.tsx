import { useEffect, useState } from "react";
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
  User, Palette, Star, Crown, Shield, Wand2
} from "lucide-react";
import { motion } from "framer-motion";
import WalletModal from "@/components/WalletModal";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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

  const requestEarlyUnlock = async (stake: any) => {
    const pool = getPool(stake.pool_id);
    if (!pool) return;
    const feePct = pool.early_unlock_fee_pct || 5;
    const feeAmount = (Number(stake.amount) * feePct / 100).toFixed(4);
    if (!window.confirm(`⚠️ Early unlock fee: ${feeAmount} (${feePct}% of staked amount) will be charged. This goes to the platform admin and operator. Proceed?`)) return;
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

  const getPool = (poolId: string) => pools.find(p => p.id === poolId);

  if (loading) return null;

  const activeStakes = stakes.filter(s => s.status === "active");
  const totalStaked = stakes.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalRewards = stakes.reduce((sum, s) => sum + Number(s.rewards_earned), 0);
  const pendingAirdrops = airdrops.filter(a => a.status === "pending");

  return (
    <div className="min-h-screen bg-background bg-grid">
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl text-primary tracking-widest text-glow-cyan">
              MY DASHBOARD
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

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <motion.div
          className="rounded-xl border border-border bg-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl font-display text-primary">
              {(profile?.display_name || "?")[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl text-foreground">{profile?.display_name || "Staker"}</h2>
              <div className="flex items-center gap-4 mt-1">
                <Badge variant="outline" className="border-accent/30 text-accent font-display text-xs">
                  {profile?.rank || "Bronze"}
                </Badge>
                <span className="text-xs text-muted-foreground font-display">Level {profile?.level || 1}</span>
                {isConnected && (
                  <span className="text-xs text-primary font-display">{shortAddress}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl text-primary">{profile?.points || 0}</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">TOTAL POINTS</p>
            </div>
          </div>
        </motion.div>

        {/* Airdrop Alert Banner */}
        {pendingAirdrops.length > 0 && (
          <motion.div
            className="rounded-lg border border-accent/30 bg-accent/10 p-4 flex items-center gap-3 cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Gift className="w-6 h-6 text-accent animate-bounce" />
            <div className="flex-1">
              <p className="font-display text-sm text-accent">🎁 You have {pendingAirdrops.length} unclaimed airdrop{pendingAirdrops.length > 1 ? "s" : ""}!</p>
              <p className="text-[10px] text-muted-foreground">Go to the Airdrops tab to claim your rewards</p>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Active Stakes", value: activeStakes.length, icon: Zap, color: "text-primary" },
            { label: "Total Staked", value: totalStaked, icon: Layers, color: "text-accent" },
            { label: "Rewards Earned", value: totalRewards.toFixed(4), icon: TrendingUp, color: "text-neon-green" },
            { label: "Badges", value: userBadges.length, icon: Trophy, color: "text-neon-gold" },
            { label: "Airdrops", value: pendingAirdrops.length, icon: Gift, color: pendingAirdrops.length > 0 ? "text-accent" : "text-muted-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
              <p className="font-display text-xl text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-display tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="stakes">
          <TabsList className="bg-card border border-border mb-4">
            <TabsTrigger value="stakes" className="font-display gap-1.5 text-xs"><Layers className="w-3.5 h-3.5" /> My Stakes</TabsTrigger>
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

          {/* Stakes */}
          <TabsContent value="stakes" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm text-foreground tracking-wider">YOUR STAKING POSITIONS</h3>
              <Button variant="ghost" size="sm" onClick={fetchAll} className="text-xs">
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>
            </div>
            {stakes.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-display text-sm text-muted-foreground">No stakes yet</p>
                <p className="text-xs text-muted-foreground mt-1">Head to the dashboard to stake in a pool!</p>
                <Button variant="outline" size="sm" className="mt-4 font-display" onClick={() => navigate("/")}>
                  Browse Pools
                </Button>
              </div>
            ) : (
              stakes.map((stake) => {
                const pool = getPool(stake.pool_id);
                const isLocked = stake.unlock_at && new Date(stake.unlock_at) > new Date();
                return (
                  <motion.div
                    key={stake.id}
                    className={`rounded-lg border p-4 ${
                      stake.status === "active"
                        ? "border-primary/30 bg-primary/5"
                        : stake.status === "emergency_unlocked"
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-border bg-card"
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isLocked ? <Lock className="w-4 h-4 text-accent" /> : <Unlock className="w-4 h-4 text-primary" />}
                        <div>
                          <p className="font-display text-sm text-foreground">{pool?.project_name || "Unknown Pool"}</p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                            <span>Amount: <strong className="text-foreground">{stake.amount}</strong></span>
                            <span>Rewards: <strong className="text-neon-green">{Number(stake.rewards_earned).toFixed(4)}</strong></span>
                            {pool && <span>Token: <strong className="text-accent">{pool.reward_token}</strong></span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <Badge variant="outline" className={`text-[10px] font-display ${
                          stake.status === "active" ? "border-primary/30 text-primary" :
                          stake.status === "emergency_unlocked" ? "border-destructive/30 text-destructive" :
                          "border-border text-muted-foreground"
                        }`}>
                          {stake.status.toUpperCase().replace("_", " ")}
                        </Badge>
                        {stake.unlock_at && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {isLocked
                              ? `Unlocks ${new Date(stake.unlock_at).toLocaleDateString()}`
                              : "Unlocked"
                            }
                          </p>
                        )}
                        {stake.status === "active" && isLocked && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => requestEarlyUnlock(stake)}
                            className="border-accent/30 text-accent hover:bg-accent/10 text-[10px] font-display h-6 px-2 mt-1"
                          >
                            <Unlock className="w-3 h-3 mr-1" /> Early Unlock
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          {/* Airdrops */}
          <TabsContent value="airdrops" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm text-foreground tracking-wider">YOUR AIRDROPS</h3>
              <Button variant="ghost" size="sm" onClick={fetchAll} className="text-xs">
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>
            </div>
            {airdrops.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <Gift className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-display text-sm text-muted-foreground">No airdrops yet</p>
                <p className="text-xs text-muted-foreground mt-1">Stake in pools to receive airdrops from projects!</p>
              </div>
            ) : (
              airdrops.map((airdrop) => (
                <motion.div
                  key={airdrop.id}
                  className={`rounded-lg border p-4 ${
                    airdrop.status === "pending"
                      ? "border-accent/30 bg-accent/5"
                      : "border-border bg-card"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-4">
                    {/* Airdrop visual */}
                    {airdrop.asset_image_url ? (
                      <img src={airdrop.asset_image_url} alt={airdrop.asset_name} className="w-14 h-14 rounded-lg object-cover border-2 border-accent/20 shadow-lg" />
                    ) : (
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${
                        airdrop.airdrop_type === "nft" ? "bg-purple-500/10 border-purple-500/20" :
                        airdrop.airdrop_type === "token" ? "bg-primary/10 border-primary/20" :
                        "bg-accent/10 border-accent/20"
                      }`}>
                        {airdrop.airdrop_type === "nft" ? (
                          <Image className="w-6 h-6 text-purple-400" />
                        ) : airdrop.airdrop_type === "token" ? (
                          <Coins className="w-6 h-6 text-primary" />
                        ) : (
                          <Gift className="w-6 h-6 text-accent" />
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-display text-sm text-foreground">{airdrop.asset_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-display ${
                          airdrop.airdrop_type === "nft" ? "border-purple-500/30 text-purple-400" :
                          airdrop.airdrop_type === "token" ? "border-primary/30 text-primary" :
                          "border-accent/30 text-accent"
                        }`}>{airdrop.airdrop_type.toUpperCase()}</span>
                        <span className="text-[10px] text-muted-foreground">Qty: {airdrop.amount}</span>
                        <span className="text-[10px] text-muted-foreground">• {new Date(airdrop.created_at).toLocaleDateString()}</span>
                      </div>
                      {airdrop.message && (
                        <p className="text-[11px] text-muted-foreground mt-1 italic">"{airdrop.message}"</p>
                      )}
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

          {/* Rewards */}
          <TabsContent value="rewards">
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <TrendingUp className="w-10 h-10 text-neon-green mx-auto mb-3" />
              <p className="font-display text-3xl text-neon-green">{totalRewards.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground font-display mt-1 tracking-wider">TOTAL REWARDS EARNED</p>
              <p className="text-[10px] text-muted-foreground mt-4 max-w-md mx-auto">
                Rewards accumulate from your staking positions. They are distributed according to each pool's APY and your staking duration.
                A platform fee is deducted before distribution.
              </p>
            </div>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {badges.map((badge) => {
                const earned = userBadges.some((ub: any) => ub.badge_id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-lg border p-4 text-center ${
                      earned ? "border-accent/30 bg-accent/5" : "border-border bg-card opacity-40"
                    }`}
                  >
                    <span className="text-3xl">{badge.icon || "🏆"}</span>
                    <p className="font-display text-xs text-foreground mt-2">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{badge.description}</p>
                    {earned ? (
                      <Badge variant="outline" className="mt-2 text-[9px] border-accent/30 text-accent">EARNED</Badge>
                    ) : (
                      <Badge variant="outline" className="mt-2 text-[9px] border-border text-muted-foreground">LOCKED</Badge>
                    )}
                  </div>
                );
              })}
              {badges.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                  No badges available yet. Check back soon!
                </div>
              )}
            </div>
          </TabsContent>

          {/* Arcade */}
          <TabsContent value="arcade">
            <div className="rounded-lg border border-border bg-card p-8 text-center">
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
                    className={`rounded-lg border p-4 text-center ${
                      game.status === "live" ? "border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10" : "border-border bg-card/50 opacity-50"
                    }`}
                    onClick={() => game.status === "live" && navigate("/arcade")}
                  >
                    <span className="text-2xl">{game.icon}</span>
                    <p className="font-display text-[10px] text-foreground mt-1">{game.name}</p>
                    {game.status === "coming_soon" && (
                      <span className="text-[8px] text-muted-foreground font-display">COMING SOON</span>
                    )}
                    {game.status === "live" && (
                      <span className="text-[8px] text-primary font-display">PLAY NOW →</span>
                    )}
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
                  Trade across chains with lightning speed and ultra-low fees that are barely noticeable.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <Zap className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="font-display text-xs text-foreground">Instant Swaps</p>
                  <p className="text-[10px] text-muted-foreground">Cross-chain routing</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="font-display text-xs text-foreground">Micro Fees</p>
                  <p className="text-[10px] text-muted-foreground">Fractions of a penny</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="font-display text-xs text-foreground">Best Rates</p>
                  <p className="text-[10px] text-muted-foreground">DEX aggregation</p>
                </div>
              </div>
              <Badge variant="outline" className="font-display text-xs border-accent/40 text-accent px-4 py-1.5 animate-pulse">
                🚀 COMING SOON — Something big is brewing
              </Badge>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
