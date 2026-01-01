import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { ExternalLink, AlertCircle } from "lucide-react";

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

type JupiterPerpsPosition = {
  address: string;
  side: string;
  collateralValue?: number;
  sizeValue?: number;
  pnlValue?: number;
  markPrice?: number;
  entryPrice?: number;
  liquidationPrice?: number;
  leverage?: number;
};

type SessionSnapshot = Record<string, { sizeValue?: number; collateralValue?: number; side?: string }>;

type SessionEventType = "open" | "close" | "increase" | "decrease" | "collateral";

type SessionEvent = {
  id: string;
  ts: number;
  type: SessionEventType;
  address?: string;
  symbol?: string;
  side?: string;
  deltaUsd?: number;
  message: string;
};

const STORAGE_KEYS = {
  startTs: "tradesSessionStartTs",
  snapshot: "tradesSessionSnapshot",
  events: "tradesSessionEvents",
};

const formatUsd = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const safeJsonParse = <T,>(v: string | null): T | null => {
  if (!v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
};

const Trades = () => {
  const sessionStartTsRef = useRef<number | null>(null);
  const prevSnapshotRef = useRef<SessionSnapshot | null>(null);
  const [sessionStartTs, setSessionStartTs] = useState<number | null>(null);
  const [events, setEvents] = useState<SessionEvent[]>([]);

  useEffect(() => {
    const startTsRaw = window.localStorage.getItem(STORAGE_KEYS.startTs);
    const startTs = startTsRaw ? Number(startTsRaw) : NaN;
    sessionStartTsRef.current = Number.isFinite(startTs) ? startTs : null;
    setSessionStartTs(sessionStartTsRef.current);

    const snapshot = safeJsonParse<SessionSnapshot>(window.localStorage.getItem(STORAGE_KEYS.snapshot));
    prevSnapshotRef.current = snapshot;

    const storedEvents = safeJsonParse<SessionEvent[]>(window.localStorage.getItem(STORAGE_KEYS.events)) || [];
    setEvents(storedEvents);
  }, []);

  const {
    data: jupiterPositions,
    isLoading,
    isError,
    error,
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

  const positions = useMemo(() => {
    const leverageElements = (jupiterPositions?.elements || []).filter((e) => e.type === "leverage");
    const list: JupiterPerpsPosition[] = leverageElements.flatMap((el) => {
      const data = el.data as any;
      const isolatedPositions = data?.isolated?.positions;
      return Array.isArray(isolatedPositions) ? (isolatedPositions as JupiterPerpsPosition[]) : [];
    });
    return list;
  }, [jupiterPositions]);

  useEffect(() => {
    if (!jupiterPositions) return;

    const tokenInfoSolana = jupiterPositions?.tokenInfo?.solana || {};
    const now = Date.now();

    const nextSnapshot: SessionSnapshot = {};
    for (const pos of positions) {
      nextSnapshot[pos.address] = {
        sizeValue: typeof pos.sizeValue === "number" ? pos.sizeValue : undefined,
        collateralValue: typeof pos.collateralValue === "number" ? pos.collateralValue : undefined,
        side: pos.side,
      };
    }

    // First time on /trades: establish baseline (current open positions become the start point)
    if (!sessionStartTsRef.current || !prevSnapshotRef.current) {
      const startTs = sessionStartTsRef.current || now;
      sessionStartTsRef.current = startTs;
      setSessionStartTs(startTs);
      prevSnapshotRef.current = nextSnapshot;
      window.localStorage.setItem(STORAGE_KEYS.startTs, String(startTs));
      window.localStorage.setItem(STORAGE_KEYS.snapshot, JSON.stringify(nextSnapshot));
      return;
    }

    const prevSnapshot = prevSnapshotRef.current;
    const newEvents: SessionEvent[] = [];

    const prevKeys = new Set(Object.keys(prevSnapshot));
    const nextKeys = new Set(Object.keys(nextSnapshot));

    for (const pos of positions) {
      const symbol = tokenInfoSolana?.[pos.address]?.symbol || pos.address.slice(0, 4);
      const side = (pos.side || "").toUpperCase();
      const prev = prevSnapshot[pos.address];

      if (!prev) {
        const size = typeof pos.sizeValue === "number" ? pos.sizeValue : undefined;
        const msg = `Opened ${side} ${symbol}${typeof size === "number" ? ` (~$${formatUsd(size)})` : ""}.`;
        newEvents.push({
          id: `${now}-open-${pos.address}`,
          ts: now,
          type: "open",
          address: pos.address,
          symbol,
          side,
          deltaUsd: typeof size === "number" ? size : undefined,
          message: msg,
        });
        continue;
      }

      const prevSize = prev.sizeValue;
      const nextSize = nextSnapshot[pos.address].sizeValue;
      if (typeof prevSize === "number" && typeof nextSize === "number") {
        const delta = nextSize - prevSize;
        if (Math.abs(delta) >= 0.01) {
          if (delta > 0) {
            newEvents.push({
              id: `${now}-inc-${pos.address}`,
              ts: now,
              type: "increase",
              address: pos.address,
              symbol,
              side,
              deltaUsd: delta,
              message: `Increased ${symbol} by ~$${formatUsd(delta)}.`,
            });
          } else {
            const pct = prevSize > 0 ? Math.min(100, (Math.abs(delta) / prevSize) * 100) : 0;
            newEvents.push({
              id: `${now}-dec-${pos.address}`,
              ts: now,
              type: "decrease",
              address: pos.address,
              symbol,
              side,
              deltaUsd: Math.abs(delta),
              message: `Reduced ${symbol} by ~$${formatUsd(Math.abs(delta))} (${pct.toFixed(0)}%).`,
            });
          }
        }
      }

      const prevColl = prev.collateralValue;
      const nextColl = nextSnapshot[pos.address].collateralValue;
      if (typeof prevColl === "number" && typeof nextColl === "number") {
        const delta = nextColl - prevColl;
        if (Math.abs(delta) >= 0.01) {
          const amt = `$${formatUsd(Math.abs(delta))}`;
          newEvents.push({
            id: `${now}-coll-${pos.address}`,
            ts: now,
            type: "collateral",
            address: pos.address,
            symbol,
            side,
            deltaUsd: Math.abs(delta),
            message: `${delta > 0 ? "Added" : "Removed"} ${amt} collateral ${delta > 0 ? "to" : "from"} ${symbol}.`,
          });
        }
      }
    }

    for (const prevKey of prevKeys) {
      if (!nextKeys.has(prevKey)) {
        const symbol = tokenInfoSolana?.[prevKey]?.symbol || prevKey.slice(0, 4);
        newEvents.push({
          id: `${now}-close-${prevKey}`,
          ts: now,
          type: "close",
          address: prevKey,
          symbol,
          message: `Closed ${symbol}.`,
        });
      }
    }

    if (newEvents.length > 0) {
      setEvents((prev) => {
        const merged = [...newEvents, ...prev].slice(0, 250);
        window.localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(merged));
        return merged;
      });
    }

    prevSnapshotRef.current = nextSnapshot;
    window.localStorage.setItem(STORAGE_KEYS.snapshot, JSON.stringify(nextSnapshot));
  }, [jupiterPositions, positions]);

  const baseline = useMemo(() => {
    const openCount = positions.length;
    const openNotional = positions.reduce((acc, p) => acc + (typeof p.sizeValue === "number" ? p.sizeValue : 0), 0);
    const openCollateral = positions.reduce(
      (acc, p) => acc + (typeof p.collateralValue === "number" ? p.collateralValue : 0),
      0
    );
    return { openCount, openNotional, openCollateral };
  }, [positions]);

  const metrics = useMemo(() => {
    const start = sessionStartTs || Date.now();
    const now = Date.now();
    const windows: Array<{ key: "24h" | "7d" | "30d" | "all"; ms: number | null }> = [
      { key: "24h", ms: 24 * 60 * 60 * 1000 },
      { key: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
      { key: "30d", ms: 30 * 24 * 60 * 60 * 1000 },
      { key: "all", ms: null },
    ];

    const sumFor = (ms: number | null) => {
      const cutoff = ms === null ? start : Math.max(start, now - ms);
      const inWindow = events.filter((e) => e.ts >= cutoff);
      const tradeLike = inWindow.filter((e) => e.type === "open" || e.type === "close" || e.type === "increase" || e.type === "decrease");
      const volume = tradeLike.reduce((acc, e) => acc + (typeof e.deltaUsd === "number" ? e.deltaUsd : 0), 0);
      return { count: tradeLike.length, volume };
    };

    const result: Record<string, { count: number; volume: number }> = {};
    for (const w of windows) result[w.key] = sumFor(w.ms);
    return result as Record<"24h" | "7d" | "30d" | "all", { count: number; volume: number }>;
  }, [events, sessionStartTs]);

  const headerRight = (
    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
      <span>session:</span>
      <span className="text-foreground">
        {sessionStartTs ? new Date(sessionStartTs).toLocaleString() : "initializing..."}
      </span>
    </div>
  );

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">./trades --session</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">{">"} Trades</h1>
            <p className="text-muted-foreground">// live session stats (starting from your current position onward)</p>
          </div>

          {isError && (
            <TerminalCard className="border-destructive" showPrompt={false}>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span>{error instanceof Error ? error.message : "Failed to load Jupiter positions"}</span>
              </div>
            </TerminalCard>
          )}

          <TerminalCard title="~/trades/status.log" promptText="cat session.status" showPrompt={!isLoading}>
            <div className="flex items-start justify-between gap-4">
              <div className="text-muted-foreground text-sm">
                <span className="text-secondary">// </span>
                tracked events: <span className="text-foreground">{events.length}</span>
              </div>
              {headerRight}
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 border border-border/50 bg-muted/20">
                <div className="text-xs text-accent">open positions</div>
                <div className="text-xl font-bold text-primary">{baseline.openCount}</div>
              </div>
              <div className="p-4 border border-border/50 bg-muted/20">
                <div className="text-xs text-accent">open notional</div>
                <div className="text-xl font-bold text-secondary">${formatUsd(baseline.openNotional)}</div>
              </div>
              <div className="p-4 border border-border/50 bg-muted/20">
                <div className="text-xs text-accent">open collateral</div>
                <div className="text-xl font-bold text-secondary">${formatUsd(baseline.openCollateral)}</div>
              </div>
              <div className="p-4 border border-border/50 bg-muted/20">
                <div className="text-xs text-accent">session uptime</div>
                <div className="text-xl font-bold text-primary">
                  {sessionStartTs ? `${Math.max(0, Math.floor((Date.now() - sessionStartTs) / 60000))}m` : "-"}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {([
                { label: "trades (24h)", key: "24h" as const },
                { label: "trades (7d)", key: "7d" as const },
                { label: "trades (30d)", key: "30d" as const },
                { label: "trades (all)", key: "all" as const },
              ] as const).map((x) => (
                <div key={x.key} className="p-4 border border-border/50 bg-muted/20">
                  <div className="text-xs text-accent">{x.label}</div>
                  <div className="text-xl font-bold text-primary">{metrics[x.key].count}</div>
                </div>
              ))}

              {([
                { label: "volume (24h)", key: "24h" as const },
                { label: "volume (7d)", key: "7d" as const },
                { label: "volume (30d)", key: "30d" as const },
                { label: "volume (all)", key: "all" as const },
              ] as const).map((x) => (
                <div key={x.label} className="p-4 border border-border/50 bg-muted/20">
                  <div className="text-xs text-accent">{x.label}</div>
                  <div className="text-xl font-bold text-secondary">${formatUsd(metrics[x.key].volume)}</div>
                </div>
              ))}
            </div>
          </TerminalCard>

          <TerminalCard title="~/trades/activity.log" promptText="tail -n 50 activity.log" showPrompt={!isLoading}>
            <div className="space-y-2 text-sm font-mono">
              {isLoading && <div className="text-muted-foreground">loading...</div>}
              {!isLoading && events.length === 0 && (
                <div className="text-muted-foreground">
                  no session activity yet — your current open position is used as the baseline.
                </div>
              )}

              {!isLoading && events.slice(0, 40).map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-3 p-3 border border-border/50 bg-muted/20">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.ts).toLocaleString()} {e.type ? `• ${e.type}` : ""}
                    </div>
                    <div className="text-foreground truncate">{e.message}</div>
                  </div>

                  {e.address && (
                    <a
                      href={`https://solscan.io/token/${e.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      title="View on Solscan"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </TerminalCard>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Trades;
