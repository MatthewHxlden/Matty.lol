import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import TerminalLayout from "@/components/TerminalLayout";
import GlitchText from "@/components/GlitchText";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4 min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <GlitchText
            text="404"
            className="text-8xl md:text-9xl font-bold text-destructive"
          />

          <div className="space-y-2">
            <p className="text-xl text-foreground">
              <span className="text-secondary">$</span> Error: Page not found
            </p>
            <p className="text-muted-foreground">
              // The requested resource does not exist
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/"
              className="inline-block border border-primary px-6 py-3 text-primary hover:bg-primary hover:text-primary-foreground transition-all hover-glow"
            >
              <span className="text-secondary">./</span>return_home
            </Link>
          </motion.div>

          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-muted-foreground/50 mt-8"
          >
{`
  _  _    ___  _  _   
 | || |  / _ \\| || |  
 | || |_| | | | || |_ 
 |__   _| |_| |__   _|
    |_|  \\___/   |_|  
`}
          </motion.pre>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default NotFound;
