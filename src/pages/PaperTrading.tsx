import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, DollarSign, Target, Shield, Activity, BarChart3, Play, X } from 'lucide-react';
import TerminalLayout from '@/components/TerminalLayout';
import TerminalCard from '@/components/TerminalCard';
import { usePaperPortfolio, useOpenPositions, usePaperStats, useJupiterPrices, usePaperTrading, usePaperTradingForm } from '@/hooks/usePaperTrading';
import { Button } from '@/components/ui/button';

const PaperTrading = () => {
  const [showTradeForm, setShowTradeForm] = useState(false);
  const { portfolio, isLoading: portfolioLoading } = usePaperPortfolio();
  const { data: openPositions, isLoading: positionsLoading } = useOpenPositions();
  const { data: stats, isLoading: statsLoading } = usePaperStats();
  const { data: prices, isLoading: pricesLoading } = useJupiterPrices();
  const { executeTrade, closeTrade } = usePaperTrading();
  const { formData, updateForm, resetForm, validateForm } = usePaperTradingForm();

  const handleExecuteTrade = async () => {
    const errors = validateForm(portfolio);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    try {
      await executeTrade.mutateAsync(formData);
      resetForm();
      setShowTradeForm(false);
    } catch (error) {
      alert(`Trade failed: ${error.message}`);
    }
  };

  const handleCloseTrade = async (tradeId: string) => {
    try {
      await closeTrade.mutateAsync(tradeId);
    } catch (error) {
      alert(`Failed to close trade: ${error.message}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const currentPrice = prices?.find(p => p.id === formData.pair)?.currentPrice || 0;

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">paper_trading --status</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <Button
              onClick={() => setShowTradeForm(!showTradeForm)}
              className="terminal-button"
            >
              <Play className="w-4 h-4 mr-2" />
              New Trade
            </Button>
          </div>

          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TerminalCard showPrompt={false}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <DollarSign className="w-3 h-3" />
                  <span>TOTAL VALUE</span>
                </div>
                <div className="text-xl font-bold text-primary">
                  {formatPrice(stats?.totalValue || 0)}
                </div>
                <div className={`text-xs ${stats?.totalReturn || 0 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(stats?.returnPercentage || 0)}
                </div>
              </div>
            </TerminalCard>

            <TerminalCard showPrompt={false}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span>WIN RATE</span>
                </div>
                <div className="text-xl font-bold text-secondary">
                  {stats?.winRate?.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats?.totalTrades || 0} trades
                </div>
              </div>
            </TerminalCard>

            <TerminalCard showPrompt={false}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  <span>OPEN POSITIONS</span>
                </div>
                <div className="text-xl font-bold text-accent">
                  {stats?.openPositions || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPrice(stats?.unrealizedPnl || 0)} P&L
                </div>
              </div>
            </TerminalCard>

            <TerminalCard showPrompt={false}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BarChart3 className="w-3 h-3" />
                  <span>BALANCE</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {formatPrice(stats?.balance || 0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Available
                </div>
              </div>
            </TerminalCard>
          </div>

          {/* Trade Form */}
          {showTradeForm && (
            <TerminalCard title="new_trade" promptText="paper_trading --execute">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">PAIR</label>
                    <select
                      value={formData.pair}
                      onChange={(e) => updateForm('pair', e.target.value)}
                      className="terminal-input w-full bg-background/80 border border-border/60 text-foreground px-3 py-2 rounded-none focus:border-primary focus:outline-none"
                    >
                      <option value="SOL-USDC">SOL/USDC</option>
                      <option value="BTC-USDC">BTC/USDC</option>
                      <option value="ETH-USDC">ETH/USDC</option>
                      <option value="RAY-USDC">RAY/USDC</option>
                      <option value="JUP-USDC">JUP/USDC</option>
                      <option value="RNDR-USDC">RNDR/USDC</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">TYPE</label>
                    <select
                      value={formData.type}
                      onChange={(e) => updateForm('type', e.target.value)}
                      className="terminal-input w-full bg-background/80 border border-border/60 text-foreground px-3 py-2 rounded-none focus:border-primary focus:outline-none"
                    >
                      <option value="long">LONG</option>
                      <option value="short">SHORT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">SIZE (USDC)</label>
                    <input
                      type="number"
                      value={formData.size}
                      onChange={(e) => updateForm('size', parseFloat(e.target.value) || 0)}
                      className="terminal-input w-full bg-background/80 border border-border/60 text-foreground px-3 py-2 rounded-none focus:border-primary focus:outline-none"
                      placeholder="0"
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">LEVERAGE</label>
                    <input
                      type="number"
                      value={formData.leverage}
                      onChange={(e) => updateForm('leverage', parseFloat(e.target.value) || 1)}
                      className="terminal-input w-full bg-background/80 border border-border/60 text-foreground px-3 py-2 rounded-none focus:border-primary focus:outline-none"
                      min="1"
                      max="100"
                      step="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">STOP LOSS</label>
                    <input
                      type="number"
                      value={formData.stopLoss || ''}
                      onChange={(e) => updateForm('stopLoss', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="terminal-input w-full bg-background/80 border border-border/60 text-foreground px-3 py-2 rounded-none focus:border-primary focus:outline-none"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">TAKE PROFIT</label>
                    <input
                      type="number"
                      value={formData.takeProfit || ''}
                      onChange={(e) => updateForm('takeProfit', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="terminal-input w-full bg-background/80 border border-border/60 text-foreground px-3 py-2 rounded-none focus:border-primary focus:outline-none"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="p-3 bg-terminal/50 rounded border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-2">
                    <span className="text-primary">$</span> trade_preview
                  </p>
                  <div className="space-y-1 text-xs">
                    <div>Entry Price: {formatPrice(currentPrice)}</div>
                    <div>Position Size: {formatPrice(formData.size * formData.leverage)}</div>
                    <div>Fees: {formatPrice((formData.size * 0.002) + (formData.size * (formData.leverage - 1) * 0.001))}</div>
                    <div>Total Cost: {formatPrice(formData.size + (formData.size * 0.002) + (formData.size * (formData.leverage - 1) * 0.001))}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleExecuteTrade}
                    disabled={executeTrade.isPending}
                    className="terminal-button flex-1"
                  >
                    {executeTrade.isPending ? 'EXECUTING...' : 'EXECUTE TRADE'}
                  </Button>
                  <Button
                    onClick={() => setShowTradeForm(false)}
                    variant="outline"
                    className="terminal-button"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TerminalCard>
          )}

          {/* Open Positions */}
          <TerminalCard title="open_positions" promptText="paper_trading --positions">
            {openPositions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-4">📊</div>
                <p>No open positions</p>
                <p className="text-sm">Click "New Trade" to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openPositions?.map((position) => {
                  const currentPrice = prices?.find(p => p.id === position.pair)?.currentPrice || 0;
                  const pnl = position.type === 'long' 
                    ? (currentPrice - position.entryPrice) / position.entryPrice * position.size * position.leverage
                    : (position.entryPrice - currentPrice) / position.entryPrice * position.size * position.leverage;
                  const pnlPercent = (pnl / position.size) * 100;

                  return (
                    <div key={position.id} className="border border-primary/20 rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-bold">{position.pair}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              position.type === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {position.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-foreground">{position.leverage}x</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Entry: {formatPrice(position.entryPrice)} | Current: {formatPrice(currentPrice)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatPrice(pnl)}
                          </div>
                          <div className={`text-xs ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatPercent(pnlPercent)}
                          </div>
                        </div>
                      </div>
                      
                      {(position.stopLoss || position.takeProfit) && (
                        <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                          {position.stopLoss && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              SL: {formatPrice(position.stopLoss)}
                            </div>
                          )}
                          {position.takeProfit && (
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              TP: {formatPrice(position.takeProfit)}
                            </div>
                          )}
                        </div>
                      )}

                      <Button
                        onClick={() => handleCloseTrade(position.id)}
                        disabled={closeTrade.isPending}
                        size="sm"
                        className="terminal-button"
                      >
                        {closeTrade.isPending ? 'CLOSING...' : 'CLOSE POSITION'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TerminalCard>

          {/* Price Ticker */}
          <TerminalCard title="market_prices" promptText="paper_trading --prices">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {prices?.map((pair) => (
                <div key={pair.id} className="text-center">
                  <div className="text-sm font-bold text-primary">{pair.symbol}</div>
                  <div className="text-lg">{formatPrice(pair.currentPrice)}</div>
                  <div className={`text-xs ${pair.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pair.priceChange24h >= 0 ? (
                      <ArrowUp className="w-3 h-3 inline" />
                    ) : (
                      <ArrowDown className="w-3 h-3 inline" />
                    )}
                    {formatPercent(pair.priceChange24h)}
                  </div>
                </div>
              ))}
            </div>
          </TerminalCard>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default PaperTrading;
