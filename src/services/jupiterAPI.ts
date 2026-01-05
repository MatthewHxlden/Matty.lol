import { JupiterPrice, JupiterQuote, TradingPair } from '@/types/paperTrading';

// CoinGecko API for accurate prices
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// CoinGecko IDs for our tokens
const COINGECKO_IDS = {
  SOL: 'solana',
  BTC: 'bitcoin', 
  ETH: 'ethereum',
  RAY: 'raydium',
  JUP: 'jupiter-aggregator',
  RNDR: 'render-token',
  USDC: 'usd-coin'
};

// Solana token mints for common pairs
const TOKEN_MINTS = {
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  SOL: 'So11111111111111111111111111111111111111112',
  BTC: '9n4nbM75f5Ui33ZbPYxnHN37iepbEBhC2DyiVzjRGbbQ',
  ETH: '2FPyTwcZLUg1MDYws8Xx2KTNW8HdpfKhpCrygTrAkLfR',
  RAY: '4k3Dyjzvzp8eM4UXycqet7gQgTmGxULTYbQFiqAu1gTH',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedKNsDwJDT',
  RNDR: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
};

export class JupiterAPI {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 2000; // 2 seconds

  private async getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  async getPrices(tokenSymbols: string[]): Promise<JupiterPrice[]> {
    return this.getCachedData(
      `prices_${tokenSymbols.join(',')}`,
      async () => {
        try {
          console.log('Fetching CoinGecko prices for tokens:', tokenSymbols);
          
          // Convert token symbols to CoinGecko IDs
          const coinGeckoIds = tokenSymbols.map(symbol => {
            const upperSymbol = symbol.toUpperCase();
            return COINGECKO_IDS[upperSymbol as keyof typeof COINGECKO_IDS];
          }).filter(Boolean);
          
          if (coinGeckoIds.length === 0) {
            console.warn('No valid CoinGecko IDs found for tokens:', tokenSymbols);
            return this.getFallbackPrices(tokenSymbols);
          }
          
          const response = await fetch(
            `${COINGECKO_API_BASE}/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
          );
          
          console.log('CoinGecko API response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('CoinGecko API error response:', errorText);
            throw new Error(`CoinGecko API failed: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log('CoinGecko API response data:', data);
          
          // Convert CoinGecko response to JupiterPrice format
          const prices: JupiterPrice[] = tokenSymbols.map(symbol => {
            const upperSymbol = symbol.toUpperCase();
            const coinGeckoId = COINGECKO_IDS[upperSymbol as keyof typeof COINGECKO_IDS];
            const coinData = coinGeckoId ? data[coinGeckoId] : null;
            
            return {
              id: symbol,
              price: coinData?.usd?.toString() || '0',
              priceChange24h: coinData?.usd_24h_change?.toString() || '0'
            };
          });
          
          return prices;
        } catch (error) {
          console.error('CoinGecko API failed, using fallback prices:', error);
          return this.getFallbackPrices(tokenSymbols);
        }
      }
    );
  }

  private getFallbackPrices(tokenSymbols: string[]): JupiterPrice[] {
    // Fallback mock prices updated to current market values (January 2025)
    const mockPrices: Record<string, number> = {
      'SOL': 238.45,     // SOL (current ~$240)
      'BTC': 102450,     // BTC (current ~$102k)
      'ETH': 3480,       // ETH (current ~$3.5k)
      'RAY': 4.82,       // RAY (current ~$4.8)
      'JUP': 1.25,       // JUP (current ~$1.25)
      'RNDR': 7.35,      // RNDR (current ~$7.3)
      'USDC': 1.00       // USDC (stablecoin)
    };

    console.log('Using fallback prices for tokens:', tokenSymbols);
    
    return tokenSymbols.map(symbol => ({
      id: symbol,
      price: mockPrices[symbol]?.toString() || '0',
      priceChange24h: ((Math.random() - 0.5) * 8).toString() // Random -4% to +4%
    }));
  }

  async getPrice(tokenSymbol: string): Promise<number> {
    const prices = await this.getPrices([tokenSymbol]);
    const price = prices.find(p => p.id === tokenSymbol);
    return price ? parseFloat(price.price) : 0;
  }

  async getQuote(inputSymbol: string, outputSymbol: string, amount: number): Promise<JupiterQuote> {
    return this.getCachedData(
      `quote_${inputSymbol}_${outputSymbol}_${amount}`,
      async () => {
        try {
          // Get prices for both tokens
          const prices = await this.getPrices([inputSymbol, outputSymbol]);
          const inputPrice = prices.find(p => p.id === inputSymbol);
          const outputPrice = prices.find(p => p.id === outputSymbol);
          
          if (!inputPrice || !outputPrice || parseFloat(inputPrice.price) === 0 || parseFloat(outputPrice.price) === 0) {
            throw new Error('Unable to get prices for quote calculation');
          }
          
          const inputPriceNum = parseFloat(inputPrice.price);
          const outputPriceNum = parseFloat(outputPrice.price);
          
          // Calculate exchange rate
          const exchangeRate = inputPriceNum / outputPriceNum;
          const outputAmount = amount * exchangeRate;
          
          // Add slippage (1% = 100 bps)
          const slippageBps = 100;
          const slippageFactor = (10000 - slippageBps) / 10000;
          const outputAmountWithSlippage = outputAmount * slippageFactor;
          
          // Add fee (0.1% typical for DEX)
          const feeAmount = outputAmount * 0.001;
          
          return {
            inputMint: inputSymbol,
            outputMint: outputSymbol,
            inputAmount: amount.toString(),
            outputAmount: outputAmountWithSlippage.toString(),
            priceImpactPct: '0.1', // Small price impact for estimation
            slippageBps: slippageBps.toString(),
            routePlan: [{
              swapInfo: {
                ammKey: 'coingecko-simulation',
                label: `${inputSymbol}/${outputSymbol}`,
                inputMint: inputSymbol,
                outputMint: outputSymbol,
                inAmount: amount.toString(),
                outAmount: outputAmountWithSlippage.toString(),
                feeAmount: feeAmount.toString(),
                feeMint: outputSymbol
              }
            }]
          };
        } catch (error) {
          console.error('Failed to calculate quote:', error);
          throw new Error('Failed to calculate quote');
        }
      }
    );
  }

  async getSupportedPairs(): Promise<TradingPair[]> {
    const pairs: TradingPair[] = [
      {
        id: 'SOL-USDC',
        symbol: 'SOL/USDC',
        baseMint: TOKEN_MINTS.SOL,
        quoteMint: TOKEN_MINTS.USDC,
        currentPrice: 0,
        priceChange24h: 0,
        volume24h: 0,
        liquidity: 0,
        supported: true
      },
      {
        id: 'BTC-USDC',
        symbol: 'BTC/USDC',
        baseMint: TOKEN_MINTS.BTC,
        quoteMint: TOKEN_MINTS.USDC,
        currentPrice: 0,
        priceChange24h: 0,
        volume24h: 0,
        liquidity: 0,
        supported: true
      },
      {
        id: 'ETH-USDC',
        symbol: 'ETH/USDC',
        baseMint: TOKEN_MINTS.ETH,
        quoteMint: TOKEN_MINTS.USDC,
        currentPrice: 0,
        priceChange24h: 0,
        volume24h: 0,
        liquidity: 0,
        supported: true
      },
      {
        id: 'RAY-USDC',
        symbol: 'RAY/USDC',
        baseMint: TOKEN_MINTS.RAY,
        quoteMint: TOKEN_MINTS.USDC,
        currentPrice: 0,
        priceChange24h: 0,
        volume24h: 0,
        liquidity: 0,
        supported: true
      },
      {
        id: 'JUP-USDC',
        symbol: 'JUP/USDC',
        baseMint: TOKEN_MINTS.JUP,
        quoteMint: TOKEN_MINTS.USDC,
        currentPrice: 0,
        priceChange24h: 0,
        volume24h: 0,
        liquidity: 0,
        supported: true
      },
      {
        id: 'RNDR-USDC',
        symbol: 'RNDR/USDC',
        baseMint: TOKEN_MINTS.RNDR,
        quoteMint: TOKEN_MINTS.USDC,
        currentPrice: 0,
        priceChange24h: 0,
        volume24h: 0,
        liquidity: 0,
        supported: true
      }
    ];

    // Update with current prices
    const tokenSymbols = pairs.map(pair => pair.id.split('-')[0]); // Extract base token symbol
    const prices = await this.getPrices(tokenSymbols);
    
    return pairs.map(pair => {
      const baseSymbol = pair.id.split('-')[0];
      const price = prices.find(p => p.id === baseSymbol);
      return {
        ...pair,
        currentPrice: price ? parseFloat(price.price) : 0,
        priceChange24h: price?.priceChange24h ? parseFloat(price.priceChange24h) : 0
      };
    });
  }

  calculateSlippage(size: number, currentPrice: number, liquidity: number): number {
    // Simple slippage calculation based on trade size vs liquidity
    const tradeValue = size * currentPrice;
    const slippageRate = Math.min(tradeValue / liquidity * 0.01, 0.05); // Max 5% slippage
    return slippageRate;
  }

  calculateFees(size: number, leverage: number): number {
    // Jupiter fees are typically 0.1-0.3%
    const baseFee = size * 0.002; // 0.2% base fee
    const leverageFee = size * (leverage - 1) * 0.001; // Additional fee for leverage
    return baseFee + leverageFee;
  }

  getTokenMint(symbol: string): string {
    return TOKEN_MINTS[symbol as keyof typeof TOKEN_MINTS] || '';
  }

  getSupportedTokens(): string[] {
    return Object.keys(TOKEN_MINTS);
  }
}

// Singleton instance
export const jupiterAPI = new JupiterAPI();
