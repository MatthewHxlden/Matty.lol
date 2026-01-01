import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import TypeWriter from "@/components/TypeWriter";
import GlitchText from "@/components/GlitchText";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Terminal, Zap, Coffee, Skull, Binary, ExternalLink, LucideIcon, ChartLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as LucideIcons from "lucide-react";

const quickLinks = [
  { name: "blog", path: "/blog", icon: Terminal, desc: "thoughts & tutorials" },
  { name: "apps", path: "/apps", icon: Code, desc: "things i've built" },
  { name: "tools", path: "/tools", icon: Zap, desc: "useful utilities" },
  { name: "trades", path: "/trades", icon: ChartLine, desc: "perps session tracker" },
  { name: "now", path: "/now", icon: Coffee, desc: "what i'm up to" },
  { name: "links", path: "/links", icon: Binary, desc: "my corner of the web" },
];

interface SiteProfile {
  id: string;
  name: string;
  role: string;
  status: string;
  mission?: string;
}

interface SiteStat {
  id: string;
  stat_key: string;
  stat_value: string;
  stat_label: string;
  icon_name: string;
  color_class: string;
  sort_order: number;
}

interface JupiterPortfolioElement {
  type: string;
  label?: string;
  platformId?: string;
  value?: number;
  data?: Record<string, unknown>;
}

interface JupiterPortfolioPositionsResponse {
  elements?: JupiterPortfolioElement[];
  tokenInfo?: Record<string, Record<string, { symbol?: string; name?: string; logoURI?: string }>>;
}

type MarketPricesResponse = {
  bitcoin?: { usd?: number };
  ethereum?: { usd?: number };
  solana?: { usd?: number };
};

type FearGreedResponse = {
  data?: Array<{ value?: string; value_classification?: string; timestamp?: string }>;
};

type JupiterPerpsPosition = {
  address: string;
  side: string;
  leverage?: number;
  liquidationPrice?: number;
  collateralValue?: number;
  size?: number;
  sizeValue?: number;
  pnlValue?: number;
  value?: number;
  markPrice?: number;
  entryPrice?: number;
};

type JupiterActivityEntry = {
  text: string;
  address?: string;
};

const formatUsd = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatPrice = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });

const getIconByName = (iconName: string): LucideIcon => {
  const icons: Record<string, LucideIcon> = {
    Coffee,
    Code,
    Skull,
    Zap,
    Terminal,
    Binary,
  };
  return icons[iconName] || Zap;
};

