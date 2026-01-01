import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CryptoPrices from "./CryptoPrices";

const TerminalFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="border-t border-border bg-background/90 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-secondary">$</span>
            <span>echo "© {currentYear} matty.lol"</span>
            <span className="cursor-blink text-primary">_</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-muted-foreground/50">[</span>
            <Link to="/now" className="text-muted-foreground hover:text-primary transition-colors">now</Link>
            <span className="text-muted-foreground/50">|</span>
            <Link to="/links" className="text-muted-foreground hover:text-primary transition-colors">links</Link>
            <span className="text-muted-foreground/50">]</span>
          </div>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-muted-foreground/50">[</span>
            <span className="text-secondary">STATUS:</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-secondary">ONLINE</span>
            </span>
            <span className="text-muted-foreground/50">]</span>
          </motion.div>

          <CryptoPrices />

          <div className="text-muted-foreground/50">
            <span>// built with </span>
            <span className="text-accent">♥</span>
            <span> and caffeine</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default TerminalFooter;
