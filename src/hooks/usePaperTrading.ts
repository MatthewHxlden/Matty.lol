import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { PaperPortfolio, PaperTrade, TradingPair, PaperTradeRequest } from '@/types/paperTrading';
import { jupiterAPI } from '@/services/jupiterAPI';
import { paperTradingEngine } from '@/services/paperTradingEngine';

// Mock user ID - in real app, this would come from auth
const CURRENT_USER_ID = 'demo_user';

export const usePaperTrading = () => {
  const queryClient = useQueryClient();

  // Initialize portfolio mutation
  const initializePortfolio = useMutation({
    mutationFn: (initialBalance: number) => 
      paperTradingEngine.initializePortfolio(CURRENT_USER_ID, initialBalance),
    onSuccess: (portfolio) => {
      queryClient.setQueryData(['paperPortfolio'], portfolio);
    }
  });

  // Execute trade mutation
  const executeTrade = useMutation({
    mutationFn: (tradeRequest: PaperTradeRequest) => 
      paperTradingEngine.executeTrade(CURRENT_USER_ID, tradeRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paperPortfolio'] });
      queryClient.invalidateQueries({ queryKey: ['paperTrades'] });
      queryClient.invalidateQueries({ queryKey: ['paperStats'] });
    }
  });

  // Close trade mutation
  const closeTrade = useMutation({
    mutationFn: (tradeId: string) => 
      paperTradingEngine.closeTrade(CURRENT_USER_ID, tradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paperPortfolio'] });
      queryClient.invalidateQueries({ queryKey: ['paperTrades'] });
      queryClient.invalidateQueries({ queryKey: ['paperStats'] });
    }
  });

  return {
    initializePortfolio,
    executeTrade,
    closeTrade
  };
};

export const usePaperPortfolio = () => {
  const [portfolio, setPortfolio] = useState<PaperPortfolio | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['paperPortfolio'],
    queryFn: async () => {
      let portfolio = paperTradingEngine.getPortfolio(CURRENT_USER_ID);
      
      // Initialize if not exists
      if (!portfolio) {
        portfolio = await paperTradingEngine.initializePortfolio(CURRENT_USER_ID, 10000);
      }
      
      // Update P&L
      await paperTradingEngine.updatePortfolioPnL(CURRENT_USER_ID);
      
      return paperTradingEngine.getPortfolio(CURRENT_USER_ID);
    },
    refetchInterval: 2000, // Update every 2 seconds
  });

  useEffect(() => {
    if (data) {
      setPortfolio(data);
    }
  }, [data]);

  return { portfolio: data, isLoading, error };
};

export const usePaperTrades = () => {
  return useQuery({
    queryKey: ['paperTrades'],
    queryFn: async () => {
      return paperTradingEngine.getTradeHistory(CURRENT_USER_ID);
    },
    refetchInterval: 2000,
  });
};

export const useOpenPositions = () => {
  return useQuery({
    queryKey: ['openPositions'],
    queryFn: async () => {
      return paperTradingEngine.getOpenPositions(CURRENT_USER_ID);
    },
    refetchInterval: 2000,
  });
};

export const usePaperStats = () => {
  return useQuery({
    queryKey: ['paperStats'],
    queryFn: async () => {
      return paperTradingEngine.getPortfolioStats(CURRENT_USER_ID);
    },
    refetchInterval: 2000,
  });
};

export const useJupiterPrices = () => {
  return useQuery({
    queryKey: ['jupiterPrices'],
    queryFn: async () => {
      const pairs = await jupiterAPI.getSupportedPairs();
      return pairs;
    },
    refetchInterval: 2000,
  });
};

export const useStopLossCheck = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(async () => {
      const closedTrades = await paperTradingEngine.checkStopLossAndTakeProfit(CURRENT_USER_ID);
      if (closedTrades.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['paperPortfolio'] });
        queryClient.invalidateQueries({ queryKey: ['paperTrades'] });
        queryClient.invalidateQueries({ queryKey: ['paperStats'] });
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [queryClient]);
};

export const usePaperTradingForm = () => {
  const [formData, setFormData] = useState<PaperTradeRequest>({
    pair: 'SOL-USDC',
    type: 'long',
    size: 100,
    leverage: 1,
    stopLoss: undefined,
    takeProfit: undefined
  });

  const updateForm = (field: keyof PaperTradeRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      pair: 'SOL-USDC',
      type: 'long',
      size: 100,
      leverage: 1,
      stopLoss: undefined,
      takeProfit: undefined
    });
  };

  const validateForm = (portfolio: PaperPortfolio | null): string[] => {
    const errors: string[] = [];

    if (!portfolio) {
      errors.push('Portfolio not initialized');
      return errors;
    }

    if (formData.size <= 0) {
      errors.push('Size must be greater than 0');
    }

    if (formData.leverage < 1 || formData.leverage > 100) {
      errors.push('Leverage must be between 1 and 100');
    }

    const fees = jupiterAPI.calculateFees(formData.size, formData.leverage);
    const totalCost = formData.size + fees;

    if (portfolio.balance < totalCost) {
      errors.push(`Insufficient balance. Need $${totalCost.toFixed(2)}, have $${portfolio.balance.toFixed(2)}`);
    }

    if (formData.stopLoss && formData.takeProfit) {
      if (formData.type === 'long' && formData.stopLoss >= formData.takeProfit) {
        errors.push('Stop loss must be below take profit for long positions');
      }
      if (formData.type === 'short' && formData.stopLoss <= formData.takeProfit) {
        errors.push('Stop loss must be above take profit for short positions');
      }
    }

    return errors;
  };

  return {
    formData,
    updateForm,
    resetForm,
    validateForm
  };
};
