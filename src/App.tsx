import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace";
import AddListing from "./pages/AddListing";
import AgriBot from "./pages/AgriBot";
import QualityChecking from "./pages/QualityChecking";
import MarketAdvisor from "./pages/MarketAdvisor";
import WeatherAnalysis from "./pages/WeatherAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/add-listing" element={<AddListing />} />
          <Route path="/agribot" element={<AgriBot />} />
          <Route path="/quality-checking" element={<QualityChecking />} />
          <Route path="/market-advisor" element={<MarketAdvisor />} />
          <Route path="/weather-analysis" element={<WeatherAnalysis />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
