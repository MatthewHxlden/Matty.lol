import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Save, Shield, Plus, X } from "lucide-react";

interface ContactInfo {
  id: string;
  email: string;
  location: string;
  response_time: string;
  discussion_topics: string[];
}

const ContactAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: "",
    location: "",
    response_time: "",
    discussion_topics: [] as string[],
  });
  const [newTopic, setNewTopic] = useState("");

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

  const { data: contactInfo, isLoading } = useQuery({
    queryKey: ["contact-info-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as ContactInfo | null;
    },
    enabled: isAdmin === true,
  });

  useEffect(() => {
    if (contactInfo) {
      setFormData({
        email: contactInfo.email,
        location: contactInfo.location,
        response_time: contactInfo.response_time,
        discussion_topics: contactInfo.discussion_topics || [],
      });
    }
  }, [contactInfo]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (contactInfo) {
        const { error } = await supabase
          .from("contact_info")
          .update(data)
          .eq("id", contactInfo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("contact_info").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-info-admin"] });
      queryClient.invalidateQueries({ queryKey: ["contact-info"] });
      toast({ title: "SAVED", description: "Contact info updated." });
    },
    onError: (error: Error) => {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setFormData({
        ...formData,
        discussion_topics: [...formData.discussion_topics, newTopic.trim()],
      });
      setNewTopic("");
    }
  };

  const removeTopic = (index: number) => {
    setFormData({
      ...formData,
      discussion_topics: formData.discussion_topics.filter((_, i) => i !== index),
    });
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
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">sudo ./contact-admin</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">{">"} Contact Admin</h1>
          </div>

          {isLoading ? (
            <TerminalCard className="animate-pulse">
              <div className="h-40 bg-muted rounded" />
            </TerminalCard>
          ) : (
            <TerminalCard title="contact_config.sh">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="hello@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="The Internet"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Response Time</label>
                  <Input
                    value={formData.response_time}
                    onChange={(e) => setFormData({ ...formData, response_time: e.target.value })}
                    placeholder="~24-48 hours"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Discussion Topics</label>
                  <div className="flex gap-2">
                    <Input
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Add a topic..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTopic();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addTopic}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1 mt-2">
                    {formData.discussion_topics.map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border border-border"
                      >
                        <span className="text-sm text-foreground">{topic}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTopic(index)}
                          className="text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </form>
            </TerminalCard>
          )}
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default ContactAdmin;
