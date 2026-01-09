import { useState, useEffect } from "react";
import React from "react";
import { motion } from "framer-motion";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import TerminalChart from "@/components/TerminalChart";
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw, Search } from "lucide-react";
import { UTCTimestamp } from "lightweight-charts";

interface TokenPrice {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  price: string;
  priceChange24h: string;
  timestamp: number;
}

// Use only the most reliable tokens with confirmed mint addresses
const POPULAR_TOKENS = [
  { mint: "So11111111111111111111111111111111111111112", name: "Solana", symbol: "SOL" },
  { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", name: "USDC", symbol: "USDC" },
  { mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", name: "USDT", symbol: "USDT" },
];

const PriceTracker = () => {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchMint, setSearchMint] = useState("");
  const [customToken, setCustomToken] = useState<TokenPrice | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<Array<{time: UTCTimestamp; open: number; high: number; low: number; close: number; volume: number}>>([]);
  const [updateInterval, setUpdateInterval] = useState<number>(60000); // 1 minute default
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');

  console.log('PriceTracker component rendered');
  console.log('Popular tokens:', POPULAR_TOKENS);

  // Generate sample chart data (in real app, this would come from an API)
  const generateChartData = (basePrice: number) => {
    const data = [];
    const now = Math.floor(Date.now() / 1000) as UTCTimestamp;
    const oneDay = 24 * 60 * 60;
    
    for (let i = 100; i >= 0; i--) {
      const time = (now - (i * oneDay / 100)) as UTCTimestamp; // 1 data point per ~14.4 minutes
      const volatility = basePrice * 0.02; // 2% volatility
      const trend = Math.sin(i * 0.1) * basePrice * 0.01; // Slight trend
      
      const open = basePrice + (Math.random() - 0.5) * volatility + trend;
      const close = open + (Math.random() - 0.5) * volatility * 0.5;
      const high = Math.max(open, close) + Math.random() * volatility * 0.3;
      const low = Math.min(open, close) - Math.random() * volatility * 0.3;
      const volume = Math.random() * 1000000 + 500000;
      
      data.push({
        time,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Number(volume.toFixed(0))
      });
    }
    
    return data;
  };

  // Update chart data when prices change
  useEffect(() => {
    if (prices.length > 0) {
      const solPrice = prices.find(p => p.symbol === 'SOL');
      if (solPrice) {
        const basePrice = parseFloat(solPrice.price);
        setChartData(generateChartData(basePrice));
      }
    }
  }, [prices]);

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllPrices();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  // Initial fetch
  useEffect(() => {
    fetchAllPrices();
  }, []);

  const fetchTokenPrice = async (mint: string, name: string, symbol: string): Promise<TokenPrice | null> => {
    try {
      const response = await fetch(`/api/jupiter-price?ids=${mint}`);
      
      if (!response.ok) {
        console.error(`API response not ok for ${symbol}:`, response.status);
        return null;
      }
      
      const data = await response.json();
      console.log(`API response for ${symbol}:`, data);
      
      const tokenData = data[mint];
      if (!tokenData) {
        console.log(`No data found for ${symbol} with mint ${mint}`);
        return null;
      }
      
      return {
        id: symbol,
        mint,
        name,
        symbol,
        price: tokenData.usdPrice?.toString() || "0",
        priceChange24h: tokenData.priceChange24h?.toString() || "0",
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return null;
    }
  };

  const fetchAllPrices = async () => {
    console.log('fetchAllPrices called');
    setLoading(true);
    setError(null);
    
    try {
      // Fetch tokens one by one to avoid issues with batch requests
      const results = [];
      
      for (const token of POPULAR_TOKENS) {
        console.log(`Fetching ${token.symbol}...`);
        const price = await fetchTokenPrice(token.mint, token.name, token.symbol);
        if (price) {
          results.push(price);
          console.log(`Got ${token.symbol} price: ${price.price}`);
        } else {
          console.log(`Failed to get ${token.symbol} price`);
        }
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('Final results:', results);
      setPrices(results);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error in fetchAllPrices:', error);
      setError("Failed to fetch prices");
    } finally {
      setLoading(false);
    }
  };

  const searchCustomToken = async () => {
    if (!searchMint.trim()) return;
    
    setLoading(true);
    try {
      const tokenPrice = await fetchTokenPrice(searchMint.trim(), "Custom Token", "CUSTOM");
      if (tokenPrice) {
        setCustomToken(tokenPrice);
        setError(null);
      } else {
        setError("Token not found or invalid mint address");
        setCustomToken(null);
      }
    } catch (error) {
      setError("Failed to fetch custom token price");
      setCustomToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPrices();
    const interval = setInterval(fetchAllPrices, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num >= 1000) return `$${num.toLocaleString()}`;
    if (num >= 1) return `$${num.toFixed(2)}`;
    return `$${num.toFixed(6)}`;
  };

  const formatPriceChange = (change: string) => {
    const num = parseFloat(change);
    const isPositive = num >= 0;
    return {
      value: `${isPositive ? '+' : ''}${num.toFixed(2)}%`,
      color: isPositive ? 'text-green-500' : 'text-red-500',
      icon: isPositive ? TrendingUp : TrendingDown
    };
  };

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">./price-tracker --monitor</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">
              {">"} Jupiter Price Tracker
            </h1>
            <p className="text-muted-foreground">
              // Real-time token prices from Jupiter aggregator V3
            </p>
          </div>

          {/* Search Custom Token */}
          <TerminalCard title="Token Search" delay={0.1}>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter token mint address..."
                  value={searchMint}
                  onChange={(e) => setSearchMint(e.target.value)}
                  className="flex-1 px-3 py-2 bg-muted border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
                <button
                  onClick={searchCustomToken}
                  disabled={loading || !searchMint.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>

              {customToken && (
                <div className="p-4 border border-border/50 bg-muted/20 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{customToken.name}</div>
                      <div className="text-sm text-muted-foreground">{customToken.symbol}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {customToken.mint.slice(0, 8)}...{customToken.mint.slice(-8)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {formatPrice(customToken.price)}
                      </div>
                      <div className={`text-sm flex items-center gap-1 ${formatPriceChange(customToken.priceChange24h).color}`}>
                        {React.createElement(formatPriceChange(customToken.priceChange24h).icon, { className: "w-3 h-3" })}
                        {formatPriceChange(customToken.priceChange24h).value}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TerminalCard>

          {/* Popular Tokens */}
          <TerminalCard title="Popular Tokens" delay={0.2}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span>Live prices (Jupiter V3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                  <button
                    onClick={fetchAllPrices}
                    disabled={loading}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {loading && prices.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  <p>{error}</p>
                </div>
              ) : prices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No price data available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prices.map((token) => {
                    const priceChange = formatPriceChange(token.priceChange24h);
                    return (
                      <div key={token.id} className="p-4 border border-border/50 bg-muted/20 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-foreground">{token.name}</div>
                            <div className="text-sm text-muted-foreground">{token.symbol}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-foreground flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {formatPrice(token.price)}
                            </div>
                            <div className={`text-sm flex items-center gap-1 ${priceChange.color}`}>
                              {React.createElement(priceChange.icon, { className: "w-3 h-3" })}
                              {priceChange.value}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TerminalCard>

          {/* Chart */}
          <TerminalCard title="SOL Price Chart" delay={0.3}>
            <div className="space-y-4">
              {/* Chart Controls */}
              <div className="flex items-center gap-4 p-3 border border-border/50 bg-muted/20 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Update:</span>
                  <select 
                    value={updateInterval} 
                    onChange={(e) => setUpdateInterval(Number(e.target.value))}
                    className="bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value={1000}>1 second</option>
                    <option value={30000}>30 seconds</option>
                    <option value={60000}>1 minute</option>
                    <option value={300000}>5 minutes</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <select 
                    value={chartType} 
                    onChange={(e) => setChartType(e.target.value as 'line' | 'candlestick')}
                    className="bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="line">Line</option>
                    <option value="candlestick">Candlestick</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  <span>Auto-refresh: {(updateInterval / 1000).toFixed(0)}s</span>
                </div>
              </div>

              {chartData.length > 0 ? (
                <TerminalChart 
                  symbol="SOL" 
                  data={chartData} 
                  height={400}
                  chartType={chartType}
                />
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                  <span>Loading chart data...</span>
                </div>
              )}
            </div>
          </TerminalCard>

          {/* Info */}
          <TerminalCard title="About Jupiter Price API V3" delay={0.4}>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Real-time price data powered by Jupiter Price API V3, the most accurate source for Solana token prices.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Prices update every 30 seconds</p>
                <p>• Data sourced from multiple DEXs with heuristics</p>
                <p>• Search any token by mint address</p>
                <p>• 24-hour price changes included</p>
                <p>• Enhanced price accuracy and reliability</p>
              </div>
              <a
                href="https://jup.ag"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                Visit Jupiter
              </a>
            </div>
          </TerminalCard>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default PriceTracker;
