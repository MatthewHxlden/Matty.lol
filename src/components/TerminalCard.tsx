import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TerminalCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  promptText?: string;
  showPrompt?: boolean;
}

const TerminalCard = ({
  title,
  children,
  className = "",
  delay = 0,
  promptText = "ls -la ./directories",
  showPrompt = true,
}: TerminalCardProps) => {
  return (
    <div>
      {showPrompt && (
        <div className="flex items-center gap-2 mb-3 text-xs md:text-sm font-mono">
          <span className="text-secondary">$</span>
          <span className="text-foreground">{promptText}</span>
          <span className="cursor-blink text-primary">_</span>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className={`border border-border bg-card/50 backdrop-blur-sm neon-border ${className}`}
      >
        {title && (
          <div className="border-b border-border px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-destructive/80" />
              <span className="w-3 h-3 rounded-full bg-accent/80" />
              <span className="w-3 h-3 rounded-full bg-secondary/80" />
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              {title}
            </span>
          </div>
        )}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default TerminalCard;
