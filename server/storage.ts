import { 
  users, tickets, ticketReplies, faqs, chatMessages,
  type User, type InsertUser, type LoginUser,
  type Ticket, type InsertTicket,
  type TicketReply, type InsertTicketReply,
  type FAQ, type InsertFAQ,
  type ChatMessage, type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, 'confirmPassword'>): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Ticket methods
  getTickets(): Promise<Ticket[]>;
  getTicketsByUserId(userId: number): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketByTicketId(ticketId: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket & { userId: number }): Promise<Ticket>;
  updateTicket(id: number, ticket: Partial<Ticket>): Promise<Ticket | undefined>;

  // Ticket Reply methods
  getTicketReplies(ticketId: number): Promise<TicketReply[]>;
  createTicketReply(reply: InsertTicketReply): Promise<TicketReply>;

  // FAQ methods
  getFAQs(): Promise<FAQ[]>;
  getFAQsByCategory(category: string): Promise<FAQ[]>;
  createFAQ(faq: InsertFAQ): Promise<FAQ>;

  // Chat methods
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateChatMessageResponse(id: number, response: string): Promise<ChatMessage | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tickets: Map<number, Ticket>;
  private ticketReplies: Map<number, TicketReply>;
  private faqs: Map<number, FAQ>;
  private chatMessages: Map<number, ChatMessage>;
  private currentUserId: number;
  private currentTicketId: number;
  private currentReplyId: number;
  private currentFAQId: number;
  private currentChatId: number;
  private ticketCounter: number;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.ticketReplies = new Map();
    this.faqs = new Map();
    this.chatMessages = new Map();
    this.currentUserId = 1;
    this.currentTicketId = 1;
    this.currentReplyId = 1;
    this.currentFAQId = 1;
    this.currentChatId = 1;
    this.ticketCounter = 1;

    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    const adminUser: User = {
      id: this.currentUserId++,
      name: "Admin User",
      email: "admin@support.com",
      password: "admin123",
      isAdmin: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample user
    const sampleUser: User = {
      id: this.currentUserId++,
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(sampleUser.id, sampleUser);

    // Create sample FAQs
    const sampleFAQs: FAQ[] = [
      {
        id: this.currentFAQId++,
        question: "How do I reset my password?",
        answer: "To reset your password, click on the 'Forgot Password' link on the login page. Enter your email address and follow the instructions sent to your email. The reset link will be valid for 24 hours.",
        category: "account",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentFAQId++,
        question: "How can I update my billing information?",
        answer: "You can update your billing information by going to Settings > Billing in your account dashboard. Click 'Update Payment Method' to change your credit card or billing address.",
        category: "billing",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentFAQId++,
        question: "Why is the application running slowly?",
        answer: "Slow performance can be caused by several factors: poor internet connection, browser cache issues, or high server load. Try clearing your browser cache, using a different browser, or contacting support if the issue persists.",
        category: "technical",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentFAQId++,
        question: "Can I export my data?",
        answer: "Yes, you can export your data in CSV or JSON format. Go to Settings > Data Export and select the data you want to export. The export will be emailed to your registered email address.",
        category: "features",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentFAQId++,
        question: "How do I delete my account?",
        answer: "To delete your account, go to Settings > Account and click 'Delete Account' at the bottom of the page. This action is permanent and cannot be undone. All your data will be permanently deleted.",
        category: "account",
        isActive: true,
        createdAt: new Date(),
      },
    ];

    sampleFAQs.forEach(faq => this.faqs.set(faq.id, faq));

    // Create sample tickets
    const sampleTickets: Ticket[] = [
      {
        id: this.currentTicketId++,
        ticketId: "TK001",
        subject: "Unable to access my account dashboard",
        description: "I'm experiencing issues logging into my account dashboard. The page keeps loading but never displays my information. I've tried clearing my browser cache and using different browsers but the issue persists.",
        category: "technical",
        priority: "high",
        status: "in-progress",
        userId: sampleUser.id,
        assigneeId: adminUser.id,
        attachments: ["screenshot.png", "error_log.pdf"],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: this.currentTicketId++,
        ticketId: "TK002",
        subject: "Payment processing error",
        description: "My payment was declined but the money was still charged to my account. Need assistance with refund processing.",
        category: "billing",
        priority: "medium",
        status: "resolved",
        userId: sampleUser.id,
        assigneeId: adminUser.id,
        attachments: [],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        id: this.currentTicketId++,
        ticketId: "TK003",
        subject: "Feature request: Dark mode",
        description: "Would like to request a dark mode feature for the application to reduce eye strain during extended use.",
        category: "feature",
        priority: "low",
        status: "open",
        userId: sampleUser.id,
        assigneeId: null,
        attachments: [],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    sampleTickets.forEach(ticket => this.tickets.set(ticket.id, ticket));
    this.ticketCounter = 4;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: Omit<InsertUser, 'confirmPassword'>): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Ticket methods
  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values())
      .filter(ticket => ticket.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getTicketByTicketId(ticketId: string): Promise<Ticket | undefined> {
    return Array.from(this.tickets.values()).find(ticket => ticket.ticketId === ticketId);
  }

  async createTicket(ticket: InsertTicket & { userId: number }): Promise<Ticket> {
    const id = this.currentTicketId++;
    const ticketId = `TK${String(this.ticketCounter++).padStart(3, '0')}`;
    const newTicket: Ticket = {
      ...ticket,
      id,
      ticketId,
      assigneeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tickets.set(id, newTicket);
    return newTicket;
  }

  async updateTicket(id: number, ticket: Partial<Ticket>): Promise<Ticket | undefined> {
    const existingTicket = this.tickets.get(id);
    if (!existingTicket) return undefined;

    const updatedTicket = { ...existingTicket, ...ticket, updatedAt: new Date() };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  // Ticket Reply methods
  async getTicketReplies(ticketId: number): Promise<TicketReply[]> {
    return Array.from(this.ticketReplies.values())
      .filter(reply => reply.ticketId === ticketId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createTicketReply(reply: InsertTicketReply): Promise<TicketReply> {
    const id = this.currentReplyId++;
    const newReply: TicketReply = {
      ...reply,
      id,
      createdAt: new Date(),
    };
    this.ticketReplies.set(id, newReply);
    return newReply;
  }

  // FAQ methods
  async getFAQs(): Promise<FAQ[]> {
    return Array.from(this.faqs.values()).filter(faq => faq.isActive);
  }

  async getFAQsByCategory(category: string): Promise<FAQ[]> {
    return Array.from(this.faqs.values())
      .filter(faq => faq.isActive && faq.category === category);
  }

  async createFAQ(faq: InsertFAQ): Promise<FAQ> {
    const id = this.currentFAQId++;
    const newFAQ: FAQ = {
      ...faq,
      id,
      createdAt: new Date(),
    };
    this.faqs.set(id, newFAQ);
    return newFAQ;
  }

  // Chat methods
  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const newMessage: ChatMessage = {
      ...message,
      id,
      response: null,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  async updateChatMessageResponse(id: number, response: string): Promise<ChatMessage | undefined> {
    const existingMessage = this.chatMessages.get(id);
    if (!existingMessage) return undefined;

    const updatedMessage = { ...existingMessage, response };
    this.chatMessages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export const storage = new MemStorage();
