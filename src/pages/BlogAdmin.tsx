import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, AlertCircle, Shield } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  tags: string[];
  read_time: string | null;
  published: boolean;
  created_at: string;
}

const BlogAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    read_time: "5 min",
    published: false,
  });

  // Check if user is admin
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user,
  });

  // Fetch all posts (admins can see all)
  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
    enabled: isAdmin === true,
  });

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: async (post: typeof formData) => {
      const { error } = await supabase.from("blog_posts").insert({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || null,
        content: post.content || null,
        tags: post.tags.split(",").map((t) => t.trim()).filter(Boolean),
        read_time: post.read_time || "5 min",
        published: post.published,
        author_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setIsCreating(false);
      resetForm();
      toast({ title: "POST CREATED", description: "New blog post added successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    },
  });

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...post }: { id: string } & typeof formData) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || null,
          content: post.content || null,
          tags: post.tags.split(",").map((t) => t.trim()).filter(Boolean),
          read_time: post.read_time || "5 min",
          published: post.published,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setEditingPost(null);
      resetForm();
      toast({ title: "POST UPDATED", description: "Blog post updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({ title: "POST DELETED", description: "Blog post removed." });
    },
    onError: (error: Error) => {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      tags: "",
      read_time: "5 min",
      published: false,
    });
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreating(false);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      tags: post.tags?.join(", ") || "",
      read_time: post.read_time || "5 min",
      published: post.published || false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Not logged in
  if (!user) {
    return (
      <TerminalLayout>
        <div className="container mx-auto px-4 text-center py-20">
          <TerminalCard>
            <div className="flex flex-col items-center gap-4">
              <Shield className="w-12 h-12 text-destructive" />
              <h2 className="text-xl font-bold text-foreground">ACCESS DENIED</h2>
              <p className="text-muted-foreground">Please login to access admin panel</p>
              <Button onClick={() => navigate("/auth")} className="mt-4">
                Go to Login
              </Button>
            </div>
          </TerminalCard>
        </div>
      </TerminalLayout>
    );
  }

  // Checking admin status
  if (isCheckingAdmin) {
    return (
      <TerminalLayout>
        <div className="container mx-auto px-4 text-center py-20">
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </TerminalLayout>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <TerminalLayout>
        <div className="container mx-auto px-4 text-center py-20">
          <TerminalCard>
            <div className="flex flex-col items-center gap-4">
              <Shield className="w-12 h-12 text-destructive" />
              <h2 className="text-xl font-bold text-foreground">ADMIN ACCESS REQUIRED</h2>
              <p className="text-muted-foreground">You don't have permission to access this area</p>
              <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
                Return Home
              </Button>
            </div>
          </TerminalCard>
        </div>
      </TerminalLayout>
    );
  }

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
              <span className="text-foreground">sudo ./blog-admin</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-4xl font-bold neon-text">
                {">"} Blog Admin
              </h1>
              <Button
                onClick={() => {
                  setIsCreating(true);
                  setEditingPost(null);
                  resetForm();
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </div>
          </div>

          {/* Editor Form */}
          {(isCreating || editingPost) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TerminalCard title={editingPost ? "edit_post.sh" : "new_post.sh"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Title</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            title: e.target.value,
                            slug: generateSlug(e.target.value),
                          });
                        }}
                        placeholder="Post title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Slug</label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="post-slug"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Excerpt</label>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Short description..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Content (Markdown)</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="# Your post content..."
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Tags (comma separated)</label>
                      <Input
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="tech, tutorial, news"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Read Time</label>
                      <Input
                        value={formData.read_time}
                        onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                        placeholder="5 min"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Status</label>
                      <Button
                        type="button"
                        variant={formData.published ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, published: !formData.published })}
                        className="w-full flex items-center gap-2"
                      >
                        {formData.published ? (
                          <>
                            <Eye className="w-4 h-4" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" /> Draft
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingPost ? "Update" : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingPost(null);
                        resetForm();
                      }}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </TerminalCard>
            </motion.div>
          )}

          {/* Posts List */}
          {isLoading ? (
            <TerminalCard className="animate-pulse">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded" />
                ))}
              </div>
            </TerminalCard>
          ) : posts && posts.length > 0 ? (
            <TerminalCard title="posts.list">
              <div className="space-y-2">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-3 border border-border hover:border-primary transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={post.published ? "text-secondary" : "text-muted-foreground"}>
                          {post.published ? "[LIVE]" : "[DRAFT]"}
                        </span>
                        <h3 className="font-bold text-foreground truncate">{post.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">/{post.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(post)}
                        className="text-primary"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Delete this post?")) {
                            deleteMutation.mutate(post.id);
                          }
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TerminalCard>
          ) : (
            <TerminalCard>
              <div className="text-center py-8 text-muted-foreground">
                <p>// no posts yet</p>
                <p className="text-sm mt-2">Click "New Post" to create your first blog post.</p>
              </div>
            </TerminalCard>
          )}
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default BlogAdmin;
