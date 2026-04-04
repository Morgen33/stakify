import { motion } from "framer-motion";
import { Sparkles, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NFTProject {
  name: string;
  totalStaked: number;
  floorPrice: string;
  isMinted: boolean;
  change24h: number;
}

const mockProjects: NFTProject[] = [
  { name: "Bored Apes", totalStaked: 1243, floorPrice: "28.5 ETH", isMinted: true, change24h: 12.5 },
  { name: "CryptoPunks", totalStaked: 987, floorPrice: "52.1 ETH", isMinted: true, change24h: -3.2 },
  { name: "Azuki", totalStaked: 756, floorPrice: "8.3 ETH", isMinted: true, change24h: 8.1 },
  { name: "Doodles", totalStaked: 432, floorPrice: "3.1 ETH", isMinted: true, change24h: -1.5 },
  { name: "Moonbirds", totalStaked: 321, floorPrice: "2.8 ETH", isMinted: false, change24h: 22.3 },
  { name: "CloneX", totalStaked: 198, floorPrice: "4.2 ETH", isMinted: true, change24h: 5.7 },
];

const TopNFTProjects = () => {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-neon-purple" />
        <h2 className="font-display text-lg text-foreground">Top NFT Projects</h2>
      </div>
      <div className="divide-y divide-border">
        {mockProjects.map((project, i) => (
          <motion.div
            key={project.name}
            className="flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors cursor-pointer group"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center font-display text-xs text-primary">
              {project.name.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display text-sm text-foreground truncate">{project.name}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={project.isMinted ? "bg-neon-green/10 text-neon-green border-neon-green/30 text-[10px]" : "bg-neon-gold/10 text-neon-gold border-neon-gold/30 text-[10px]"}>
                      {project.isMinted ? "Minted" : "Minting"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card border-border">
                    <p className="text-xs">{project.isMinted ? "This collection is fully minted" : "Minting is still in progress"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">Floor: {project.floorPrice}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-sm text-primary">{project.totalStaked.toLocaleString()}</p>
              <p className={`text-xs font-display ${project.change24h >= 0 ? "text-neon-green" : "text-neon-red"}`}>
                {project.change24h >= 0 ? "+" : ""}{project.change24h}%
              </p>
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopNFTProjects;
