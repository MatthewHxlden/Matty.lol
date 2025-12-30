import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Shield, FileText, Code, Wrench, Link2, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["hsl(180, 100%, 50%)", "hsl(120, 100%, 50%)", "hsl(300, 100%, 60%)", "hsl(0, 100%, 50%)"];

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  // Fetch counts
  const { data: blogCount } = useQuery({
    queryKey: ["analytics-blog-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("blog_posts")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: isAdmin === true,
  });

  const { data: publishedBlogCount } = useQuery({
    queryKey: ["analytics-published-blog-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("blog_posts")
        .select("*", { count: "exact", head: true })
        .eq("published", true);
      if (error) throw error;
      return count || 0;
    },
    enabled: isAdmin === true,
  });

  const { data: appsCount } = useQuery({
    queryKey: ["analytics-apps-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("apps")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: isAdmin === true,
  });

  const { data: toolsCount } = useQuery({
    queryKey: ["analytics-tools-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("tools")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: isAdmin === true,
  });

  const { data: linksCount } = useQuery({
    queryKey: ["analytics-links-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("links")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: isAdmin === true,
  });

  const { data: recentPosts } = useQuery({
    queryKey: ["analytics-recent-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, published, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // Not logged in
  if (!user) {
    return (
      <TerminalLayout>
        <div className="container mx-auto px-4 text-center py-20">
          <TerminalCard>
            <div className="flex flex-col items-center gap-4">
              <Shield className="w-12 h-12 text-destructive" />
              <h2 className="text-xl font-bold text-foreground">ACCESS DENIED</h2>
              <p className="text-muted-foreground">Please login to access analytics</p>
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

  const contentData = [
    { name: "Blog Posts", value: blogCount || 0, icon: FileText },
    { name: "Apps", value: appsCount || 0, icon: Code },
    { name: "Tools", value: toolsCount || 0, icon: Wrench },
    { name: "Links", value: linksCount || 0, icon: Link2 },
  ];

  const pieData = [
    { name: "Published", value: publishedBlogCount || 0 },
    { name: "Drafts", value: (blogCount || 0) - (publishedBlogCount || 0) },
  ];

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
              <span className="text-foreground">./analytics --dashboard</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">
              {">"} Analytics Dashboard
            </h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contentData.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TerminalCard>
                    <div className="flex items-center gap-3">
                      <Icon
                        className="w-8 h-8"
                        style={{ color: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <div
                          className="text-2xl font-bold"
                          style={{ color: COLORS[index % COLORS.length] }}
                        >
                          {item.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </TerminalCard>
                </motion.div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <TerminalCard title="content_distribution.chart">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(180 100% 25%)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "hsl(180 50% 40%)", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(180 100% 25%)" }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(180 50% 40%)", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(180 100% 25%)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(220 20% 6%)",
                        border: "1px solid hsl(180 100% 50%)",
                        borderRadius: 0,
                      }}
                      labelStyle={{ color: "hsl(180 100% 50%)" }}
                    />
                    <Bar dataKey="value" fill="hsl(180 100% 50%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TerminalCard>

            {/* Pie Chart */}
            <TerminalCard title="blog_status.chart">
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "hsl(120 100% 50%)" : "hsl(180 50% 40%)"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(220 20% 6%)",
                        border: "1px solid hsl(180 100% 50%)",
                        borderRadius: 0,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TerminalCard>
          </div>

          {/* Recent Posts */}
          <TerminalCard title="recent_activity.log">
            <div className="space-y-3">
              {recentPosts?.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{post.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-0.5 border ${
                        post.published
                          ? "border-secondary text-secondary"
                          : "border-muted-foreground text-muted-foreground"
                      }`}
                    >
                      {post.published ? "published" : "draft"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!recentPosts || recentPosts.length === 0) && (
                <p className="text-muted-foreground text-center py-4">
                  No recent posts
                </p>
              )}
            </div>
          </TerminalCard>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Analytics;
