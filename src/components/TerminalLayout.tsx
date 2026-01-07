import { ReactNode } from "react";
import { motion } from "framer-motion";
import TerminalHeader from "./TerminalHeader";
import TerminalFooter from "./TerminalFooter";
import RainBackground from "@/components/RainBackground";
import { useAmbientTheme } from "@/hooks/useAmbientTheme";

interface TerminalLayoutProps {
  children: ReactNode;
}

const TerminalLayout = ({ children }: TerminalLayoutProps) => {
  const { ambientEnabled } = useAmbientTheme();

  return (
    <div className="min-h-screen flex flex-col matrix-bg crt-flicker">
      {/* Scanlines overlay */}
      {!ambientEnabled ? null : <div className="scanlines" />}
      
      {/* Grid background */}
      {!ambientEnabled ? null : <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />}

      <RainBackground />

      <TerminalHeader />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 pt-40 pb-8 relative z-10"
      >
        {children}
      </motion.main>

      <TerminalFooter />
    </div>
  );
};

export default TerminalLayout;
