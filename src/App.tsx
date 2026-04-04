import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Admin from "./pages/Admin.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ProjectPanel from "./pages/ProjectPanel.tsx";
import ProjectPage from "./pages/ProjectPage.tsx";
import OperatorPanel from "./pages/OperatorPanel.tsx";
import MasterPanel from "./pages/MasterPanel.tsx";
import Arcade from "./pages/Arcade.tsx";
import Raffle from "./pages/Raffle.tsx";
import Pricing from "./pages/Pricing.tsx";
import About from "./pages/About.tsx";
import Lottery from "./pages/Lottery.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <WalletProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/operator" element={<OperatorPanel />} />
                <Route path="/master" element={<MasterPanel />} />
                <Route path="/project-panel" element={<ProjectPanel />} />
                <Route path="/project/:slug" element={<ProjectPage />} />
                <Route path="/arcade" element={<Arcade />} />
                <Route path="/raffle" element={<Raffle />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/lottery" element={<Lottery />} />
                <Route path="/about" element={<About />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </WalletProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
