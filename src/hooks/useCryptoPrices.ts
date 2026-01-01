import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
}

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

const COINGECKO_IDS = {
  solana: 'solana',
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
  venice: 'venice-token', // Venice token ID on CoinGecko
};

export const useCryptoPrices = () => {
  const { data: prices, isLoading, error } = useQuery({
    queryKey: ['crypto-prices'],
    queryFn: async () => {
      try {
        const ids = Object.values(COINGECKO_IDS).join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch crypto prices');
        }
        
        const data: CoinGeckoResponse = await response.json();
        
        const formattedPrices: CryptoPrice[] = Object.entries(COINGECKO_IDS).map(([symbol, id]) => {
          const coinData = data[id];
          return {
            symbol: symbol.toUpperCase(),
            name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
            price: coinData?.usd || 0,
            change24h: 0, // CoinGecko doesn't provide absolute change, only percentage
            changePercent24h: coinData?.usd_24h_change || 0,
          };
        });
        
        return formattedPrices;
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return {
    prices: prices || [],
    isLoading,
    error,
    formatPrice,
    formatChange,
    getChangeColor,
  };
};
