import { motion } from "framer-motion";
import { useState } from "react";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { changelog } from "@/data/changelog";

const Changelog = () => {
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const defaultVisibleCount = 7;

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">cat changelog.log</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">{">"} Changelog</h1>
            <p className="text-muted-foreground">// updates, fixes, and new features</p>
          </div>

          <TerminalCard title="~/changelog.log" promptText="tail -n 50 changelog.log">
            <div className="space-y-4">
              {changelog.map((entry) => {
                const key = `${entry.date}-${entry.title}`;
                const expanded = expandedKeys[key] === true;
                const visibleItems = expanded ? entry.items : entry.items.slice(0, defaultVisibleCount);
                const canExpand = entry.items.length > defaultVisibleCount;

                return (
                  <div key={key} className="p-4 border border-border/50 bg-muted/20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="text-foreground font-mono text-sm md:text-base">{entry.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">{entry.date}</div>
                    </div>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] px-2 py-0.5 border border-border text-muted-foreground font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {visibleItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-secondary font-mono">-</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {canExpand && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedKeys((prev) => ({
                              ...prev,
                              [key]: !(prev[key] === true),
                            }))
                          }
                          className="text-xs font-mono text-primary hover:text-foreground transition-colors"
                        >
                          {expanded ? "View less" : "See all changes"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TerminalCard>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Changelog;
