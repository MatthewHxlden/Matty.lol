import { useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { AmbientThemeProvider } from "@/hooks/useAmbientTheme";
import { RainThemeProvider } from "@/hooks/useRainTheme";
import { PulseThemeProvider } from "@/hooks/usePulseTheme";
import { ColorThemeProvider } from "@/hooks/useColorTheme";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogAdmin from "./pages/BlogAdmin";
import Apps from "./pages/Apps";
import AppsAdmin from "./pages/AppsAdmin";
import Tools from "./pages/Tools";
import ToolsAdmin from "./pages/ToolsAdmin";
import Links from "./pages/Links";
import LinksAdmin from "./pages/LinksAdmin";
import Contact from "./pages/Contact";
import ContactAdmin from "./pages/ContactAdmin";
import SiteAdmin from "./pages/SiteAdmin";
import AdminHub from "./pages/AdminHub";
import TradesAdmin from "./pages/TradesAdmin";
import Now from "./pages/Now";
import NowAdmin from "./pages/NowAdmin";
import Feed from "./pages/Feed";
import FeedAdmin from "./pages/FeedAdmin";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import RssFeed from "./pages/RssFeed";
import Trades from "./pages/Trades";
import Changelog from "./pages/Changelog";
import RentReclaim from "./pages/RentReclaim";
import PaperTrading from "./pages/PaperTrading";
import CryptoSwaps from "./pages/CryptoSwaps";
import NotFound from "./pages/NotFound";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter, CoinbaseWalletAdapter, TrustWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

const queryClient = new QueryClient();

const App = () => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
    ],
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint="https://solana-api.projectserum.com">
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <ColorThemeProvider>
              <PulseThemeProvider>
                <AmbientThemeProvider>
                  <RainThemeProvider>
                    <AuthProvider>
                      <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter>
                          <AnimatePresence mode="wait">
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/blog" element={<Blog />} />
                              <Route path="/blog/:slug" element={<BlogPost />} />
                              <Route path="/admin" element={<AdminHub />} />
                              <Route path="/admin/site" element={<SiteAdmin />} />
                              <Route path="/admin/blog" element={<BlogAdmin />} />
                              <Route path="/admin/apps" element={<AppsAdmin />} />
                              <Route path="/admin/tools" element={<ToolsAdmin />} />
                              <Route path="/admin/links" element={<LinksAdmin />} />
                              <Route path="/admin/contact" element={<ContactAdmin />} />
                              <Route path="/admin/trades" element={<TradesAdmin />} />
                              <Route path="/admin/now" element={<NowAdmin />} />
                              <Route path="/admin/feed" element={<FeedAdmin />} />
                              <Route path="/admin/analytics" element={<Analytics />} />
                              <Route path="/apps" element={<Apps />} />
                              <Route path="/changelog" element={<Changelog />} />
                              <Route path="/feed" element={<Feed />} />
                              <Route path="/trades" element={<Trades />} />
                              <Route path="/paper-trading" element={<PaperTrading />} />
                              <Route path="/crypto-swaps" element={<CryptoSwaps />} />
                              <Route path="/tools" element={<Tools />} />
                              <Route path="/rent-reclaim" element={<RentReclaim />} />
                              <Route path="/links" element={<Links />} />
                              <Route path="/contact" element={<Contact />} />
                              <Route path="/now" element={<Now />} />
                              <Route path="/auth" element={<Auth />} />
                              <Route path="/profile" element={<Profile />} />
                              <Route path="/rss" element={<RssFeed />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </AnimatePresence>
                        </BrowserRouter>
                      </TooltipProvider>
                    </AuthProvider>
                  </RainThemeProvider>
                </AmbientThemeProvider>
              </PulseThemeProvider>
            </ColorThemeProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
};

export default App;
