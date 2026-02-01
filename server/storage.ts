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
  users,
  conversations,
  messages,
  trades,
  parties,
  tradeParties,
  documents,
  chatMessages,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, isNull, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user!;
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
