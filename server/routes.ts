import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, loginUserSchema, insertTicketSchema, 
  insertTicketReplySchema, insertChatMessageSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const { confirmPassword, ...userToCreate } = userData;
      const user = await storage.createUser(userToCreate);
      
      // Remove password from response
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Ticket routes
  app.get("/api/tickets", async (req, res) => {
    try {
      const userId = req.query.userId;
      
      if (userId) {
        const tickets = await storage.getTicketsByUserId(parseInt(userId as string));
        res.json(tickets);
      } else {
        const tickets = await storage.getTickets();
        res.json(tickets);
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicket(id);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/tickets/by-ticket-id/:ticketId", async (req, res) => {
    try {
      const ticketId = req.params.ticketId;
      const ticket = await storage.getTicketByTicketId(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      const userId = parseInt(req.body.userId);
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const ticket = await storage.createTicket({ ...ticketData, userId });
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/tickets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticketData = req.body;
      
      const ticket = await storage.updateTicket(id, ticketData);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Ticket reply routes
  app.get("/api/tickets/:ticketId/replies", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      const replies = await storage.getTicketReplies(ticketId);
      res.json(replies);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/tickets/:ticketId/replies", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      const replyData = insertTicketReplySchema.parse(req.body);
      
      const reply = await storage.createTicketReply({ ...replyData, ticketId });
      res.json(reply);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // FAQ routes
  app.get("/api/faqs", async (req, res) => {
    try {
      const category = req.query.category as string;
      
      if (category) {
        const faqs = await storage.getFAQsByCategory(category);
        res.json(faqs);
      } else {
        const faqs = await storage.getFAQs();
        res.json(faqs);
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Chat routes
  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      
      // Generate AI response
      const response = generateAIResponse(messageData.message);
      const updatedMessage = await storage.updateChatMessageResponse(message.id, response);
      
      res.json(updatedMessage);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('password') || lowerMessage.includes('reset')) {
    return "To reset your password, go to the login page and click 'Forgot Password'. Enter your email and follow the instructions sent to you. The reset link is valid for 24 hours.";
  } else if (lowerMessage.includes('billing') || lowerMessage.includes('payment')) {
    return "For billing questions, you can update your payment information in Settings > Billing. If you're experiencing payment issues, please check that your card information is current and try again.";
  } else if (lowerMessage.includes('slow') || lowerMessage.includes('performance')) {
    return "Performance issues can be caused by network connectivity, browser cache, or server load. Try clearing your browser cache, using a different browser, or checking your internet connection.";
  } else if (lowerMessage.includes('human') || lowerMessage.includes('agent')) {
    return "I'd be happy to connect you with a human agent. You can create a support ticket by clicking 'New Ticket' in the sidebar, and our team will respond within 2-4 hours.";
  } else {
    return `I understand you need help with: ${message}. Let me search our knowledge base for relevant information. If I can't find a solution, I'll connect you with a human agent who can assist further.`;
  }
}
