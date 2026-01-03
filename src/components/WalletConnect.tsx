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

  const wallets = [
    {
      name: "Phantom",
      icon: "👻",
      description: "Most popular Solana wallet",
      connect: async () => {
        if (!window.solana?.isPhantom) {
          window.open("https://phantom.app/", "_blank");
          throw new Error("Phantom wallet not installed");
        }
        const response = await window.solana.connect();
        return response.publicKey.toString();
      }
    },
    {
      name: "Jupiter",
      icon: "🪐",
      description: "Jupiter aggregator wallet",
      connect: async () => {
        // Jupiter uses standard wallet adapter
        if (!window.solana) {
          window.open("https://jup.ag/", "_blank");
          throw new Error("Jupiter wallet not available");
        }
        const response = await window.solana.connect();
        return response.publicKey.toString();
      }
    },
    {
      name: "Backpack",
      icon: "🎒",
      description: "Advanced Solana wallet",
      connect: async () => {
        if (!window.backpack) {
          window.open("https://backpack.app/", "_blank");
          throw new Error("Backpack wallet not installed");
        }
        const response = await window.backpack.connect();
        return response.publicKey.toString();
      }
    },
    {
      name: "MetaMask",
      icon: "🦊",
      description: "EVM wallet (via Solana snap)",
      connect: async () => {
        if (!window.ethereum) {
          window.open("https://metamask.io/", "_blank");
          throw new Error("MetaMask not installed");
        }
        // MetaMask Solana integration would need additional setup
        throw new Error("MetaMask Solana support coming soon");
      }
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
      }
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
                    disabled={connecting}
                    className="w-full p-3 border border-border/50 rounded-lg hover:border-primary hover:bg-muted/20 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{wallet.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{wallet.name}</div>
                        <div className="text-sm text-muted-foreground">{wallet.description}</div>
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
