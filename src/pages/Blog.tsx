import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Calendar, Clock, Tag, AlertCircle, Filter, Hash, Bookmark, Star, Heart, ThumbsUp, MessageSquare, Code, Database, Server, Cloud, Globe, Link as LinkIcon, FileText, Video, Music, Headphones, Camera, Mic, Monitor, Smartphone, Tablet, Watch, Gamepad2, Cpu, Zap, Battery, Wifi, Bluetooth, Navigation, MapPin, Calendar as CalendarIcon, Clock as ClockIcon, TrendingUp, BarChart, PieChart, Activity, Target, Award, Trophy, Medal, Gem, Sparkles, Flame, Sun, Moon, CloudRain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: string[];
  read_time: string | null;
  created_at: string;
  cover_image: string | null;
}

interface BlogTag {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTag = searchParams.get("tag");

  // Icon mapping
  const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }> | any> = {
    Tag,
    Hash,
    Bookmark,
    Star,
    Heart,
    ThumbsUp,
    MessageSquare,
    Code,
    Database,
    Server,
    Cloud,
    Globe,
    Link: LinkIcon,
    FileText,
    Video,
    Music,
    Headphones,
    Camera,
    Mic,
    Monitor,
    Smartphone,
    Tablet,
    Watch,
    Gamepad2,
    Cpu,
    Zap,
    Battery,
    Wifi,
    Bluetooth,
    Navigation,
    MapPin,
    Calendar: CalendarIcon,
    Clock: ClockIcon,
    TrendingUp,
    BarChart,
    PieChart,
    Activity,
    Target,
    Award,
    Trophy,
    Medal,
    Gem,
    Sparkles,
    Flame,
    Sun,
    Moon,
    CloudRain,
  };

  const { data: blogPosts, isLoading, error } = useQuery({
    queryKey: ["blog-posts", selectedTag],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, tags, read_time, created_at, cover_image")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (selectedTag) {
        query = query.contains("tags", [selectedTag]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const { data: tags } = useQuery({
    queryKey: ["blog-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_tags")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as BlogTag[];
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

          {/* Tag Filter */}
          {tags && tags.length > 0 && (
            <TerminalCard title="tag-filter" promptText="filter --by-tag">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-secondary">Filter by tag:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSearchParams({});
                    }}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      !selectedTag
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary hover:text-foreground"
                    }`}
                  >
                    All Posts
                  </button>
                  
                  {tags.map((tag) => {
                        const IconComponent = iconMap[tag.icon] || Tag;
                        return (
                          <button
                            key={tag.id}
                            onClick={() => {
                              setSearchParams(tag.name ? { tag: tag.name } : {});
                            }}
                            className={`px-3 py-1 text-xs rounded-full border transition-all flex items-center gap-1 bg-background ${
                              selectedTag === tag.name
                                ? "border-primary text-primary"
                                : "border-border/50 text-muted-foreground hover:border-primary hover:text-foreground"
                            }`}
                            style={{
                              borderColor: selectedTag === tag.name ? tag.color : undefined,
                              color: selectedTag === tag.name ? tag.color : undefined,
                            }}
                          >
                            <IconComponent className="w-3 h-3" style={{ color: selectedTag === tag.name ? tag.color : undefined }} />
                            {tag.name}
                          </button>
                        );
                      })}
                </div>
                
                {selectedTag && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Showing posts tagged with:</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: tags.find(t => t.name === selectedTag)?.color + "20", color: tags.find(t => t.name === selectedTag)?.color }}>
                      {selectedTag}
                    </span>
                    <button
                      onClick={() => setSearchParams({})}
                      className="text-primary hover:underline"
                    >
                      Clear filter
                    </button>
                  </div>
                )}
              </div>
            </TerminalCard>
          )}

          {/* Blog Posts */}
          {!isLoading && !error && blogPosts && blogPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/blog/${post.slug}`}>
                    <TerminalCard className="group cursor-pointer hover:border-primary transition-all duration-300 h-full flex flex-col" showPrompt={false}>
                      <div className="space-y-3 flex-1 flex flex-col">
                        {/* Cover Image */}
                        {post.cover_image && (
                          <div className="relative w-full h-48 overflow-hidden rounded-lg border border-border/50 flex-shrink-0">
                            <img
                              src={post.cover_image}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}

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

                        <h2 className="text-lg font-bold text-foreground group-hover:text-primary group-hover:neon-text transition-all line-clamp-2">
                          <span className="text-secondary">{">"}</span> {post.title}
                        </h2>

                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-3 flex-grow">
                            {post.excerpt}
                          </p>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.slice(0, 3).map((tagName) => {
                              const tagConfig = tags?.find(t => t.name === tagName);
                              const IconComponent = tagConfig ? (iconMap[tagConfig.icon] || Tag) : Tag;
                              return (
                                <span
                                  key={tagName}
                                  className="flex items-center gap-1 text-xs px-2 py-1 border rounded-full transition-all hover:scale-105 bg-background"
                                  style={{
                                    borderColor: tagConfig?.color || undefined,
                                    color: tagConfig?.color || undefined,
                                  }}
                                >
                                  <IconComponent className="w-3 h-3" style={{ color: tagConfig?.color || undefined }} />
                                  {tagName}
                                </span>
                              );
                            })}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{post.tags.length - 3} more
                              </span>
                            )}
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
