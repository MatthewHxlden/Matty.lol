import { motion } from "framer-motion";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Wrench, ExternalLink, Sparkles } from "lucide-react";

const tools = [
  {
    name: "Color Converter",
    description: "Convert between HEX, RGB, HSL and more",
    category: "design",
    link: "#",
  },
  {
    name: "JSON Formatter",
    description: "Pretty print and validate JSON data",
    category: "dev",
    link: "#",
  },
  {
    name: "Base64 Encoder",
    description: "Encode and decode Base64 strings",
    category: "dev",
    link: "#",
  },
  {
    name: "Lorem Generator",
    description: "Generate placeholder text with style",
    category: "content",
    link: "#",
  },
  {
    name: "Regex Tester",
    description: "Test and debug regular expressions",
    category: "dev",
    link: "#",
  },
  {
    name: "CSS Gradient Maker",
    description: "Create beautiful CSS gradients",
    category: "design",
    link: "#",
  },
];

const categoryColors: Record<string, string> = {
  dev: "border-secondary text-secondary",
  design: "border-accent text-accent",
  content: "border-primary text-primary",
};

const Tools = () => {
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
              <span className="text-foreground">./tools --list</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">
              {">"} Tools
            </h1>
            <p className="text-muted-foreground">
              // utilities to make your life easier
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, index) => (
              <motion.a
                key={tool.name}
                href={tool.link}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <div className="border border-border p-4 h-full transition-all duration-300 hover:border-primary hover:neon-border bg-card/30 backdrop-blur-sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {tool.description}
                    </p>

                    <span
                      className={`inline-block text-xs px-2 py-1 border ${categoryColors[tool.category]}`}
                    >
                      {tool.category}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Coming Soon */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <TerminalCard className="text-center">
              <div className="flex flex-col items-center gap-2 py-4">
                <Sparkles className="w-8 h-8 text-accent animate-float" />
                <p className="text-muted-foreground">
                  <span className="text-secondary">// </span>
                  More tools in development...
                </p>
                <p className="text-xs text-muted-foreground/50">
                  Got a tool idea? Let me know!
                </p>
              </div>
            </TerminalCard>
          </motion.div>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Tools;
