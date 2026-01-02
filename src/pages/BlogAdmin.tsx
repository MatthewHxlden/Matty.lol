import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import MarkdownEditor from "@/components/MarkdownEditor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Shield, Upload, Image, Tag as TagIcon, Palette, Filter, Hash, Bookmark, Star, Heart, ThumbsUp, MessageSquare, Code, Database, Server, Cloud, Globe, Link, FileText, Video, Music, Headphones, Camera, Mic, Monitor, Smartphone, Tablet, Watch, Gamepad2, Cpu, Zap, Battery, Wifi, Bluetooth, Navigation, MapPin, Calendar, Clock, TrendingUp, BarChart, PieChart, Activity, Target, Award, Trophy, Medal, Gem, Sparkles, Flame, Sun, Moon, CloudRain, Bitcoin, Coins, Brain, BrainCircuit } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  tags: string[];
  read_time: string | null;
  published: boolean;
  cover_image: string | null;
  created_at: string;
}

interface BlogTag {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

const BlogAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showTagSettings, setShowTagSettings] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTag, setNewTag] = useState({
    name: "",
    icon: "Tag",
    color: "#3b82f6",
  });
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    read_time: "5 min",
    published: false,
    cover_image: "",
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

  // Fetch tags
  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ["blog-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_tags")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as BlogTag[];
    },
    enabled: isAdmin === true,
  });

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, cover_image: urlData.publicUrl });
      toast({ title: "UPLOADED", description: "Image uploaded successfully." });
    } catch (error: any) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

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
        cover_image: post.cover_image || null,
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
          cover_image: post.cover_image || null,
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

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: async (tagData: typeof newTag) => {
      const { data, error } = await supabase
        .from("blog_tags")
        .insert([tagData])
        .select()
        .single();
      if (error) throw error;
      return data as BlogTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-tags"] });
      setNewTag({ name: "", icon: "Tag", color: "#3b82f6" });
      setIsCreatingTag(false);
      toast({
        title: "TAG CREATED",
        description: "Blog tag has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "ERROR",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from("blog_tags")
        .delete()
        .eq("id", tagId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-tags"] });
      toast({
        title: "TAG DELETED",
        description: "Blog tag has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "ERROR",
        description: error.message,
        variant: "destructive",
      });
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
      cover_image: "",
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
      cover_image: post.cover_image || "",
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

  const handleCreateTag = () => {
    if (!newTag.name.trim()) {
      toast({
        title: "ERROR",
        description: "Tag name is required",
        variant: "destructive",
      });
      return;
    }
    createTagMutation.mutate(newTag);
  };

  const handleDeleteTag = (tagId: string) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      deleteTagMutation.mutate(tagId);
    }
  };

  // Icon mapping
  const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }> | any> = {
    Tag: TagIcon,
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
    Link,
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
    Calendar,
    Clock,
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
    Bitcoin,
    Coins,
    Brain,
    BrainCircuit,
  };

  // Icon options
  const iconOptions = [
    "Tag", "Hash", "Bookmark", "Star", "Heart", "ThumbsUp", "MessageSquare",
    "Code", "Database", "Server", "Cloud", "Globe", "Link", "FileText",
    "Image", "Video", "Music", "Headphones", "Camera", "Mic", "Monitor",
    "Smartphone", "Tablet", "Watch", "Gamepad2", "Cpu", "Zap", "Battery",
    "Wifi", "Bluetooth", "Navigation", "MapPin", "Calendar", "Clock",
    "TrendingUp", "BarChart", "PieChart", "Activity", "Target", "Award",
    "Trophy", "Medal", "Gem", "Sparkles", "Flame", "Sun", "Moon", "CloudRain",
    "Bitcoin", "Coins", "Brain", "BrainCircuit"
  ];

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
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowTagSettings(!showTagSettings)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TagIcon className="w-4 h-4" />
                  Tag Settings
                </Button>
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
          </div>

          {/* Tag Settings */}
          {showTagSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Create New Tag */}
              <TerminalCard title="create-tag" promptText="nano new-tag.conf">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tag-name">Tag Name</Label>
                      <Input
                        id="tag-name"
                        value={newTag.name}
                        onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                        placeholder="Enter tag name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="tag-icon">Icon</Label>
                      <select
                        id="tag-icon"
                        value={newTag.icon}
                        onChange={(e) => setNewTag({ ...newTag, icon: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                      >
                        {iconOptions.map((icon) => {
                          const IconComponent = iconMap[icon];
                          return (
                            <option key={icon} value={icon}>
                              {icon}
                            </option>
                          );
                        })}
                      </select>
                      <div className="mt-2 flex items-center gap-2 p-2 border border-border/50 rounded bg-muted/20">
                        {(() => {
                          const IconComponent = iconMap[newTag.icon];
                          return IconComponent ? <IconComponent className="w-4 h-4" /> : <TagIcon className="w-4 h-4" />;
                        })()}
                        <span className="text-sm text-muted-foreground">Preview: {newTag.icon}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="tag-color">Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="tag-color"
                          type="color"
                          value={newTag.color}
                          onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={newTag.color}
                          onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateTag}
                      disabled={createTagMutation.isPending || !newTag.name.trim()}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Tag
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewTag({ name: "", icon: "Tag", color: "#3b82f6" });
                        setIsCreatingTag(false);
                      }}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </TerminalCard>

              {/* Existing Tags */}
              <TerminalCard title="manage-tags" promptText="ls ./tags/">
                <div className="space-y-4">
                  {tags && tags.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tags.map((tag) => {
                        const IconComponent = iconMap[tag.icon] || TagIcon;
                        return (
                          <div
                            key={tag.id}
                            className="flex items-center justify-between p-4 border border-border/50 bg-muted/20 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: tag.color }}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{tag.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {tag.icon} • {tag.color}
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTag(tag.id)}
                              disabled={deleteTagMutation.isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <TagIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No tags created yet</p>
                      <p className="text-sm mt-2">Create your first tag above</p>
                    </div>
                  )}
                </div>
              </TerminalCard>
            </motion.div>
          )}

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

                  {/* Cover Image Upload */}
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Cover Image</label>
                    <div className="flex items-center gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {isUploading ? "Uploading..." : "Upload Image"}
                      </Button>
                      {formData.cover_image && (
                        <div className="flex items-center gap-2">
                          <img
                            src={formData.cover_image}
                            alt="Cover preview"
                            className="w-16 h-16 object-cover border border-border"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({ ...formData, cover_image: "" })}
                            className="text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <Input
                      value={formData.cover_image}
                      onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                      placeholder="Or paste image URL"
                      className="mt-2"
                    />
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
                    <MarkdownEditor
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Tags</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {tags && tags.length > 0 ? (
                          tags.map((tag) => {
                            const IconComponent = iconMap[tag.icon] || TagIcon;
                            const isSelected = formData.tags.split(',').map(t => t.trim()).includes(tag.name);
                            return (
                              <label key={tag.id} className="flex items-center gap-2 p-2 border border-border/50 rounded hover:bg-muted/20 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const currentTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
                                    if (e.target.checked) {
                                      currentTags.push(tag.name);
                                    } else {
                                      const index = currentTags.indexOf(tag.name);
                                      if (index > -1) currentTags.splice(index, 1);
                                    }
                                    setFormData({ ...formData, tags: currentTags.join(', ') });
                                  }}
                                  className="rounded"
                                />
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: tag.color }}
                                >
                                  <IconComponent className="w-2 h-2 text-white" />
                                </div>
                                <span className="text-sm" style={{ color: tag.color }}>
                                  {tag.name}
                                </span>
                              </label>
                            );
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground">No tags created yet. Create tags in the Tag Settings section above.</p>
                        )}
                      </div>
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
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {post.cover_image && (
                        <img
                          src={post.cover_image}
                          alt=""
                          className="w-10 h-10 object-cover border border-border hidden sm:block"
                        />
                      )}
                      {!post.cover_image && (
                        <div className="w-10 h-10 border border-border flex items-center justify-center text-muted-foreground hidden sm:flex">
                          <Image className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={post.published ? "text-secondary" : "text-muted-foreground"}>
                            {post.published ? "[LIVE]" : "[DRAFT]"}
                          </span>
                          <h3 className="font-bold text-foreground truncate">{post.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">/{post.slug}</p>
                      </div>
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
