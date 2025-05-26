import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TicketIcon, Plus, HelpCircle, Bot, User as UserIcon, Settings, X } from "lucide-react";

interface SidebarProps {
  user: User;
  activeSection: string;
  onSectionChange: (section: string) => void;
  ticketCount?: number;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ 
  user, 
  activeSection, 
  onSectionChange, 
  ticketCount = 0,
  isMobile = false,
  isOpen = false,
  onClose 
}: SidebarProps) {
  const navItems = [
    {
      id: 'tickets',
      label: 'My Tickets',
      icon: TicketIcon,
      badge: ticketCount > 0 ? ticketCount : undefined,
    },
    {
      id: 'new-ticket',
      label: 'New Ticket',
      icon: Plus,
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: HelpCircle,
    },
    {
      id: 'chat',
      label: 'AI Assistant',
      icon: Bot,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
    },
  ];

  if (user.isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: Settings,
    });
  }

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const SidebarContent = () => (
    <nav className="flex-1 px-4 py-6 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            className={`w-full justify-start text-sm font-medium ${
              isActive
                ? 'text-primary bg-primary/10 hover:bg-primary/20'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => handleSectionChange(item.id)}
          >
            <Icon className="h-5 w-5 mr-3" />
            {item.label}
            {item.badge && (
              <Badge className="ml-auto bg-primary text-primary-foreground">
                {item.badge}
              </Badge>
            )}
          </Button>
        );
      })}
    </nav>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        <SidebarContent />
      </div>
    </aside>
  );
}
