import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, X, Tag as TagIcon, Palette } from "lucide-react";

interface BlogTag {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

const BlogSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreating, setIsCreating] = useState(false);
  const [newTag, setNewTag] = useState({
    name: "",
    icon: "Tag",
    color: "#3b82f6",
  });

  // Common icon options
  const iconOptions = [
    "Tag", "Hash", "Bookmark", "Star", "Heart", "ThumbsUp", "MessageSquare",
    "Code", "Database", "Server", "Cloud", "Globe", "Link", "FileText",
    "Image", "Video", "Music", "Headphones", "Camera", "Mic", "Monitor",
    "Smartphone", "Tablet", "Watch", "Gamepad2", "Cpu", "Zap", "Battery",
    "Wifi", "Bluetooth", "Navigation", "MapPin", "Calendar", "Clock",
    "TrendingUp", "BarChart", "PieChart", "Activity", "Target", "Award",
    "Trophy", "Medal", "Gem", "Sparkles", "Flame", "Sun", "Moon", "CloudRain"
  ];

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

  // Fetch tags
  const { data: tags, isLoading } = useQuery({
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
      setIsCreating(false);
      toast({
        title: "Tag created",
        description: "Blog tag has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
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
        title: "Tag deleted",
        description: "Blog tag has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateTag = () => {
    if (!newTag.name.trim()) {
      toast({
        title: "Error",
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

  if (!user) {
    return (
      <TerminalLayout>
        <div className="container mx-auto px-4 text-center py-20">
          <TerminalCard>
            <div className="text-center text-muted-foreground">
              Please login to access admin settings
            </div>
          </TerminalCard>
        </div>
      </TerminalLayout>
    );
  }

  if (isCheckingAdmin || isLoading) {
    return (
      <TerminalLayout>
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </TerminalLayout>
    );
  }

  if (!isAdmin) {
    return (
      <TerminalLayout>
        <div className="container mx-auto px-4 text-center py-20">
          <TerminalCard>
            <div className="text-center text-destructive">
              Admin access required
            </div>
          </TerminalCard>
        </div>
      </TerminalLayout>
    );
  }

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">cd ./admin/blog/settings</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">
              {">"} Blog Settings
            </h1>
            <p className="text-muted-foreground">
              // manage blog tags with icons and colors
            </p>
          </div>

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
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
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
                    setIsCreating(false);
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
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-4 border border-border/50 bg-muted/20 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          <TagIcon className="w-4 h-4" />
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
                  ))}
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
      </div>
    </TerminalLayout>
  );
};

export default BlogSettings;
