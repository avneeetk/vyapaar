import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Mail, MessageCircle, Phone, Building, Calendar, Settings, MoreVertical, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Client, Interaction } from '../types/client';
import { useToast } from '@/hooks/use-toast';
import { toggleAuto, getClientHistory } from '../api';

interface ClientDetailsProps {
  client: Client;
  onBack: () => void;
  onUpdate: (client: Client) => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onBack, onUpdate }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<Client>(client);

  // Keep draft in sync if client changes
  useEffect(() => {
    setSettingsDraft(client);
  }, [client]);

  const [interactions, setInteractions] = useState<Interaction[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getClientHistory(client.id);
        setInteractions(res);
      } catch (error) {
        console.error("Failed to load history", error);
      }
    };

    fetchHistory();
  }, [client.id]);

  const { toast } = useToast();

  const toggleAutoManage = async () => {
    try {
      // Use the shared API function to toggle auto
      const newAuto = !client.auto;
      await toggleAuto(client.id, newAuto);
      // Refresh history after updating auto-manage
      const res = await getClientHistory(client.id);
      setInteractions(res);
      const updatedClient = { ...client, auto: newAuto, autoManage: newAuto };
      onUpdate(updatedClient); // update parent state
      toast({
        title: `Auto-manage ${newAuto ? 'enabled' : 'disabled'}`,
        description: `NAARAD will ${newAuto ? 'now' : 'no longer'} automatically manage this client`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update auto-manage setting."
      });
    }
  };


  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4 text-[#0F62FE]" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-[#25D366]" />;
      case 'response':
        return <MessageCircle className="w-4 h-4 text-[#6F6F6F]" />;
      default:
        return <MessageCircle className="w-4 h-4 text-[#6F6F6F]" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white font-inter">
      {/* Header with Back Button */}
      <div className="border-b border-[#E0E0E0] p-4 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-[#6F6F6F] hover:text-[#161616] hover:bg-[#F5F5F5]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-xl font-semibold text-[#161616] font-inter truncate">
                {client.name}
              </h2>
              <p className="text-sm text-[#6F6F6F] font-inter truncate">
                {client.company}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Auto Manage Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={client.autoManage}
                onCheckedChange={toggleAutoManage}
              />
              <span className="text-xs md:text-sm text-[#6F6F6F] font-inter hidden sm:block">
                Auto: {client.autoManage ? 'ON' : 'OFF'}
              </span>
            </div>
            
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#6F6F6F] hover:text-[#161616]"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSettings(!showSettings)}>
                  <Settings className="w-4 h-4 mr-2" />
                  {showSettings ? 'Hide Settings' : 'Show Settings'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleAutoManage}>
                  {client.autoManage ? 'Pause Auto-manage' : 'Enable Auto-manage'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Chat Timeline */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Client Info Bar */}
          <div className="bg-[#F9FAFB] p-3 md:p-4 border-b border-[#E0E0E0]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm font-inter">
              <div className="flex items-center space-x-2 min-w-0">
                <Mail className="w-4 h-4 text-[#6F6F6F] flex-shrink-0" />
                <span className="text-[#6F6F6F] truncate">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center space-x-2 min-w-0">
                  <Phone className="w-4 h-4 text-[#6F6F6F] flex-shrink-0" />
                  <span className="text-[#6F6F6F] truncate">{client.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 min-w-0">
                <Building className="w-4 h-4 text-[#6F6F6F] flex-shrink-0" />
                <span className="text-[#6F6F6F] truncate">{client.company}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#6F6F6F] flex-shrink-0" />
                <span className="text-[#6F6F6F]">
                  Next: {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric'
                  }).format(client.nextFollowUp)}
                </span>
              </div>
            </div>
          </div>

          {/* Interaction History / Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 md:pb-4">
            {(!interactions || interactions.length === 0) ? (
              <div className="text-gray-400 text-center py-6">No history yet</div>
            ) : (
              interactions.map((interaction, idx) => (
                <div
                  key={interaction.id || (interaction.timestamp ? String(interaction.timestamp) : idx)}
                  className={`flex ${interaction.type === 'response' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 ${
                      interaction.type === 'response'
                        ? 'bg-[#F5F5F5] text-[#161616]'
                        : 'bg-[#0F62FE] text-white'
                    }`}
                  >
                    <div className="flex items-start space-x-2 mb-2">
                      {/* Icon and sender */}
                      <div>
                        {interaction.type === 'response' ? (
                          <span role="img" aria-label="Client">🧑‍💼</span>
                        ) : (
                          <span role="img" aria-label="NAARAD">🤖</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs opacity-75 font-inter">
                            {interaction.type === 'response' ? 'Client' : 'NAARAD'}
                          </span>
                          <span className="text-xs opacity-75 font-inter">
                            {new Date(interaction.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Message content */}
                    <p className="text-sm font-inter leading-relaxed break-words">
                      {interaction.content}
                    </p>
                    {/* Rationale */}
                    {interaction.agentRationale && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <p className="text-xs opacity-75 font-inter italic">
                          Rationale: {interaction.agentRationale}
                        </p>
                      </div>
                    )}
                    {/* Status */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-75 font-inter">
                        {interaction.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Status Bar */}
          <div className="border-t border-[#E0E0E0] p-3 md:p-4 bg-[#F9FAFB]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm font-inter">
              <span className="text-[#6F6F6F]">
                {client.autoManage 
                  ? 'NAARAD is actively managing this client'
                  : 'Auto-management is paused for this client'
                }
              </span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  client.autoManage ? 'bg-[#24A148]' : 'bg-[#F1C21B]'
                }`}></div>
                <span className="text-[#6F6F6F]">
                  {client.autoManage ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#E0E0E0] bg-white p-4 max-h-[50vh] md:max-h-none overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#161616] font-inter">
                Client Settings
              </h3>
            </div>
                        <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#161616] font-inter mb-2">
                  Name
                </label>
                <Input
                  value={settingsDraft.name}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, name: e.target.value })}
                  className="font-inter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#161616] font-inter mb-2">
                  Company
                </label>
                <Input
                  value={settingsDraft.company}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, company: e.target.value })}
                  className="font-inter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#161616] font-inter mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={settingsDraft.email}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, email: e.target.value })}
                  className="font-inter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#161616] font-inter mb-2">
                  Phone
                </label>
                <Input
                  value={settingsDraft.phone || ''}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, phone: e.target.value })}
                  className="font-inter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#161616] font-inter mb-2">
                  Preferred Channel
                </label>
                <select
                  value={settingsDraft.preferredChannel}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, preferredChannel: e.target.value as 'email' | 'whatsapp' | 'both' })}
                  className="w-full px-3 py-2 border border-[#C6C6C6] rounded-lg font-inter text-[#161616]"
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#161616] font-inter mb-2">
                  Follow-up Cadence
                </label>
                <select
                  value={settingsDraft.followUpCadence}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, followUpCadence: e.target.value as 'daily' | 'weekly' | 'biweekly' | 'monthly' })}
                  className="w-full px-3 py-2 border border-[#C6C6C6] rounded-lg font-inter text-[#161616]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#161616] font-inter mb-2">
                  Priority Level
                </label>
                <select
                  value={settingsDraft.priority}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2 border border-[#C6C6C6] rounded-lg font-inter text-[#161616]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#161616] font-inter mb-2">
                  Notes
                </label>
                <Textarea
                  value={settingsDraft.notes || ''}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, notes: e.target.value })}
                  placeholder="Add notes about this client..."
                  className="font-inter resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setSettingsDraft(client)}>
                Cancel
              </Button>
              <Button onClick={() => onUpdate(settingsDraft)}>
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ClientDetails;
