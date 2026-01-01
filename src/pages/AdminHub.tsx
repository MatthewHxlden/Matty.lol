import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";

const AdminHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (error) return false;
      return data as boolean;
    },
    enabled: !!user,
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

  const links = [
    { label: "site", path: "/admin/site", desc: "homepage profile, mission, stats" },
    { label: "now", path: "/admin/now", desc: "edit /now page content" },
    { label: "feed", path: "/admin/feed", desc: "post updates to /feed" },
    { label: "blog", path: "/admin/blog", desc: "posts, images, tags" },
    { label: "apps", path: "/admin/apps", desc: "projects list" },
    { label: "tools", path: "/admin/tools", desc: "tool catalog" },
    { label: "links", path: "/admin/links", desc: "social links" },
    { label: "contact", path: "/admin/contact", desc: "contact page" },
    { label: "trades", path: "/admin/trades", desc: "trades page settings" },
    { label: "analytics", path: "/admin/analytics", desc: "traffic / events" },
  ];

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">sudo ./admin</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">{">"} Site Admin</h1>
            <p className="text-muted-foreground">// pick a module</p>
          </div>

          <TerminalCard title="~/admin/modules.list" promptText="ls -la ./admin">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {links.map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  className="p-4 border border-border/50 bg-muted/20 hover:border-primary/60 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-mono">./{l.label}</span>
                    <span className="text-xs text-muted-foreground">open</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{l.desc}</div>
                </Link>
              ))}
            </div>
          </TerminalCard>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default AdminHub;
