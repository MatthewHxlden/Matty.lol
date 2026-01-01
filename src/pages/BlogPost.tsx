import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Calendar, Clock, Tag, ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BlogPostWithAuthor {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  tags: string[];
  read_time: string | null;
  created_at: string;
  author_id: string | null;
  cover_image: string | null;
  profiles: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      // Fetch post
      const { data: postData, error: postError } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, content, tags, read_time, created_at, author_id, cover_image")
        .eq("slug", slug!)
        .eq("published", true)
        .single();

      if (postError) throw postError;

      // Fetch author profile if author_id exists
      let profiles = null;
      if (postData.author_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username, display_name, avatar_url, bio")
          .eq("id", postData.author_id)
          .single();
        profiles = profileData;
      }

      return { ...postData, profiles } as BlogPostWithAuthor;
    },
    enabled: !!slug,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-primary neon-text mt-6 mb-4">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-secondary mt-4 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\*(.*)$/);
        if (match) {
          return (
            <li key={index} className="text-foreground ml-4 my-1">
              <span className="text-accent font-bold">{match[1]}</span>
              <span className="text-muted-foreground">{match[2]}</span>
            </li>
          );
        }
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="text-muted-foreground ml-4 my-1">{line.slice(2)}</li>;
      }
      if (line.match(/^\d+\. /)) {
        return <li key={index} className="text-muted-foreground ml-4 my-1 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
      }
      if (line === '') {
        return <br key={index} />;
      }
      return <p key={index} className="text-foreground my-2">{line}</p>;
    });
  };

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>cd ../blog</span>
          </Link>

          {/* Loading state */}
          {isLoading && (
            <TerminalCard className="animate-pulse" showPrompt={false}>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            </TerminalCard>
          )}

          {/* Error state */}
          {error && (
            <TerminalCard className="border-destructive" showPrompt={false}>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span>Error loading post: {(error as Error).message}</span>
              </div>
            </TerminalCard>
          )}

          {/* Post content */}
          {post && (
            <>
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-secondary">$</span>
                  <span className="text-foreground">cat ./blog/{post.slug}.md</span>
                  <span className="cursor-blink text-primary">_</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold neon-text">
                  {">"} {post.title}
                </h1>
                
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.created_at)}
                  </span>
                  {post.read_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.read_time}
                    </span>
                  )}
                </div>

                {/* Tags */}
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

              {/* Cover Image */}
              {post.cover_image && (
                <div className="w-full">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-auto max-h-96 object-cover rounded-lg border border-border/50"
                  />
                </div>
              )}

              {/* Content */}
              <TerminalCard title={`${post.slug}.md`} promptText={`cat ./blog/${post.slug}.md`}>
                <div className="prose prose-invert max-w-none">
                  {post.content ? (
                    <MarkdownRenderer content={post.content} />
                  ) : (
                    <p className="text-muted-foreground italic">// no content available</p>
                  )}
                </div>
              </TerminalCard>

              {/* Author section */}
              {post.profiles && (
                <TerminalCard title="author.info" promptText="cat author.info">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary">
                      <AvatarImage src={post.profiles.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-primary text-xl">
                        {(post.profiles.display_name || post.profiles.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-foreground">
                        {post.profiles.display_name || post.profiles.username}
                      </p>
                      {post.profiles.username && post.profiles.display_name && (
                        <p className="text-sm text-secondary">@{post.profiles.username}</p>
                      )}
                      {post.profiles.bio && (
                        <p className="text-sm text-muted-foreground">{post.profiles.bio}</p>
                      )}
                    </div>
                  </div>
                </TerminalCard>
              )}
            </>
          )}
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default BlogPost;
