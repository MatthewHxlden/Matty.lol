import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw, Search } from "lucide-react";

interface TokenPrice {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  price: string;
  priceChange24h: string;
  timestamp: number;
}

const POPULAR_TOKENS = [
  { mint: "So11111111111111111111111111111111111111112", name: "Solana", symbol: "SOL" },
  { mint: "9n4nbM75f5Ui33ZbPYxnHN37iepbEBhC2DyiVzjRGbbQ", name: "Bitcoin", symbol: "BTC" },
  { mint: "2FPyTwcZLUg1MDYws8Xx2KTNW8HdpfKhpCrygTrAkLfR", name: "Ethereum", symbol: "ETH" },
  { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", name: "USDC", symbol: "USDC" },
  { mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", name: "USDT", symbol: "USDT" },
  { mint: "4k3Dyjzvzp8eM4UXycqet7gQgTmGxULTYbQFiqAu1gTH", name: "Raydium", symbol: "RAY" },
  { mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedKNsDwJDT", name: "Jupiter", symbol: "JUP" },
];

const PriceTracker = () => {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchMint, setSearchMint] = useState("");
  const [customToken, setCustomToken] = useState<TokenPrice | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchTokenPrice = async (mint: string, name: string, symbol: string): Promise<TokenPrice | null> => {
    try {
      const response = await fetch(`https://price.jup.ag/v1/price?id=${mint}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return {
        id: symbol,
        mint,
        name,
        symbol,
        price: data.data?.price || "0",
        priceChange24h: data.data?.change24h || "0",
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return null;
    }
  };

  const fetchAllPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const pricePromises = POPULAR_TOKENS.map(token => 
        fetchTokenPrice(token.mint, token.name, token.symbol)
      );
      
      const results = await Promise.all(pricePromises);
      const validPrices = results.filter((price): price is TokenPrice => price !== null);
      
      setPrices(validPrices);
      setLastUpdated(new Date());
    } catch (error) {
      setError("Failed to fetch prices");
      console.error("Error fetching prices:", error);
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
              // Real-time token prices from Jupiter aggregator
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
                  <span>Live prices</span>
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

          {/* Info */}
          <TerminalCard title="About Jupiter Price API" delay={0.4}>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Real-time price data powered by Jupiter aggregator, the best source for Solana token prices.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Prices update every 30 seconds</p>
                <p>• Data sourced from multiple DEXs</p>
                <p>• Search any token by mint address</p>
                <p>• 24-hour price changes included</p>
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
