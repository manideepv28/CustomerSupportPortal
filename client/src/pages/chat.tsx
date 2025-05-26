import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User, ChatMessage } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, User as UserIcon, Send, Trash2 } from "lucide-react";
import { getTimeSince } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatPageProps {
  user: User;
}

export default function ChatPage({ user }: ChatPageProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: chatMessages = [], refetch } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", user.id],
    queryFn: async () => {
      const response = await fetch(`/api/chat/${user.id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch chat messages");
      return response.json();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        userId: user.id,
        message: messageText,
      });
      return response.json();
    },
    onSuccess: () => {
      refetch();
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const quickActions = [
    { label: "Reset Password", message: "I forgot my password" },
    { label: "Billing Help", message: "How do I update my billing information?" },
    { label: "Technical Issue", message: "The app is running slowly" },
    { label: "Human Support", message: "I need to speak with a human agent" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleQuickAction = (quickMessage: string) => {
    sendMessageMutation.mutate(quickMessage);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Assistant</h2>
          <p className="text-gray-600">Get instant help with common questions and issues</p>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="border-b border-gray-200 flex flex-row items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Support Assistant</CardTitle>
                <div className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 p-6 overflow-y-auto space-y-4">
            {/* Welcome Message */}
            {chatMessages.length === 0 && (
              <>
                <div className="flex items-start chat-message">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                      <p className="text-gray-800">Hello! I'm your AI support assistant. I can help you with:</p>
                      <ul className="mt-2 text-sm text-gray-600 space-y-1">
                        <li>• Account and login issues</li>
                        <li>• Billing questions</li>
                        <li>• Feature explanations</li>
                        <li>• Technical troubleshooting</li>
                      </ul>
                      <p className="mt-2 text-gray-800">How can I help you today?</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Just now</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 ml-11">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                      onClick={() => handleQuickAction(action.message)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </>
            )}

            {/* Chat Messages */}
            {chatMessages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User Message */}
                <div className="flex items-start justify-end chat-message">
                  <div className="flex-1 max-w-md">
                    <div className="bg-primary text-primary-foreground rounded-lg p-3">
                      <p>{msg.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {getTimeSince(msg.createdAt)}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ml-3 flex-shrink-0">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* AI Response */}
                {msg.response && (
                  <div className="flex items-start chat-message">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                        <p className="text-gray-800">{msg.response}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeSince(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={sendMessageMutation.isPending}
              />
              <Button 
                type="submit" 
                disabled={!message.trim() || sendMessageMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <Bot className="h-3 w-3 mr-1" />
              If I can't help, I'll connect you with a human agent
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
