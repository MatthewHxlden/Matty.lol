import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRainTheme } from "@/hooks/useRainTheme";
import { useAmbientTheme } from "@/hooks/useAmbientTheme";
import { usePulseTheme } from "@/hooks/usePulseTheme";
import SearchModal from "@/components/SearchModal";
import TerminalCommand from "@/components/TerminalCommand";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { supabase } from "@/integrations/supabase/client";
import {
  LogIn,
  LogOut,
  User,
  Settings,
  Shield,
  Search,
  CloudRain,
  Github,
  Rss,
  CloudSun,
  Activity,
  Sparkles,
  Grid,
} from "lucide-react";
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
  const { ambientEnabled, setAmbientEnabled } = useAmbientTheme();
  const { pulseEnabled, setPulseEnabled } = usePulseTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const tickerPanelRef = useRef<HTMLDivElement | null>(null);
  const [activeTicker, setActiveTicker] = useState<{ message: string; link: string | null } | null>(null);

  useEffect(() => {
    if (!headerRef.current) return;

    const el = headerRef.current;
    const read = () => setHeaderHeight(el.getBoundingClientRect().height);
    read();

    const ro = new ResizeObserver(read);
    ro.observe(el);
    window.addEventListener("resize", read);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", read);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tickerPanelRef.current && !tickerPanelRef.current.contains(e.target as Node)) {
        setActiveTicker(null);
      }
    };
    if (activeTicker) {
      window.addEventListener("mousedown", handleClickOutside);
      return () => window.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeTicker]);

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
      return (await res.json()) as { ok?: boolean; message?: string; link?: string };
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
    { message: weatherStatus?.message || "external conditions: loading weather...", link: null },
    { message: githubStatus?.message || "github: checking latest activity...", link: githubStatus?.link || null },
    { message: redditStatus?.message || "reddit: fetching last post...", link: redditStatus?.link || null },
    { message: "system: all signals green.", link: null },
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
      ref={headerRef}
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
                <img 
                  src="/logo.png" 
                  alt="matty.lol" 
                  className="h-8 w-auto"
                />
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
                        : "text-muted-foreground hover:shine-text"
                    }`}
                  >
                    <span className="text-secondary opacity-50 group-hover:opacity-100 transition-opacity">./</span>
                    <span className="relative">
                      {link.name}
                      {location.pathname === link.path && (
                        <motion.span
                          layoutId="activeTab"
                          className="absolute inset-0 border border-primary/50 -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </span>
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
                  <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1 text-sm text-accent hover:text-primary transition-all hover:shine-text">
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
                      : "text-secondary hover:text-primary hover:shine-text"
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

            {/* Theme controls (farthest right) */}
            <div className="ml-2 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-2 px-3 py-1 text-sm border border-border/60 bg-card/40 hover:bg-card/60 transition-all">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline">effects</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-background border border-border/70 shadow-xl">
                  <div className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">visual toggles</div>
                  <DropdownMenuItem className="flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground">Theme</span>
                    <ThemeSwitcher />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <CloudRain className="w-4 h-4 text-primary" />
                      <span>Rain</span>
                    </div>
                    <Switch checked={rainEnabled} onCheckedChange={setRainEnabled} />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Grid className="w-4 h-4 text-primary" />
                      <span>Ambient grid</span>
                    </div>
                    <Switch checked={ambientEnabled} onCheckedChange={setAmbientEnabled} />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Pulse glow</span>
                    </div>
                    <Switch checked={pulseEnabled} onCheckedChange={setPulseEnabled} />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
      </div>

      <div className="border-t border-border/50 bg-card/20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="py-1 text-xs font-mono text-muted-foreground whitespace-nowrap">
            <div className="marquee">
              {[...tickerMessages, ...tickerMessages].map((tickerItem, idx) => (
                <span key={idx} className="px-4">
                  <button
                    className="inline-flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setActiveTicker(tickerItem)}
                    title="Click to expand"
                  >
                    {tickerItem.message.startsWith("github:") ? (
                      <Github className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : tickerItem.message.startsWith("reddit:") ? (
                      <Rss className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : tickerItem.message.startsWith("external conditions:") ? (
                      <CloudSun className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : tickerItem.message.startsWith("system:") ? (
                      <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    {(() => {
                      const [prefix, ...rest] = tickerItem.message.split(":");
                      const body = rest.join(":").trim();
                      return (
                        <>
                          <span className="text-muted-foreground">{prefix}:</span>{" "}
                          <span className="text-primary font-semibold">{body}</span>
                        </>
                      );
                    })()}
                  </button>
                </span>
              ))}
            </div>

            {activeTicker && (
              <div
                ref={tickerPanelRef}
                className="mt-2 rounded-md border border-border/50 bg-card/60 p-3 text-xs text-foreground"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-primary">Details</div>
                  <button
                    onClick={() => setActiveTicker(null)}
                    className="text-muted-foreground hover:text-primary text-xs"
                    aria-label="Close ticker details"
                  >
                    close
                  </button>
                </div>
                <div className="mt-2 text-sm text-foreground">
                  {activeTicker.message}
                </div>
                {activeTicker.link && (
                  <div className="mt-2">
                    <a
                      href={activeTicker.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Open link
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <TerminalCommand isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} topOffset={headerHeight} />
    </motion.header>
  );
};

export default TerminalHeader;
