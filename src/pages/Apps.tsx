import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { ExternalLink, Github, Star, Code, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface App {
  id: string;
  name: string;
  description: string | null;
  tech: string[];
  status: string;
  github_url: string | null;
  demo_url: string | null;
  stars: number;
}

const statusColors: Record<string, string> = {
  live: "text-secondary",
  beta: "text-accent",
  dev: "text-muted-foreground",
};

const Apps = () => {
  const { data: apps, isLoading, error } = useQuery({
    queryKey: ["apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as App[];
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
              <span className="text-foreground">ls -la ./apps</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">
              {">"} Apps
            </h1>
            <p className="text-muted-foreground">
              // things i've built and shipped
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <TerminalCard key={i} className="animate-pulse h-48">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </TerminalCard>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <TerminalCard className="border-destructive">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span>Error loading apps: {(error as Error).message}</span>
              </div>
            </TerminalCard>
          )}

          {/* Apps Grid */}
          {!isLoading && !error && apps && apps.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TerminalCard title={`~/apps/${app.name.toLowerCase()}`} className="h-full">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">
                            {app.name}
                          </h3>
                          <span className={`text-xs ${statusColors[app.status] || statusColors.dev}`}>
                            [{app.status?.toUpperCase() || 'DEV'}]
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-accent text-sm">
                          <Star className="w-4 h-4 fill-current" />
                          {app.stars || 0}
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm">
                        {app.description}
                      </p>

                      {app.tech && app.tech.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {app.tech.map((tech) => (
                            <span
                              key={tech}
                              className="text-xs px-2 py-1 border border-border text-muted-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-4 pt-2">
                        {app.github_url && (
                          <a
                            href={app.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary hover-glow transition-all"
                          >
                            <Github className="w-4 h-4" />
                            <span>source</span>
                          </a>
                        )}
                        {app.demo_url && (
                          <a
                            href={app.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-secondary transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>demo</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </TerminalCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && (!apps || apps.length === 0) && (
            <TerminalCard>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg">// no apps found</p>
                <p className="text-sm mt-2">check back soon...</p>
              </div>
            </TerminalCard>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-8"
          >
            <TerminalCard className="inline-block">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Code className="w-4 h-4 text-secondary" />
                <span>More projects on</span>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:neon-text transition-all">
                  GitHub
                </a>
              </div>
            </TerminalCard>
          </motion.div>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Apps;
