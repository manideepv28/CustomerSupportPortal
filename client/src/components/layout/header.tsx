import { useState } from "react";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Menu, Bell, ChevronDown, User as UserIcon, Settings, LogOut, Headphones } from "lucide-react";
import { getUserInitials } from "@/lib/auth";

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
  onLogout: () => void;
}

export function Header({ user, onMenuClick, onLogout }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center ml-4 lg:ml-0">
              <Headphones className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Support Portal</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-500 relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </Badge>
              </Button>
            </div>
            
            <DropdownMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium mr-3">
                    {getUserInitials(user.name)}
                  </div>
                  <span className="hidden md:block text-gray-700 font-medium mr-2">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
