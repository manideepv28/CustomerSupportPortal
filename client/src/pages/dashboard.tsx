import { useState } from "react";
import { User } from "@shared/schema";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import TicketsPage from "./tickets";
import NewTicketPage from "./new-ticket";
import FAQPage from "./faq";
import ChatPage from "./chat";
import ProfilePage from "./profile";
import AdminPage from "./admin";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeSection, setActiveSection] = useState("tickets");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "tickets":
        return <TicketsPage user={user} />;
      case "new-ticket":
        return <NewTicketPage user={user} onTicketCreated={() => setActiveSection("tickets")} />;
      case "faq":
        return <FAQPage />;
      case "chat":
        return <ChatPage user={user} />;
      case "profile":
        return <ProfilePage user={user} />;
      case "admin":
        return user.isAdmin ? <AdminPage user={user} /> : <TicketsPage user={user} />;
      default:
        return <TicketsPage user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onMenuClick={() => setIsMobileSidebarOpen(true)} 
        onLogout={onLogout} 
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar 
          user={user}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          ticketCount={0}
        />
        
        <Sidebar 
          user={user}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          ticketCount={0}
          isMobile={true}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-auto">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
}
