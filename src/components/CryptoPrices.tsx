import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

const CryptoPrices = () => {
  const [expanded, setExpanded] = useState(false);
  const { prices, isLoading, error, formatPrice, formatChange, getChangeColor } = useCryptoPrices();

  if (isLoading && prices.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <span className="text-muted-foreground/50">[</span>
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span className="text-secondary">CRYPTO:</span>
        <span>loading...</span>
        <span className="text-muted-foreground/50">]</span>
      </div>
    );
  }

  if (error && prices.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <span className="text-muted-foreground/50">[</span>
        <span className="text-secondary">CRYPTO:</span>
        <span className="text-red-500">error</span>
        <span className="text-muted-foreground/50">]</span>
      </div>
    );
  }

  const getIcon = (change: number) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Minus;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="relative"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
        title="Crypto Prices"
      >
        <span className="text-muted-foreground/50">[</span>
        <TrendingUp className="w-3 h-3" />
        <span className="text-secondary">CRYPTO:</span>
        <span className="text-accent">
          {prices.filter(p => p.changePercent24h > 0).length}/{prices.length}
        </span>
        <span className="text-muted-foreground/50">]</span>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bottom-full left-0 mb-2 p-3 border border-border/60 bg-card/30 backdrop-blur-md neon-border shine-hover rounded-lg min-w-[220px] z-50"
        >
          <div className="space-y-2 text-xs font-mono">
            <div className="text-secondary text-center mb-2 pb-2 border-b border-border/30">
              Live Prices
              {isLoading && <RefreshCw className="w-3 h-3 inline-block ml-2 animate-spin" />}
            </div>
            {prices.map((crypto) => {
              const Icon = getIcon(crypto.changePercent24h);
              const changeColor = getChangeColor(crypto.changePercent24h);
              
              return (
                <div key={crypto.symbol} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground/70 w-8">
                      {crypto.symbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">
                      {formatPrice(crypto.price)}
                    </span>
                    <div className={`flex items-center gap-1 ${changeColor}`}>
                      <Icon className="w-3 h-3" />
                      <span className="text-[10px]">
                        {formatChange(crypto.changePercent24h)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="pt-2 mt-2 border-t border-border/30 text-[10px] text-muted-foreground/50 text-center">
              Data via CoinGecko
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CryptoPrices;
