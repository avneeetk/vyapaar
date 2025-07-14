
import React, { useState } from 'react';
import { Upload, Settings, User, ChevronDown, ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onShowUpload: () => void;
  onBack?: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onShowUpload, onBack, title = 'NAARAD' }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-[#E0E0E0] px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-[#6F6F6F] hover:text-[#161616] md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        
        <div className="flex items-center space-x-3">
          <h1 className="text-xl md:text-2xl font-semibold text-[#161616] font-['Inter']">
            {title}
          </h1>
          {title === 'NAARAD' && (
            <span className="text-sm text-[#6F6F6F] font-['Inter'] hidden sm:block">
              Auto Follow-up Manager
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-3">
        <Button
          onClick={onShowUpload}
          className="bg-[#0F62FE] hover:bg-[#0043CE] text-white px-3 py-2 md:px-4 rounded-lg font-['Inter'] font-medium text-sm md:text-base"
        >
          <Upload className="w-4 h-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Upload</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* Agent Mode Dropdown - Desktop only */}
        <div className="hidden md:flex items-center space-x-2 text-sm text-[#6F6F6F] border-l border-[#E0E0E0] pl-4">
          <span className="font-['Inter']">Agent Mode</span>
          <ChevronDown className="w-4 h-4" />
        </div>

        {/* Settings - Desktop */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-[#6F6F6F] hover:text-[#161616] hidden md:flex"
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#6F6F6F] hover:text-[#161616]"
            >
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[#DA1E28]">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#6F6F6F] hover:text-[#161616] md:hidden"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Agent Mode
              <ChevronDown className="w-4 h-4 ml-auto" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
