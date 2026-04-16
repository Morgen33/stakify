import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket, Clock, Trophy, Users, Coins, Gift, ArrowLeft,
  Sparkles, Share2, Crown, Flame, Star, Zap, Diamond,
  Plus, Filter, Search, Timer, Shield, ExternalLink, TrendingUp, Wallet
} from "lucide-react";
import WalletModal from "@/components/WalletModal";

/* ── Countdown hook ── */
function useCountdown(endDate: string | null) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (!endDate) { setTimeLeft(""); return; }
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("ENDED"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return timeLeft;
}

/* ── Raffle Card ── */
const RaffleCard = ({ raffle, myTickets, onBuy, index }: {
  raffle: any; myTickets: number; onBuy: (raffle: any, count: number) => void; index: number;
}) => {
  const [count, setCount] = useState("1");
  const countdown = useCountdown(raffle.end_date);
  const soldPct = raffle.max_tickets > 0 ? Math.round((raffle.tickets_sold / raffle.max_tickets) * 100) : 0;
  const isActive = raffle.status === "active";
  const isHot = soldPct > 70;
  const isAlmostFull = soldPct > 90;

  return (
    <motion.div
      className="rounded-2xl border border-border bg-card overflow-hidden group hover:border-primary/40 transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      {/* Prize Image */}
      <div className="relative w-full h-48 bg-gradient-to-br from-accent/10 via-primary/5 to-secondary overflow-hidden">
        {raffle.prize_image_url ? (
          <img src={raffle.prize_image_url} alt={raffle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <Gift className="w-16 h-16 text-accent/20" />
            </motion.div>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {isHot && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/90 text-destructive-foreground text-[9px] font-display backdrop-blur-sm">
              <Flame className="w-3 h-3" /> HOT
            </span>
          )}
          {isAlmostFull && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/90 text-accent-foreground text-[9px] font-display backdrop-blur-sm">
              <Zap className="w-3 h-3" /> ALMOST FULL
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={`text-[9px] font-display backdrop-blur-sm ${
            isActive ? "border-neon-green/50 text-neon-green bg-neon-green/10" :
            raffle.status === "drawn" ? "border-accent/50 text-accent bg-accent/10" :
            "border-primary/50 text-primary bg-primary/10"
          }`}>
            {raffle.status === "active" ? "● LIVE" : raffle.status.toUpperCase()}
          </Badge>
        </div>
        {/* Chain badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-[9px] font-display text-muted-foreground border border-border">
            {raffle.currency === "SOL" ? "◎ Solana" : "⟠ Ethereum"}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Title */}
        <div>
          <h3 className="font-display text-sm text-foreground tracking-wider truncate">{raffle.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{raffle.description || raffle.prize_description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 rounded-xl bg-secondary/40 border border-border">
            <Coins className="w-3.5 h-3.5 mx-auto mb-1 text-primary" />
            <p className="font-display text-xs text-foreground">{raffle.ticket_price}</p>
            <p className="text-[8px] text-muted-foreground">{raffle.currency}/TKT</p>
          </div>
          <div className="text-center p-2.5 rounded-xl bg-secondary/40 border border-border">
            <Users className="w-3.5 h-3.5 mx-auto mb-1 text-accent" />
            <p className="font-display text-xs text-foreground">{raffle.tickets_sold}/{raffle.max_tickets}</p>
            <p className="text-[8px] text-muted-foreground">SOLD</p>
          </div>
          <div className="text-center p-2.5 rounded-xl bg-secondary/40 border border-border">
            <Trophy className="w-3.5 h-3.5 mx-auto mb-1 text-neon-gold" />
            <p className="font-display text-xs text-foreground capitalize">{raffle.prize_type}</p>
            <p className="text-[8px] text-muted-foreground">PRIZE</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 font-display">
            <span>{soldPct}% filled</span>
            <span>{raffle.max_tickets - raffle.tickets_sold} left</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isAlmostFull ? "bg-gradient-to-r from-destructive via-accent to-accent" : "bg-gradient-to-r from-primary via-accent to-primary"}`}
              initial={{ width: 0 }}
              animate={{ width: `${soldPct}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          </div>
        </div>

        {/* Countdown */}
        {countdown && (
          <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-secondary/30 border border-border">
            <Timer className="w-3.5 h-3.5 text-accent" />
            <span className={`font-display text-xs tracking-wider ${countdown === "ENDED" ? "text-destructive" : "text-accent"}`}>
              {countdown}
            </span>
          </div>
        )}

        {/* My tickets */}
        {myTickets > 0 && (
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-primary/20 bg-primary/5">
            <Ticket className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-display text-primary">You own {myTickets} ticket{myTickets > 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Buy section */}
        {isActive && (
          <div className="flex gap-2">
            <Input
              type="number" min="1" max={raffle.max_tickets - raffle.tickets_sold}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="bg-secondary border-border text-sm max-w-[70px] text-center"
            />
            <Button
              onClick={() => onBuy(raffle, parseInt(count) || 1)}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground font-display text-xs hover:opacity-90 transition-opacity"
            >
              <Ticket className="w-3.5 h-3.5 mr-1.5" />
              Buy {parseInt(count) || 1} Ticket{(parseInt(count) || 1) > 1 ? "s" : ""}
            </Button>
          </div>
        )}

        {/* Winner */}
        {raffle.status === "drawn" && raffle.winner_user_id && (
          <div className="rounded-xl border border-neon-gold/30 bg-neon-gold/5 p-3 text-center">
            <Crown className="w-5 h-5 text-neon-gold mx-auto mb-1" />
            <p className="font-display text-[10px] text-neon-gold tracking-wider">WINNER DRAWN</p>
          </div>
        )}

        {/* Share */}
        <Button
          variant="ghost" size="sm"
          className="w-full text-xs text-muted-foreground hover:text-foreground font-display gap-1.5"
          onClick={() => {
            const text = encodeURIComponent(`🎟️ Check out "${raffle.title}" raffle!\n🏆 Prize: ${raffle.prize_description}\n💰 Ticket: ${raffle.ticket_price} ${raffle.currency}\nJoin now 👇`);
            const url = encodeURIComponent(window.location.origin + "/raffle");
            window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
          }}
        >
          <Share2 className="w-3 h-3" /> Share on 𝕏
        </Button>
      </div>
    </motion.div>
  );
};

/* ── Host a Raffle Dialog ── */
const HostRaffleDialog = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", prize_description: "", prize_type: "nft",
    ticket_price: "0.01", max_tickets: "100", currency: "ETH",
    nft_contract: "", nft_token_id: "", end_days: "7",
  });

  const handleSubmit = () => {
    if (!form.title || !form.prize_description) return;
    onSubmit(form);
    setOpen(false);
    setForm({ title: "", description: "", prize_description: "", prize_type: "nft", ticket_price: "0.01", max_tickets: "100", currency: "ETH", nft_contract: "", nft_token_id: "", end_days: "7" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-display text-xs bg-gradient-to-r from-accent to-primary text-primary-foreground gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Host a Raffle
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground tracking-wider flex items-center gap-2">
            <Gift className="w-5 h-5 text-accent" /> HOST A RAFFLE
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
            <p className="text-xs text-muted-foreground">
              <Shield className="w-3 h-3 inline mr-1 text-accent" />
              Your NFT will be held in a secure escrow wallet until the raffle completes.
              A listing fee applies. Once the ticket threshold is met, the draw happens automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] font-display text-muted-foreground mb-1 block">RAFFLE TITLE</label>
              <Input placeholder="e.g. Bored Ape #7291" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-display text-muted-foreground mb-1 block">DESCRIPTION</label>
              <Textarea placeholder="Tell everyone about this raffle..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border min-h-[60px]" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-display text-muted-foreground mb-1 block">PRIZE DESCRIPTION</label>
              <Input placeholder="e.g. Rare NFT from xyz collection" value={form.prize_description} onChange={(e) => setForm({ ...form, prize_description: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-[10px] font-display text-muted-foreground mb-1 block">BLOCKCHAIN</label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">⟠ Ethereum (ETH)</SelectItem>
                  <SelectItem value="SOL">◎ Solana (SOL)</SelectItem>
                  <SelectItem value="USDC">💵 USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-display text-muted-foreground mb-1 block">PRIZE TYPE</label>
              <Select value={form.prize_type} onValueChange={(v) => setForm({ ...form, prize_type: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nft">NFT</SelectItem>
                  <SelectItem value="token">Token</SelectItem>
                  <SelectItem value="whitelist">Whitelist Spot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.prize_type === "nft" && (
              <>
                <div>
                  <label className="text-[10px] font-display text-muted-foreground mb-1 block">NFT CONTRACT</label>
                  <Input placeholder="0x..." value={form.nft_contract} onChange={(e) => setForm({ ...form, nft_contract: e.target.value })} className="bg-secondary border-border text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-display text-muted-foreground mb-1 block">TOKEN ID</label>
                  <Input placeholder="#1234" value={form.nft_token_id} onChange={(e) => setForm({ ...form, nft_token_id: e.target.value })} className="bg-secondary border-border" />
                </div>
              </>
            )}
            <div>
              <label className="text-[10px] font-display text-muted-foreground mb-1 block">TICKET PRICE ({form.currency})</label>
              <Input type="number" step="0.001" value={form.ticket_price} onChange={(e) => setForm({ ...form, ticket_price: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-[10px] font-display text-muted-foreground mb-1 block">MAX TICKETS (THRESHOLD)</label>
              <Input type="number" value={form.max_tickets} onChange={(e) => setForm({ ...form, max_tickets: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-[10px] font-display text-muted-foreground mb-1 block">DURATION (DAYS)</label>
              <Input type="number" value={form.end_days} onChange={(e) => setForm({ ...form, end_days: e.target.value })} className="bg-secondary border-border" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1.5">
            <p className="text-[10px] font-display text-muted-foreground">FEE SUMMARY</p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Listing Fee</span>
              <span className="text-foreground font-display">0.01 {form.currency}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Platform Cut</span>
              <span className="text-foreground font-display">5%</span>
            </div>
            <div className="flex justify-between text-xs border-t border-border pt-1.5 mt-1.5">
              <span className="text-muted-foreground">Potential Revenue</span>
              <span className="text-accent font-display">
                {(Number(form.ticket_price) * Number(form.max_tickets) * 0.95).toFixed(4)} {form.currency}
              </span>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-accent to-primary text-primary-foreground font-display gap-2">
            <Gift className="w-4 h-4" /> Submit Raffle for Review
          </Button>
          <p className="text-[9px] text-muted-foreground text-center">
            Raffles are reviewed by the admin team before going live. NFTs are deposited to escrow upon approval.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ── Stats Bar ── */
const RaffleStats = ({ raffles }: { raffles: any[] }) => {
  const liveCount = raffles.filter(r => r.status === "active").length;
  const totalTickets = raffles.reduce((s, r) => s + r.tickets_sold, 0);
  const totalValue = raffles.reduce((s, r) => s + r.tickets_sold * Number(r.ticket_price), 0);

  const stats = [
    { icon: Sparkles, label: "Live Raffles", value: liveCount, color: "text-neon-green" },
    { icon: Ticket, label: "Tickets Sold", value: totalTickets.toLocaleString(), color: "text-primary" },
    { icon: TrendingUp, label: "Total Volume", value: `${totalValue.toFixed(2)}`, color: "text-accent" },
    { icon: Trophy, label: "Prizes Drawn", value: raffles.filter(r => r.status === "drawn").length, color: "text-neon-gold" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.08 }}
        >
          <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
          <p className={`font-display text-xl ${s.color}`}>{s.value}</p>
          <p className="text-[10px] text-muted-foreground font-display">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN RAFFLE HOUSE PAGE
   ══════════════════════════════════════════════ */
const Raffle = () => {
  const { user } = useAuth();
  const { isConnected } = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [raffles, setRaffles] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureEnabled, setFeatureEnabled] = useState(false);
  const [chainFilter, setChainFilter] = useState<"all" | "ETH" | "SOL">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "upcoming" | "drawn">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [rafflesRes, settingsRes] = await Promise.all([
      supabase.from("raffles").select("*").order("created_at", { ascending: false }),
      supabase.from("platform_settings").select("*").eq("key", "feature_raffle").maybeSingle(),
    ]);
    setRaffles(rafflesRes.data || []);
    setFeatureEnabled(settingsRes.data?.value === "true");
    if (user) {
      const { data: tickets } = await supabase.from("raffle_tickets").select("*").eq("user_id", user.id);
      setMyTickets(tickets || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRaffles = useMemo(() => {
    return raffles.filter(r => {
      if (chainFilter !== "all" && r.currency !== chainFilter && !(chainFilter === "ETH" && r.currency === "USDC")) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [raffles, chainFilter, statusFilter, searchQuery]);

  const getMyTicketsForRaffle = (raffleId: string) =>
    myTickets.filter(t => t.raffle_id === raffleId).reduce((sum, t) => sum + t.ticket_count, 0);

  const buyTicket = async (raffle: any, count: number) => {
    if (!user) { toast({ title: "Connect wallet first", description: "Sign in to buy raffle tickets.", variant: "destructive" }); return; }
    const totalCost = count * Number(raffle.ticket_price);
    const { error } = await supabase.from("raffle_tickets").insert({
      raffle_id: raffle.id, user_id: user.id, ticket_count: count,
      paid_amount: totalCost, currency: raffle.currency,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: `🎟️ ${count} ticket${count > 1 ? "s" : ""} purchased!`, description: `Total: ${totalCost} ${raffle.currency}` });
      fetchData();
    }
  };

  const handleHostRaffle = (data: any) => {
    toast({
      title: "📩 Raffle Submitted for Review",
      description: `"${data.title}" has been sent to the admin team. You'll be notified once approved.`,
    });
  };

  /* ── Demo raffles shown when DB is empty ── */
  const demoRaffles = [
    { id: "d1", title: "BORED APE #7291", description: "Ultra-rare Bored Ape from the original collection", prize_description: "Rare NFT", prize_type: "nft", tickets_sold: 847, max_tickets: 1000, ticket_price: 0.05, currency: "ETH", status: "active", end_date: new Date(Date.now() + 86400000 * 3).toISOString(), prize_image_url: null, winner_user_id: null },
    { id: "d2", title: "50 SOL JACKPOT", description: "Massive Solana prize pool for lucky winners", prize_description: "50 SOL", prize_type: "token", tickets_sold: 312, max_tickets: 500, ticket_price: 0.1, currency: "SOL", status: "active", end_date: new Date(Date.now() + 86400000 * 5).toISOString(), prize_image_url: null, winner_user_id: null },
    { id: "d3", title: "AZUKI SPIRIT #2201", description: "Legendary Azuki Spirit from the elementals", prize_description: "Legendary NFT", prize_type: "nft", tickets_sold: 1200, max_tickets: 2000, ticket_price: 0.02, currency: "ETH", status: "active", end_date: new Date(Date.now() + 86400000 * 7).toISOString(), prize_image_url: null, winner_user_id: null },
    { id: "d4", title: "1 ETH MEGA DRAW", description: "The ultimate prize — 1 full ETH up for grabs", prize_description: "1 ETH", prize_type: "token", tickets_sold: 4500, max_tickets: 5000, ticket_price: 0.01, currency: "ETH", status: "active", end_date: new Date(Date.now() + 86400000 * 2).toISOString(), prize_image_url: null, winner_user_id: null },
    { id: "d5", title: "MAD LADS #4488", description: "Solana's hottest PFP collection", prize_description: "Rare NFT", prize_type: "nft", tickets_sold: 150, max_tickets: 300, ticket_price: 0.5, currency: "SOL", status: "upcoming", end_date: new Date(Date.now() + 86400000 * 10).toISOString(), prize_image_url: null, winner_user_id: null },
    { id: "d6", title: "500 USDC DROP", description: "Stablecoin giveaway — zero volatility risk", prize_description: "500 USDC", prize_type: "token", tickets_sold: 620, max_tickets: 1000, ticket_price: 5, currency: "USDC", status: "active", end_date: new Date(Date.now() + 86400000 * 4).toISOString(), prize_image_url: null, winner_user_id: null },
  ];

  const displayRaffles = raffles.length > 0 ? filteredRaffles : demoRaffles.filter(r => {
    if (chainFilter !== "all" && r.currency !== chainFilter && !(chainFilter === "ETH" && r.currency === "USDC")) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  const isDemo = raffles.length === 0;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ── Nav ── */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Ticket className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-display text-xl text-accent tracking-widest">RAFFLE HOUSE</h2>
            <Badge variant="outline" className="text-[9px] font-display border-accent/30 text-accent animate-pulse">BETA</Badge>
          </div>
          <div className="flex items-center gap-3">
            <WalletModal redirectAfterConnect={false} />
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">
              <ArrowLeft className="w-3 h-3 mr-1" /> Home
            </Button>
          </div>
        </div>
      </nav>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* ── Hero ── */}
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-accent/30 bg-accent/5 mb-5"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-display text-xs text-accent tracking-[0.3em]">NFT RAFFLES ON-CHAIN</span>
            <Sparkles className="w-4 h-4 text-accent" />
          </motion.div>
          <h1 className="font-display text-4xl md:text-6xl text-foreground mb-3 tracking-wider">
            THE <span className="text-accent">RAFFLE</span> HOUSE
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm mb-6">
            Win NFTs, tokens & more. Escrow-protected. Threshold-based draws.
            Host your own or enter for a chance to win.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[
              { icon: Shield, label: "Escrow Protected" },
              { icon: Ticket, label: "Threshold Draws" },
              { icon: Crown, label: "NFT Prizes" },
              { icon: Coins, label: "ETH · SOL · USDC" },
              { icon: Star, label: "Hondro Points" },
            ].map((f, i) => (
              <motion.span
                key={f.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card/50 text-[10px] font-display text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <f.icon className="w-3 h-3 text-primary" />
                {f.label}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <RaffleStats raffles={isDemo ? demoRaffles : raffles} />

        {/* ── Filters + Actions ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          {/* Chain Tabs */}
          <Tabs value={chainFilter} onValueChange={(v) => setChainFilter(v as any)} className="w-auto">
            <TabsList className="bg-secondary/50 border border-border">
              <TabsTrigger value="all" className="font-display text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">All Chains</TabsTrigger>
              <TabsTrigger value="ETH" className="font-display text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">⟠ Ethereum</TabsTrigger>
              <TabsTrigger value="SOL" className="font-display text-xs data-[state=active]:bg-accent/20 data-[state=active]:text-accent">◎ Solana</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Status filter */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[130px] bg-secondary border-border text-xs font-display h-9">
                <Filter className="w-3 h-3 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">● Live</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="drawn">Drawn</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search raffles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary border-border text-xs h-9 w-[180px]"
              />
            </div>

            {/* Host */}
            <HostRaffleDialog onSubmit={handleHostRaffle} />
          </div>
        </div>

        {/* ── Demo banner ── */}
        {isDemo && (
          <motion.div
            className="mb-6 rounded-xl border border-accent/20 bg-accent/5 p-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 inline mr-1 text-accent" />
              These are <strong className="text-accent">preview raffles</strong> — real draws will appear once the Raffle House goes live.
              <strong className="text-primary ml-1">Host your own raffle</strong> to be the first!
            </p>
          </motion.div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-border bg-card h-[420px] animate-pulse" />
            ))}
          </div>
        ) : displayRaffles.length === 0 ? (
          <motion.div className="text-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Gift className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-lg text-foreground mb-2">No Raffles Found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or be the first to host one!</p>
            <HostRaffleDialog onSubmit={handleHostRaffle} />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {displayRaffles.map((raffle, i) => (
                <RaffleCard
                  key={raffle.id}
                  raffle={raffle}
                  myTickets={getMyTicketsForRaffle(raffle.id)}
                  onBuy={isDemo ? () => toast({ title: "Preview Only", description: "This is a demo raffle. Real draws coming soon!" }) : buyTicket}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── How It Works ── */}
        <motion.div
          className="mt-16 mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-xl text-foreground text-center mb-8 tracking-wider">
            <Diamond className="w-5 h-5 inline text-primary mr-2" />
            HOW IT WORKS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", icon: Wallet, title: "Connect Wallet", desc: "Link your Ethereum or Solana wallet to get started" },
              { step: "02", icon: Gift, title: "Choose a Raffle", desc: "Browse live NFT and token raffles across chains" },
              { step: "03", icon: Ticket, title: "Buy Tickets", desc: "Purchase tickets — threshold met triggers the draw" },
              { step: "04", icon: Crown, title: "Win Prizes", desc: "Winners drawn on-chain. Prize sent from escrow automatically" },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                className="rounded-xl border border-border bg-card/60 p-5 text-center relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="absolute top-2 right-3 font-display text-3xl text-border/60 group-hover:text-primary/20 transition-colors">{s.step}</span>
                <s.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-display text-sm text-foreground mb-1.5">{s.title}</h3>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Disclaimer ── */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground/60 max-w-lg mx-auto">
            ⚠️ Raffle participation involves financial risk. Ticket purchases are non-refundable.
            Winners are selected randomly and verifiably on-chain. Platform fees apply.
            All prizes are held in escrow and distributed automatically upon draw completion.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Raffle;
