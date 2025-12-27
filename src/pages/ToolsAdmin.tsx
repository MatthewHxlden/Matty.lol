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
import { Plus, Edit, Trash2, Save, X, Shield } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string | null;
  category: string;
  url: string | null;
  sort_order: number;
}

const ToolsAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingItem, setEditingItem] = useState<Tool | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "dev",
    url: "",
    sort_order: 0,
  });

  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      return data as boolean;
    },
    enabled: !!user,
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-tools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tools").select("*").order("sort_order");
      if (error) throw error;
      return data as Tool[];
    },
    enabled: isAdmin === true,
  });

  const createMutation = useMutation({
    mutationFn: async (item: typeof formData) => {
      const { error } = await supabase.from("tools").insert({
        name: item.name,
        description: item.description || null,
        category: item.category,
        url: item.url || null,
        sort_order: item.sort_order,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tools"] });
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      setIsCreating(false);
      resetForm();
      toast({ title: "TOOL CREATED" });
    },
    onError: (error: Error) => toast({ title: "ERROR", description: error.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...item }: { id: string } & typeof formData) => {
      const { error } = await supabase.from("tools").update({
        name: item.name,
        description: item.description || null,
        category: item.category,
        url: item.url || null,
        sort_order: item.sort_order,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tools"] });
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      setEditingItem(null);
      resetForm();
      toast({ title: "TOOL UPDATED" });
    },
    onError: (error: Error) => toast({ title: "ERROR", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tools"] });
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      toast({ title: "TOOL DELETED" });
    },
    onError: (error: Error) => toast({ title: "ERROR", description: error.message, variant: "destructive" }),
  });

  const resetForm = () => setFormData({ name: "", description: "", category: "dev", url: "", sort_order: 0 });

  const handleEdit = (item: Tool) => {
    setEditingItem(item);
    setIsCreating(false);
    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category || "dev",
      url: item.url || "",
      sort_order: item.sort_order || 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) updateMutation.mutate({ id: editingItem.id, ...formData });
    else createMutation.mutate(formData);
  };

  if (!user) {
    return (
      <TerminalLayout>
        <div className="container mx-auto px-4 text-center py-20">
          <TerminalCard>
            <div className="flex flex-col items-center gap-4">
              <Shield className="w-12 h-12 text-destructive" />
              <h2 className="text-xl font-bold">ACCESS DENIED</h2>
              <Button onClick={() => navigate("/auth")}>Go to Login</Button>
            </div>
          </TerminalCard>
        </div>
      </TerminalLayout>
    );
  }

  if (isCheckingAdmin) return <TerminalLayout><div className="container mx-auto px-4 text-center py-20"><p className="text-muted-foreground">Verifying access...</p></div></TerminalLayout>;
  if (!isAdmin) {
    return (
      <TerminalLayout>
        <div className="container mx-auto px-4 text-center py-20">
          <TerminalCard>
            <div className="flex flex-col items-center gap-4">
              <Shield className="w-12 h-12 text-destructive" />
              <h2 className="text-xl font-bold">ADMIN ACCESS REQUIRED</h2>
              <Button onClick={() => navigate("/")} variant="outline">Return Home</Button>
            </div>
          </TerminalCard>
        </div>
      </TerminalLayout>
    );
  }

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">sudo ./tools-admin</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-4xl font-bold neon-text">{">"} Tools Admin</h1>
              <Button onClick={() => { setIsCreating(true); setEditingItem(null); resetForm(); }} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Tool
              </Button>
            </div>
          </div>

          {(isCreating || editingItem) && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <TerminalCard title={editingItem ? "edit_tool.sh" : "new_tool.sh"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Name</label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Category (dev/design/content)</label>
                      <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Description</label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">URL</label>
                      <Input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Sort Order</label>
                      <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}><Save className="w-4 h-4 mr-2" />{editingItem ? "Update" : "Create"}</Button>
                    <Button type="button" variant="outline" onClick={() => { setIsCreating(false); setEditingItem(null); resetForm(); }}><X className="w-4 h-4 mr-2" />Cancel</Button>
                  </div>
                </form>
              </TerminalCard>
            </motion.div>
          )}

          {isLoading ? (
            <TerminalCard className="animate-pulse"><div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded" />)}</div></TerminalCard>
          ) : items && items.length > 0 ? (
            <TerminalCard title="tools.list">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-border hover:border-primary transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-secondary">[{item.category?.toUpperCase()}]</span>
                        <h3 className="font-bold text-foreground truncate">{item.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} className="text-primary"><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(item.id); }} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </TerminalCard>
          ) : (
            <TerminalCard><div className="text-center py-8 text-muted-foreground"><p>// no tools yet</p></div></TerminalCard>
          )}
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default ToolsAdmin;
