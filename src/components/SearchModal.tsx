import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, FileText, Code, Wrench, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface SearchResult {
  type: "blog" | "app" | "tool";
  id: string;
  title: string;
  description: string | null;
  url: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all data for search
  const { data: blogPosts } = useQuery({
    queryKey: ["search-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, excerpt, slug")
        .eq("published", true);
      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  const { data: apps } = useQuery({
    queryKey: ["search-apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("apps")
        .select("id, name, description, demo_url");
      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  const { data: tools } = useQuery({
    queryKey: ["search-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("id, name, description, url");
      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const newResults: SearchResult[] = [];

    // Search blog posts
    blogPosts?.forEach((post) => {
      if (
        post.title.toLowerCase().includes(searchQuery) ||
        post.excerpt?.toLowerCase().includes(searchQuery)
      ) {
        newResults.push({
          type: "blog",
          id: post.id,
          title: post.title,
          description: post.excerpt,
          url: `/blog/${post.slug}`,
        });
      }
    });

    // Search apps
    apps?.forEach((app) => {
      if (
        app.name.toLowerCase().includes(searchQuery) ||
        app.description?.toLowerCase().includes(searchQuery)
      ) {
        newResults.push({
          type: "app",
          id: app.id,
          title: app.name,
          description: app.description,
          url: app.demo_url || "/apps",
        });
      }
    });

    // Search tools
    tools?.forEach((tool) => {
      if (
        tool.name.toLowerCase().includes(searchQuery) ||
        tool.description?.toLowerCase().includes(searchQuery)
      ) {
        newResults.push({
          type: "tool",
          id: tool.id,
          title: tool.name,
          description: tool.description,
          url: tool.url || "/tools",
        });
      }
    });

    setResults(newResults.slice(0, 10));
  }, [query, blogPosts, apps, tools]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case "blog":
        return <FileText className="w-4 h-4" />;
      case "app":
        return <Code className="w-4 h-4" />;
      case "tool":
        return <Wrench className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "blog":
        return "text-primary";
      case "app":
        return "text-secondary";
      case "tool":
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-card border border-primary neon-border"
          >
            {/* Search Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="w-5 h-5 text-primary" />
              <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts, apps, tools..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query && results.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{query}"</p>
                </div>
              )}

              {results.map((result) => {
                const isExternal = result.url.startsWith("http");
                const Component = isExternal ? "a" : Link;
                const props = isExternal
                  ? { href: result.url, target: "_blank", rel: "noopener noreferrer" }
                  : { to: result.url };

                return (
                  <Component
                    key={`${result.type}-${result.id}`}
                    {...(props as any)}
                    onClick={onClose}
                    className="flex items-start gap-3 p-4 hover:bg-muted/50 border-b border-border/50 transition-colors cursor-pointer group"
                  >
                    <div className={`mt-1 ${getTypeColor(result.type)}`}>
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                          {result.title}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 border ${getTypeColor(
                            result.type
                          )} border-current opacity-60`}
                        >
                          {result.type}
                        </span>
                        {isExternal && (
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      {result.description && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </Component>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
              <span>
                <kbd className="px-1.5 py-0.5 bg-muted border border-border">ESC</kbd> to
                close
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-muted border border-border">⌘</kbd>
                <kbd className="px-1.5 py-0.5 bg-muted border border-border ml-1">K</kbd> to
                open
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
