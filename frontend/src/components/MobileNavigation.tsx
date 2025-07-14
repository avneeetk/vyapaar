
import React from 'react';
import { Home, Activity, Settings, Users } from 'lucide-react';

interface MobileNavigationProps {
  currentView: 'dashboard' | 'activity' | 'settings';
  onViewChange: (view: 'dashboard' | 'activity' | 'settings') => void;
  clientCount: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  onViewChange,
  clientCount
}) => {
  const navItems = [
    {
      id: 'dashboard' as const,
      icon: Users,
      label: 'Clients',
      badge: clientCount > 0 ? clientCount : undefined
    },
    {
      id: 'activity' as const,
      icon: Activity,
      label: 'Activity',
      badge: undefined
    },
    {
      id: 'settings' as const,
      icon: Settings,
      label: 'Settings',
      badge: undefined
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] px-4 py-2 safe-area-pb">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] justify-center ${
                isActive 
                  ? 'text-[#0F62FE] bg-[#0F62FE]/10' 
                  : 'text-[#6F6F6F] hover:text-[#161616] hover:bg-[#F5F5F5]'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-[#DA1E28] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
