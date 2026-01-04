import { PaperTrade, PaperPortfolio, PaperTradeRequest, TradingPair } from '@/types/paperTrading';
import { jupiterAPI } from './jupiterAPI';

export class PaperTradingEngine {
  private portfolios: Map<string, PaperPortfolio> = new Map();
  private trades: Map<string, PaperTrade> = new Map();

  async initializePortfolio(userId: string, initialBalance: number = 10000): Promise<PaperPortfolio> {
    const portfolio: PaperPortfolio = {
      userId,
      balance: initialBalance,
      initialBalance,
      totalPnl: 0,
      unrealizedPnl: 0,
      winRate: 0,
      totalTrades: 0,
      openPositions: [],
      closedPositions: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    this.portfolios.set(userId, portfolio);
    return portfolio;
  }

  getPortfolio(userId: string): PaperPortfolio | undefined {
    return this.portfolios.get(userId);
  }

  async executeTrade(userId: string, request: PaperTradeRequest): Promise<PaperTrade> {
    const portfolio = this.portfolios.get(userId);
    if (!portfolio) {
      throw new Error('Portfolio not found. Initialize portfolio first.');
    }

    // Get current price from Jupiter
    const pairs = await jupiterAPI.getSupportedPairs();
    const pair = pairs.find(p => p.id === request.pair);
    if (!pair) {
      throw new Error('Trading pair not supported');
    }

    const currentPrice = pair.currentPrice;
    if (currentPrice === 0) {
      throw new Error('Unable to get current price');
    }

    // Calculate position size and fees
    const positionValue = request.size * request.leverage;
    const fees = jupiterAPI.calculateFees(request.size, request.leverage);
    const totalCost = request.size + fees;

    // Check if user has enough balance
    if (portfolio.balance < totalCost) {
      throw new Error('Insufficient balance');
    }

    // Calculate slippage
    const slippage = jupiterAPI.calculateSlippage(request.size, currentPrice, pair.liquidity);
    const entryPrice = request.type === 'long' 
      ? currentPrice * (1 + slippage)
      : currentPrice * (1 - slippage);

    // Create trade
    const trade: PaperTrade = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      pair: request.pair,
      type: request.type,
      entryPrice,
      size: request.size,
      leverage: request.leverage,
      stopLoss: request.stopLoss,
      takeProfit: request.takeProfit,
      status: 'open',
      openedAt: new Date().toISOString(),
      fees,
      slippage
    };

    // Update portfolio
    portfolio.balance -= totalCost;
    portfolio.openPositions.push(trade);
    portfolio.totalTrades++;
    portfolio.lastUpdated = new Date().toISOString();

    // Store trade
    this.trades.set(trade.id, trade);
    this.portfolios.set(userId, portfolio);

    return trade;
  }

  async closeTrade(userId: string, tradeId: string): Promise<PaperTrade> {
    const portfolio = this.portfolios.get(userId);
    const trade = this.trades.get(tradeId);

    if (!portfolio || !trade) {
      throw new Error('Trade not found');
    }

    if (trade.status !== 'open') {
      throw new Error('Trade is already closed');
    }

    if (trade.userId !== userId) {
      throw new Error('Trade does not belong to user');
    }

    // Get current price
    const pairs = await jupiterAPI.getSupportedPairs();
    const pair = pairs.find(p => p.id === trade.pair);
    if (!pair) {
      throw new Error('Trading pair not found');
    }

    const currentPrice = pair.currentPrice;
    if (currentPrice === 0) {
      throw new Error('Unable to get current price');
    }

    // Calculate P&L
    const priceChange = currentPrice - trade.entryPrice;
    const pnl = trade.type === 'long' 
      ? (priceChange / trade.entryPrice) * trade.size * trade.leverage
      : (-priceChange / trade.entryPrice) * trade.size * trade.leverage;

    // Calculate exit fees
    const exitFees = jupiterAPI.calculateFees(trade.size, trade.leverage);
    const netPnl = pnl - trade.fees - exitFees;

    // Update trade
    trade.status = 'closed';
    trade.closedAt = new Date().toISOString();
    trade.exitPrice = currentPrice;
    trade.pnl = netPnl;

    // Update portfolio
    portfolio.balance += trade.size + netPnl;
    portfolio.totalPnl += netPnl;
    
    // Remove from open positions and add to closed
    portfolio.openPositions = portfolio.openPositions.filter(t => t.id !== tradeId);
    portfolio.closedPositions.push(trade);

    // Update win rate
    const winningTrades = portfolio.closedPositions.filter(t => (t.pnl || 0) > 0).length;
    portfolio.winRate = portfolio.closedPositions.length > 0 
      ? (winningTrades / portfolio.closedPositions.length) * 100 
      : 0;

    portfolio.lastUpdated = new Date().toISOString();

    // Store updated data
    this.trades.set(tradeId, trade);
    this.portfolios.set(userId, portfolio);

    return trade;
  }

