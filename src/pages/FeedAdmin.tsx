import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Save, Shield, Trash2, Pencil } from "lucide-react";

type ActivityFeedRow = {
  id: string;
  title: string;
  content: string;
  published: boolean | null;
  created_at: string;
  updated_at: string;
};

const FeedAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editingItem, setEditingItem] = useState<ActivityFeedRow | null>(null);
  const [form, setForm] = useState({ title: "", content: "", published: true });

  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error) return false;
      return data as boolean;
    },
    enabled: !!user,
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-activity-feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_feed")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as ActivityFeedRow[];
    },
    enabled: isAdmin === true,
  });

  useEffect(() => {
    if (editingItem) {
      setForm({
        title: editingItem.title || "",
        content: editingItem.content || "",
        published: editingItem.published !== false,
      });
    } else {
      setForm({ title: "", content: "", published: true });
    }
  }, [editingItem]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingItem) {
        const { error } = await supabase
          .from("activity_feed")
          .update({ title: form.title, content: form.content, published: form.published })
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("activity_feed")
          .insert({ title: form.title, content: form.content, published: form.published, author_id: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activity-feed"] });
      queryClient.invalidateQueries({ queryKey: ["activity-feed"] });
      setEditingItem(null);
      setForm({ title: "", content: "", published: true });
      toast({ title: "SAVED", description: "feed entry updated." });
    },
    onError: (error: Error) => toast({ title: "ERROR", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("activity_feed").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activity-feed"] });
      queryClient.invalidateQueries({ queryKey: ["activity-feed"] });
      toast({ title: "DELETED" });
    },
    onError: (error: Error) => toast({ title: "ERROR", description: error.message, variant: "destructive" }),
  });

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
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">sudo ./feed-admin</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">{">"} Feed Admin</h1>
            <p className="text-muted-foreground">// post updates to /feed</p>
          </div>

          <TerminalCard title="~/feed_editor.sh" promptText={editingItem ? "vim feed_entry (edit)" : "vim feed_entry (new)"}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Title</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Content</label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="min-h-[220px]"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">published</span>
                  <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                </div>
                <div className="flex items-center gap-2">
                  {editingItem && (
                    <Button variant="outline" onClick={() => setEditingItem(null)}>
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending || !form.title.trim()}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saveMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </TerminalCard>

          <TerminalCard title="~/feed_entries.list" promptText="ls -la ./feed">
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">loading...</div>
              ) : (items || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">no entries yet.</div>
              ) : (
                (items || []).map((item) => (
                  <div key={item.id} className="border border-border/50 bg-muted/10 p-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <div className="text-foreground font-mono">{item.title}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                          {new Date(item.created_at).toLocaleString()} · {item.published === false ? "draft" : "published"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingItem(item)} className="flex items-center gap-2">
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TerminalCard>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default FeedAdmin;
