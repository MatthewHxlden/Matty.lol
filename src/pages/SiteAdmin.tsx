import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Save, Shield, Plus, Edit, Trash2, X, GripVertical } from "lucide-react";

interface SiteProfile {
  id: string;
  name: string;
  role: string;
  status: string;
  mission?: string;
}

interface SiteStat {
  id: string;
  stat_key: string;
  stat_value: string;
  stat_label: string;
  icon_name: string;
  color_class: string;
  sort_order: number;
}

type HomeLayoutItem = {
  id: string;
  enabled: boolean;
};

type HomeLayoutRow = {
  id: string;
  layout: unknown;
};

const DEFAULT_HOME_LAYOUT: HomeLayoutItem[] = [
  { id: "hero", enabled: true },
  { id: "trades", enabled: true },
  { id: "signals", enabled: true },
  { id: "quick_links", enabled: true },
  { id: "status", enabled: true },
];

const normalizeHomeLayout = (raw: unknown): HomeLayoutItem[] => {
  const parsed = Array.isArray(raw) ? (raw as any[]) : [];
  const items: HomeLayoutItem[] = parsed
    .map((v) => ({
      id: typeof v?.id === "string" ? v.id : "",
      enabled: typeof v?.enabled === "boolean" ? v.enabled : true,
    }))
    .filter((v) => v.id);

  const merged = [...DEFAULT_HOME_LAYOUT];
  for (const item of items) {
    const idx = merged.findIndex((m) => m.id === item.id);
    if (idx >= 0) merged[idx] = item;
    else merged.push(item);
  }

  const dedup: HomeLayoutItem[] = [];
  for (const item of merged) {
    if (dedup.some((d) => d.id === item.id)) continue;
    dedup.push(item);
  }
  return dedup;
};

const SiteAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [profileData, setProfileData] = useState({
    name: "",
    role: "",
    status: "",
    mission: "",
  });

  const [editingStat, setEditingStat] = useState<SiteStat | null>(null);
  const [isCreatingStat, setIsCreatingStat] = useState(false);
  const [statForm, setStatForm] = useState({
    stat_key: "",
    stat_value: "",
    stat_label: "",
    icon_name: "Zap",
    color_class: "text-primary",
    sort_order: 0,
  });

  const [homeLayout, setHomeLayout] = useState<HomeLayoutItem[]>(DEFAULT_HOME_LAYOUT);

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

  const { data: siteProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ["site-profile-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_profile")
        .select("*")
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as SiteProfile | null;
    },
    enabled: isAdmin === true,
  });

  const { data: homeLayoutRow } = useQuery({
    queryKey: ["home-layout-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_layout")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as HomeLayoutRow | null;
    },
    enabled: isAdmin === true,
  });

  useEffect(() => {
    setHomeLayout(normalizeHomeLayout(homeLayoutRow?.layout));
  }, [homeLayoutRow]);

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["site-stats-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_stats")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as SiteStat[];
    },
    enabled: isAdmin === true,
  });

  useEffect(() => {
    if (siteProfile) {
      setProfileData({
        name: siteProfile.name,
        role: siteProfile.role,
        status: siteProfile.status,
        mission: siteProfile.mission || "",
      });
    }
  }, [siteProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      if (siteProfile) {
        const { error } = await supabase
          .from("site_profile")
          .update(data)
          .eq("id", siteProfile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_profile").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-profile-admin"] });
      queryClient.invalidateQueries({ queryKey: ["site-profile"] });
      toast({ title: "SAVED", description: "Profile updated." });
    },
    onError: (error: Error) => {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    },
  });

  const createStatMutation = useMutation({
    mutationFn: async (data: typeof statForm) => {
      const { error } = await supabase.from("site_stats").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-stats-admin"] });
      queryClient.invalidateQueries({ queryKey: ["site-stats"] });
      setIsCreatingStat(false);
      resetStatForm();
      toast({ title: "CREATED", description: "Stat added." });
    },
    onError: (error: Error) => {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    },
  });

  const updateStatMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof statForm) => {
      const { error } = await supabase.from("site_stats").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-stats-admin"] });
      queryClient.invalidateQueries({ queryKey: ["site-stats"] });
      setEditingStat(null);
      resetStatForm();
      toast({ title: "UPDATED", description: "Stat updated." });
    },
    onError: (error: Error) => {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    },
  });

  const deleteStatMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_stats").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-stats-admin"] });
      queryClient.invalidateQueries({ queryKey: ["site-stats"] });
      toast({ title: "DELETED", description: "Stat removed." });
    },
    onError: (error: Error) => {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    },
  });

  const resetStatForm = () => {
    setStatForm({
      stat_key: "",
      stat_value: "",
      stat_label: "",
      icon_name: "Zap",
      color_class: "text-primary",
      sort_order: 0,
    });
  };

  const saveHomeLayoutMutation = useMutation({
    mutationFn: async () => {
      if (homeLayoutRow) {
        const { error } = await supabase
          .from("home_layout")
          .update({ layout: homeLayout as any })
          .eq("id", homeLayoutRow.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("home_layout").insert({ layout: homeLayout as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-layout-admin"] });
      queryClient.invalidateQueries({ queryKey: ["home-layout"] });
      toast({ title: "SAVED", description: "Homepage layout updated." });
    },
    onError: (error: Error) => toast({ title: "ERROR", description: error.message, variant: "destructive" }),
  });

  const handleEditStat = (stat: SiteStat) => {
    setEditingStat(stat);
    setIsCreatingStat(false);
    setStatForm({
      stat_key: stat.stat_key,
      stat_value: stat.stat_value,
      stat_label: stat.stat_label,
      icon_name: stat.icon_name,
      color_class: stat.color_class,
      sort_order: stat.sort_order,
    });
  };

  const handleStatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStat) {
      updateStatMutation.mutate({ id: editingStat.id, ...statForm });
    } else {
      createStatMutation.mutate(statForm);
    }
  };

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

  if (isCheckingAdmin) {
    return (
      <TerminalLayout>
        <div className="container mx-auto px-4 text-center py-20">
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </TerminalLayout>
    );
  }

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
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">sudo ./site-admin</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">{">"} Site Admin</h1>
            <p className="text-muted-foreground">// edit homepage profile & stats</p>
          </div>

          {/* Profile Section */}
          {loadingProfile ? (
            <TerminalCard className="animate-pulse">
              <div className="h-32 bg-muted rounded" />
            </TerminalCard>
          ) : (
            <TerminalCard title="profile_config.sh">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateProfileMutation.mutate(profileData);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Name</label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-muted-foreground">Role</label>
                    <Input
                      value={profileData.role}
                      onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                      placeholder="Developer / Creator"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Status</label>
                  <Input
                    value={profileData.status}
                    onChange={(e) => setProfileData({ ...profileData, status: e.target.value })}
                    placeholder="building cool stuff"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Mission (mission.txt)</label>
                  <Textarea
                    value={profileData.mission}
                    onChange={(e) => setProfileData({ ...profileData, mission: e.target.value })}
                    placeholder="Welcome to my corner of the web..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Profile
                </Button>
              </form>
            </TerminalCard>
          )}

          <TerminalCard title="home_layout.json" promptText="edit home_layout">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                drag to reorder. toggle to enable/disable.
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHomeLayout(DEFAULT_HOME_LAYOUT)}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={() => saveHomeLayoutMutation.mutate()}
                  disabled={saveHomeLayoutMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saveHomeLayoutMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <Reorder.Group axis="y" values={homeLayout} onReorder={setHomeLayout} className="space-y-2">
                {homeLayout.map((item) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    className="flex items-center justify-between gap-4 p-3 border border-border/50 bg-muted/10"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-foreground">{item.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">enabled</span>
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={(v) =>
                          setHomeLayout((prev) => prev.map((p) => (p.id === item.id ? { ...p, enabled: v } : p)))
                        }
                      />
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </TerminalCard>

          {/* Stats Section */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Stats</h2>
            <Button
              onClick={() => {
                setIsCreatingStat(true);
                setEditingStat(null);
                resetStatForm();
              }}
              className="flex items-center gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Add Stat
            </Button>
          </div>

          {(isCreatingStat || editingStat) && (
            <TerminalCard title={editingStat ? "edit_stat.sh" : "new_stat.sh"}>
              <form onSubmit={handleStatSubmit} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Key</label>
                    <Input
                      value={statForm.stat_key}
                      onChange={(e) => setStatForm({ ...statForm, stat_key: e.target.value })}
                      placeholder="coffees"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Value</label>
                    <Input
                      value={statForm.stat_value}
                      onChange={(e) => setStatForm({ ...statForm, stat_value: e.target.value })}
                      placeholder="∞"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Label</label>
                    <Input
                      value={statForm.stat_label}
                      onChange={(e) => setStatForm({ ...statForm, stat_label: e.target.value })}
                      placeholder="coffees"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Icon (lucide)</label>
                    <Input
                      value={statForm.icon_name}
                      onChange={(e) => setStatForm({ ...statForm, icon_name: e.target.value })}
                      placeholder="Coffee, Code, Skull, Zap"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Color Class</label>
                    <Input
                      value={statForm.color_class}
                      onChange={(e) => setStatForm({ ...statForm, color_class: e.target.value })}
                      placeholder="text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Sort Order</label>
                    <Input
                      type="number"
                      value={statForm.sort_order}
                      onChange={(e) =>
                        setStatForm({ ...statForm, sort_order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {editingStat ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingStat(false);
                      setEditingStat(null);
                      resetStatForm();
                    }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            </TerminalCard>
          )}

          {loadingStats ? (
            <TerminalCard className="animate-pulse">
              <div className="h-20 bg-muted rounded" />
            </TerminalCard>
          ) : stats && stats.length > 0 ? (
            <TerminalCard title="stats.list">
              <div className="space-y-2">
                {stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="flex items-center justify-between p-3 border border-border hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className={stat.color_class}>{stat.icon_name}</span>
                      <div>
                        <span className="font-bold text-foreground">{stat.stat_value}</span>
                        <span className="text-muted-foreground ml-2">{stat.stat_label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEditStat(stat)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this stat?")) {
                            deleteStatMutation.mutate(stat.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TerminalCard>
          ) : (
            <TerminalCard>
              <p className="text-center text-muted-foreground py-4">// no stats yet</p>
            </TerminalCard>
          )}
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default SiteAdmin;