  async updatePortfolioPnL(userId: string): Promise<void> {
    const portfolio = this.portfolios.get(userId);
    if (!portfolio) return;

    const pairs = await jupiterAPI.getSupportedPairs();
    let unrealizedPnl = 0;

    // Calculate unrealized P&L for open positions
    for (const trade of portfolio.openPositions) {
      const pair = pairs.find(p => p.id === trade.pair);
      if (!pair || pair.currentPrice === 0) continue;

      const priceChange = pair.currentPrice - trade.entryPrice;
      const pnl = trade.type === 'long' 
        ? (priceChange / trade.entryPrice) * trade.size * trade.leverage
        : (-priceChange / trade.entryPrice) * trade.size * trade.leverage;

      unrealizedPnl += pnl;
    }

    portfolio.unrealizedPnl = unrealizedPnl;
    portfolio.lastUpdated = new Date().toISOString();
    this.portfolios.set(userId, portfolio);
  }

  async checkStopLossAndTakeProfit(userId: string): Promise<PaperTrade[]> {
    const portfolio = this.portfolios.get(userId);
    if (!portfolio) return [];

    const pairs = await jupiterAPI.getSupportedPairs();
    const closedTrades: PaperTrade[] = [];

    for (const trade of portfolio.openPositions) {
      const pair = pairs.find(p => p.id === trade.pair);
      if (!pair || pair.currentPrice === 0) continue;

      let shouldClose = false;

      // Check stop loss
      if (trade.stopLoss) {
        if (trade.type === 'long' && pair.currentPrice <= trade.stopLoss) {
          shouldClose = true;
        } else if (trade.type === 'short' && pair.currentPrice >= trade.stopLoss) {
          shouldClose = true;
        }
      }

      // Check take profit
      if (trade.takeProfit) {
        if (trade.type === 'long' && pair.currentPrice >= trade.takeProfit) {
          shouldClose = true;
        } else if (trade.type === 'short' && pair.currentPrice <= trade.takeProfit) {
          shouldClose = true;
        }
      }

      if (shouldClose) {
        const closedTrade = await this.closeTrade(userId, trade.id);
        closedTrades.push(closedTrade);
      }
    }

    return closedTrades;
  }

  getTradeHistory(userId: string): PaperTrade[] {
    const portfolio = this.portfolios.get(userId);
    if (!portfolio) return [];

    return [...portfolio.closedPositions, ...portfolio.openPositions]
      .sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
  }

  getOpenPositions(userId: string): PaperTrade[] {
    const portfolio = this.portfolios.get(userId);
    return portfolio ? [...portfolio.openPositions] : [];
  }

  async getPortfolioStats(userId: string) {
    const portfolio = this.portfolios.get(userId);
    if (!portfolio) return null;

    await this.updatePortfolioPnL(userId);

    const totalValue = portfolio.balance + portfolio.unrealizedPnl;
    const totalReturn = totalValue - portfolio.initialBalance;
    const returnPercentage = (totalReturn / portfolio.initialBalance) * 100;

    return {
      totalValue,
      totalReturn,
      returnPercentage,
      winRate: portfolio.winRate,
      totalTrades: portfolio.totalTrades,
      openPositions: portfolio.openPositions.length,
      balance: portfolio.balance,
      unrealizedPnl: portfolio.unrealizedPnl
    };
  }
}

// Singleton instance
export const paperTradingEngine = new PaperTradingEngine();
