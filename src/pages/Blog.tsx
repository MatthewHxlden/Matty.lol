import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Calendar, Clock, Tag, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: string[];
  read_time: string | null;
  created_at: string;
}

const Blog = () => {
  const { data: blogPosts, isLoading, error } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, tags, read_time, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
              <span className="text-foreground">cat ./blog/README.md</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">
              {">"} Blog
            </h1>
            <p className="text-muted-foreground">
              // thoughts, tutorials, and random musings
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <TerminalCard key={i} className="animate-pulse" showPrompt={false}>
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
            <TerminalCard className="border-destructive" showPrompt={false}>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span>Error loading posts: {error.message}</span>
              </div>
            </TerminalCard>
          )}

          {/* Empty state */}
          {!isLoading && !error && blogPosts?.length === 0 && (
            <TerminalCard showPrompt={false}>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg">// no posts found</p>
                <p className="text-sm mt-2">check back soon for new content...</p>
              </div>
            </TerminalCard>
          )}

          {/* Blog Posts */}
          {!isLoading && !error && blogPosts && blogPosts.length > 0 && (
            <div className="space-y-4">
              {blogPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/blog/${post.slug}`}>
                    <TerminalCard className="group cursor-pointer hover:border-primary transition-all duration-300" showPrompt={false}>
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.created_at)}
                          </span>
                          {post.read_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.read_time}
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl font-bold text-foreground group-hover:text-primary group-hover:neon-text transition-all">
                          <span className="text-secondary">{">"}</span> {post.title}
                        </h2>

                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm">
                            {post.excerpt}
                          </p>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="flex items-center gap-1 text-xs px-2 py-1 border border-accent/30 text-accent"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </TerminalCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground text-sm py-8"
          >
            <span className="text-secondary">// </span>
            more posts coming soon...
          </motion.div>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Blog;
