
import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, Bell, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Client, Activity } from '../types/client';

interface ActivityFeedProps {
  clients: Client[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ clients }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
        // TODO: You can generate activities based on actual uploaded client data here if needed.
    setActivities([]);
  }, [clients]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'follow_up_sent':
        return <Mail className="w-4 h-4 text-[#0F62FE]" />;
      case 'reminder_triggered':
        return <Bell className="w-4 h-4 text-[#F1C21B]" />;
      case 'client_responded':
        return <MessageCircle className="w-4 h-4 text-[#24A148]" />;
      case 'status_changed':
        return <AlertTriangle className="w-4 h-4 text-[#DA1E28]" />;
      default:
        return <Clock className="w-4 h-4 text-[#6F6F6F]" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#E0E0E0]">
        <h3 className="text-lg font-medium text-[#161616] font-['IBM_Plex_Sans']">
          Live Activity
        </h3>
        <p className="text-sm text-[#6F6F6F] font-['IBM_Plex_Sans']">
          Real-time updates from NAARAD
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-[#F9FAFB] rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#161616] font-['IBM_Plex_Sans']">
                  {activity.clientName}
                </p>
                <p className="text-sm text-[#6F6F6F] font-['IBM_Plex_Sans'] leading-relaxed">
                  {activity.message}
                </p>
                <p className="text-xs text-[#6F6F6F] font-['IBM_Plex_Sans'] mt-1">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-[#E0E0E0] bg-[#F9FAFB]">
        <div className="flex items-center justify-between text-sm font-['IBM_Plex_Sans']">
          <span className="text-[#6F6F6F]">
            NAARAD is actively monitoring
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#24A148] rounded-full animate-pulse"></div>
            <span className="text-[#24A148]">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ActivityFeed;