import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, LogOut, User, Settings, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "home", path: "/" },
  { name: "blog", path: "/blog" },
  { name: "apps", path: "/apps" },
  { name: "tools", path: "/tools" },
  { name: "links", path: "/links" },
  { name: "contact", path: "/contact" },
];

const TerminalHeader = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (error) return false;
      return data as boolean;
    },
    enabled: !!user,
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <span className="text-secondary">$</span>
              <span
                className="glitch text-2xl font-bold neon-text"
                data-text="matty.lol"
              >
                matty.lol
              </span>
              <span className="cursor-blink text-primary">_</span>
            </motion.div>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center gap-1 md:gap-2">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={link.path}
                  className={`group relative px-3 py-1 text-sm transition-all duration-300 ${
                    location.pathname === link.path
                      ? "text-primary neon-text"
                      : "text-muted-foreground hover-glow"
                  }`}
                >
                  <span className="text-secondary opacity-50 group-hover:opacity-100 transition-opacity">
                    ./
                  </span>
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.span
                      layoutId="activeTab"
                      className="absolute inset-0 border border-primary/50 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}

            {/* Auth button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navLinks.length * 0.1 }}
              className="ml-2"
            >
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1 text-sm text-accent hover:text-primary transition-all hover-glow">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">account</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border-border">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin/site" className="flex items-center gap-2 cursor-pointer">
                            <Shield className="w-4 h-4" />
                            Site Admin
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/blog" className="flex items-center gap-2 cursor-pointer">
                            <Shield className="w-4 h-4" />
                            Blog Admin
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/apps" className="flex items-center gap-2 cursor-pointer">
                            <Shield className="w-4 h-4" />
                            Apps Admin
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/tools" className="flex items-center gap-2 cursor-pointer">
                            <Shield className="w-4 h-4" />
                            Tools Admin
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/links" className="flex items-center gap-2 cursor-pointer">
                            <Shield className="w-4 h-4" />
                            Links Admin
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/contact" className="flex items-center gap-2 cursor-pointer">
                            <Shield className="w-4 h-4" />
                            Contact Admin
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/auth"
                  className={`flex items-center gap-1 px-3 py-1 text-sm transition-all ${
                    location.pathname === "/auth"
                      ? "text-primary neon-text"
                      : "text-secondary hover:text-primary hover-glow"
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">login</span>
                </Link>
              )}
            </motion.div>
          </nav>
        </div>

        {/* Terminal line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-4 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </div>
    </motion.header>
  );
};

export default TerminalHeader;
