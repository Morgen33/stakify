import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Camera, Download, Gift, Send, Users, Copy } from "lucide-react";
import { motion } from "framer-motion";

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
        <h3 className="font-display text-sm text-primary mb-4 tracking-wider flex items-center gap-2">
          <Camera className="w-4 h-4" /> STAKER SNAPSHOT
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Capture a list of all active stakers in a pool. Use it to bulk-airdrop rewards or export for external use.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pools.filter(p => p.status === "active").map(pool => {
            const count = stakes.filter(s => s.pool_id === pool.id && s.status === "active").length;
            return (
              <Button
                key={pool.id}
                variant="outline"
                size="sm"
                onClick={() => takeSnapshot(pool.id)}
                className="justify-between border-primary/20 hover:bg-primary/10 text-xs font-display"
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-3 h-3 text-primary" />
                  <span>{pool.project_name}</span>
                </div>
                <span className="text-muted-foreground">{count} stakers</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Snapshot Results */}
      {snapshot.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm text-foreground tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" /> CAPTURED STAKERS ({snapshot.length})
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyAllWallets} className="text-xs font-display">
                <Copy className="w-3 h-3 mr-1" /> Copy IDs
              </Button>
              <Button variant="outline" size="sm" onClick={downloadSnapshot} className="text-xs font-display">
                <Download className="w-3 h-3 mr-1" /> Export CSV
              </Button>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {snapshot.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-secondary/30 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-display text-foreground">{entry.display_name}</span>
                  <code className="text-[10px] text-muted-foreground">{entry.user_id.slice(0, 12)}...</code>
                </div>
                <span className="text-primary font-display">{entry.amount} staked</span>
              </div>
            ))}
          </div>

          {/* Bulk Reward */}
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="font-display text-xs text-accent mb-3 tracking-wider flex items-center gap-2">
              <Gift className="w-3.5 h-3.5" /> BULK REWARD ALL ({snapshot.length} USERS)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <Input
                placeholder="Asset name (e.g. 100 $FORGE)"
                value={bulkAirdrop.asset_name}
                onChange={e => setBulkAirdrop({ ...bulkAirdrop, asset_name: e.target.value })}
                className="bg-secondary border-border text-sm"
              />
              <Input
                type="number"
                placeholder="Amount per user"
                value={bulkAirdrop.amount}
                onChange={e => setBulkAirdrop({ ...bulkAirdrop, amount: e.target.value })}
                className="bg-secondary border-border text-sm"
              />
              <select
                value={bulkAirdrop.project_account_id}
                onChange={e => setBulkAirdrop({ ...bulkAirdrop, project_account_id: e.target.value })}
                className="bg-secondary border border-border rounded-md text-sm text-foreground px-3"
              >
                <option value="">Select project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.project_name}</option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Message (optional)"
              value={bulkAirdrop.message}
              onChange={e => setBulkAirdrop({ ...bulkAirdrop, message: e.target.value })}
              className="bg-secondary border-border text-sm mb-3"
            />
            <Button onClick={bulkRewardAll} className="bg-accent text-accent-foreground font-display text-xs">
              <Send className="w-3.5 h-3.5 mr-1.5" /> Airdrop to All {snapshot.length} Stakers
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SnapshotPanel;
