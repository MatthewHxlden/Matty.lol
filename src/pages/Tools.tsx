import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Wrench, ExternalLink, Sparkles, AlertCircle, Trash2, TrendingUp, ArrowUpDown, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Tool {
  id: string;
  name: string;
  description: string | null;
  category: string;
  url: string | null;
}

const categoryColors: Record<string, string> = {
  dev: "border-secondary text-secondary",
  design: "border-accent text-accent",
  content: "border-primary text-primary",
};

const Tools = () => {
  const { data: tools, isLoading, error } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Tool[];
    },
  });

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">./tools --list</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">
              {">"} Tools
            </h1>
            <p className="text-muted-foreground">
              // utilities to make your life easier
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border border-border p-4 animate-pulse">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <TerminalCard className="border-destructive" showPrompt={false}>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span>Error loading tools: {(error as Error).message}</span>
              </div>
            </TerminalCard>
          )}

          {/* Tools Grid */}
          {!isLoading && !error && tools && tools.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool, index) => (
                <motion.a
                  key={tool.id}
                  href={tool.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <div className="border border-border p-4 h-full transition-all duration-300 hover:border-primary hover:neon-border bg-card/30 backdrop-blur-sm">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {tool.name}
                          </h3>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>

                      <span
                        className={`inline-block text-xs px-2 py-1 border ${categoryColors[tool.category] || categoryColors.dev}`}
                      >
                        {tool.category}
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
              
              {/* Rent Reclaim Tool */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: tools.length * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  <Link to="/rent-reclaim" onClick={(e) => e.preventDefault()}>
                    <div className="border border-border p-4 h-full transition-all duration-300 hover:border-primary hover:neon-border bg-card/30 backdrop-blur-sm group relative overflow-hidden">
                      {/* Coming Soon Badge */}
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-full px-3 py-1">
                          <span className="text-yellow-600 font-semibold text-xs">Coming Soon</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                              Solana Rent Reclaim
                            </h3>
                          </div>
                          <Sparkles className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Reclaim SOL locked in empty token accounts with 15% fee
                        </p>

                        <span className="inline-block text-xs px-2 py-1 border border-accent text-accent">
                          blockchain
                        </span>
                      </div>
                      
                      {/* Subtle overlay to prevent interaction */}
                      <div className="absolute inset-0 bg-muted/10 cursor-not-allowed z-5"></div>
                    </div>
                  </Link>
                </div>
              </motion.div>

              {/* Paper Trading Tool */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (tools.length + 1) * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link to="/paper-trading">
                  <div className="border border-border p-4 h-full transition-all duration-300 hover:border-primary hover:neon-border bg-card/30 backdrop-blur-sm group">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                            Paper Trading Simulator
                          </h3>
                        </div>
                        <Sparkles className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Practice Solana DEX trading with real Jupiter prices and $10,000 virtual USD
                      </p>

                      <span className="inline-block text-xs px-2 py-1 border border-secondary text-secondary">
                        trading
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Crypto Swaps Tool */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (tools.length + 2) * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  <Link to="/crypto-swaps" onClick={(e) => e.preventDefault()}>
                    <div className="border border-border p-4 h-full transition-all duration-300 hover:border-primary hover:neon-border bg-card/30 backdrop-blur-sm group relative overflow-hidden">
                      {/* Coming Soon Badge */}
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-full px-3 py-1">
                          <span className="text-yellow-600 font-semibold text-xs">Coming Soon</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                              Crypto Swaps
                            </h3>
                          </div>
                          <Sparkles className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Swap tokens on Solana using Jupiter aggregator for best rates
                        </p>

                        <span className="inline-block text-xs px-2 py-1 border border-accent text-accent">
                          defi
                        </span>
                      </div>
                      
                      {/* Subtle overlay to prevent interaction */}
                      <div className="absolute inset-0 bg-muted/10 cursor-not-allowed z-5"></div>
                    </div>
                  </Link>
                </div>
              </motion.div>

              {/* Price Tracker Tool */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (tools.length + 3) * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link to="/price-tracker">
                  <div className="border border-border p-4 h-full transition-all duration-300 hover:border-primary hover:neon-border bg-card/30 backdrop-blur-sm group">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                            Jupiter Price Tracker
                          </h3>
                        </div>
                        <Sparkles className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Real-time token prices from Jupiter aggregator with 24h changes
                      </p>

                      <span className="inline-block text-xs px-2 py-1 border border-secondary text-secondary">
                        prices
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && (!tools || tools.length === 0) && (
            <TerminalCard showPrompt={false}>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg">// no tools found</p>
                <p className="text-sm mt-2">check back soon...</p>
              </div>
            </TerminalCard>
          )}

          {/* Coming Soon */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <TerminalCard className="text-center" showPrompt={false}>
              <div className="flex flex-col items-center gap-2 py-4">
                <Sparkles className="w-8 h-8 text-accent animate-float" />
                <p className="text-muted-foreground">
                  <span className="text-secondary">// </span>
                  More tools in development...
                </p>
                <p className="text-xs text-muted-foreground/50">
                  Got a tool idea? Let me know!
                </p>
              </div>
            </TerminalCard>
          </motion.div>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Tools;
