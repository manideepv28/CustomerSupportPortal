import { useState } from "react";
import { Ticket, User, TicketReply } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Paperclip, CheckCircle, Download, User as UserIcon } from "lucide-react";
import { getTimeSince, getUserInitials, capitalizeFirst } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TicketDetailModalProps {
  ticket: Ticket | null;
  user: User;
  replies: TicketReply[];
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdate: (ticket: Ticket) => void;
}

export function TicketDetailModal({ 
  ticket, 
  user, 
  replies, 
  isOpen, 
  onClose, 
  onTicketUpdate 
}: TicketDetailModalProps) {
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const { toast } = useToast();

  if (!ticket) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await apiRequest("PUT", `/api/tickets/${ticket.id}`, {
        status: newStatus,
      });
      const updatedTicket = await response.json();
      onTicketUpdate(updatedTicket);
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${capitalizeFirst(newStatus.replace('-', ' '))}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      const response = await apiRequest("PUT", `/api/tickets/${ticket.id}`, {
        priority: newPriority,
      });
      const updatedTicket = await response.json();
      onTicketUpdate(updatedTicket);
      toast({
        title: "Priority Updated",
        description: `Ticket priority changed to ${capitalizeFirst(newPriority)}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update ticket priority",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      await apiRequest("POST", `/api/tickets/${ticket.id}/replies`, {
        userId: user.id,
        message: replyText,
        isFromAgent: false,
      });
      
      setReplyText("");
      toast({
        title: "Reply Sent",
        description: "Your reply has been added to the ticket",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ticket Details
            <span className="text-sm text-gray-500">#{ticket.ticketId}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {ticket.subject}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {ticket.description}
              </p>
            </div>

            {/* Conversation */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Conversation</h4>
              
              {/* Original ticket message */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium mr-3">
                    {getUserInitials(user.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="font-medium text-gray-900">{user.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {getTimeSince(ticket.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{ticket.description}</p>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {replies.map((reply) => (
                <div key={reply.id} className={`rounded-lg p-4 ${
                  reply.isFromAgent ? 'bg-gray-50' : 'bg-blue-50'
                }`}>
                  <div className="flex items-start">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 ${
                      reply.isFromAgent ? 'bg-green-600' : 'bg-primary'
                    }`}>
                      {reply.isFromAgent ? 'SA' : getUserInitials(user.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-900">
                          {reply.isFromAgent ? 'Support Agent' : user.name}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {getTimeSince(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{reply.message}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Reply Form */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Add Reply</h5>
                <Textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="mb-3"
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim() || isSubmittingReply}
                  >
                    {isSubmittingReply ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Priority */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Ticket Status</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <Select 
                    value={ticket.status} 
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Priority</label>
                  <Select 
                    value={ticket.priority} 
                    onValueChange={handlePriorityChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Ticket Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Information</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-900">{getTimeSince(ticket.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="text-gray-900 capitalize">{ticket.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={getStatusColor(ticket.status)}>
                    {capitalizeFirst(ticket.status.replace('-', ' '))}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {capitalizeFirst(ticket.priority)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Attachments</h5>
                <div className="space-y-2">
                  {ticket.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                      <Paperclip className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700 flex-1">{attachment}</span>
                      <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary-dark">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
