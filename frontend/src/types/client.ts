
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'pending' | 'overdue' | 'responded';
  priority: 'low' | 'medium' | 'high';
  lastInteraction: Date;
  nextFollowUp: Date;
  auto: boolean; // <-- add this to reflect backend and UI toggle
  autoManage: boolean; // legacy, keep for compatibility
  preferredChannel: 'email' | 'whatsapp' | 'both';
  followUpCadence: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  notes?: string;
  interactions: Interaction[];
  tags?: string[];
}

export interface Interaction {
  id: string;
  type: 'email' | 'whatsapp' | 'response';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'responded';
  agentRationale?: string;
}

export interface Activity {
  id: string;
  clientId: string;
  clientName: string;
  type: 'follow_up_sent' | 'reminder_triggered' | 'client_responded' | 'status_changed';
  message: string;
  timestamp: Date;
}