const Index = () => {
  const prevMarkByMintRef = useRef<Record<string, number>>({});
  const prevSignalByKeyRef = useRef<Record<string, number>>({});
  const prevPerpsSnapshotRef = useRef<Record<string, { sizeValue?: number; collateralValue?: number }>>({});
  const [activityLog, setActivityLog] = useState<JupiterActivityEntry[]>([]);
  const [activeActivity, setActiveActivity] = useState<JupiterActivityEntry | null>(null);

  const { data: siteProfile } = useQuery({
    queryKey: ["site-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_profile")
        .select("*")
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as SiteProfile | null;
    },
  });

  const missionText =
    siteProfile?.mission ||
    "Welcome to my corner of the web. This is where I share projects, thoughts, and random experiments. Navigate using the links above or explore below.";

  const { data: siteStats } = useQuery({
    queryKey: ["site-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_stats")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as SiteStat[];
    },
  });

  const {
    data: jupiterPositions,
    isLoading: jupiterPositionsLoading,
    isError: jupiterPositionsIsError,
    error: jupiterPositionsError,
  } = useQuery({
    queryKey: ["jupiter-portfolio-positions"],
    queryFn: async () => {
      const res = await fetch("/api/jupiter-positions");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to fetch positions (${res.status})`);
      }
      return (await res.json()) as JupiterPortfolioPositionsResponse;
    },
    refetchInterval: 30000,
  });

  const { data: marketPrices } = useQuery({
    queryKey: ["market-prices"],
    queryFn: async () => {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd"
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to fetch market prices (${res.status})`);
      }
      return (await res.json()) as MarketPricesResponse;
    },
    refetchInterval: 30000,
  });

  const { data: fearGreed } = useQuery({
    queryKey: ["fear-greed"],
    queryFn: async () => {
      const res = await fetch("https://api.alternative.me/fng/?limit=1&format=json");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to fetch fear/greed (${res.status})`);
      }
      return (await res.json()) as FearGreedResponse;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    const tokenInfoSolana = jupiterPositions?.tokenInfo?.solana || {};
    const leverageElements = (jupiterPositions?.elements || []).filter((e) => e.type === "leverage");
    const positions: JupiterPerpsPosition[] = leverageElements.flatMap((el) => {
      const data = el.data as any;
      const isolatedPositions = data?.isolated?.positions;
      return Array.isArray(isolatedPositions) ? (isolatedPositions as JupiterPerpsPosition[]) : [];
    });

    const next: Record<string, number> = { ...prevMarkByMintRef.current };
    for (const pos of positions) {
      if (typeof pos.markPrice === "number") {
        next[pos.address] = pos.markPrice;
      }
    }
    prevMarkByMintRef.current = next;

    const prevSnapshot = prevPerpsSnapshotRef.current;
    const nextSnapshot: Record<string, { sizeValue?: number; collateralValue?: number }> = {};
    const events: JupiterActivityEntry[] = [];

    for (const pos of positions) {
      nextSnapshot[pos.address] = {
        sizeValue: typeof pos.sizeValue === "number" ? pos.sizeValue : undefined,
        collateralValue: typeof pos.collateralValue === "number" ? pos.collateralValue : undefined,
      };

      const prev = prevSnapshot[pos.address];
      if (!prev) continue;

      const symbol = tokenInfoSolana?.[pos.address]?.symbol || pos.address.slice(0, 4);
      const prevColl = prev.collateralValue;
      const nextColl = nextSnapshot[pos.address].collateralValue;
      if (typeof prevColl === "number" && typeof nextColl === "number") {
        const delta = nextColl - prevColl;
        if (Math.abs(delta) >= 0.01) {
          const amt = `$${formatUsd(Math.abs(delta))}`;
          events.push({
            text: `${delta > 0 ? "Added" : "Removed"} ${amt} collateral ${delta > 0 ? "to" : "from"} the ${symbol} trade.`,
            address: pos.address,
          });
        }
      }

      const prevSize = prev.sizeValue;
      const nextSize = nextSnapshot[pos.address].sizeValue;
      if (typeof prevSize === "number" && typeof nextSize === "number") {
        const delta = nextSize - prevSize;
        if (Math.abs(delta) >= 0.01) {
          if (delta < 0) {
            const pct = prevSize > 0 ? Math.min(100, (Math.abs(delta) / prevSize) * 100) : 0;
            events.push({
              text: `Closed ${pct.toFixed(0)}% of the ${symbol} position (~$${formatUsd(Math.abs(delta))}).`,
              address: pos.address,
            });
          } else {
            events.push({
              text: `Increased the ${symbol} position by ~$${formatUsd(delta)}.`,
              address: pos.address,
            });
          }
        }
      }
    }

    const prevKeys = new Set(Object.keys(prevSnapshot));
    const nextKeys = new Set(Object.keys(nextSnapshot));

    for (const pos of positions) {
      if (!prevKeys.has(pos.address)) {
        const symbol = tokenInfoSolana?.[pos.address]?.symbol || pos.address.slice(0, 4);
        const side = (pos.side || "").toUpperCase();
        const size = typeof pos.sizeValue === "number" ? `$${formatUsd(pos.sizeValue)}` : "-";
        events.push({ text: `Opened ${side} ${symbol} (~${size}).`, address: pos.address });
      }
    }

    for (const prevKey of prevKeys) {
      if (!nextKeys.has(prevKey)) {
        const symbol = tokenInfoSolana?.[prevKey]?.symbol || prevKey.slice(0, 4);
        events.push({ text: `Closed the ${symbol} position.`, address: prevKey });
      }
    }

    if (Object.keys(prevSnapshot).length > 0 && events.length > 0) {
      const newest = events[0];
      setActiveActivity(newest);
      setActivityLog((prevLog) => {
        const nextLog = [newest, ...prevLog].slice(0, 10);
        return nextLog;
      });
    }

    prevPerpsSnapshotRef.current = nextSnapshot;
  }, [jupiterPositions]);

  useEffect(() => {
    if (!activeActivity) return;
    const t = window.setTimeout(() => setActiveActivity(null), 8000);
    return () => window.clearTimeout(t);
  }, [activeActivity]);

  useEffect(() => {
    const next: Record<string, number> = { ...prevSignalByKeyRef.current };
    const btc = marketPrices?.bitcoin?.usd;
    const eth = marketPrices?.ethereum?.usd;
    const sol = marketPrices?.solana?.usd;
    if (typeof btc === "number") next.btc = btc;
    if (typeof eth === "number") next.eth = eth;
    if (typeof sol === "number") next.sol = sol;
    prevSignalByKeyRef.current = next;
  }, [marketPrices]);

  // Fallback values
  const name = siteProfile?.name || "Matty";
  const role = siteProfile?.role || "Developer / Creator / Digital Wanderer";
  const status = siteProfile?.status || "building cool stuff on the internet";

  const stats = siteStats && siteStats.length > 0 ? siteStats : [
    { id: "1", stat_key: "coffees", stat_value: "∞", stat_label: "coffees", icon_name: "Coffee", color_class: "text-accent", sort_order: 1 },
    { id: "2", stat_key: "projects", stat_value: "42+", stat_label: "projects", icon_name: "Code", color_class: "text-secondary", sort_order: 2 },
    { id: "3", stat_key: "bugs", stat_value: "9999", stat_label: "bugs fixed", icon_name: "Skull", color_class: "text-destructive", sort_order: 3 },
    { id: "4", stat_key: "ideas", stat_value: "loading...", stat_label: "ideas", icon_name: "Zap", color_class: "text-primary", sort_order: 4 },
  ];

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="min-h-[60vh] flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* ASCII Art Header */}
            <motion.pre
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-primary text-xs md:text-sm font-mono hidden md:block neon-text -mt-2"
            >
{`
███╗   ███╗ █████╗ ████████╗████████╗██╗   ██╗
████╗ ████║██╔══██╗╚══██╔══╝╚══██╔══╝╚██╗ ██╔╝
██╔████╔██║███████║   ██║      ██║    ╚████╔╝ 
██║╚██╔╝██║██╔══██║   ██║      ██║     ╚██╔╝  
██║ ╚═╝ ██║██║  ██║   ██║      ██║      ██║   
╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝      ╚═╝      ╚═╝   
`}
            </motion.pre>

            {/* Mobile Title */}
            <div className="md:hidden">
              <GlitchText
                text="MATTY.LOL"
                className="text-4xl font-bold neon-text"
              />
            </div>

            {/* Terminal prompt intro */}
            <TerminalCard title="~/welcome.sh" delay={0.3} promptText="whoami">
              <div className="space-y-4 text-sm md:text-base">
                <div className="flex items-start gap-2">
                  <span className="text-secondary shrink-0">$</span>
                  <TypeWriter
                    text="whoami"
                    delay={80}
                    className="text-foreground"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="pl-4 border-l-2 border-primary/30 space-y-2"
                >
                  <p className="text-muted-foreground">
                    <span className="text-accent">name:</span> {name}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-accent">role:</span> {role}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-accent">status:</span>{" "}
                    <span className="text-secondary">
                      {status}
                    </span>
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-secondary shrink-0">$</span>
                  <span className="text-foreground">cat mission.txt</span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2 }}
                  className="text-muted-foreground pl-4"
                >
                  {missionText}
                </motion.p>
              </div>
            </TerminalCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TerminalCard title="~/signals.log" delay={0.45} promptText="watch signals --live">
                {(() => {
                  const btc = marketPrices?.bitcoin?.usd;
                  const eth = marketPrices?.ethereum?.usd;
                  const sol = marketPrices?.solana?.usd;

                const btcPrev = prevSignalByKeyRef.current.btc;
                const ethPrev = prevSignalByKeyRef.current.eth;
                const solPrev = prevSignalByKeyRef.current.sol;

                const btcClass =
                  typeof btc === "number" && typeof btcPrev === "number"
                    ? btc > btcPrev
                      ? "text-secondary"
                      : btc < btcPrev
                        ? "text-destructive"
                        : "text-muted-foreground"
                    : "text-muted-foreground";
                const ethClass =
                  typeof eth === "number" && typeof ethPrev === "number"
                    ? eth > ethPrev
                      ? "text-secondary"
                      : eth < ethPrev
                        ? "text-destructive"
                        : "text-muted-foreground"
                    : "text-muted-foreground";
                const solClass =
                  typeof sol === "number" && typeof solPrev === "number"
                    ? sol > solPrev
                      ? "text-secondary"
                      : sol < solPrev
                        ? "text-destructive"
                        : "text-muted-foreground"
                    : "text-muted-foreground";

                const fg = fearGreed?.data?.[0];
                const fgValueNum = fg?.value ? Number(fg.value) : undefined;
                const fgLabel = fg?.value_classification;
                const fgClass =
                  typeof fgValueNum === "number"
                    ? fgValueNum >= 60
                      ? "text-secondary"
                      : fgValueNum <= 40
                        ? "text-destructive"
                        : "text-accent"
                    : "text-muted-foreground";

                const fmt = (n?: number) =>
                  typeof n === "number" ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "-";

                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs md:text-sm font-mono">
                    <div className="p-4 border border-border/50 bg-muted/20">
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-xs text-accent">BTC</div>
                        <a
                          href="https://www.coingecko.com/en/coins/bitcoin"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="View on CoinGecko"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className={`text-sm ${btcClass}`}>{fmt(btc)}</div>
                    </div>
                    <div className="p-4 border border-border/50 bg-muted/20">
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-xs text-accent">ETH</div>
                        <a
                          href="https://www.coingecko.com/en/coins/ethereum"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="View on CoinGecko"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className={`text-sm ${ethClass}`}>{fmt(eth)}</div>
                    </div>
                    <div className="p-4 border border-border/50 bg-muted/20">
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-xs text-accent">SOL</div>
                        <a
                          href="https://www.coingecko.com/en/coins/solana"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="View on CoinGecko"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className={`text-sm ${solClass}`}>{fmt(sol)}</div>
                    </div>
                    <div className="p-4 border border-border/50 bg-muted/20">
                      <div className="text-xs text-accent">F/G</div>
                      <div className={`text-sm ${fgClass}`}>{fg?.value || "-"}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{fgLabel || ""}</div>
                    </div>
                  </div>
                );
              })()}
              </TerminalCard>

              {/* Trades box (full width, status-style) */}
              <TerminalCard title="~/trades.log" delay={0.48} promptText="jup perps --open">
                <div className="space-y-3 text-xs md:text-sm font-mono">
                  {jupiterPositionsLoading && (
                    <p className="text-muted-foreground pl-4">loading...</p>
                  )}

                  {jupiterPositionsIsError && (
                    <p className="text-muted-foreground pl-4">
                      error: {jupiterPositionsError instanceof Error ? jupiterPositionsError.message : "unknown error"}
                    </p>
                  )}

                  {!jupiterPositionsLoading && !jupiterPositionsIsError && (
                    <div className="grid grid-cols-1 gap-4">
                      {(() => {
                        const tokenInfoSolana = jupiterPositions?.tokenInfo?.solana || {};
                        const leverageElements = (jupiterPositions?.elements || []).filter(
                          (e) => e.type === "leverage"
                        );

                        const positions: JupiterPerpsPosition[] = leverageElements.flatMap((el) => {
                          const data = el.data as any;
                          const isolatedPositions = data?.isolated?.positions;
                          return Array.isArray(isolatedPositions) ? (isolatedPositions as JupiterPerpsPosition[]) : [];
                        });

                        if (positions.length === 0) {
                          return <p className="text-muted-foreground pl-4">no open positions</p>;
                        }

                        return positions.slice(0, 6).map((pos, idx) => {
                          const symbol = tokenInfoSolana?.[pos.address]?.symbol || pos.address.slice(0, 4);
                          const logoURI = tokenInfoSolana?.[pos.address]?.logoURI;
                          const isSol =
                            pos.address === "So11111111111111111111111111111111111111112" ||
                            symbol === "SOL" ||
                            symbol === "wSOL";
                          const side = (pos.side || "").toUpperCase();
                          const leverage = typeof pos.leverage === "number" ? `${pos.leverage.toFixed(1)}x` : "-";
                          const sizeUsd = typeof pos.sizeValue === "number" ? `$${formatUsd(pos.sizeValue)}` : "-";
                          const pnlUsd =
                            typeof pos.pnlValue === "number"
                              ? `${pos.pnlValue > 0 ? "+" : pos.pnlValue < 0 ? "-" : ""}$${formatUsd(Math.abs(pos.pnlValue))}`
                              : "-";
                          const liq = typeof pos.liquidationPrice === "number" ? formatPrice(pos.liquidationPrice) : "-";
                          const entry = typeof pos.entryPrice === "number" ? formatPrice(pos.entryPrice) : "-";
                          const markNum = typeof pos.markPrice === "number" ? pos.markPrice : undefined;
                          const mark = typeof markNum === "number" ? formatPrice(markNum) : "-";
                          const prevMark = prevMarkByMintRef.current[pos.address];
                          const markTrendClass =
                            typeof markNum === "number" && typeof prevMark === "number"
                              ? markNum > prevMark
                                ? "text-secondary"
                                : markNum < prevMark
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              : "text-muted-foreground";
                          const pnlClass =
                            typeof pos.pnlValue === "number"
                              ? pos.pnlValue < 0
                                ? "text-destructive"
                                : pos.pnlValue > 0
                                  ? "text-secondary"
                                  : "text-muted-foreground"
                              : "text-muted-foreground";

                          return (
                            <div
                              key={`${pos.address}-${idx}`}
                              className="p-4 border border-border/50 bg-muted/20"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isSol ? (
                                    <img
                                      src="/Solana-Round-Logo-PNG.png"
                                      alt={symbol}
                                      className="w-6 h-6 rounded-full"
                                      loading="lazy"
                                    />
                                  ) : logoURI ? (
                                    <img
                                      src={logoURI}
                                      alt={symbol}
                                      className="w-6 h-6 rounded-full"
                                      loading="lazy"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : null}

                                  <div className="text-foreground">
                                    {symbol}
                                  </div>

                                  <a
                                    href={`https://solscan.io/token/${pos.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    title="View on Solscan"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>

                                  <div className="text-muted-foreground text-xs">
                                    entry {entry} | liq {liq} |{" "}
                                    <span className={markTrendClass}>mark {mark}</span>
                                  </div>
                                </div>

                                <div className={pos.side === "long" ? "text-primary" : "text-destructive"}>
                                  {side}
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="p-3 border border-border/50 bg-muted/20 text-center">
                                  <div className="text-xs text-accent">leverage</div>
                                  <div className="text-sm text-muted-foreground">{leverage}</div>
                                </div>
                                <div className="p-3 border border-border/50 bg-muted/20 text-center">
                                  <div className="text-xs text-accent">size</div>
                                  <div className="text-sm text-muted-foreground">{sizeUsd}</div>
                                </div>
                                <div className="p-3 border border-border/50 bg-muted/20 text-center">
                                  <div className="text-xs text-accent">Profit &amp; Loss</div>
                                  <div className={`text-sm ${pnlClass}`}>{pnlUsd}</div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}

                  <div className="p-4 border border-border/50 bg-muted/20">
                    <div className="text-xs text-accent font-mono">activity</div>
                    <div className="mt-2 text-sm text-foreground font-mono">
                      {activeActivity ? (
                        <div className="flex items-start gap-2">
                          <span className="text-secondary shrink-0">$</span>
                          <TypeWriter text={activeActivity.text} delay={35} className="text-foreground" />
                          {activeActivity.address && (
                            <a
                              href={`https://solscan.io/token/${activeActivity.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title="View on Solscan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ) : activityLog.length > 0 ? (
                        <div className="flex items-start gap-2">
                          <span className="text-secondary shrink-0">$</span>
                          <span className="text-muted-foreground">{activityLog[0].text}</span>
                          {activityLog[0].address && (
                            <a
                              href={`https://solscan.io/token/${activityLog[0].address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title="View on Solscan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <span className="text-secondary shrink-0">$</span>
                          <span className="text-muted-foreground">waiting for next update...</span>
                        </div>
                      )}
                    </div>

                    {activityLog.length > 1 && (
                      <div className="mt-3 space-y-1 text-xs text-muted-foreground font-mono">
                        {activityLog.slice(1, 5).map((line, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-muted-foreground">-</span>
                            <span className="truncate">{line.text}</span>
                            {line.address && (
                              <a
                                href={`https://solscan.io/token/${line.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                title="View on Solscan"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <a
                      href="https://jup.ag/?refId=crbvb8z35bbd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 border border-primary/50 text-primary hover:text-foreground hover:bg-primary/10 hover:border-primary transition-all"
                    >
                      <span>Join me on Jupiter!</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      users get a 10% trading points bonus using my link.
                    </p>
                  </div>
                </div>
              </TerminalCard>
            </div>
          </motion.div>
        </section>

        {/* Quick Links Grid */}
        <section className="py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="text-secondary">$</span>
              <span className="text-foreground">ls -la ./directories</span>
              <span className="cursor-blink text-primary">_</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.7 + index * 0.1 }}
                  >
                    <Link to={link.path} className="group block">
                      <div className="border border-border p-4 transition-all duration-300 hover:border-primary hover:neon-border bg-card/30 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-accent group-hover:text-primary transition-colors" />
                            <div>
                              <span className="text-secondary">./</span>
                              <span className="text-foreground group-hover:neon-text transition-all">
                                {link.name}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground pl-8">
                          // {link.desc}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Status Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2 }}
          className="py-12"
        >
          <TerminalCard title="~/status.log" delay={3.2} promptText="cat status.log">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {stats.map((stat, index) => {
                const Icon = getIconByName(stat.icon_name);
                return (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 border border-border/50 bg-muted/20"
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color_class}`} />
                    <div className={`text-xl font-bold ${stat.color_class}`}>
                      {stat.stat_value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.stat_label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TerminalCard>
        </motion.section>
      </div>
    </TerminalLayout>
  );
};

export default Index;
