import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { User, Save, Camera, Shield, Github, Twitter, Linkedin, Mail, Globe, Youtube, MessageCircle, AlertCircle, type LucideIcon } from "lucide-react";

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

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

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
  });

  // Fetch profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });

  const { data: links, isLoading: linksLoading, error: linksError } = useQuery({
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

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        display_name: profile.display_name || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({
          username: data.username || null,
          display_name: data.display_name || null,
          bio: data.bio || null,
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast({ title: "PROFILE UPDATED", description: "Your changes have been saved." });
    },
    onError: (error: Error) => {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    setUploading(true);

    try {
      // Delete old avatar if exists
      await supabase.storage.from("avatars").remove([`${user.id}/avatar.png`, `${user.id}/avatar.jpg`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.webp`]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast({ title: "AVATAR UPDATED", description: "Your new avatar is live." });
    } catch (error) {
      toast({ title: "UPLOAD FAILED", description: (error as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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
              <p className="text-muted-foreground">Please login to view your profile</p>
              <Button onClick={() => navigate("/auth")} className="mt-4">
                Go to Login
              </Button>
            </div>
          </TerminalCard>
        </div>
      </TerminalLayout>
    );
  }

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">./edit-profile</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">
              {">"} My Profile
            </h1>
            <p className="text-muted-foreground">
              // customize your identity
            </p>
          </div>

          {isLoading ? (
            <TerminalCard className="animate-pulse">
              <div className="space-y-4">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto" />
                <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
              </div>
            </TerminalCard>
          ) : (
            <>
              {/* Avatar Section */}
              <TerminalCard title="avatar.upload">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-primary">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-primary text-4xl">
                        {(profile?.display_name || profile?.username || user.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="flex flex-col items-center gap-1 text-primary">
                        <Camera className="w-6 h-6" />
                        <span className="text-xs">
                          {uploading ? "Uploading..." : "Change"}
                        </span>
                      </div>
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    // hover to change avatar
                  </p>
                </div>
              </TerminalCard>

              {/* Profile Form */}
              <TerminalCard title="profile.config">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      username
                    </label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="neo"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">display_name</label>
                    <Input
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="Thomas Anderson"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">bio</label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="// tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </TerminalCard>

              {/* Email info */}
              <TerminalCard title="account.info">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Email:</p>
                  <p className="text-foreground font-mono">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    // email cannot be changed here
                  </p>
                </div>
              </TerminalCard>

              {/* Links */}
              <TerminalCard title="~/links.list" promptText="cat links.list">
                {linksError && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Error loading links: {(linksError as Error).message}</span>
                  </div>
                )}

                {linksLoading && <div className="text-sm text-muted-foreground">loading...</div>}

                {!linksLoading && !linksError && links && links.length > 0 && (
                  <div className="space-y-3">
                    {links.map((link) => {
                      const Icon = iconMap[link.icon] || Globe;
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block border border-border p-4 transition-all duration-300 bg-card/30 backdrop-blur-sm hover:border-primary/60 hover:bg-primary/5"
                        >
                          <div className="flex items-center gap-4">
                            <Icon className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <div className="font-bold text-foreground">{link.name}</div>
                              {link.handle && (
                                <div className="text-sm text-muted-foreground">{link.handle}</div>
                              )}
                            </div>
                            <span className="text-muted-foreground">→</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}

                {!linksLoading && !linksError && (!links || links.length === 0) && (
                  <div className="text-sm text-muted-foreground">// no links found</div>
                )}
              </TerminalCard>
            </>
          )}
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Profile;
