import { motion } from "framer-motion";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { ExternalLink, Github, Star, Code } from "lucide-react";

const apps = [
  {
    name: "NeonTask",
    description: "A cyberpunk-themed task manager with terminal vibes",
    tech: ["React", "TypeScript", "Tailwind"],
    status: "live",
    github: "#",
    demo: "#",
    stars: 42,
  },
  {
    name: "ByteBuddy",
    description: "AI-powered coding companion for the terminal",
    tech: ["Python", "OpenAI", "Click"],
    status: "beta",
    github: "#",
    demo: "#",
    stars: 128,
  },
  {
    name: "GlitchGen",
    description: "Generate glitch art from any image",
    tech: ["JavaScript", "Canvas API", "WebGL"],
    status: "live",
    github: "#",
    demo: "#",
    stars: 89,
  },
  {
    name: "TerminalFolio",
    description: "Portfolio template with terminal aesthetics",
    tech: ["Next.js", "Framer Motion", "MDX"],
    status: "dev",
    github: "#",
    demo: null,
    stars: 256,
  },
];

const statusColors: Record<string, string> = {
  live: "text-secondary",
  beta: "text-accent",
  dev: "text-muted-foreground",
};

const Apps = () => {
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
              <span className="text-foreground">ls -la ./apps</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">
              {">"} Apps
            </h1>
            <p className="text-muted-foreground">
              // things i've built and shipped
            </p>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apps.map((app, index) => (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TerminalCard title={`~/apps/${app.name.toLowerCase()}`} className="h-full">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {app.name}
                        </h3>
                        <span className={`text-xs ${statusColors[app.status]}`}>
                          [{app.status.toUpperCase()}]
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-accent text-sm">
                        <Star className="w-4 h-4 fill-current" />
                        {app.stars}
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm">
                      {app.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {app.tech.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2 py-1 border border-border text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-2">
                      <a
                        href={app.github}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary hover-glow transition-all"
                      >
                        <Github className="w-4 h-4" />
                        <span>source</span>
                      </a>
                      {app.demo && (
                        <a
                          href={app.demo}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-secondary transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                </TerminalCard>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-8"
          >
            <TerminalCard className="inline-block">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Code className="w-4 h-4 text-secondary" />
                <span>More projects on</span>
                <a href="#" className="text-primary hover:neon-text transition-all">
                  GitHub
                </a>
              </div>
            </TerminalCard>
          </motion.div>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Apps;
