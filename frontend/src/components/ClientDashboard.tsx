import React, { useState } from 'react';
import { Search, MoreVertical, Mail, MessageCircle, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Client } from '../types/client';
import { toggleAuto } from '../api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate} from 'react-router-dom';
import ClientChatHistory from './ClientChatHistory';
import ClientInitialFollowup from './ClientInitialFollowup';

interface ClientDashboardProps {
  clients: Client[];
  onClientsUpdate: (clients: Client[]) => void;
  onBack?: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  clients, 
  onClientsUpdate, 
  onBack 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-[#24A148]" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-[#F1C21B]" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-[#DA1E28]" />;
      case 'responded':
        return <CheckCircle className="w-4 h-4 text-[#0F62FE]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[#6F6F6F]" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-[#DA1E28]';
      case 'medium':
        return 'border-l-[#F1C21B]';
      case 'low':
        return 'border-l-[#24A148]';
      default:
        return 'border-l-[#C6C6C6]';
    }
  };

  const toggleAutoManage = async (clientId: string, newValue: boolean) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    try {
      await toggleAuto(clientId, newValue); // use shared API
      // Update local state
      const updatedClients = clients.map(c =>
        c.id === clientId ? { ...c, auto: newValue, autoManage: newValue } : c
      );
      onClientsUpdate(updatedClients);
      toast({
        title: `Auto-manage ${newValue ? 'enabled' : 'disabled'}`,
        description: `NAARAD will ${newValue ? 'now' : 'no longer'} automatically manage ${client.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update auto-manage setting."
      });
    }
  };

  const handleClientAction = (action: string, client: Client) => {
    switch (action) {
      case 'edit':
        toast({
          title: "Edit Client",
          description: `Opening edit form for ${client.name}`,
        });
        break;
      case 'pause':
        toggleAutoManage(client.id, !client.auto);
        break;
      case 'history':
        navigate(`/client/${client.id}`);
        break;
      default:
        break;
    }
  };

  const formatLastInteraction = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {onBack && (
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          ← Back to Upload
        </Button>
      )}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-[#161616] font-['Inter'] mb-4">
          Client Management
        </h2>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F6F6F] w-4 h-4" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 font-['Inter'] h-11"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 h-11 border border-[#C6C6C6] rounded-lg font-['Inter'] text-[#161616] bg-white min-w-[120px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="responded">Responded</option>
          </select>
        </div>

        {/* Status Summary */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm font-['Inter'] mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#24A148] rounded-full"></div>
            <span className="text-[#6F6F6F]">Active ({clients.filter(c => c.status === 'active').length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#F1C21B] rounded-full"></div>
            <span className="text-[#6F6F6F]">Pending ({clients.filter(c => c.status === 'pending').length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#DA1E28] rounded-full"></div>
            <span className="text-[#6F6F6F]">Overdue ({clients.filter(c => c.status === 'overdue').length})</span>
          </div>
        </div>
      </div>

      {/* Client Cards */}
      <div className="grid gap-3 md:gap-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className={`bg-white rounded-lg border-l-4 ${getPriorityColor(client.priority)} shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] md:active:scale-100`}
            onClick={() => navigate(`/client/${client.id}`)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-[#161616] font-['Inter'] truncate">
                      {client.name}
                    </h3>
                    {getStatusIcon(client.status)}
                    {client.priority === 'high' && (
                      <AlertTriangle className="w-4 h-4 text-[#DA1E28] flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-[#6F6F6F] font-['Inter']">
                    <p className="truncate">{client.company}</p>
                    <p className="truncate">{client.email}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                      <span>Last contact: {formatLastInteraction(client.lastInteraction)}</span>
                      <div className="flex items-center space-x-1">
                        {client.preferredChannel === 'email' && <Mail className="w-3 h-3" />}
                        {client.preferredChannel === 'whatsapp' && <MessageCircle className="w-3 h-3" />}
                        {client.preferredChannel === 'both' && (
                          <>
                            <Mail className="w-3 h-3" />
                            <MessageCircle className="w-3 h-3" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 md:space-x-3 ml-4">
                  {/* Auto Manage Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                    <Switch
                      checked={client.auto}
                      onCheckedChange={() => toggleAutoManage(client.id, !client.auto)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-xs text-[#6F6F6F] font-['Inter'] hidden sm:block">
                      Auto Manage
                    </span>
                  </div>
                  
                  {/* Menu Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#6F6F6F] hover:text-[#161616] h-9 w-9"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleClientAction('history', client)}>
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClientAction('edit', client)}>
                        Edit Client
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleClientAction('pause', client)}>
                        {client.auto ? 'Pause Follow-up' : 'Resume Follow-up'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* Show initial NAARAD follow-up */}
                <ClientInitialFollowup clientId={client.id} />

                {/* Expand/collapse chat history */}
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpandedClientId(expandedClientId === client.id ? null : client.id)}
                  >
                    {expandedClientId === client.id ? 'Hide Chat History' : 'Show Chat History'}
                  </Button>
                </div>
                {expandedClientId === client.id && (
                  <div className="mt-2">
                    <ClientChatHistory clientId={client.id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#6F6F6F] font-['Inter']">
            {searchQuery || filterStatus !== 'all' 
              ? 'No clients match your search criteria' 
              : 'No clients yet. Upload your client data to get started.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
