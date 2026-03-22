import { 
  type User, 
  type InsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Trade,
  type InsertTrade,
  type Party,
  type InsertParty,
  type TradeParty,
  type InsertTradeParty,
  type Document,
  type InsertDocument,
  type ChatMessage,
  type InsertChatMessage,
  type Org,
  type InsertOrg,
  type AuditLog,
  type InsertAuditLog,
  type Invite,
  type InsertInvite,
  users,
  conversations,
  messages,
  trades,
  parties,
  tradeParties,
  documents,
  chatMessages,
  orgs,
  invites,
  auditLogs,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, isNull, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<any>): Promise<User | undefined>;

  // Orgs
  getOrg(id: string): Promise<Org | undefined>;
  createOrg(data: InsertOrg): Promise<Org>;
  updateOrg(id: string, data: Partial<InsertOrg>): Promise<Org | undefined>;

  // Invites
  createInvite(data: InsertInvite): Promise<Invite>;
  getInviteByToken(tokenHash: string): Promise<Invite | undefined>;
  acceptInvite(id: string): Promise<void>;

  // Audit
  createAuditLog(data: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(orgId: string): Promise<AuditLog[]>;
  
  createConversation(data: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversations(): Promise<Conversation[]>;
  deleteConversation(id: string): Promise<void>;
  
  createMessage(data: InsertMessage): Promise<Message>;
  getMessages(conversationId: string): Promise<Message[]>;

  // Trades
  createTrade(data: InsertTrade): Promise<Trade>;
  getTrade(id: string): Promise<Trade | undefined>;
  getTrades(): Promise<Trade[]>;
  updateTrade(id: string, data: Partial<InsertTrade>): Promise<Trade | undefined>;
  
  // Parties
  createParty(data: InsertParty): Promise<Party>;
  getParty(id: string): Promise<Party | undefined>;
  getParties(): Promise<Party[]>;
  
  // Trade Parties
  addPartyToTrade(data: InsertTradeParty): Promise<TradeParty>;
  getTradeParties(tradeId: string): Promise<(TradeParty & { party: Party })[]>;
  
  // Documents
  createDocument(data: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getTradeDocuments(tradeId: string): Promise<Document[]>;
  
  // Chat Messages
  createChatMessage(data: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(tradeId: string | null, mode: string): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user!;
  }

  async updateUser(id: string, data: Partial<any>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Orgs
  async getOrg(id: string): Promise<Org | undefined> {
    const [org] = await db.select().from(orgs).where(eq(orgs.id, id));
    return org;
  }

  async createOrg(data: InsertOrg): Promise<Org> {
    const [org] = await db.insert(orgs).values(data).returning();
    return org!;
  }

  async updateOrg(id: string, data: Partial<InsertOrg>): Promise<Org | undefined> {
    const [org] = await db.update(orgs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orgs.id, id))
      .returning();
    return org;
  }

  // Invites
  async createInvite(data: InsertInvite): Promise<Invite> {
    const [invite] = await db.insert(invites).values(data).returning();
    return invite!;
  }

  async getInviteByToken(tokenHash: string): Promise<Invite | undefined> {
    const [invite] = await db.select().from(invites).where(eq(invites.tokenHash, tokenHash));
    return invite;
  }

  async acceptInvite(id: string): Promise<void> {
    await db.update(invites)
      .set({ acceptedAt: new Date() })
      .where(eq(invites.id, id));
  }

  // Audit
  async createAuditLog(data: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(data).returning();
    return log!;
  }

  async getAuditLogs(orgId: string): Promise<AuditLog[]> {
    return db.select().from(auditLogs)
      .where(eq(auditLogs.orgId, orgId))
      .orderBy(desc(auditLogs.createdAt));
  }

  async createConversation(data: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(data).returning();
    return conversation!;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getConversations(): Promise<Conversation[]> {
    return db.select().from(conversations).orderBy(desc(conversations.updatedAt));
  }

  async deleteConversation(id: string): Promise<void> {
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(data).returning();
    return message!;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  // Trades
  async createTrade(data: InsertTrade): Promise<Trade> {
    const [trade] = await db.insert(trades).values(data).returning();
    return trade!;
  }

  async getTrade(id: string): Promise<Trade | undefined> {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    return trade;
  }

  async getTrades(): Promise<Trade[]> {
    return db.select().from(trades).orderBy(desc(trades.createdAt));
  }

  async updateTrade(id: string, data: Partial<InsertTrade>): Promise<Trade | undefined> {
    const [trade] = await db.update(trades)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(trades.id, id))
      .returning();
    return trade;
  }

  // Parties
  async createParty(data: InsertParty): Promise<Party> {
    const [party] = await db.insert(parties).values(data).returning();
    return party!;
  }

  async getParty(id: string): Promise<Party | undefined> {
    const [party] = await db.select().from(parties).where(eq(parties.id, id));
    return party;
  }

  async getParties(): Promise<Party[]> {
    return db.select().from(parties).orderBy(desc(parties.createdAt));
  }

  // Trade Parties
  async addPartyToTrade(data: InsertTradeParty): Promise<TradeParty> {
    const [tp] = await db.insert(tradeParties).values(data).returning();
    return tp!;
  }

  async getTradeParties(tradeId: string): Promise<(TradeParty & { party: Party })[]> {
    const results = await db
      .select()
      .from(tradeParties)
      .innerJoin(parties, eq(tradeParties.partyId, parties.id))
      .where(eq(tradeParties.tradeId, tradeId));
    
    return results.map(r => ({
      ...r.trade_parties,
      party: r.parties,
    }));
  }

  // Documents
  async createDocument(data: InsertDocument): Promise<Document> {
    const [doc] = await db.insert(documents).values(data).returning();
    return doc!;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async getTradeDocuments(tradeId: string): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.tradeId, tradeId));
  }

  // Chat Messages
  async createChatMessage(data: InsertChatMessage): Promise<ChatMessage> {
    const [msg] = await db.insert(chatMessages).values(data).returning();
    return msg!;
  }

  async getChatMessages(tradeId: string | null, mode: string): Promise<ChatMessage[]> {
    if (tradeId) {
      return db.select().from(chatMessages)
        .where(and(eq(chatMessages.tradeId, tradeId), eq(chatMessages.mode, mode)))
        .orderBy(chatMessages.createdAt);
    }
    return db.select().from(chatMessages)
      .where(and(isNull(chatMessages.tradeId), eq(chatMessages.mode, mode)))
      .orderBy(chatMessages.createdAt);
  }
}

export const storage = new DatabaseStorage();
