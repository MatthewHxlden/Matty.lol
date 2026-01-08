import { motion } from "framer-motion";
import { useState } from "react";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { ArrowUpDown, TrendingUp, AlertCircle, ExternalLink, Wallet, Plug } from "lucide-react";

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

interface SwapQuote {
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  route: any[];
}

interface WalletInfo {
  name: string;
  icon: string;
  installed: boolean;
  connect: () => Promise<any>;
}

const CryptoSwaps = () => {
  const [fromToken, setFromToken] = useState("So11111111111111111111111111111111111111112"); // SOL
  const [toToken, setToToken] = useState("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // USDC
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wallet, setWallet] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");

  // Common tokens for demo
  const commonTokens: Token[] = [
    {
      address: "So11111111111111111111111111111111111111112",
      symbol: "SOL",
      name: "Solana",
      decimals: 9,
    },
    {
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
    },
    {
      address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
    },
    {
      address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6zjnB7YaB1pPB263",
      symbol: "BONK",
      name: "Bonk",
      decimals: 5,
    },
  ];

  const getQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Convert amount to smallest unit (for SOL, multiply by 1e9)
      const fromTokenDecimals = commonTokens.find(t => t.address === fromToken)?.decimals || 9;
      const amountInSmallestUnit = Math.floor(parseFloat(amount) * Math.pow(10, fromTokenDecimals)).toString();
      
      console.log('Fetching quote:', {
        fromToken,
        toToken,
        amount,
        amountInSmallestUnit,
        fromTokenDecimals
      });
      
      const response = await fetch(
        `https://api.jup.ag/ultra/quote?inputMint=${fromToken}&outputMint=${toToken}&amount=${amountInSmallestUnit}&slippage=0.5`,
        {
          headers: {
            'Authorization': 'Bearer 73825dd1-1e66-4466-a2e9-ad4276bb0168',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Jupiter API error:', response.status, errorText);
        throw new Error(`Jupiter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Jupiter response:', data);
      
      setQuote({
        inputAmount: data.inAmount,
        outputAmount: data.outAmount,
        priceImpact: data.priceImpactPct || 0,
        route: data.route || [],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to get quote: ${errorMessage}`);
      console.error('Quote error:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async () => {
    if (!quote || !wallet || !walletAddress) {
      setError("Please connect a wallet and get a quote first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get swap transaction from Jupiter
      const swapResponse = await fetch(
        `https://api.jup.ag/ultra/swap?inputMint=${fromToken}&outputMint=${toToken}&amount=${quote.inputAmount}&slippage=0.5&userPublicKey=${walletAddress}`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer 73825dd1-1e66-4466-a2e9-ad4276bb0168',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!swapResponse.ok) {
        const errorText = await swapResponse.text();
        console.error('Swap API error:', swapResponse.status, errorText);
        throw new Error(`Failed to create swap transaction: ${swapResponse.status}`);
      }

      const swapData = await swapResponse.json();
      console.log('Swap transaction:', swapData);

      // Sign and send transaction
      if (wallet.isPhantom || wallet.isSolflare) {
        // Solana wallet
        const transaction = swapData.swapTransaction;
        const signedTransaction = await wallet.signAndSendTransaction(transaction);
        console.log('Transaction sent:', signedTransaction);
        alert(`Swap executed! Transaction: ${signedTransaction.signature}`);
      } else if (wallet.isMetaMask) {
        // MetaMask with Solana support
        const transaction = swapData.swapTransaction;
        const signedTransaction = await wallet.request({
          method: 'sol_signAndSendTransaction',
          params: [transaction]
        });
        console.log('Transaction sent:', signedTransaction);
        alert(`Swap executed! Transaction: ${signedTransaction.signature}`);
      }

      // Reset quote after successful swap
      setQuote(null);
      setAmount("");

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to execute swap: ${errorMessage}`);
      console.error('Swap error:', err);
    } finally {
      setLoading(false);
    }
  };

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setQuote(null);
  };

  const formatAmount = (amount: string, decimals: number) => {
    const num = parseFloat(amount) / Math.pow(10, decimals);
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  // Wallet detection and connection
  const detectWallets = (): WalletInfo[] => {
    const wallets: WalletInfo[] = [];

    // Phantom
    if (typeof window !== 'undefined' && (window as any).solana?.isPhantom) {
      wallets.push({
        name: 'Phantom',
        icon: '👻',
        installed: true,
        connect: async () => {
          try {
            const response = await (window as any).solana.connect();
            setWallet((window as any).solana);
            setWalletAddress(response.publicKey.toString());
            return response;
          } catch (err) {
            throw new Error('Failed to connect to Phantom');
          }
        }
      });
    }

    // MetaMask (Solana support)
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      wallets.push({
        name: 'MetaMask',
        icon: '🦊',
        installed: true,
        connect: async () => {
          try {
            // Switch to Solana network
            await (window as any).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x65' }], // Solana mainnet chain ID
            });
            const accounts = await (window as any).ethereum.request({
              method: 'eth_requestAccounts'
            });
            setWallet((window as any).ethereum);
            setWalletAddress(accounts[0]);
            return accounts;
          } catch (err) {
            throw new Error('Failed to connect to MetaMask');
          }
        }
      });
    }

    // Solflare
    if (typeof window !== 'undefined' && (window as any).solflare) {
      wallets.push({
        name: 'Solflare',
        icon: '🔥',
        installed: true,
        connect: async () => {
          try {
            const response = await (window as any).solflare.connect();
            setWallet((window as any).solflare);
            setWalletAddress(response.publicKey.toString());
            return response;
          } catch (err) {
            throw new Error('Failed to connect to Solflare');
          }
        }
      });
    }

    return wallets;
  };

  const connectWallet = async (walletInfo: WalletInfo) => {
    try {
      setError("");
      await walletInfo.connect();
    } catch (err) {
      setError(`Failed to connect wallet: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setWalletAddress("");
  };

  const availableWallets = detectWallets();

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
              <span className="text-foreground">./crypto-swaps --execute</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              <span className="text-secondary">./</span>
              crypto-swaps
            </h1>
            <p className="text-muted-foreground">
              Powered by Jupiter Aggregator - Best rates on Solana
            </p>
          </div>

          {/* Wallet Connection */}
          <TerminalCard title="Wallet Connection" delay={0.1}>
            {!walletAddress ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span>Connect your wallet to swap tokens</span>
                </div>
                
                {availableWallets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {availableWallets.map((walletInfo, index) => (
                      <motion.button
                        key={walletInfo.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => connectWallet(walletInfo)}
                        className="flex items-center gap-3 p-4 border border-border rounded hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <span className="text-2xl">{walletInfo.icon}</span>
                        <div className="text-left">
                          <div className="font-semibold text-foreground">{walletInfo.name}</div>
                          <div className="text-xs text-muted-foreground">Click to connect</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No wallets detected</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Install one of these wallets:</p>
                      <div className="flex justify-center gap-4">
                        <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Phantom</a>
                        <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MetaMask</a>
                        <a href="https://solflare.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Solflare</a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {wallet?.isPhantom ? 'Phantom' : wallet?.isMetaMask ? 'MetaMask' : 'Wallet'} Connected
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-1 text-sm border border-border rounded hover:border-destructive hover:text-destructive transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </TerminalCard>

          {/* Swap Interface */}
          <TerminalCard title="Swap Interface" delay={0.2}>
            <div className="space-y-6">
              {/* From Token */}
              <div className="space-y-2">
                <label className="text-sm text-secondary">From</label>
                <div className="flex gap-2">
                  <select
                    value={fromToken}
                    onChange={(e) => {
                      setFromToken(e.target.value);
                      setQuote(null);
                    }}
                    className="flex-1 bg-background border border-border rounded px-3 py-2 text-foreground"
                  >
                    {commonTokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setQuote(null);
                    }}
                    placeholder="Amount"
                    className="flex-1 bg-background border border-border rounded px-3 py-2 text-foreground"
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={swapTokens}
                  className="p-2 rounded-full bg-background border border-border hover:border-primary transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <label className="text-sm text-secondary">To</label>
                <select
                  value={toToken}
                  onChange={(e) => {
                    setToToken(e.target.value);
                    setQuote(null);
                  }}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-foreground"
                >
                  {commonTokens.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Get Quote Button */}
              <button
                onClick={getQuote}
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Getting Quote..." : "Get Quote"}
              </button>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Quote Display */}
              {quote && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 p-4 bg-background/50 border border-border rounded"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">You'll receive:</span>
                    <span className="text-foreground font-mono">
                      {formatAmount(quote.outputAmount, 6)} {commonTokens.find(t => t.address === toToken)?.symbol}
                    </span>
                  </div>
                  
                  {quote.priceImpact > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-secondary">Price Impact:</span>
                      <span className={`font-mono ${quote.priceImpact > 1 ? 'text-destructive' : 'text-foreground'}`}>
                        {quote.priceImpact.toFixed(2)}%
                      </span>
                    </div>
                  )}

                  <button
                    onClick={executeSwap}
                    className="w-full py-3 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
                  >
                    Execute Swap
                  </button>
                </motion.div>
              )}
            </div>
          </TerminalCard>

          {/* Info Card */}
          <TerminalCard title="About Jupiter" delay={0.4}>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Jupiter is the leading DEX aggregator on Solana, finding the best routes across multiple DEXs to give you optimal trading rates.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-sm">Best rates across multiple DEXs</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-secondary" />
                  <span className="text-sm">Always check price impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <span className="text-sm">Powered by Jupiter API</span>
                </div>
              </div>
              <a
                href="https://jup.ag"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Jupiter
              </a>
            </div>
          </TerminalCard>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default CryptoSwaps;
