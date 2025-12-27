import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Github, Twitter, Linkedin, Mail, Globe, Youtube, MessageCircle, AlertCircle, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LinkItem {
  id: string;
  name: string;
  handle: string | null;
  url: string;
  icon: string;
}

const iconMap: Record<string, LucideIcon> = {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Globe,
  Youtube,
  MessageCircle,
};

const colorMap: Record<string, string> = {
  Github: "hover:text-foreground hover:border-foreground",
  Twitter: "hover:text-primary hover:border-primary",
  Linkedin: "hover:text-[hsl(210_100%_50%)] hover:border-[hsl(210_100%_50%)]",
  Youtube: "hover:text-destructive hover:border-destructive",
  MessageCircle: "hover:text-accent hover:border-accent",
  Globe: "hover:text-secondary hover:border-secondary",
  Mail: "hover:text-primary hover:border-primary",
};

const Links = () => {
  const { data: links, isLoading, error } = useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as LinkItem[];
    },
  });

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-24 h-24 mx-auto border-2 border-primary flex items-center justify-center neon-border"
            >
              <span className="text-4xl font-bold text-primary pulse-glow">M</span>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold neon-text">
              @matty
            </h1>
            <p className="text-muted-foreground">
              // find me across the web
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-border p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-muted rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <TerminalCard className="border-destructive">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span>Error loading links: {(error as Error).message}</span>
              </div>
            </TerminalCard>
          )}

          {/* Links */}
          {!isLoading && !error && links && links.length > 0 && (
            <div className="space-y-3">
              {links.map((link, index) => {
                const Icon = iconMap[link.icon] || Globe;
                const colorClass = colorMap[link.icon] || colorMap.Globe;
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`block border border-border p-4 transition-all duration-300 bg-card/30 backdrop-blur-sm ${colorClass}`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="w-6 h-6" />
                      <div className="flex-1">
                        <div className="font-bold">{link.name}</div>
                        {link.handle && (
                          <div className="text-sm text-muted-foreground">
                            {link.handle}
                          </div>
                        )}
                      </div>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && (!links || links.length === 0) && (
            <TerminalCard>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg">// no links found</p>
                <p className="text-sm mt-2">check back soon...</p>
              </div>
            </TerminalCard>
          )}

          {/* Terminal signature */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center pt-8"
          >
            <div className="inline-block border border-border/50 px-4 py-2 text-sm text-muted-foreground">
              <span className="text-secondary">$</span> echo "thanks for stopping by"
              <span className="cursor-blink text-primary ml-1">_</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Links;
