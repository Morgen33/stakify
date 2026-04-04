import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Ticket, Clock, Trophy, Users, Coins, Gift, ArrowLeft,
  Sparkles, Lock, Share2, Crown, Flame, Star, Zap, Diamond
} from "lucide-react";
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

  useEffect(() => { fetchData(); }, [user]);

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
    const totalCost = count * Number(raffle.ticket_price);
    const { error } = await supabase.from("raffle_tickets").insert({
      raffle_id: raffle.id, user_id: user.id, ticket_count: count,
      paid_amount: totalCost, currency: raffle.currency,
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

  // Demo raffle cards to show behind the blur
  const demoRaffles = [
    { id: "d1", title: "BORED APE #7291", prize: "Rare NFT", tickets: 847, max: 1000, price: "0.05 ETH", type: "nft", hot: true },
    { id: "d2", title: "50 SOL JACKPOT", prize: "50 SOL", tickets: 312, max: 500, price: "0.1 SOL", type: "token", hot: false },
    { id: "d3", title: "AZUKI SPIRIT", prize: "Legendary NFT", tickets: 1200, max: 2000, price: "0.02 ETH", type: "nft", hot: true },
    { id: "d4", title: "1 ETH MEGA DRAW", prize: "1 ETH", tickets: 4500, max: 5000, price: "0.01 ETH", type: "token", hot: true },
    { id: "d5", title: "DOODLES #4488", prize: "Rare NFT", tickets: 150, max: 300, price: "0.03 ETH", type: "nft", hot: false },
    { id: "d6", title: "500 USDC DROP", prize: "500 USDC", tickets: 620, max: 1000, price: "5 USDC", type: "token", hot: false },
  ];

  const getGradient = (i: number) => {
    const gradients = [
      "from-purple-500/20 via-pink-500/10 to-accent/20",
      "from-primary/20 via-blue-500/10 to-cyan-400/20",
      "from-orange-500/20 via-red-500/10 to-pink-500/20",
      "from-emerald-500/20 via-teal-500/10 to-primary/20",
      "from-violet-500/20 via-indigo-500/10 to-blue-500/20",
      "from-amber-500/20 via-orange-500/10 to-red-500/20",
    ];
    return gradients[i % gradients.length];
  };

  return (
    <div className="min-h-screen bg-background bg-grid overflow-hidden">
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Ticket className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-display text-xl text-accent tracking-widest">RAFFLE HOUSE</h2>
            <Badge variant="outline" className="text-[9px] font-display border-accent/30 text-accent animate-pulse">BETA</Badge>
          </div>
          <div className="flex items-center gap-3">
            <WalletModal />
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-display text-xs">
              <ArrowLeft className="w-3 h-3 mr-1" /> Home
            </Button>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl mx-auto px-4 py-8 relative">
        {/* Hero */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-accent/30 bg-accent/5 mb-6"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-display text-xs text-accent tracking-[0.3em]">
              {featureEnabled ? "LIVE DRAWS" : "GRAND OPENING SOON"}
            </span>
            <Sparkles className="w-4 h-4 text-accent" />
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4 tracking-wider leading-tight">
            THE <span className="text-accent">RAFFLE</span> HOUSE
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-base mb-6">
            Win NFTs, tokens, ETH, SOL & USDC. Buy tickets. Watch the timer.
            One lucky winner takes it all. Are you feeling lucky?
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { icon: Ticket, label: "Ticket Raffles", color: "text-accent" },
              { icon: Crown, label: "NFT Prizes", color: "text-primary" },
              { icon: Coins, label: "ETH · SOL · USDC", color: "text-accent" },
              { icon: Share2, label: "Share on 𝕏", color: "text-primary" },
              { icon: Zap, label: "Instant Draws", color: "text-accent" },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card/50 text-xs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <f.icon className={`w-3.5 h-3.5 ${f.color}`} />
                <span className="font-display text-muted-foreground">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══ TEASER GRID (blurred) ═══ */}
        <div className="relative">
          {/* The blurred demo cards behind */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none pointer-events-none">
            {demoRaffles.map((demo, i) => (
              <motion.div
                key={demo.id}
                className={`rounded-2xl border border-border bg-gradient-to-br ${getGradient(i)} overflow-hidden filter blur-[6px]`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
              >
                {/* Fake prize image area */}
                <div className="w-full h-44 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center relative">
                  {demo.hot && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/90 text-destructive-foreground text-[9px] font-display">
                      <Flame className="w-3 h-3" /> HOT
                    </div>
                  )}
                  <Gift className="w-16 h-16 text-accent/30" />
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-base text-foreground tracking-wider">{demo.title}</h3>
                    <Badge variant="outline" className="text-[9px] font-display border-primary/30 text-primary">LIVE</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2.5 rounded-xl bg-card/80 border border-border">
                      <Coins className="w-3.5 h-3.5 mx-auto mb-1 text-primary" />
                      <p className="font-display text-xs text-foreground">{demo.price}</p>
                      <p className="text-[8px] text-muted-foreground">PER TICKET</p>
                    </div>
                    <div className="text-center p-2.5 rounded-xl bg-card/80 border border-border">
                      <Users className="w-3.5 h-3.5 mx-auto mb-1 text-accent" />
                      <p className="font-display text-xs text-foreground">{demo.tickets}/{demo.max}</p>
                      <p className="text-[8px] text-muted-foreground">SOLD</p>
                    </div>
                    <div className="text-center p-2.5 rounded-xl bg-card/80 border border-border">
                      <Trophy className="w-3.5 h-3.5 mx-auto mb-1 text-neon-gold" />
                      <p className="font-display text-xs text-foreground capitalize">{demo.type}</p>
                      <p className="text-[8px] text-muted-foreground">PRIZE</p>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-secondary mb-3">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary" style={{ width: `${Math.round((demo.tickets / demo.max) * 100)}%` }} />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 h-9 rounded-lg bg-secondary/50 border border-border" />
                    <div className="flex-[2] h-9 rounded-lg bg-accent/30 border border-accent/20 flex items-center justify-center">
                      <span className="font-display text-xs text-accent">🎟️ Buy Tickets</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <motion.div
              className="text-center p-10 rounded-3xl border border-accent/30 bg-background/80 backdrop-blur-md shadow-2xl max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Lock className="w-16 h-16 text-accent mx-auto mb-4" />
              </motion.div>
              <h2 className="font-display text-3xl text-foreground mb-3 tracking-wider">COMING SOON</h2>
              <p className="text-sm text-muted-foreground mb-6">
                The Raffle House is being stocked with <strong className="text-accent">epic prizes</strong>,
                NFT drops, token giveaways, and exclusive draws.
                Connect your wallet to be <strong className="text-primary">first in line</strong>.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {["NFTs", "ETH", "SOL", "USDC", "Tokens"].map((tag, i) => (
                  <motion.span
                    key={tag}
                    className="px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-[10px] font-display text-accent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                <Diamond className="w-3 h-3 text-primary" />
                <span>Projects can host their own raffles</span>
                <Diamond className="w-3 h-3 text-primary" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Live raffles (when enabled) */}
        {featureEnabled && raffles.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl text-foreground mb-6 tracking-wider text-center">
              <Sparkles className="w-5 h-5 inline text-accent mr-2" />
              LIVE DRAWS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raffles.map((raffle) => {
                const myCount = getMyTicketsForRaffle(raffle.id);
                const soldPercent = raffle.max_tickets > 0 ? Math.round((raffle.tickets_sold / raffle.max_tickets) * 100) : 0;
                const isActive = raffle.status === "active";

                return (
                  <motion.div
                    key={raffle.id}
                    className="rounded-2xl border border-border bg-card overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {raffle.prize_image_url ? (
                      <img src={raffle.prize_image_url} alt={raffle.title} className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center">
                        <Gift className="w-14 h-14 text-accent/30" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display text-sm text-foreground tracking-wider">{raffle.title}</h3>
                        <Badge variant="outline" className="text-[9px] font-display border-primary/30 text-primary">
                          {raffle.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{raffle.description || raffle.prize_description}</p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 rounded-xl bg-secondary/30 border border-border">
                          <Coins className="w-3 h-3 mx-auto mb-1 text-primary" />
                          <p className="font-display text-xs text-foreground">{raffle.ticket_price} {raffle.currency}</p>
                          <p className="text-[8px] text-muted-foreground">PER TICKET</p>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-secondary/30 border border-border">
                          <Users className="w-3 h-3 mx-auto mb-1 text-accent" />
                          <p className="font-display text-xs text-foreground">{raffle.tickets_sold}/{raffle.max_tickets}</p>
                          <p className="text-[8px] text-muted-foreground">SOLD</p>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-secondary/30 border border-border">
                          <Trophy className="w-3 h-3 mx-auto mb-1 text-neon-gold" />
                          <p className="font-display text-xs text-foreground capitalize">{raffle.prize_type}</p>
                          <p className="text-[8px] text-muted-foreground">PRIZE</p>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-secondary mb-3">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary transition-all" style={{ width: `${soldPercent}%` }} />
                      </div>
                      {myCount > 0 && <p className="text-[10px] text-primary font-display mb-2">🎟️ You own {myCount} ticket{myCount > 1 ? "s" : ""}</p>}
                      {raffle.end_date && (
                        <p className="text-[10px] text-muted-foreground mb-3 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Ends {new Date(raffle.end_date).toLocaleDateString()}
                        </p>
                      )}
                      {isActive && (
                        <div className="flex gap-2">
                          <Input type="number" min="1" value={ticketCounts[raffle.id] || "1"}
                            onChange={(e) => setTicketCounts({ ...ticketCounts, [raffle.id]: e.target.value })}
                            className="bg-secondary border-border text-sm max-w-[70px]" />
                          <Button onClick={() => buyTicket(raffle)} className="flex-1 bg-accent text-accent-foreground font-display text-xs">
                            <Ticket className="w-3 h-3 mr-1" /> Buy Tickets
                          </Button>
                        </div>
                      )}
                      <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground font-display gap-1.5"
                        onClick={() => {
                          const text = encodeURIComponent(`🎟️ Check out "${raffle.title}" raffle!\n🏆 Prize: ${raffle.prize_description}\n💰 Ticket: ${raffle.ticket_price} ${raffle.currency}\nJoin now 👇`);
                          const url = encodeURIComponent(window.location.origin + "/raffle");
                          window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
                        }}>
                        <Share2 className="w-3 h-3" /> Share on 𝕏
                      </Button>
                      {raffle.status === "drawn" && raffle.winner_user_id && (
                        <div className="mt-2 rounded-xl border border-neon-gold/20 bg-neon-gold/5 p-3 text-center">
                          <Trophy className="w-5 h-5 text-neon-gold mx-auto mb-1" />
                          <p className="font-display text-[10px] text-neon-gold">WINNER DRAWN</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-muted-foreground/60 max-w-lg mx-auto">
            ⚠️ Raffle participation involves financial risk. Ticket purchases are non-refundable.
            Winners are selected randomly and verifiably. Platform fees apply to raffle listings.
            All prizes are distributed by the respective project teams. The platform facilitates
            the raffle but is not responsible for prize fulfillment.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Raffle;
