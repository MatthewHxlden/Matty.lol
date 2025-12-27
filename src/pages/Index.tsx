import { motion } from "framer-motion";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import TypeWriter from "@/components/TypeWriter";
import GlitchText from "@/components/GlitchText";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Terminal, Zap, Coffee, Skull, Binary } from "lucide-react";

const quickLinks = [
  { name: "blog", path: "/blog", icon: Terminal, desc: "thoughts & tutorials" },
  { name: "apps", path: "/apps", icon: Code, desc: "things i've built" },
  { name: "tools", path: "/tools", icon: Zap, desc: "useful utilities" },
  { name: "links", path: "/links", icon: Binary, desc: "my corner of the web" },
];

const Index = () => {
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
                    <span className="text-accent">name:</span> Matty
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-accent">role:</span> Developer / Creator / Digital Wanderer
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-accent">status:</span>{" "}
                    <span className="text-secondary">
                      building cool stuff on the internet
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
              {[
                { icon: Coffee, label: "coffees", value: "∞", color: "text-accent" },
                { icon: Code, label: "projects", value: "42+", color: "text-secondary" },
                { icon: Skull, label: "bugs fixed", value: "9999", color: "text-destructive" },
                { icon: Zap, label: "ideas", value: "loading...", color: "text-primary" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 border border-border/50 bg-muted/20"
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                    <div className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
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
