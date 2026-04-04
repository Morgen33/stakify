import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Ticket, Clock, Trophy, Users, Coins, Gift, ArrowLeft,
  Sparkles, HelpCircle, Lock, Share2
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import WalletModal from "@/components/WalletModal";

const Raffle = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [raffles, setRaffles] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [ticketCounts, setTicketCounts] = useState<Record<string, string>>({});
  const [featureEnabled, setFeatureEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
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
  };

  const buyTicket = async (raffle: any) => {
    if (!user) { toast({ title: "Sign in first", variant: "destructive" }); return; }
    const count = parseInt(ticketCounts[raffle.id] || "1") || 1;
    if (count < 1) return;
    const totalCost = count * Number(raffle.ticket_price);

    const { error } = await supabase.from("raffle_tickets").insert({
      raffle_id: raffle.id,
      user_id: user.id,
      ticket_count: count,
      paid_amount: totalCost,
      currency: raffle.currency,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: `🎟️ ${count} ticket${count > 1 ? "s" : ""} purchased!` });
      setTicketCounts({ ...ticketCounts, [raffle.id]: "1" });
      fetchData();
    }
  };

  const getMyTicketsForRaffle = (raffleId: string) =>
    myTickets.filter(t => t.raffle_id === raffleId).reduce((sum, t) => sum + t.ticket_count, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "border-primary/30 text-primary";
      case "upcoming": return "border-accent/30 text-accent";
      case "ended": return "border-border text-muted-foreground";
      case "drawn": return "border-neon-gold/30 text-neon-gold";
      default: return "border-border text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ticket className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl text-accent tracking-widest">
              RAFFLE HOUSE
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <WalletModal />
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">
              <ArrowLeft className="w-3 h-3 mr-1" /> Home
            </Button>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="font-display text-[10px] text-accent tracking-widest">
              {featureEnabled ? "LIVE RAFFLES" : "COMING SOON"}
            </span>
          </div>
          <h1 className="font-display text-4xl text-foreground mb-3 tracking-wider">
            WIN <span className="text-accent">BIG</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            Enter raffles for a chance to win NFTs, tokens, ETH, and exclusive prizes.
            Pay with ETH, USDC, or SOL. The more tickets, the higher your chances!
          </p>
        </motion.div>

        {!featureEnabled && (
          <motion.div
            className="rounded-xl border border-accent/20 bg-accent/5 p-8 text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Lock className="w-12 h-12 text-accent/40 mx-auto mb-4" />
            <h3 className="font-display text-xl text-foreground mb-2">COMING SOON</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              The Raffle House is being prepared. Stay tuned for epic prizes, NFT drops,
              and token giveaways. Connect your wallet to be first in line!
            </p>
          </motion.div>
        )}

        {/* Raffles Grid */}
        {featureEnabled && raffles.length === 0 && (
          <div className="text-center py-16">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-display text-sm text-muted-foreground">No raffles available right now. Check back soon!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {raffles.map((raffle) => {
            const myCount = getMyTicketsForRaffle(raffle.id);
            const soldPercent = raffle.max_tickets > 0 ? Math.round((raffle.tickets_sold / raffle.max_tickets) * 100) : 0;
            const isActive = raffle.status === "active" && featureEnabled;

            return (
              <motion.div
                key={raffle.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
              >
                {/* Prize Image */}
                {raffle.prize_image_url ? (
                  <img src={raffle.prize_image_url} alt={raffle.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center">
                    <Gift className="w-12 h-12 text-accent/40" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-sm text-foreground tracking-wider">{raffle.title}</h3>
                    <Badge variant="outline" className={`text-[9px] font-display ${getStatusColor(raffle.status)}`}>
                      {raffle.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{raffle.description || raffle.prize_description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-secondary/30 border border-border">
                      <Coins className="w-3 h-3 mx-auto mb-1 text-primary" />
                      <p className="font-display text-xs text-foreground">{raffle.ticket_price} {raffle.currency}</p>
                      <p className="text-[8px] text-muted-foreground">PER TICKET</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-secondary/30 border border-border">
                      <Users className="w-3 h-3 mx-auto mb-1 text-accent" />
                      <p className="font-display text-xs text-foreground">{raffle.tickets_sold}/{raffle.max_tickets}</p>
                      <p className="text-[8px] text-muted-foreground">SOLD</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-secondary/30 border border-border">
                      <Trophy className="w-3 h-3 mx-auto mb-1 text-neon-gold" />
                      <p className="font-display text-xs text-foreground capitalize">{raffle.prize_type}</p>
                      <p className="text-[8px] text-muted-foreground">PRIZE</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-secondary mb-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                      style={{ width: `${soldPercent}%` }}
                    />
                  </div>

                  {/* My tickets */}
                  {myCount > 0 && (
                    <p className="text-[10px] text-primary font-display mb-2">🎟️ You own {myCount} ticket{myCount > 1 ? "s" : ""}</p>
                  )}

                  {/* End date */}
                  {raffle.end_date && (
                    <p className="text-[10px] text-muted-foreground mb-3 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Ends {new Date(raffle.end_date).toLocaleDateString()}
                    </p>
                  )}

                  {/* Buy tickets */}
                  {isActive && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={ticketCounts[raffle.id] || "1"}
                        onChange={(e) => setTicketCounts({ ...ticketCounts, [raffle.id]: e.target.value })}
                        className="bg-secondary border-border text-sm max-w-[70px]"
                      />
                      <Button onClick={() => buyTicket(raffle)} className="flex-1 bg-accent text-accent-foreground font-display text-xs">
                        <Ticket className="w-3 h-3 mr-1" /> Buy Tickets
                      </Button>
                    </div>
                  )}

                  {/* Share to X */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground font-display gap-1.5"
                    onClick={() => {
                      const text = encodeURIComponent(`🎟️ Check out "${raffle.title}" raffle on STAKEFORGE!\n\n🏆 Prize: ${raffle.prize_description}\n💰 Ticket: ${raffle.ticket_price} ${raffle.currency}\n\nJoin now 👇`);
                      const url = encodeURIComponent(window.location.origin + "/raffle");
                      window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
                    }}
                  >
                    <Share2 className="w-3 h-3" /> Share on 𝕏
                  </Button>

                  {raffle.status === "drawn" && raffle.winner_user_id && (
                    <div className="rounded-lg border border-neon-gold/20 bg-neon-gold/5 p-3 text-center">
                      <Trophy className="w-5 h-5 text-neon-gold mx-auto mb-1" />
                      <p className="font-display text-[10px] text-neon-gold">WINNER DRAWN</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 text-center">
          <p className="text-[10px] text-muted-foreground/60 max-w-lg mx-auto">
            ⚠️ Raffle participation involves financial risk. Ticket purchases are non-refundable.
            Winners are selected randomly and verifiably. Platform fees apply to raffle listings.
            All prizes are distributed by the respective project teams. STAKEFORGE facilitates
            the raffle platform but is not responsible for prize fulfillment.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Raffle;
