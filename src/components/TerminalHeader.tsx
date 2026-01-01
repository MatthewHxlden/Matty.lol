import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRainTheme } from "@/hooks/useRainTheme";
import SearchModal from "@/components/SearchModal";
import TerminalCommand from "@/components/TerminalCommand";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, LogOut, User, Settings, Shield, Search, CloudRain, Github, Rss, CloudSun, Activity } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
  { name: "trades", path: "/trades" },
  { name: "contact", path: "/contact" },
];

const TerminalHeader = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { rainEnabled, setRainEnabled } = useRainTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

  const { data: weatherStatus } = useQuery({
    queryKey: ["status", "weather"],
    queryFn: async () => {
      const res = await fetch("/api/status/weather");
      if (!res.ok) throw new Error(`weather status error (${res.status})`);
      return (await res.json()) as { ok?: boolean; message?: string };
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: githubStatus } = useQuery({
    queryKey: ["status", "github"],
    queryFn: async () => {
      const res = await fetch("/api/status/github");
      if (!res.ok) throw new Error(`github status error (${res.status})`);
      return (await res.json()) as { ok?: boolean; message?: string };
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: redditStatus } = useQuery({
    queryKey: ["status", "reddit"],
    queryFn: async () => {
      const res = await fetch("/api/status/reddit");
      if (!res.ok) throw new Error(`reddit status error (${res.status})`);
      return (await res.json()) as { ok?: boolean; message?: string; link?: string };
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const tickerMessages = [
    weatherStatus?.message || "external conditions: loading weather...",
    githubStatus?.message || "github: checking latest activity...",
    redditStatus?.message || "reddit: fetching last post...",
    "system: all signals green.",
  ];

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && e.shiftKey) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && !e.shiftKey) {
        e.preventDefault();
        setTerminalOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "`") {
        e.preventDefault();
        setTerminalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Logo */}
            <Link to="/" className="group">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                <span className="text-secondary">$</span>
                <span className="glitch text-2xl font-bold neon-text" data-text="matty.lol">
                  matty.lol
                </span>
                <span className="cursor-blink text-primary">_</span>
              </motion.div>
            </Link>

            {/* Main nav (left beside logo) */}
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
                    <span className="text-secondary opacity-50 group-hover:opacity-100 transition-opacity">./</span>
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
            </nav>
          </div>

          {/* Right-side controls */}
          <div className="flex items-center justify-end gap-2">
            {/* Search & Terminal buttons */}
            <button
              onClick={() => setSearchOpen(true)}
              className="px-2 py-1 text-muted-foreground hover:text-primary transition-all"
              title="Search (Ctrl/⌘+Shift+K)"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTerminalOpen(true)}
              className="px-2 py-1 text-muted-foreground hover:text-secondary transition-all font-mono"
              title="Command Terminal (Ctrl/⌘+K)"
            >
              <span className="text-sm leading-none">&gt;_</span>
            </button>

            {/* Account dropdown */}
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
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="w-4 h-4" />
                          Site Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        Edit Profile
                      </Link>
                    </DropdownMenuItem>
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

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (navLinks.length + 1) * 0.1 }}
              className="ml-2"
            >
              <Link
                to="/changelog"
                className="relative inline-flex items-center gap-2 px-3 py-1 text-sm border border-primary/60 bg-card/30 backdrop-blur-sm text-primary hover:text-foreground hover:bg-primary/10 transition-all shine-box"
              >
                <span>changelog</span>
                <span className="text-[10px] px-1.5 py-0.5 border border-accent/50 text-accent">NEW</span>
              </Link>
            </motion.div>

            {/* Theme toggle (farthest right) */}
            <div className="ml-2 flex items-center gap-2 px-2 py-1 border border-border/50 bg-card/20">
              <CloudRain className="w-4 h-4 text-primary" />
              <Switch checked={rainEnabled} onCheckedChange={setRainEnabled} />
            </div>
          </div>
        </div>

        {/* Terminal line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-4 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        />

        <div className="mt-3 border border-border/50 bg-card/20 overflow-hidden">
          <div className="py-1 text-xs font-mono text-muted-foreground whitespace-nowrap">
            <div className="marquee">
              {[...tickerMessages, ...tickerMessages].map((msg, idx) => (
                <span key={idx} className="px-4">
                  <span className="inline-flex items-center gap-2">
                    {msg.startsWith("github:") ? (
                      <Github className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : msg.startsWith("reddit:") ? (
                      <Rss className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : msg.startsWith("external conditions:") ? (
                      <CloudSun className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : msg.startsWith("system:") ? (
                      <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span>{msg}</span>
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <TerminalCommand isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
    </motion.header>
  );
};

export default TerminalHeader;
