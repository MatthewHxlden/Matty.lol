import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Wallet, Trash2, AlertCircle, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
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

  const connectWallet = async () => {
    if (window.solana?.isPhantom) {
      try {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setConnected(true);
      } catch (err) {
        console.error("Failed to connect wallet:", err);
      }
    } else {
      // Fallback to manual address input with test option
      const useTest = confirm("Use test wallet address for demo?");
      let address;
      
      if (useTest) {
        // Test wallet address (you can replace this with a real one)
        address = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
      } else {
        address = prompt("Enter your Solana wallet address:");
      }
      
      if (address) {
        setWalletAddress(address);
        setConnected(true);
      }
    }
  };

  const scanAccounts = async () => {
    if (!walletAddress) {
      console.error("No wallet address provided");
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Solana Rent Reclaim</h1>
            <p className="text-muted-foreground">
              Reclaim SOL locked in empty token accounts • 15% fee applies
            </p>
          </div>

          <TerminalCard title="~/tools/rent-reclaim/wallet.log" promptText="connect wallet">
            <div className="space-y-4">
              {!connected ? (
                <div className="text-center py-8">
                  <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <button
                    onClick={connectWallet}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Connect Wallet
                  </button>
                  <p className="text-sm text-muted-foreground mt-4">
                    Supports Phantom, Jupiter, and other Solana wallets
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border/50 bg-muted/20">
                    <div>
                      <div className="text-sm text-muted-foreground">Connected Wallet</div>
                      <div className="font-mono text-foreground">
                        {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <button
                    onClick={scanAccounts}
                    disabled={scanning}
                    className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {scanning ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Scanning Accounts...
                      </div>
                    ) : (
                      "Scan for Reclaimable Accounts"
                    )}
                  </button>
                </div>
              )}
            </div>
          </TerminalCard>

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
                          {reclaimableAccounts.length} empty accounts • ~0.00203928 SOL each
                        </div>
                        <button
                          onClick={reclaimAll}
                          disabled={reclaiming.length > 0}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {reclaiming.length > 0 ? "Reclaiming..." : "Reclaim All"}
                        </button>
                      </div>
                      
                      {reclaimableAccounts.map((account) => (
                        <div key={account.pubkey} className="flex items-center justify-between p-3 border border-border/50 bg-muted/20">
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-xs text-foreground truncate">
                              {account.pubkey}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rent: ~0.00203928 SOL
                            </div>
                          </div>
                          <button
                            onClick={() => reclaimAccount(account.pubkey)}
                            disabled={reclaiming.includes(account.pubkey)}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {reclaiming.includes(account.pubkey) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Reclaim"
                            )}
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </TerminalCard>

              {balanceAccounts.length > 0 && (
                <TerminalCard title="~/tools/rent-reclaim/balance.log" promptText="cat balance.accounts">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground mb-4">
                      {balanceAccounts.length} accounts with balance (not recommended to close)
                    </div>
                    
                    {balanceAccounts.map((account) => (
                      <div key={account.pubkey} className="flex items-center justify-between p-3 border border-border/50 bg-muted/20">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-xs text-foreground truncate">
                            {account.pubkey}
                          </div>
                          <div className="text-xs text-primary">
                            Has balance - keep this account
                          </div>
                        </div>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      </div>
                    ))}
                  </div>
                </TerminalCard>
              )}
            </>
          )}
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default RentReclaim;
