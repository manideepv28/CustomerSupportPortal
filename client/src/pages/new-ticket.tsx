import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertTicketSchema, type InsertTicket } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { CloudUpload, X, Send } from "lucide-react";
import { formatFileSize } from "@/lib/auth";

interface NewTicketPageProps {
  user: User;
  onTicketCreated: () => void;
}

export default function NewTicketPage({ user, onTicketCreated }: NewTicketPageProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const form = useForm<InsertTicket & { emailUpdates: boolean }>({
    resolver: zodResolver(insertTicketSchema.extend({
      emailUpdates: z.boolean(),
    })),
    defaultValues: {
      subject: "",
      description: "",
      category: "",
      priority: "medium",
      status: "open",
      attachments: [],
      emailUpdates: true,
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: InsertTicket) => {
      const response = await apiRequest("POST", "/api/tickets", {
        ...data,
        userId: user.id,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ticket Created",
        description: "Your support ticket has been created successfully.",
      });
      form.reset();
      setSelectedFiles([]);
      onTicketCreated();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive",
      });
    },
  });

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    
    if (validFiles.length !== files.length) {
      toast({
        title: "File Size Warning",
        description: "Some files were too large (max 10MB each) and were not added.",
        variant: "destructive",
      });
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: InsertTicket & { emailUpdates: boolean }) => {
    const { emailUpdates, ...ticketData } = data;
    
    // For now, just store file names as attachments
    const attachments = selectedFiles.map(file => file.name);
    
    createTicketMutation.mutate({
      ...ticketData,
      attachments,
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Support Ticket</h2>
          <p className="text-gray-600">Describe your issue and we'll help you resolve it quickly</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Brief description of your issue"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing & Payments</SelectItem>
                          <SelectItem value="account">Account Access</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={6}
                          placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Upload */}
                <div>
                  <FormLabel>Attachments</FormLabel>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <CloudUpload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            className="sr-only"
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                            onChange={handleFileSelection}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB each</p>
                    </div>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="emailUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Send me email updates when there are responses to this ticket
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={onTicketCreated}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTicketMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {createTicketMutation.isPending ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
