import { JupiterPrice, JupiterQuote, TradingPair } from '@/types/paperTrading';

const JUPITER_API_BASE = 'https://price.jup.ag/v6';
const JUPITER_QUOTE_API = 'https://quote.jup.ag/v6';
const JUPITER_TOKEN_LIST = 'https://token.jup.ag/all';
const JUPITER_API_KEY = '73825dd1-1e66-4466-a2e9-ad4276bb0168';

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

  async getPrices(tokenIds: string[]): Promise<JupiterPrice[]> {
    return this.getCachedData(
      `prices_${tokenIds.join(',')}`,
      async () => {
        try {
          console.log('Fetching Jupiter prices for tokens:', tokenIds);
          
          // Try multiple authentication methods
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          // Method 1: Bearer token
          headers['Authorization'] = `Bearer ${JUPITER_API_KEY}`;
          
          const response = await fetch(`${JUPITER_API_BASE}/price?ids=${tokenIds.join(',')}`, {
            headers
          });
          
          console.log('Jupiter API response status:', response.status);
          
          if (!response.ok) {
            // Try without API key (public endpoint)
            console.log('Trying without API key...');
            const publicResponse = await fetch(`${JUPITER_API_BASE}/price?ids=${tokenIds.join(',')}`);
            
            if (publicResponse.ok) {
              const data = await publicResponse.json();
              console.log('Jupiter public API response data:', data);
              return data.data || [];
            }
            
            const errorText = await response.text();
            console.error('Jupiter API error response:', errorText);
            throw new Error(`Jupiter API failed: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Jupiter API response data:', data);
          
          if (!data.data || data.data.length === 0) {
            console.warn('Jupiter API returned no price data');
            throw new Error('No price data returned from Jupiter API');
          }
          
          return data.data;
        } catch (error) {
          console.error('Jupiter API failed, using fallback prices:', error);
          // Fallback to mock prices if API fails
          return this.getFallbackPrices(tokenIds);
        }
      }
    );
  }

  private getFallbackPrices(tokenIds: string[]): JupiterPrice[] {
    // Fallback mock prices updated to current market values (January 2025)
    const mockPrices: Record<string, number> = {
      'So11111111111111111111111111111111111111112': 238.45, // SOL (current ~$240)
      '9n4nbM75f5Ui33ZbPYxnHN37iepbEBhC2DyiVzjRGbbQ': 102450, // BTC (current ~$102k)
      '2FPyTwcZLUg1MDYws8Xx2KTNW8HdpfKhpCrygTrAkLfR': 3480, // ETH (current ~$3.5k)
      '4k3Dyjzvzp8eM4UXycqet7gQgTmGxULTYbQFiqAu1gTH': 4.82, // RAY (current ~$4.8)
      'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedKNsDwJDT': 1.25, // JUP (current ~$1.25)
      '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM': 7.35, // RNDR (current ~$7.3)
    };

    console.log('Using fallback prices for tokens:', tokenIds);
    
    return tokenIds.map(id => ({
      id,
      price: mockPrices[id]?.toString() || '0',
      priceChange24h: ((Math.random() - 0.5) * 8).toString() // Random -4% to +4%
    }));
  }

  async getPrice(tokenId: string): Promise<number> {
    const prices = await this.getPrices([tokenId]);
    const price = prices.find(p => p.id === tokenId);
    return price ? parseFloat(price.price) : 0;
  }

  async getQuote(inputMint: string, outputMint: string, amount: number): Promise<JupiterQuote> {
    const inputAmount = Math.floor(amount * 1_000_000); // Convert to smallest unit (USDC has 6 decimals)
    
    return this.getCachedData(
      `quote_${inputMint}_${outputMint}_${inputAmount}`,
      async () => {
        const response = await fetch(
          `${JUPITER_QUOTE_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${inputAmount}&slippageBps=100`,
          {
            headers: {
              'Authorization': `Bearer ${JUPITER_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch Jupiter quote');
        }
        return response.json();
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
    const tokenIds = pairs.map(pair => pair.baseMint);
    const prices = await this.getPrices(tokenIds);
    
    return pairs.map(pair => {
      const price = prices.find(p => p.id === pair.baseMint);
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
