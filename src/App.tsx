import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSkeleton from "@/components/LoadingSkeleton";

// Eager-load critical route
import Index from "./pages/Index.tsx";

// Lazy-load everything else for faster initial load
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const ProjectPanel = lazy(() => import("./pages/ProjectPanel.tsx"));
const ProjectPage = lazy(() => import("./pages/ProjectPage.tsx"));
const OperatorPanel = lazy(() => import("./pages/OperatorPanel.tsx"));
const MasterPanel = lazy(() => import("./pages/MasterPanel.tsx"));
const Arcade = lazy(() => import("./pages/Arcade.tsx"));
const Raffle = lazy(() => import("./pages/Raffle.tsx"));
const Pricing = lazy(() => import("./pages/Pricing.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Lottery = lazy(() => import("./pages/Lottery.tsx"));
const Hub = lazy(() => import("./pages/Hub.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <WalletProvider>
              <Suspense fallback={<LoadingSkeleton />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/sf-admin-9x7k" element={<Admin />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/operator" element={<OperatorPanel />} />
                  <Route path="/sf-master-q4z8" element={<MasterPanel />} />
                  <Route path="/project-panel" element={<ProjectPanel />} />
                  <Route path="/project/:slug" element={<ProjectPage />} />
                  <Route path="/arcade" element={<Arcade />} />
                  <Route path="/raffle" element={<Raffle />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/lottery" element={<Lottery />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/hub" element={<Hub />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </WalletProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
