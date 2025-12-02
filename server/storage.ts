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
  type CampaignMember,
  type CharacterChangeLog,
  users,
  characters,
  items,
  campaigns,
  campaignMembers,
  characterChangeLogs,
  maps,
  notes
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;

  // Campaigns
  getCampaigns(userId: string, role: string): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  getCampaignByInviteCode(code: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign, dmId: string): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<InsertCampaign>, dmId: string): Promise<Campaign | undefined>;
  deleteCampaign(id: string, dmId: string): Promise<boolean>;

  // Campaign Members
  getCampaignMembers(campaignId: string): Promise<(CampaignMember & { user: User })[]>;
  addCampaignMember(campaignId: string, userId: string): Promise<CampaignMember>;
  removeCampaignMember(campaignId: string, userId: string): Promise<boolean>;
  isUserInCampaign(campaignId: string, userId: string): Promise<boolean>;

  // Characters
  getCharactersByCampaign(campaignId: string): Promise<Character[]>;
  getCharactersByPlayer(playerId: string): Promise<Character[]>;
  getCharacter(id: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter, playerId: string): Promise<Character>;
  updateCharacter(id: string, character: Partial<InsertCharacter>, playerId: string, isDm?: boolean): Promise<Character | undefined>;
  deleteCharacter(id: string, playerId: string, isDm?: boolean): Promise<boolean>;

  // Character Change Logs
  logCharacterChange(log: {
    characterId: string;
    playerId: string;
    campaignId: string;
    changeType: string;
    fieldChanged?: string;
    oldValue?: string;
    newValue?: string;
    description?: string;
  }): Promise<CharacterChangeLog>;
  getChangeLogsByCampaign(campaignId: string, onlyUnseen?: boolean): Promise<CharacterChangeLog[]>;
  markChangeLogAsSeen(id: string): Promise<void>;
  markAllChangeLogsAsSeen(campaignId: string): Promise<void>;

  // Items
  getItems(userId: string, campaignId?: string): Promise<Item[]>;
  getItem(id: string, userId: string): Promise<Item | undefined>;
  createItem(item: InsertItem, ownerId: string): Promise<Item>;
  updateItem(id: string, item: Partial<InsertItem>, ownerId: string): Promise<Item | undefined>;
  deleteItem(id: string, ownerId: string): Promise<boolean>;

  // Maps
  getMaps(campaignId: string, isDm: boolean): Promise<Map[]>;
  getMap(id: string): Promise<Map | undefined>;
  createMap(map: InsertMap, dmId: string): Promise<Map>;
  updateMap(id: string, map: Partial<InsertMap>, dmId: string): Promise<Map | undefined>;
  deleteMap(id: string, dmId: string): Promise<boolean>;

  // Notes
  getNotes(campaignId: string, dmId: string): Promise<Note[]>;
  getNote(id: string, dmId: string): Promise<Note | undefined>;
  createNote(note: InsertNote, dmId: string): Promise<Note>;
  updateNote(id: string, note: Partial<InsertNote>, dmId: string): Promise<Note | undefined>;
  deleteNote(id: string, dmId: string): Promise<boolean>;
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
    const [user] = await db.insert(users).values(insertUser as any).returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Campaigns
  async getCampaigns(userId: string, role: string): Promise<Campaign[]> {
    if (role === "dm") {
      return await db.select().from(campaigns).where(eq(campaigns.dmId, userId));
    } else {
      const memberships = await db.select().from(campaignMembers).where(eq(campaignMembers.userId, userId));
      const campaignIds = memberships.map(m => m.campaignId);
      if (campaignIds.length === 0) return [];
      
      const result: Campaign[] = [];
      for (const cid of campaignIds) {
        const [camp] = await db.select().from(campaigns).where(eq(campaigns.id, cid));
        if (camp) result.push(camp);
      }
      return result;
    }
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async getCampaignByInviteCode(code: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.inviteCode, code));
    return campaign || undefined;
  }

  async createCampaign(campaign: InsertCampaign, dmId: string): Promise<Campaign> {
    const inviteCode = randomBytes(6).toString("hex");
    const [newCampaign] = await db.insert(campaigns).values({ ...campaign, dmId, inviteCode } as any).returning();
    return newCampaign;
  }

  async updateCampaign(id: string, campaign: Partial<InsertCampaign>, dmId: string): Promise<Campaign | undefined> {
    const [updated] = await db.update(campaigns)
      .set(campaign as any)
      .where(and(eq(campaigns.id, id), eq(campaigns.dmId, dmId)))
      .returning();
    return updated || undefined;
  }

  async deleteCampaign(id: string, dmId: string): Promise<boolean> {
    const result = await db.delete(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.dmId, dmId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Campaign Members
  async getCampaignMembers(campaignId: string): Promise<(CampaignMember & { user: User })[]> {
    const members = await db.select().from(campaignMembers).where(eq(campaignMembers.campaignId, campaignId));
    const result: (CampaignMember & { user: User })[] = [];
    for (const member of members) {
      const [user] = await db.select().from(users).where(eq(users.id, member.userId));
      if (user) {
        result.push({ ...member, user });
      }
    }
    return result;
  }

  async addCampaignMember(campaignId: string, userId: string): Promise<CampaignMember> {
    const [member] = await db.insert(campaignMembers).values({ campaignId, userId }).returning();
    return member;
  }

  async removeCampaignMember(campaignId: string, userId: string): Promise<boolean> {
    const result = await db.delete(campaignMembers)
      .where(and(eq(campaignMembers.campaignId, campaignId), eq(campaignMembers.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async isUserInCampaign(campaignId: string, userId: string): Promise<boolean> {
    const [member] = await db.select().from(campaignMembers)
      .where(and(eq(campaignMembers.campaignId, campaignId), eq(campaignMembers.userId, userId)));
    if (member) return true;
    
    const [campaign] = await db.select().from(campaigns)
      .where(and(eq(campaigns.id, campaignId), eq(campaigns.dmId, userId)));
    return !!campaign;
  }

  // Characters
  async getCharactersByCampaign(campaignId: string): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.campaignId, campaignId));
  }

  async getCharactersByPlayer(playerId: string): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.playerId, playerId));
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character || undefined;
  }

  async createCharacter(character: InsertCharacter, playerId: string): Promise<Character> {
    const [newCharacter] = await db.insert(characters).values({ ...character, playerId } as any).returning();
    return newCharacter;
  }

  async updateCharacter(id: string, character: Partial<InsertCharacter>, playerId: string, isDm = false): Promise<Character | undefined> {
    const existing = await this.getCharacter(id);
    if (!existing) return undefined;
    
    if (!isDm && existing.playerId !== playerId) return undefined;
    
    const [updated] = await db.update(characters)
      .set({ ...character, updatedAt: new Date() } as any)
      .where(eq(characters.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCharacter(id: string, playerId: string, isDm = false): Promise<boolean> {
    const existing = await this.getCharacter(id);
    if (!existing) return false;
    
    if (!isDm && existing.playerId !== playerId) return false;
    
    const result = await db.delete(characters).where(eq(characters.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Character Change Logs
  async logCharacterChange(log: {
    characterId: string;
    playerId: string;
    campaignId: string;
    changeType: string;
    fieldChanged?: string;
    oldValue?: string;
    newValue?: string;
    description?: string;
  }): Promise<CharacterChangeLog> {
    const [newLog] = await db.insert(characterChangeLogs).values(log as any).returning();
    return newLog;
  }

  async getChangeLogsByCampaign(campaignId: string, onlyUnseen = false): Promise<CharacterChangeLog[]> {
    if (onlyUnseen) {
      return await db.select().from(characterChangeLogs)
        .where(and(eq(characterChangeLogs.campaignId, campaignId), eq(characterChangeLogs.seenByDm, false)))
        .orderBy(desc(characterChangeLogs.createdAt));
    }
    return await db.select().from(characterChangeLogs)
      .where(eq(characterChangeLogs.campaignId, campaignId))
      .orderBy(desc(characterChangeLogs.createdAt));
  }

  async markChangeLogAsSeen(id: string): Promise<void> {
    await db.update(characterChangeLogs).set({ seenByDm: true }).where(eq(characterChangeLogs.id, id));
  }

  async markAllChangeLogsAsSeen(campaignId: string): Promise<void> {
    await db.update(characterChangeLogs).set({ seenByDm: true }).where(eq(characterChangeLogs.campaignId, campaignId));
  }

  // Items
  async getItems(userId: string, campaignId?: string): Promise<Item[]> {
    if (campaignId) {
      return await db.select().from(items).where(eq(items.campaignId, campaignId));
    }
    return await db.select().from(items).where(eq(items.ownerId, userId));
  }

  async getItem(id: string, userId: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async createItem(item: InsertItem, ownerId: string): Promise<Item> {
    const [newItem] = await db.insert(items).values({ ...item, ownerId } as any).returning();
    return newItem;
  }

  async updateItem(id: string, item: Partial<InsertItem>, ownerId: string): Promise<Item | undefined> {
    const [updated] = await db.update(items)
      .set(item as any)
      .where(and(eq(items.id, id), eq(items.ownerId, ownerId)))
      .returning();
    return updated || undefined;
  }

  async deleteItem(id: string, ownerId: string): Promise<boolean> {
    const result = await db.delete(items)
      .where(and(eq(items.id, id), eq(items.ownerId, ownerId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Maps
  async getMaps(campaignId: string, isDm: boolean): Promise<Map[]> {
    if (isDm) {
      return await db.select().from(maps).where(eq(maps.campaignId, campaignId));
    }
    return await db.select().from(maps)
      .where(and(eq(maps.campaignId, campaignId), eq(maps.visibleToPlayers, true)));
  }

  async getMap(id: string): Promise<Map | undefined> {
    const [map] = await db.select().from(maps).where(eq(maps.id, id));
    return map || undefined;
  }

  async createMap(map: InsertMap, dmId: string): Promise<Map> {
    const [newMap] = await db.insert(maps).values({ ...map, dmId } as any).returning();
    return newMap;
  }

  async updateMap(id: string, map: Partial<InsertMap>, dmId: string): Promise<Map | undefined> {
    const [updated] = await db.update(maps)
      .set(map as any)
      .where(and(eq(maps.id, id), eq(maps.dmId, dmId)))
      .returning();
    return updated || undefined;
  }

  async deleteMap(id: string, dmId: string): Promise<boolean> {
    const result = await db.delete(maps)
      .where(and(eq(maps.id, id), eq(maps.dmId, dmId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Notes
  async getNotes(campaignId: string, dmId: string): Promise<Note[]> {
    return await db.select().from(notes)
      .where(and(eq(notes.campaignId, campaignId), eq(notes.dmId, dmId)));
  }

  async getNote(id: string, dmId: string): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(
      and(eq(notes.id, id), eq(notes.dmId, dmId))
    );
    return note || undefined;
  }

  async createNote(note: InsertNote, dmId: string): Promise<Note> {
    const [newNote] = await db.insert(notes).values({ ...note, dmId } as any).returning();
    return newNote;
  }

  async updateNote(id: string, note: Partial<InsertNote>, dmId: string): Promise<Note | undefined> {
    const [updated] = await db.update(notes)
      .set({ ...note, updatedAt: new Date() } as any)
      .where(and(eq(notes.id, id), eq(notes.dmId, dmId)))
      .returning();
    return updated || undefined;
  }

  async deleteNote(id: string, dmId: string): Promise<boolean> {
    const result = await db.delete(notes)
      .where(and(eq(notes.id, id), eq(notes.dmId, dmId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
