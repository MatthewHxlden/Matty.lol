import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { supabase } from "@/integrations/supabase/client";

type NowPageRow = {
  id: string;
  title: string;
  content: string;
  updated_at: string;
};

const Now = () => {
  const { data } = useQuery({
    queryKey: ["now-page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("now_page")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as NowPageRow | null;
    },
  });

  const title = data?.title || "now";
  const content = data?.content || "building, learning, shipping.";

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">cat now.txt</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">{">"} {title}</h1>
            <p className="text-muted-foreground">// what i'm focused on right now</p>
          </div>

          <TerminalCard title="~/now.txt" promptText="cat now.txt">
            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {content}
            </div>
            {data?.updated_at && (
              <div className="mt-4 text-xs text-muted-foreground font-mono">
                last_update: <span className="text-foreground">{new Date(data.updated_at).toLocaleString()}</span>
              </div>
            )}
          </TerminalCard>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Now;
