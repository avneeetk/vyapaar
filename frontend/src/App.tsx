import { useState, useEffect } from "react";
import { fetchClients } from "./api";
import { Client } from "./types/client";
import ClientDashboard from "./components/ClientDashboard";
import ClientUpload from "./components/ClientUpload";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ActivityFeed from "./components/ActivityFeed"; // If you have this component
import ClientDetailsPage from "./pages/ClientDetailsPage"; // New file you'll create

const queryClient = new QueryClient();



const App = () => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await fetchClients();
        setClients(data);
      } catch (err) {
        console.error("Failed to fetch clients", err);
      }
    };
    loadClients();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ClientUpload
                  onClientsUploaded={uploadedClients => {
                    setClients(uploadedClients);
                    window.location.href = '/dashboard';
                  }}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                <ClientDashboard
                  clients={clients}
                  onClientsUpdate={setClients}
                  onBack={() => {
                    window.location.href = '/';
                  }}
                />
              }
            />
            <Route
              path="/client/:id"
              element={
                <ClientDetailsPage
                  clients={clients}
                  onUpdate={setClients}
                />
              }
            />
            <Route
              path="/activity"
              element={<ActivityFeed clients={clients} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;