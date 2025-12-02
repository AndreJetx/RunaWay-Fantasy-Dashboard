import { 
  type User, 
  type InsertUser,
  type Character,
  type InsertCharacter,
  type Item,
  type InsertItem,
  type Campaign,
  type InsertCampaign,
  type Map,
  type InsertMap,
  type Note,
  type InsertNote,
  users,
  characters,
  items,
  campaigns,
  maps,
  notes
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Characters
  getCharacters(userId: string): Promise<Character[]>;
  getCharacter(id: string, userId: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter, userId: string): Promise<Character>;
  updateCharacter(id: string, character: Partial<InsertCharacter>, userId: string): Promise<Character | undefined>;
  deleteCharacter(id: string, userId: string): Promise<boolean>;

  // Items
  getItems(userId: string): Promise<Item[]>;
  getItem(id: string, userId: string): Promise<Item | undefined>;
  createItem(item: InsertItem, userId: string): Promise<Item>;
  updateItem(id: string, item: Partial<InsertItem>, userId: string): Promise<Item | undefined>;
  deleteItem(id: string, userId: string): Promise<boolean>;

  // Campaigns
  getCampaigns(userId: string): Promise<Campaign[]>;
  getCampaign(id: string, userId: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign, userId: string): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<InsertCampaign>, userId: string): Promise<Campaign | undefined>;
  deleteCampaign(id: string, userId: string): Promise<boolean>;

  // Maps
  getMaps(userId: string): Promise<Map[]>;
  getMap(id: string, userId: string): Promise<Map | undefined>;
  createMap(map: InsertMap, userId: string): Promise<Map>;
  updateMap(id: string, map: Partial<InsertMap>, userId: string): Promise<Map | undefined>;
  deleteMap(id: string, userId: string): Promise<boolean>;

  // Notes
  getNotes(userId: string): Promise<Note[]>;
  getNote(id: string, userId: string): Promise<Note | undefined>;
  createNote(note: InsertNote, userId: string): Promise<Note>;
  updateNote(id: string, note: Partial<InsertNote>, userId: string): Promise<Note | undefined>;
  deleteNote(id: string, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Characters
  async getCharacters(userId: string): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.userId, userId));
  }

  async getCharacter(id: string, userId: string): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(
      and(eq(characters.id, id), eq(characters.userId, userId))
    );
    return character || undefined;
  }

  async createCharacter(character: InsertCharacter, userId: string): Promise<Character> {
    const [newCharacter] = await db.insert(characters).values({ ...character, userId } as any).returning();
    return newCharacter;
  }

  async updateCharacter(id: string, character: Partial<InsertCharacter>, userId: string): Promise<Character | undefined> {
    const [updated] = await db.update(characters)
      .set(character as any)
      .where(and(eq(characters.id, id), eq(characters.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteCharacter(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(characters)
      .where(and(eq(characters.id, id), eq(characters.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Items
  async getItems(userId: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.userId, userId));
  }

  async getItem(id: string, userId: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(
      and(eq(items.id, id), eq(items.userId, userId))
    );
    return item || undefined;
  }

  async createItem(item: InsertItem, userId: string): Promise<Item> {
    const [newItem] = await db.insert(items).values({ ...item, userId }).returning();
    return newItem;
  }

  async updateItem(id: string, item: Partial<InsertItem>, userId: string): Promise<Item | undefined> {
    const [updated] = await db.update(items)
      .set(item)
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteItem(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(items)
      .where(and(eq(items.id, id), eq(items.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Campaigns
  async getCampaigns(userId: string): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.userId, userId));
  }

  async getCampaign(id: string, userId: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(
      and(eq(campaigns.id, id), eq(campaigns.userId, userId))
    );
    return campaign || undefined;
  }

  async createCampaign(campaign: InsertCampaign, userId: string): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values({ ...campaign, userId } as any).returning();
    return newCampaign;
  }

  async updateCampaign(id: string, campaign: Partial<InsertCampaign>, userId: string): Promise<Campaign | undefined> {
    const [updated] = await db.update(campaigns)
      .set(campaign as any)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteCampaign(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Maps
  async getMaps(userId: string): Promise<Map[]> {
    return await db.select().from(maps).where(eq(maps.userId, userId));
  }

  async getMap(id: string, userId: string): Promise<Map | undefined> {
    const [map] = await db.select().from(maps).where(
      and(eq(maps.id, id), eq(maps.userId, userId))
    );
    return map || undefined;
  }

  async createMap(map: InsertMap, userId: string): Promise<Map> {
    const [newMap] = await db.insert(maps).values({ ...map, userId } as any).returning();
    return newMap;
  }

  async updateMap(id: string, map: Partial<InsertMap>, userId: string): Promise<Map | undefined> {
    const [updated] = await db.update(maps)
      .set(map as any)
      .where(and(eq(maps.id, id), eq(maps.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteMap(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(maps)
      .where(and(eq(maps.id, id), eq(maps.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Notes
  async getNotes(userId: string): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.userId, userId));
  }

  async getNote(id: string, userId: string): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(
      and(eq(notes.id, id), eq(notes.userId, userId))
    );
    return note || undefined;
  }

  async createNote(note: InsertNote, userId: string): Promise<Note> {
    const [newNote] = await db.insert(notes).values({ ...note, userId }).returning();
    return newNote;
  }

  async updateNote(id: string, note: Partial<InsertNote>, userId: string): Promise<Note | undefined> {
    const [updated] = await db.update(notes)
      .set({ ...note, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteNote(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
