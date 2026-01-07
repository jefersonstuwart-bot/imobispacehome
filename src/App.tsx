import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import PropertyDetail from "./pages/PropertyDetail";
import ProposalForm from "./pages/ProposalForm";
import ProposalSuccess from "./pages/ProposalSuccess";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import PropertiesManagement from "./pages/dashboard/PropertiesManagement";
import BrokersManagement from "./pages/dashboard/BrokersManagement";
import ProposalsManagement from "./pages/dashboard/ProposalsManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/empreendimento/:id" element={<PropertyDetail />} />
            <Route path="/proposta/:propertyId" element={<ProposalForm />} />
            <Route path="/proposta-enviada" element={<ProposalSuccess />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/dashboard/empreendimentos" element={<PropertiesManagement />} />
            <Route path="/dashboard/corretores" element={<BrokersManagement />} />
            <Route path="/dashboard/propostas" element={<ProposalsManagement />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
