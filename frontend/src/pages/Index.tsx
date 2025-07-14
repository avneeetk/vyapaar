import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ClientUpload } from '../components/ClientUpload';
import { ClientDashboard } from '../components/ClientDashboard';
import { ClientDetails } from '../components/ClientDetails';
import { ActivityFeed } from '../components/ActivityFeed';
import { MobileNavigation } from '../components/MobileNavigation';
import { Client } from '../types/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showUpload, setShowUpload] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'activity' | 'settings'>('dashboard');
  const { toast } = useToast();

  const handleClientsUploaded = (uploadedClients: Client[]) => {
    // Convert string dates to Date objects for frontend usage
    const parsedClients = uploadedClients.map(client => ({
      ...client,
      lastInteraction: client.lastInteraction ? new Date(client.lastInteraction) : null,
      dueDate: client.dueDate ? new Date(client.dueDate) : null,
    }));
    setClients(parsedClients);
    setShowUpload(false);
    toast({
      title: "Clients uploaded successfully",
      description: `${uploadedClients.length} clients are now being managed by NAARAD`,
    });
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  const handleClientUpdate = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setSelectedClient(updatedClient);
    toast({
      title: "Client updated",
      description: `Settings for ${updatedClient.name} have been saved`,
    });
  };

  const handleBackToDashboard = () => {
    setSelectedClient(null);
  };

  const handleShowUpload = () => {
    setShowUpload(true);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header 
        onShowUpload={handleShowUpload}
        onBack={selectedClient ? handleBackToDashboard : undefined}
        title={selectedClient ? selectedClient.name : 'NAARAD'}
      />
      
      {/* Desktop Layout */}
      <div className="hidden md:flex h-[calc(100vh-64px)]">
        {/* Main Content Area */}
        <div className="flex-1 flex">
          {showUpload && clients.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <ClientUpload onClientsUploaded={handleClientsUploaded} />
            </div>
          ) : selectedClient ? (
            <div className="flex-1">
              <ClientDetails 
                client={selectedClient} 
                onBack={handleBackToDashboard}
                onUpdate={handleClientUpdate}
              />
            </div>
          ) : (
            <div className="flex-1">
              <ClientDashboard 
                clients={clients} 
                onClientSelect={handleClientSelect}
                onClientsUpdate={setClients}
              />
            </div>
          )}
        </div>

        {/* Activity Feed Sidebar */}
        {clients.length > 0 && (
          <div className="w-80 border-l border-[#E0E0E0] bg-white">
            <ActivityFeed clients={clients} />
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {showUpload && clients.length === 0 ? (
          <div className="p-4">
            <ClientUpload onClientsUploaded={handleClientsUploaded} />
          </div>
        ) : selectedClient ? (
          <ClientDetails 
            client={selectedClient} 
            onBack={handleBackToDashboard}
            onUpdate={handleClientUpdate}
          />
        ) : (
          <>
            {currentView === 'dashboard' && (
              <ClientDashboard 
                clients={clients} 
                onClientSelect={handleClientSelect}
                onClientsUpdate={setClients}
              />
            )}
            {currentView === 'activity' && clients.length > 0 && (
              <div className="h-[calc(100vh-128px)]">
                <ActivityFeed clients={clients} />
              </div>
            )}
            {currentView === 'settings' && (
              <div className="p-4">
                <h2 className="text-xl font-medium text-[#161616] mb-4">Settings</h2>
                <p className="text-[#6F6F6F]">Settings panel coming soon...</p>
              </div>
            )}
            
            <MobileNavigation 
              currentView={currentView}
              onViewChange={setCurrentView}
              clientCount={clients.length}
            />
          </>
        )}
      </div>

      {/* Upload Modal for Desktop */}
      {showUpload && clients.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <ClientUpload 
              onClientsUploaded={handleClientsUploaded} 
              onClose={() => setShowUpload(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
