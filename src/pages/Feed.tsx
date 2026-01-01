import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { supabase } from "@/integrations/supabase/client";

type ActivityFeedRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  published: boolean | null;
};

const Feed = () => {
  const { data: items } = useQuery({
    queryKey: ["activity-feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_feed" as any)
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as ActivityFeedRow[];
    },
  });

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">tail -f feed.log</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">{">"} feed</h1>
            <p className="text-muted-foreground">// site activity, updates, and logs</p>
          </div>

          <TerminalCard title="~/feed.log" promptText="tail -n 100 feed.log">
            <div className="space-y-4">
              {(items || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">no entries yet.</div>
              ) : (
                (items || []).map((item) => (
                  <div key={item.id} className="border border-border/50 bg-muted/10 p-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="text-foreground font-mono">{item.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {new Date(item.created_at).toLocaleString()}
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

export default Feed;
