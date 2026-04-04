import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Plus, Trash2, Settings, Users, Layers, Award } from "lucide-react";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pools, setPools] = useState<any[]>([]);
  const [stakes, setStakes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  // New pool form
  const [newPool, setNewPool] = useState({
    project_name: "",
    apy: "45",
    lock_period_days: "30",
    reward_token: "",
    platform_fee_pct: "2.5",
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAll();
    }
  }, [isAdmin]);

  const fetchAll = async () => {
    const [poolsRes, stakesRes, profilesRes, settingsRes, badgesRes] = await Promise.all([
      supabase.from("staking_pools").select("*").order("created_at", { ascending: false }),
      supabase.from("stakes").select("*, profiles(display_name)").order("staked_at", { ascending: false }),
      supabase.from("profiles").select("*").order("points", { ascending: false }),
      supabase.from("platform_settings").select("*"),
      supabase.from("badges").select("*"),
    ]);
    setPools(poolsRes.data || []);
    setStakes(stakesRes.data || []);
    setProfiles(profilesRes.data || []);
    setSettings(settingsRes.data || []);
    setBadges(badgesRes.data || []);
  };

  const createPool = async () => {
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
      toast({ title: "Pool created!" });
      setNewPool({ project_name: "", apy: "45", lock_period_days: "30", reward_token: "", platform_fee_pct: "2.5" });
      fetchAll();
    }
  };

  const deletePool = async (id: string) => {
    await supabase.from("staking_pools").delete().eq("id", id);
    fetchAll();
  };

  const updateSetting = async (id: string, value: string) => {
    await supabase.from("platform_settings").update({ value }).eq("id", id);
    fetchAll();
  };

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-neon-green" />
            <h2 className="font-display text-xl text-primary tracking-widest text-glow-cyan">
              ADMIN PANEL
            </h2>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="font-display text-sm">
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="container max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="pools">
          <TabsList className="bg-card border border-border mb-6">
            <TabsTrigger value="pools" className="font-display gap-2">
              <Layers className="w-4 h-4" /> Pools
            </TabsTrigger>
            <TabsTrigger value="users" className="font-display gap-2">
              <Users className="w-4 h-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="stakes" className="font-display gap-2">
              <Award className="w-4 h-4" /> Stakes
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-display gap-2">
              <Settings className="w-4 h-4" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* Pools Tab */}
          <TabsContent value="pools" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> Create New Pool
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Project Name" value={newPool.project_name} onChange={(e) => setNewPool({ ...newPool, project_name: e.target.value })} className="bg-secondary border-border" />
                <Input placeholder="Reward Token (e.g. $APE)" value={newPool.reward_token} onChange={(e) => setNewPool({ ...newPool, reward_token: e.target.value })} className="bg-secondary border-border" />
                <Input type="number" placeholder="APY %" value={newPool.apy} onChange={(e) => setNewPool({ ...newPool, apy: e.target.value })} className="bg-secondary border-border" />
                <Input type="number" placeholder="Lock Period (days)" value={newPool.lock_period_days} onChange={(e) => setNewPool({ ...newPool, lock_period_days: e.target.value })} className="bg-secondary border-border" />
                <Input type="number" placeholder="Platform Fee %" value={newPool.platform_fee_pct} onChange={(e) => setNewPool({ ...newPool, platform_fee_pct: e.target.value })} className="bg-secondary border-border" />
                <Button onClick={createPool} className="bg-primary text-primary-foreground font-display box-glow-cyan">
                  Create Pool
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-lg text-foreground mb-4">Active Pools ({pools.length})</h3>
              <div className="space-y-3">
                {pools.map((pool) => (
                  <div key={pool.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                    <div>
                      <span className="font-display text-foreground">{pool.project_name}</span>
                      <span className="text-sm text-muted-foreground ml-3">APY: {pool.apy}% | Fee: {pool.platform_fee_pct}% | {pool.status}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deletePool(pool.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {pools.length === 0 && <p className="text-muted-foreground text-sm">No pools yet.</p>}
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-lg text-foreground mb-4">Users ({profiles.length})</h3>
              <div className="space-y-2">
                {profiles.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                    <div>
                      <span className="font-display text-foreground">{p.display_name || "Unnamed"}</span>
                      <span className="text-sm text-muted-foreground ml-3">Level {p.level} | {p.points} pts | {p.rank}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Stakes Tab */}
          <TabsContent value="stakes">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-lg text-foreground mb-4">All Stakes ({stakes.length})</h3>
              <div className="space-y-2">
                {stakes.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                    <div>
                      <span className="font-display text-foreground">Amount: {s.amount}</span>
                      <span className="text-sm text-muted-foreground ml-3">Rewards: {s.rewards_earned} | {s.status}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(s.staked_at).toLocaleDateString()}</span>
                  </div>
                ))}
                {stakes.length === 0 && <p className="text-muted-foreground text-sm">No stakes yet.</p>}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-lg text-foreground mb-4">Platform Settings</h3>
              <div className="space-y-3">
                {settings.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-md bg-secondary/50">
                    <span className="font-display text-foreground min-w-[200px]">{s.key}</span>
                    <Input
                      defaultValue={s.value}
                      onBlur={(e) => updateSetting(s.id, e.target.value)}
                      className="bg-background border-border max-w-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 mt-6">
              <h3 className="font-display text-lg text-foreground mb-4">Badges ({badges.length})</h3>
              <div className="space-y-2">
                {badges.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-md bg-secondary/50">
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <span className="font-display text-foreground">{b.name}</span>
                      <p className="text-sm text-muted-foreground">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
