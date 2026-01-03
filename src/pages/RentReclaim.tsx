import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import WalletConnect from "@/components/WalletConnect";
import { Trash2, AlertCircle, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import TypeWriter from "@/components/TypeWriter";

// Extend Window interface for Solana wallet
declare global {
  interface Window {
    solana?: any;
  }
}

interface AccountInfo {
  pubkey: string;
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
  isReclaimable: boolean;
  hasBalance: boolean;
}

const RentReclaim = () => {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [scanning, setScanning] = useState(false);
  const [reclaiming, setReclaiming] = useState<string[]>([]);
  const [totalReclaimable, setTotalReclaimable] = useState(0);
  const [feeAddress] = useState("9NuiHh5wgRPx69BFGP1ZR8kHiBENGoJrXs5GpZzKAyn8");
  const [feePercentage] = useState(0.15); // 15% fee

  const connection = new Connection("https://api.mainnet-beta.solana.com");

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
    setConnected(true);
  };

  const scanAccounts = async () => {
    if (!walletAddress) {
      console.error("No wallet address provided");
      return;
    }

    // Validate if it's a Solana address
    try {
      new PublicKey(walletAddress);
    } catch (error) {
      console.error("Invalid Solana address:", walletAddress);
      alert("This appears to be an Ethereum address, not a Solana address. Please connect a Solana wallet (Phantom, Backpack, or Jupiter) or enter a Solana address manually.");
      return;
    }

    setScanning(true);
    try {
      console.log("Scanning accounts for:", walletAddress);
      const publicKey = new PublicKey(walletAddress);
      
      // Get all token accounts for the wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
      });

      console.log("Found token accounts:", tokenAccounts.value.length);

      const accountInfos: AccountInfo[] = [];
      let reclaimableTotal = 0;

      for (const account of tokenAccounts.value) {
        try {
          const parsedInfo = account.account.data.parsed;
          const info = parsedInfo.info;
          
          // Check if account has tokens
          const tokenAmount = parsedInfo.info.tokenAmount?.uiAmount || 0;
          const isReclaimable = tokenAmount === 0;
          const hasBalance = tokenAmount > 0;

          const rentAmount = isReclaimable ? 0.00203928 : 0; // Approximate rent for token accounts

          accountInfos.push({
            pubkey: account.pubkey.toString(),
            lamports: account.account.lamports,
            owner: account.account.owner.toString(),
            executable: account.account.executable,
            rentEpoch: account.account.rentEpoch,
            isReclaimable,
            hasBalance,
          });

          if (isReclaimable) {
            reclaimableTotal += rentAmount;
          }

          console.log(`Account ${account.pubkey.toString()}:`, {
            tokenAmount,
            isReclaimable,
            hasBalance,
            rentAmount
          });
        } catch (accountError) {
          console.error("Error processing account:", account.pubkey.toString(), accountError);
        }
      }

      console.log("Final results:", {
        totalAccounts: accountInfos.length,
        reclaimableAccounts: accountInfos.filter(acc => acc.isReclaimable).length,
        totalReclaimable: reclaimableTotal
      });

      setAccounts(accountInfos);
      setTotalReclaimable(reclaimableTotal);
    } catch (error) {
      console.error("Error scanning accounts:", error);
      // Show user-friendly error
      alert("Failed to scan accounts. Please check your wallet address and try again.");
    } finally {
      setScanning(false);
    }
  };

  const reclaimAccount = async (accountPubkey: string) => {
    if (!connected || !walletAddress) return;

    setReclaiming(prev => [...prev, accountPubkey]);
    
    try {
      // This is a simplified version - in production you'd need proper transaction building
      const publicKey = new PublicKey(walletAddress);
      const accountKey = new PublicKey(accountPubkey);
      
      // Calculate fee (15% of reclaimed amount)
      const rentAmount = 0.00203928; // Approximate rent
      const fee = rentAmount * feePercentage;
      const userAmount = rentAmount - fee;

      // Create transaction to close account and send rent + fee
      // Note: SystemProgram.closeAccount doesn't exist, we'd use TokenProgram.closeAccount in production
      const transaction = new Transaction().add(
        // This would be TokenProgram.closeAccount in real implementation
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 0, // Placeholder
        })
      );

      // In a real implementation, you'd:
      // 1. Create the actual transaction
      // 2. Add fee transfer to your fee address
      // 3. Sign and send via wallet
      // 4. Handle success/error states
      
      console.log("Reclaiming account:", accountPubkey);
      console.log("User receives:", userAmount, "SOL");
      console.log("Fee (15%):", fee, "SOL");
      
      // For demo purposes, just remove from list
      setAccounts(prev => prev.filter(acc => acc.pubkey !== accountPubkey));
      setTotalReclaimable(prev => prev - rentAmount);
      
    } catch (error) {
      console.error("Error reclaiming account:", error);
    } finally {
      setReclaiming(prev => prev.filter(addr => addr !== accountPubkey));
    }
  };

  const reclaimAll = async () => {
    const reclaimableAccounts = accounts.filter(acc => acc.isReclaimable);
    for (const account of reclaimableAccounts) {
      await reclaimAccount(account.pubkey);
    }
  };

  const reclaimableAccounts = accounts.filter(acc => acc.isReclaimable);
  const balanceAccounts = accounts.filter(acc => acc.hasBalance);

  return (
    <TerminalLayout>
      <div className="max-w-6xl mx-auto space-y-6">
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
              This tool is currently under development. Check back soon for the rent reclaim feature!
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2 opacity-50">Solana Rent Reclaim</h1>
            <p className="text-muted-foreground opacity-50">
              Reclaim SOL locked in empty token accounts • 15% fee applies
            </p>
          </div>

          <TerminalCard title="~/tools/rent-reclaim/wallet.log" promptText="connect wallet">
            <div className="space-y-4">
              {/* Disabled WalletConnect */}
              <div className="relative">
                <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                      <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-yellow-600 font-semibold">Tool Under Development</p>
                      <p className="text-sm text-muted-foreground mt-1">This feature is coming soon!</p>
                    </div>
                  </div>
                </div>
                <div className="opacity-30 pointer-events-none">
                  <WalletConnect
                    onConnect={() => {}} // Disabled
                    connected={false}
                    walletAddress=""
                  />
                </div>
              </div>
              
              {/* Disabled Scan Button */}
              <button
                disabled={true}
                className="w-full px-4 py-3 bg-muted text-muted-foreground rounded-lg cursor-not-allowed opacity-50"
              >
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4" />
                  Feature Coming Soon...
                </div>
              </button>
            </div>
          </TerminalCard>

          {/* Disabled Account Results */}
          <div className="relative opacity-30 pointer-events-none">
            {accounts.length > 0 && (
              <>
                <TerminalCard title="~/tools/rent-reclaim/summary.log" promptText="cat reclaim.summary">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-border/50 bg-muted/20">
                      <div className="text-sm text-muted-foreground">Total Accounts</div>
                      <div className="text-2xl font-bold text-foreground">{accounts.length}</div>
                    </div>
                    <div className="p-4 border border-border/50 bg-muted/20">
                      <div className="text-sm text-muted-foreground">Reclaimable</div>
                      <div className="text-2xl font-bold text-primary">{reclaimableAccounts.length}</div>
                    </div>
                    <div className="p-4 border border-border/50 bg-muted/20">
                      <div className="text-sm text-muted-foreground">Total SOL</div>
                      <div className="text-2xl font-bold text-secondary">
                        {totalReclaimable.toFixed(6)} SOL
                      </div>
                    </div>
                  </div>

                  {reclaimableAccounts.length > 0 && (
                    <div className="mt-4 p-4 border border-border/50 bg-primary/10">
                      <div className="text-sm text-muted-foreground mb-2">
                        After 15% fee ({(totalReclaimable * feePercentage).toFixed(6)} SOL)
                      </div>
                      <div className="text-lg font-bold text-primary">
                        You'll receive: {(totalReclaimable * (1 - feePercentage)).toFixed(6)} SOL
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Fee address: {feeAddress.slice(0, 8)}...{feeAddress.slice(-8)}
                      </div>
                    </div>
                  )}
                </TerminalCard>

                <TerminalCard title="~/tools/rent-reclaim/reclaimable.log" promptText="cat reclaimable.accounts">
                  <div className="space-y-2">
                    {reclaimableAccounts.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <div>No reclaimable accounts found</div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-muted-foreground">
                            Found {reclaimableAccounts.length} reclaimable accounts
                          </div>
                          <button
                            onClick={reclaimAll}
                            disabled={true}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50"
                          >
                            Reclaim All
                          </button>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {reclaimableAccounts.map((account) => (
                            <div key={account.pubkey} className="p-3 border border-border/50 bg-muted/20">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-mono text-xs text-muted-foreground mb-1">
                                    {account.pubkey.slice(0, 8)}...{account.pubkey.slice(-8)}
                                  </div>
                                  <div className="text-sm text-foreground">
                                    ~0.00203928 SOL
                                  </div>
                                </div>
                                <button
                                  onClick={() => reclaimAccount(account.pubkey)}
                                  disabled={true}
                                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50"
                                >
                                  Reclaim
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </TerminalCard>
              </>
            )}
          </div>

          {/* Info Card */}
          <TerminalCard title="~/tools/rent-reclaim/info.log" promptText="cat development.status">
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
                    <span>Account scanning being refined</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Transaction signing under development</span>
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
                  <li>• Scan your wallet for empty token accounts</li>
                  <li>• Calculate reclaimable SOL rent</li>
                  <li>• Batch reclaim transactions for efficiency</li>
                  <li>• Charge 15% fee for the service</li>
                </ul>
              </div>
            </div>
          </TerminalCard>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default RentReclaim;
