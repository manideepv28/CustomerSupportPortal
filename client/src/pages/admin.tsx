import { useQuery } from "@tanstack/react-query";
import { User, Ticket } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TicketIcon, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { getTimeSince, capitalizeFirst } from "@/lib/auth";

interface AdminPageProps {
  user: User;
}

export default function AdminPage({ user }: AdminPageProps) {
  const { data: allTickets = [] } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  // Calculate statistics
  const stats = {
    total: allTickets.length,
    pending: allTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length,
    resolvedToday: allTickets.filter(t => {
      const today = new Date().toDateString();
      return t.status === 'resolved' && new Date(t.updatedAt).toDateString() === today;
    }).length,
    urgent: allTickets.filter(t => t.priority === 'urgent').length,
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

  if (!user.isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Manage support tickets and user accounts</p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <TicketIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Ticket Management */}
      <Card>
        <CardHeader>
          <CardTitle>All Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{ticket.ticketId}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {ticket.subject}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">User #{ticket.userId}</div>
                      <div className="text-sm text-gray-500">user@example.com</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {capitalizeFirst(ticket.status.replace('-', ' '))}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {capitalizeFirst(ticket.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {getTimeSince(ticket.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        {ticket.status !== 'resolved' && (
                          <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                            Resolve
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Close
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
