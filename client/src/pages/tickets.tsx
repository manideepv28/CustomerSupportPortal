import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Ticket, TicketReply } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketDetailModal } from "@/components/ticket-detail-modal";
import { Clock, Paperclip, MessageSquare, TicketIcon } from "lucide-react";
import { getTimeSince, capitalizeFirst } from "@/lib/auth";

interface TicketsPageProps {
  user: User;
}

export default function TicketsPage({ user }: TicketsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: tickets = [], refetch } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets", { userId: user.id }],
    queryFn: async () => {
      const response = await fetch(`/api/tickets?userId=${user.id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json();
    },
  });

  const { data: replies = [] } = useQuery<TicketReply[]>({
    queryKey: ["/api/tickets", selectedTicket?.id, "replies"],
    queryFn: async () => {
      if (!selectedTicket) return [];
      const response = await fetch(`/api/tickets/${selectedTicket.id}/replies`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch replies");
      return response.json();
    },
    enabled: !!selectedTicket,
  });

  const filteredAndSortedTickets = tickets
    .filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
        case "updated":
          return new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime();
        case "newest":
        default:
          return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleTicketUpdate = (updatedTicket: Ticket) => {
    setSelectedTicket(updatedTicket);
    refetch();
  };

  if (filteredAndSortedTickets.length === 0 && !searchTerm && !statusFilter) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Support Tickets</h2>
          <p className="text-gray-600">Track and manage your support requests</p>
        </div>
        
        <div className="text-center py-12">
          <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-500 mb-6">You haven't submitted any support tickets yet.</p>
          <Button>Create Your First Ticket</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Support Tickets</h2>
        <p className="text-gray-600">Track and manage your support requests</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="updated">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredAndSortedTickets.map((ticket) => (
          <Card 
            key={ticket.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleTicketClick(ticket)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {ticket.subject}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Ticket #{ticket.ticketId} • Created {getTimeSince(ticket.createdAt!)}
                  </p>
                </div>
                <Badge className={getStatusColor(ticket.status)}>
                  {capitalizeFirst(ticket.status.replace('-', ' '))}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {ticket.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Last updated: {getTimeSince(ticket.updatedAt!)}
                </div>
                <div className="flex items-center space-x-4">
                  {ticket.attachments && ticket.attachments.length > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Paperclip className="h-4 w-4" />
                      <span>{ticket.attachments.length} attachments</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    <span>{replies.length} replies</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedTickets.length === 0 && (searchTerm || statusFilter) && (
        <div className="text-center py-12">
          <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
          <Button variant="outline" onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      <TicketDetailModal
        ticket={selectedTicket}
        user={user}
        replies={replies}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketUpdate={handleTicketUpdate}
      />
    </div>
  );
}
