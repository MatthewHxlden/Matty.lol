import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Wallet, X, CheckCircle, AlertCircle } from "lucide-react";

// Extend Window interface for wallet providers
declare global {
  interface Window {
    solana?: any;
    backpack?: any;
    ethereum?: any;
    jupiter?: any;
    glow?: any;
    brave?: any;
  }
}

interface WalletConnectProps {
  onConnect: (address: string) => void;
  connected: boolean;
  walletAddress: string;
}

const WalletConnect = ({ onConnect, connected, walletAddress }: WalletConnectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Detect available wallets
  const availableWallets = {
    phantom: !!window.solana?.isPhantom,
    backpack: !!window.backpack,
    metamask: !!window.ethereum,
    jupiter: !!window.jupiter || !!(window as any).solana?.isJupiter, // Try multiple Jupiter detection methods
    glow: !!(window as any).glow,
    brave: !!window.brave,
  };

  // Log detected wallets for debugging
  console.log("Detected wallets:", availableWallets);
  console.log("window.solana:", window.solana);
  console.log("window.backpack:", window.backpack);
  console.log("window.ethereum:", window.ethereum);
  console.log("window.jupiter:", window.jupiter);

  const wallets = [
    {
      name: "MetaMask",
      icon: "🦊",
      description: availableWallets.metamask ? "Click to connect" : "Not detected - install extension",
      connect: async () => {
        try {
          // Check if MetaMask is installed
          if (!window.ethereum) {
            window.open("https://metamask.io/", "_blank");
            throw new Error("MetaMask not installed. Please install MetaMask browser extension.");
          }
          
          const provider = window.ethereum;
          
          // Try to connect to MetaMask and get accounts
          try {
            const accounts = await provider.request({
              method: 'eth_requestAccounts'
            });
            
            if (accounts && accounts.length > 0) {
              console.log("Connected to MetaMask:", accounts[0]);
              // For now, return the Ethereum address as a placeholder
              // In a real implementation, you'd need to handle Solana-specific MetaMask integration
              return accounts[0];
            }
          } catch (error: any) {
            console.error("MetaMask connection error:", error);
            throw new Error(`MetaMask connection failed: ${error.message}`);
          }
          
          throw new Error("No accounts found in MetaMask");
        } catch (error) {
          console.error("MetaMask connection error:", error);
          if (error instanceof Error && error.message.includes("not installed")) {
            throw error;
          }
          throw error;
        }
      },
      available: availableWallets.metamask
    },
    {
      name: "Jupiter",
      icon: "🪐",
      description: availableWallets.jupiter ? "Click to connect" : "Not detected - install extension",
      connect: async () => {
        try {
          console.log("Attempting Jupiter connection...");
          
          // Method 1: Try window.jupiter directly
          if (window.jupiter) {
            console.log("Found window.jupiter, connecting...");
            const response = await window.jupiter.connect();
            console.log("Connected to Jupiter via window.jupiter:", response.publicKey.toString());
            return response.publicKey.toString();
          }
          
          // Method 2: Try window.solana if it's Jupiter
          if ((window as any).solana?.isJupiter) {
            console.log("Found Jupiter via window.solana.isJupiter, connecting...");
            const response = await (window as any).solana.connect();
            console.log("Connected to Jupiter via window.solana:", response.publicKey.toString());
            return response.publicKey.toString();
          }
          
          // Method 3: Try any available Solana wallet (Jupiter might be using standard adapter)
          if (window.solana) {
            console.log("Trying generic Solana connection for Jupiter...");
            const response = await window.solana.connect();
            console.log("Connected to generic Solana wallet (might be Jupiter):", response.publicKey.toString());
            return response.publicKey.toString();
          }
          
          // No Jupiter wallet found
          window.open("https://jup.ag/wallet", "_blank");
          throw new Error("Jupiter wallet not detected. Please install Jupiter browser extension and refresh the page.");
        } catch (error) {
          console.error("Jupiter connection error:", error);
          if (error instanceof Error && error.message.includes("not detected")) {
            throw error;
          }
          throw new Error(`Failed to connect to Jupiter: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      },
      available: availableWallets.jupiter
    },
    {
      name: "Phantom",
      icon: "👻",
      description: availableWallets.phantom ? "Click to connect" : "Not detected - install extension",
      connect: async () => {
        try {
          // Check if Phantom is installed
          if (!window.solana?.isPhantom) {
            window.open("https://phantom.app/", "_blank");
            throw new Error("Phantom wallet not installed. Please install Phantom browser extension.");
          }
          
          // Request connection to Phantom
          console.log("Connecting to Phantom wallet...");
          const response = await window.solana.connect();
          console.log("Connected to Phantom:", response.publicKey.toString());
          return response.publicKey.toString();
        } catch (error) {
          console.error("Phantom connection error:", error);
          if (error instanceof Error && error.message.includes("not installed")) {
            throw error;
          }
          throw new Error("Failed to connect to Phantom. Please make sure Phantom is unlocked and try again.");
        }
      },
      available: availableWallets.phantom
    },
    {
      name: "Backpack",
      icon: "🎒",
      description: availableWallets.backpack ? "Click to connect" : "Not detected - install extension",
      connect: async () => {
        try {
          // Check if Backpack is installed
          if (!window.backpack) {
            window.open("https://backpack.app/", "_blank");
            throw new Error("Backpack wallet not installed. Please install Backpack browser extension.");
          }
          
          // Request connection to Backpack
          console.log("Connecting to Backpack wallet...");
          const response = await window.backpack.connect();
          console.log("Connected to Backpack:", response.publicKey.toString());
          return response.publicKey.toString();
        } catch (error) {
          console.error("Backpack connection error:", error);
          if (error instanceof Error && error.message.includes("not installed")) {
            throw error;
          }
          throw new Error("Failed to connect to Backpack. Please make sure Backpack is unlocked and try again.");
        }
      },
      available: availableWallets.backpack
    },
    {
      name: "Manual Address",
      icon: "⌨️",
      description: "Enter wallet address manually",
      connect: async () => {
        const address = prompt("Enter your Solana wallet address:");
        if (!address) throw new Error("No address provided");
        
        // Basic validation
        if (address.length < 32 || address.length > 44) {
          throw new Error("Invalid Solana address format");
        }
        
        return address;
      },
      available: true // Always available
    }
  ];

  const handleConnect = async (wallet: typeof wallets[0]) => {
    setConnecting(true);
    try {
      const address = await wallet.connect();
      onConnect(address);
      setIsOpen(false);
    } catch (error) {
      console.error(`Failed to connect to ${wallet.name}:`, error);
      alert(`Failed to connect to ${wallet.name}: ${(error as Error).message}`);
    } finally {
      setConnecting(false);
    }
  };

  if (connected && walletAddress) {
    return (
      <div className="flex items-center gap-3 p-4 border border-border/50 bg-muted/20 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">Connected Wallet</div>
          <div className="font-mono text-foreground">
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>

      {isOpen && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9999]"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card border border-border rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden relative">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-bold text-foreground">Connect Wallet</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleConnect(wallet)}
                    disabled={connecting || !wallet.available}
                    className={`w-full p-3 border rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                      wallet.available 
                        ? 'border-border/50 hover:border-primary hover:bg-muted/20' 
                        : 'border-border/20 bg-muted/10 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{wallet.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {wallet.name}
                          {wallet.available ? (
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="Available" />
                          ) : (
                            <div className="w-2 h-2 bg-red-500 rounded-full" title="Not installed" />
                          )}
                        </div>
                        <div className={`text-sm ${
                          wallet.available ? 'text-muted-foreground' : 'text-destructive'
                        }`}>
                          {wallet.description}
                        </div>
                      </div>
                      {connecting && (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <div>
                    Make sure your wallet is installed and unlocked. Some wallets may need to be connected to Solana mainnet.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default WalletConnect;
