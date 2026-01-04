export interface PaperTrade {
  id: string;
  userId: string;
  pair: string;
  type: 'long' | 'short';
  entryPrice: number;
  size: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  exitPrice?: number;
  pnl?: number;
  fees: number;
  slippage: number;
}

export interface PaperPortfolio {
  userId: string;
  balance: number;
  initialBalance: number;
  totalPnl: number;
  unrealizedPnl: number;
  winRate: number;
  totalTrades: number;
  openPositions: PaperTrade[];
  closedPositions: PaperTrade[];
  createdAt: string;
  lastUpdated: string;
}

export interface JupiterPrice {
  id: string;
  price: string;
  priceChange24h?: string;
}

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  outputAmount: string;
  priceImpactPct: string;
  slippageBps: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
  }>;
}

export interface TradingPair {
  id: string;
  symbol: string;
  baseMint: string;
  quoteMint: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  supported: boolean;
}

export interface PaperTradeRequest {
  pair: string;
  type: 'long' | 'short';
  size: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
}
