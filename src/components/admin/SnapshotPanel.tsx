import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Camera, Download, Gift, Send, Users, Copy, CheckCircle2, Coins, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SnapshotEntry {
  user_id: string;
  display_name: string;
  amount: number;
  staked_at: string;
  status: string;
}

interface SnapshotPanelProps {
  pools: any[];
  stakes: any[];
  profiles: any[];
  projects: any[];
  onRefresh: () => void;
}

const SnapshotPanel = ({ pools, stakes, profiles, projects, onRefresh }: SnapshotPanelProps) => {
  const { toast } = useToast();
  const [snapshot, setSnapshot] = useState<SnapshotEntry[]>([]);
  const [snapshotPool, setSnapshotPool] = useState<string>("");
  const [snapshotTime, setSnapshotTime] = useState<string>("");
  const [bulkAirdrop, setBulkAirdrop] = useState({ asset_name: "", amount: "1", airdrop_type: "token", message: "", project_account_id: "" });

  const takeSnapshot = (poolId: string) => {
    const poolStakes = stakes.filter(s => s.pool_id === poolId && s.status === "active");
    const entries: SnapshotEntry[] = poolStakes.map(s => {
      const prof = profiles.find(p => p.user_id === s.user_id);
      return {
        user_id: s.user_id,
        display_name: prof?.display_name || "Unknown",
        amount: s.amount,
        staked_at: s.staked_at,
        status: s.status,
      };
    });
    setSnapshot(entries);
    setSnapshotPool(poolId);
    setSnapshotTime(new Date().toLocaleString());
    toast({ title: `📸 Snapshot taken — ${entries.length} stakers captured` });
  };

  const downloadSnapshot = () => {
    const pool = pools.find(p => p.id === snapshotPool);
    const csv = [
      "User ID,Display Name,Amount Staked,Staked At,Status",
      ...snapshot.map(e => `${e.user_id},${e.display_name},${e.amount},${e.staked_at},${e.status}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snapshot_${pool?.project_name || "pool"}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAllWallets = () => {
    const ids = snapshot.map(e => e.user_id).join("\n");
    navigator.clipboard.writeText(ids);
    toast({ title: "📋 All user IDs copied to clipboard" });
  };

  const totalStaked = snapshot.reduce((sum, e) => sum + Number(e.amount), 0);
  const pool = pools.find(p => p.id === snapshotPool);

  const bulkRewardAll = async () => {
    if (!bulkAirdrop.asset_name || snapshot.length === 0) {
      toast({ title: "Missing data", description: "Take a snapshot first and enter asset details.", variant: "destructive" });
      return;
    }
    const projectId = bulkAirdrop.project_account_id || projects[0]?.id;
    if (!projectId) {
      toast({ title: "No project", description: "Create a project first.", variant: "destructive" });
      return;
    }
    
    const inserts = snapshot.map(e => ({
      recipient_user_id: e.user_id,
      airdrop_type: bulkAirdrop.airdrop_type,
      asset_name: bulkAirdrop.asset_name,
      amount: parseFloat(bulkAirdrop.amount) || 1,
      message: bulkAirdrop.message || null,
      project_account_id: projectId,
      status: "pending" as const,
    }));

    const { error } = await supabase.from("airdrops").insert(inserts);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `🎁 Airdrop sent to ${snapshot.length} stakers!` });
      setBulkAirdrop({ asset_name: "", amount: "1", airdrop_type: "token", message: "", project_account_id: "" });
      onRefresh();
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Take Snapshot */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
        <h3 className="font-display text-sm text-primary mb-2 tracking-wider flex items-center gap-2">
          <Camera className="w-4 h-4" /> STAKER SNAPSHOT
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Select a pool to capture all active stakers. Use the snapshot to bulk-airdrop rewards or export data.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pools.filter(p => p.status === "active").map(p => {
            const count = stakes.filter(s => s.pool_id === p.id && s.status === "active").length;
            const isSelected = snapshotPool === p.id;
            return (
              <Button
                key={p.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => takeSnapshot(p.id)}
                className={`justify-between text-xs font-display ${isSelected ? "bg-primary text-primary-foreground" : "border-primary/20 hover:bg-primary/10"}`}
              >
                <div className="flex items-center gap-2">
                  {isSelected ? <CheckCircle2 className="w-3 h-3" /> : <Camera className="w-3 h-3 text-primary" />}
                  <span>{p.project_name}</span>
                </div>
                <span className={isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}>{count} stakers</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Snapshot Results */}
      <AnimatePresence>
        {snapshot.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            {/* Header with stats */}
            <div className="bg-secondary/50 border-b border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-sm text-foreground tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" /> SNAPSHOT: {pool?.project_name || "Pool"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1">Taken at {snapshotTime}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyAllWallets} className="text-xs font-display gap-1.5">
                    <Copy className="w-3 h-3" /> Copy IDs
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadSnapshot} className="text-xs font-display gap-1.5">
                    <Download className="w-3 h-3" /> Export CSV
                  </Button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md bg-card border border-border p-3 text-center">
                  <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="font-display text-lg text-foreground">{snapshot.length}</p>
                  <p className="text-[10px] text-muted-foreground font-display">STAKERS</p>
                </div>
                <div className="rounded-md bg-card border border-border p-3 text-center">
                  <Coins className="w-4 h-4 mx-auto mb-1 text-accent" />
                  <p className="font-display text-lg text-foreground">{totalStaked.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-display">TOTAL STAKED</p>
                </div>
                <div className="rounded-md bg-card border border-border p-3 text-center">
                  <Hash className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="font-display text-lg text-foreground">{pool?.reward_token || "—"}</p>
                  <p className="text-[10px] text-muted-foreground font-display">TOKEN</p>
                </div>
              </div>
            </div>

            {/* Staker list */}
            <div className="p-5">
              <div className="max-h-[350px] overflow-y-auto space-y-1.5 pr-1">
                {snapshot.map((entry, i) => (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-transparent hover:border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-display text-primary">
                        {(entry.display_name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-display text-xs text-foreground">{entry.display_name}</span>
                        <p className="text-[10px] text-muted-foreground font-mono">{entry.user_id.slice(0, 16)}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-xs text-primary">{entry.amount} staked</span>
                      <p className="text-[10px] text-muted-foreground">{new Date(entry.staked_at).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bulk Reward */}
            <div className="border-t border-border p-5 bg-accent/5">
              <h4 className="font-display text-xs text-accent mb-3 tracking-wider flex items-center gap-2">
                <Gift className="w-3.5 h-3.5" /> BULK REWARD ALL {snapshot.length} STAKERS
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">ASSET NAME</label>
                  <Input
                    placeholder="e.g. 100 $FORGE"
                    value={bulkAirdrop.asset_name}
                    onChange={e => setBulkAirdrop({ ...bulkAirdrop, asset_name: e.target.value })}
                    className="bg-secondary border-border text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">AMOUNT PER USER</label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={bulkAirdrop.amount}
                    onChange={e => setBulkAirdrop({ ...bulkAirdrop, amount: e.target.value })}
                    className="bg-secondary border-border text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">PROJECT</label>
                  <select
                    value={bulkAirdrop.project_account_id}
                    onChange={e => setBulkAirdrop({ ...bulkAirdrop, project_account_id: e.target.value })}
                    className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground mt-1"
                  >
                    <option value="">Select project...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.project_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">TYPE</label>
                  <select
                    value={bulkAirdrop.airdrop_type}
                    onChange={e => setBulkAirdrop({ ...bulkAirdrop, airdrop_type: e.target.value })}
                    className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground mt-1"
                  >
                    <option value="token">Token</option>
                    <option value="nft">NFT</option>
                    <option value="reward">Reward</option>
                    <option value="solana">Solana</option>
                    <option value="usdc">USDC</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display">MESSAGE (OPTIONAL)</label>
                  <Input
                    placeholder="Thanks for staking!"
                    value={bulkAirdrop.message}
                    onChange={e => setBulkAirdrop({ ...bulkAirdrop, message: e.target.value })}
                    className="bg-secondary border-border text-sm mt-1"
                  />
                </div>
              </div>
              <Button onClick={bulkRewardAll} className="bg-accent text-accent-foreground font-display text-xs gap-1.5">
                <Send className="w-3.5 h-3.5" /> Airdrop to All {snapshot.length} Stakers
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SnapshotPanel;
