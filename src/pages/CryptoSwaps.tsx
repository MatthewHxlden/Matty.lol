import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { ArrowUpDown, TrendingUp, AlertCircle, ExternalLink, Wallet, X } from "lucide-react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// Type declarations for Jupiter Plugin
declare global {
  interface Window {
    Jupiter?: {
      init: (options: any) => void;
      destroy: () => void;
      open?: () => void;
    };
  }
}

const CryptoSwaps = () => {
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();
  const [isPluginLoaded, setIsPluginLoaded] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const pluginRef = useRef<any>(null);

  // Fetch SOL balance when wallet connects
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey || !connection) return;
      
      setLoadingBalance(true);
      setBalanceError(null);
      try {
        const balance = await connection.getBalance(publicKey);
        setSolBalance(balance / 1e9); // Convert lamports to SOL
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalanceError('Failed to fetch balance');
        setSolBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    };

    if (connected && publicKey && connection) {
      fetchBalance();
    } else {
      setSolBalance(null);
      setBalanceError(null);
    }
  }, [connected, publicKey, connection]);

  // Initialize Jupiter Plugin only once when loaded and wallet is connected
  useEffect(() => {
    if (!isPluginLoaded || !window.Jupiter || !connected) return;

    const timer = setTimeout(() => {
      const container = document.getElementById('jupiter-plugin-container');
      if (!container) {
        console.error('Jupiter Plugin container not found');
        return;
      }

      // Clear container before re-initializing
      container.innerHTML = '';

      // Destroy previous instance if exists
      if (pluginRef.current && pluginRef.current.destroy) {
        pluginRef.current.destroy();
      }

      console.log('Initializing Jupiter Plugin');

      try {
        window.Jupiter.init({
          enableWalletPassthrough: true,
          displayMode: 'modal', // Use modal to trigger wallet popup
          container: container,
          formProps: {
            inputMint: 'So11111111111111111111111111111111111111112',
            outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            amount: solBalance ? Math.max(0.01, Math.min(solBalance * 0.99, solBalance)).toString() : '0.1',
            slippageBps: 100,
          },
          callbacks: {
            onSwapSuccess: (swapData: any) => {
              console.log('Swap successful:', swapData);
              // Refresh balance after successful swap
              setTimeout(() => {
                if (publicKey && connection) {
                  connection.getBalance(publicKey).then(balance => {
                    setSolBalance(balance / 1e9);
                  }).catch(error => {
                    console.error('Error fetching balance after swap:', error);
                  });
                }
              }, 2000);
            },
            onSwapError: (error: any) => {
              console.error('Swap error:', error);
            },
          },
        });
        pluginRef.current = window.Jupiter;
        console.log('Jupiter Plugin initialized successfully');
      } catch (error) {
        console.error('Error initializing Jupiter Plugin:', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isPluginLoaded, connected]); // Only re-initialize when connection status changes

  useEffect(() => {
    // Load Jupiter Plugin script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@jup-ag/plugin@latest/dist/index.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Jupiter Plugin script loaded');
      setIsPluginLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Jupiter Plugin');
      setIsPluginLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (pluginRef.current && pluginRef.current.destroy) {
        pluginRef.current.destroy();
      }
    };
  }, []);

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* COMING SOON Banner */}
          <div className="relative overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 transform -rotate-3 scale-110"></div>
            <div className="relative bg-gradient-to-r from-yellow-600/90 to-orange-600/90 text-white p-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-white/20 px-4 py-2 rounded-full transform -rotate-12">
                  <span className="font-bold text-sm tracking-wider">BETA</span>
                </div>
                <h2 className="text-3xl font-bold">COMING SOON</h2>
                <div className="bg-white/20 px-4 py-2 rounded-full transform rotate-12">
                  <span className="font-bold text-sm tracking-wider">V2</span>
                </div>
              </div>
              <p className="mt-2 text-yellow-100">
                This tool is currently under development. Check back soon for the crypto swaps feature!
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">./crypto-swaps --execute</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground opacity-50">
              <span className="text-secondary">./</span>
              crypto-swaps
            </h1>
            <p className="text-muted-foreground opacity-50">
              Powered by Jupiter Plugin - Best rates on Solana
            </p>
          </div>

          {/* Disabled Content */}
          <div className="relative opacity-30 pointer-events-none">
            {/* Wallet Balance */}
            <TerminalCard title="Wallet Connection" delay={0.1}>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="w-4 h-4" />
                    <span>
                      {connected ? "Wallet connected" : "Connect your wallet to swap tokens"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <WalletMultiButton className="!bg-primary !text-primary-foreground !hover:bg-primary/90" />
                    {connected && (
                      <button
                        onClick={disconnect}
                        className="px-3 py-1 text-sm border border-border rounded hover:border-destructive hover:text-destructive transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
                
                {connected && publicKey && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Address: <span className="text-foreground font-mono">{publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</span>
                    </div>
                    
                    {loadingBalance ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm text-muted-foreground">Fetching balance...</span>
                      </div>
                    ) : balanceError ? (
                      <div className="text-sm text-destructive">
                        {balanceError}
                      </div>
                    ) : solBalance !== null ? (
                      <div className="space-y-2">
                        <div className="text-lg font-semibold text-foreground">
                          {solBalance.toFixed(4)} SOL
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Available for swap: {(solBalance * 0.99).toFixed(4)} SOL (1% for fees)
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No balance data
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TerminalCard>

            {/* Jupiter Plugin Container */}
            <TerminalCard title="Jupiter Swap Plugin" delay={0.2}>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span>
                    {isPluginLoaded && connected ? "Click button below to open Jupiter Swap" : 
                     isPluginLoaded ? "Connect wallet first" : "Loading Jupiter Plugin..."}
                  </span>
                </div>
                
                {isPluginLoaded && connected ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        if (window.Jupiter && window.Jupiter.open) {
                          window.Jupiter.open();
                        }
                      }}
                      className="w-full py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      Open Jupiter Swap
                    </button>
                    <p className="text-xs text-muted-foreground text-center">
                      This will open Jupiter's swap interface in a modal
                    </p>
                  </div>
                ) : !isPluginLoaded ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : null}
                
                <div 
                  id="jupiter-plugin-container" 
                  className="hidden" // Hide container since we're using modal
                >
                  {/* Jupiter Plugin will be rendered here but hidden */}
                </div>
              </div>
            </TerminalCard>

            {/* Info Card */}
            <TerminalCard title="About Jupiter Plugin" delay={0.4}>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Jupiter Plugin provides seamless integration of swap functionality directly into applications without redirects.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-sm">Best rates across multiple DEXs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-secondary" />
                    <span className="text-sm">RPC-less - Ultra handles everything</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    <span className="text-sm">Powered by Jupiter Ultra API</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Features:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Multiple display modes (integrated, widget, modal)</li>
                    <li>Wallet Standard support</li>
                    <li>Customizable swap form</li>
                    <li>Referral fee support</li>
                    <li>Real-time token information</li>
                  </ul>
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
          </div>

          {/* Info Card */}
          <TerminalCard title="~/tools/crypto-swaps/info.log" promptText="cat development.status">
            <div className="space-y-4">
              <div className="p-4 border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <h3 className="font-semibold text-yellow-600">Development Status</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Wallet integration in progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Jupiter Plugin being refined</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Swap interface under development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Fee optimization planned</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-border/50 bg-blue-500/10">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-blue-600">What This Tool Will Do</h3>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Connect to Solana wallets</li>
                  <li>• Display wallet balance</li>
                  <li>• Access Jupiter aggregator for best rates</li>
                  <li>• Seamlessly swap tokens on Solana</li>
                </ul>
              </div>
            </div>
          </TerminalCard>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default CryptoSwaps;
