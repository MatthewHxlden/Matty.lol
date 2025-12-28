import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import TypeWriter from "@/components/TypeWriter";
import GlitchText from "@/components/GlitchText";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Terminal, Zap, Coffee, Skull, Binary, LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as LucideIcons from "lucide-react";

const quickLinks = [
  { name: "blog", path: "/blog", icon: Terminal, desc: "thoughts & tutorials" },
  { name: "apps", path: "/apps", icon: Code, desc: "things i've built" },
  { name: "tools", path: "/tools", icon: Zap, desc: "useful utilities" },
  { name: "links", path: "/links", icon: Binary, desc: "my corner of the web" },
];

interface SiteProfile {
  id: string;
  name: string;
  role: string;
  status: string;
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

const getIconByName = (iconName: string): LucideIcon => {
  const icons: Record<string, LucideIcon> = {
    Coffee,
    Code,
    Skull,
    Zap,
    Terminal,
    Binary,
  };
  return icons[iconName] || Zap;
};

const Index = () => {
  const { data: siteProfile } = useQuery({
    queryKey: ["site-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_profile")
        .select("*")
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as SiteProfile | null;
    },
  });

  const { data: siteStats } = useQuery({
    queryKey: ["site-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_stats")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as SiteStat[];
    },
  });

  // Fallback values
  const name = siteProfile?.name || "Matty";
  const role = siteProfile?.role || "Developer / Creator / Digital Wanderer";
  const status = siteProfile?.status || "building cool stuff on the internet";

  const stats = siteStats && siteStats.length > 0 ? siteStats : [
    { id: "1", stat_key: "coffees", stat_value: "∞", stat_label: "coffees", icon_name: "Coffee", color_class: "text-accent", sort_order: 1 },
    { id: "2", stat_key: "projects", stat_value: "42+", stat_label: "projects", icon_name: "Code", color_class: "text-secondary", sort_order: 2 },
    { id: "3", stat_key: "bugs", stat_value: "9999", stat_label: "bugs fixed", icon_name: "Skull", color_class: "text-destructive", sort_order: 3 },
    { id: "4", stat_key: "ideas", stat_value: "loading...", stat_label: "ideas", icon_name: "Zap", color_class: "text-primary", sort_order: 4 },
  ];

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="min-h-[60vh] flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* ASCII Art Header */}
            <motion.pre
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-primary text-xs md:text-sm font-mono hidden md:block neon-text"
            >
{`
███╗   ███╗ █████╗ ████████╗████████╗██╗   ██╗
████╗ ████║██╔══██╗╚══██╔══╝╚══██╔══╝╚██╗ ██╔╝
██╔████╔██║███████║   ██║      ██║    ╚████╔╝ 
██║╚██╔╝██║██╔══██║   ██║      ██║     ╚██╔╝  
██║ ╚═╝ ██║██║  ██║   ██║      ██║      ██║   
╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝      ╚═╝      ╚═╝   
`}
            </motion.pre>

            {/* Mobile Title */}
            <div className="md:hidden">
              <GlitchText
                text="MATTY.LOL"
                className="text-4xl font-bold neon-text"
              />
            </div>

            {/* Terminal prompt intro */}
            <TerminalCard title="~/welcome.sh" delay={0.3}>
              <div className="space-y-4 text-sm md:text-base">
                <div className="flex items-start gap-2">
                  <span className="text-secondary shrink-0">$</span>
                  <TypeWriter
                    text="whoami"
                    delay={80}
                    className="text-foreground"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="pl-4 border-l-2 border-primary/30 space-y-2"
                >
                  <p className="text-muted-foreground">
                    <span className="text-accent">name:</span> {name}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-accent">role:</span> {role}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-accent">status:</span>{" "}
                    <span className="text-secondary">
                      {status}
                    </span>
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-secondary shrink-0">$</span>
                  <span className="text-foreground">cat mission.txt</span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2 }}
                  className="text-muted-foreground pl-4"
                >
                  Welcome to my corner of the web. This is where I share projects,
                  thoughts, and random experiments. Navigate using the links above
                  or explore below.
                </motion.p>
              </div>
            </TerminalCard>
          </motion.div>
        </section>

        {/* Quick Links Grid */}
        <section className="py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="text-secondary">$</span>
              <span className="text-foreground">ls -la ./directories</span>
              <span className="cursor-blink text-primary">_</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.7 + index * 0.1 }}
                  >
                    <Link to={link.path} className="group block">
                      <div className="border border-border p-4 transition-all duration-300 hover:border-primary hover:neon-border bg-card/30 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-accent group-hover:text-primary transition-colors" />
                            <div>
                              <span className="text-secondary">./</span>
                              <span className="text-foreground group-hover:neon-text transition-all">
                                {link.name}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground pl-8">
                          // {link.desc}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Status Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2 }}
          className="py-12"
        >
          <TerminalCard title="~/status.log" delay={3.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {stats.map((stat, index) => {
                const Icon = getIconByName(stat.icon_name);
                return (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 border border-border/50 bg-muted/20"
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color_class}`} />
                    <div className={`text-xl font-bold ${stat.color_class}`}>
                      {stat.stat_value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.stat_label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TerminalCard>
        </motion.section>
      </div>
    </TerminalLayout>
  );
};

export default Index;
