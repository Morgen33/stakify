import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Users, ArrowLeft, Shield, Zap, Code, Globe, Sparkles, Save
} from "lucide-react";
import WalletModal from "@/components/WalletModal";
import { useToast } from "@/hooks/use-toast";

interface Founder {
  name: string;
  title: string;
  bio: string;
  emoji: string;
}

const defaultFounders: Founder[] = [
  { name: "", title: "Founder", bio: "", emoji: "👤" },
  { name: "", title: "Co-Founder", bio: "", emoji: "👤" },
  { name: "", title: "Co-Founder", bio: "", emoji: "👤" },
  { name: "", title: "Co-Founder", bio: "", emoji: "👤" },
  { name: "", title: "Co-Founder", bio: "", emoji: "👤" },
];

const About = () => {
  const { isAdmin, isOperator } = useAuth();
  const { toast } = useToast();
  const [founders, setFounders] = useState<Founder[]>(defaultFounders);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Founder[]>(defaultFounders);
  const canEdit = isAdmin || isOperator;

  useEffect(() => {
    loadFounders();
  }, []);

  const loadFounders = async () => {
    const { data } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("key", "founders_data")
      .maybeSingle();
    if (data?.value) {
      try {
        const parsed = JSON.parse(data.value);
        setFounders(parsed);
        setEditData(parsed);
      } catch {}
    }
  };

  const saveFounders = async () => {
    const { data: existing } = await supabase
      .from("platform_settings")
      .select("id")
      .eq("key", "founders_data")
      .maybeSingle();
    
    if (existing) {
      await supabase.from("platform_settings").update({ value: JSON.stringify(editData) }).eq("id", existing.id);
    } else {
      await supabase.from("platform_settings").insert({ key: "founders_data", value: JSON.stringify(editData) });
    }
    setFounders(editData);
    setEditing(false);
    toast({ title: "✅ Team bios updated!" });
  };

  const updateFounder = (index: number, field: keyof Founder, value: string) => {
    const updated = [...editData];
    updated[index] = { ...updated[index], [field]: value };
    setEditData(updated);
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl text-accent tracking-widest">
              THE TEAM
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <WalletModal />
            <Button variant="outline" size="sm" asChild className="font-display text-xs">
              <Link to="/"><ArrowLeft className="w-3 h-3 mr-1" /> Home</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Hero */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="font-display text-[10px] text-accent tracking-widest">MEET THE FOUNDERS</span>
          </div>
          <h1 className="font-display text-4xl text-foreground mb-3 tracking-wider">
            BUILT BY <span className="text-accent">DEGENS</span>, FOR DEGENS.
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            We're a crew of builders, creators, and crypto natives who believe staking should be
            rewarding, gamified, and actually fun. Meet the team making it happen.
          </p>
        </motion.div>

        {/* Edit toggle */}
        {canEdit && (
          <div className="flex justify-center gap-3">
            {!editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="font-display text-xs">
                ✏️ Edit Bios
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={saveFounders} className="bg-primary text-primary-foreground font-display text-xs">
                  <Save className="w-3 h-3 mr-1" /> Save Changes
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setEditing(false); setEditData(founders); }} className="font-display text-xs">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Founder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(editing ? editData : founders).map((founder, i) => (
            <motion.div
              key={i}
              className="rounded-xl border border-border bg-card p-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex items-center justify-center text-3xl mb-4">
                  {editing ? (
                    <Input
                      value={editData[i].emoji}
                      onChange={(e) => updateFounder(i, "emoji", e.target.value)}
                      className="w-12 h-12 text-center text-2xl bg-transparent border-none p-0"
                    />
                  ) : (
                    founder.emoji
                  )}
                </div>
                {editing ? (
                  <div className="space-y-2">
                    <Input value={editData[i].name} onChange={(e) => updateFounder(i, "name", e.target.value)} className="bg-secondary border-border text-sm font-display" placeholder="Name" />
                    <Input value={editData[i].title} onChange={(e) => updateFounder(i, "title", e.target.value)} className="bg-secondary border-border text-xs" placeholder="Title" />
                    <textarea
                      value={editData[i].bio}
                      onChange={(e) => updateFounder(i, "bio", e.target.value)}
                      className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground resize-none"
                      rows={4}
                      placeholder="Bio..."
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="font-display text-lg text-foreground mb-1">{founder.name || <span className="text-muted-foreground italic">Name not set</span>}</h3>
                    <p className="text-xs text-accent font-display tracking-wider mb-3">{founder.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{founder.bio || <span className="italic">Bio coming soon — check back later!</span>}</p>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mission */}
        <motion.div
          className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
          <h3 className="font-display text-xl text-foreground tracking-wider mb-3">OUR MISSION</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're building the most rewarding, secure, and gamified NFT staking platform in Web3.
            Every feature — from the arcade to the raffle house — is designed to make holding your
            NFTs actually exciting. We believe in transparency, fair fees, and giving back to the
            communities that make this ecosystem thrive. This is just the beginning.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <Code className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display text-[10px] text-muted-foreground tracking-wider">AUDITED CODE</p>
            </div>
            <div className="text-center">
              <Shield className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="font-display text-[10px] text-muted-foreground tracking-wider">5-LAYER SECURITY</p>
            </div>
            <div className="text-center">
              <Globe className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display text-[10px] text-muted-foreground tracking-wider">MULTI-CHAIN READY</p>
            </div>
            <div className="text-center">
              <Zap className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="font-display text-[10px] text-muted-foreground tracking-wider">GAMIFIED DeFi</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default About;
