import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users with roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default("player"), // 'dm' or 'player'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Campaigns
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dmId: varchar("dm_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  system: text("system").notNull().default("dnd5e"), // 'dnd5e' or 'tormenta20'
  status: text("status").notNull().default("Active"),
  nextSession: text("next_session"),
  image: text("image"),
  inviteCode: varchar("invite_code").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Campaign Members (players in a campaign)
export const campaignMembers = pgTable("campaign_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// D&D 5e Character Sheet
export const dnd5eAttributes = z.object({
  strength: z.number().min(1).max(30).default(10),
  dexterity: z.number().min(1).max(30).default(10),
  constitution: z.number().min(1).max(30).default(10),
  intelligence: z.number().min(1).max(30).default(10),
  wisdom: z.number().min(1).max(30).default(10),
  charisma: z.number().min(1).max(30).default(10),
});

export const dnd5eSkills = z.object({
  acrobatics: z.number().default(0),
  animalHandling: z.number().default(0),
  arcana: z.number().default(0),
  athletics: z.number().default(0),
  deception: z.number().default(0),
  history: z.number().default(0),
  insight: z.number().default(0),
  intimidation: z.number().default(0),
  investigation: z.number().default(0),
  medicine: z.number().default(0),
  nature: z.number().default(0),
  perception: z.number().default(0),
  performance: z.number().default(0),
  persuasion: z.number().default(0),
  religion: z.number().default(0),
  sleightOfHand: z.number().default(0),
  stealth: z.number().default(0),
  survival: z.number().default(0),
});

// Tormenta 20 Character Sheet
export const tormenta20Attributes = z.object({
  forca: z.number().min(1).max(30).default(10),
  destreza: z.number().min(1).max(30).default(10),
  constituicao: z.number().min(1).max(30).default(10),
  inteligencia: z.number().min(1).max(30).default(10),
  sabedoria: z.number().min(1).max(30).default(10),
  carisma: z.number().min(1).max(30).default(10),
});

export const tormenta20Pericias = z.object({
  acrobacia: z.number().default(0),
  adestramento: z.number().default(0),
  atletismo: z.number().default(0),
  atuacao: z.number().default(0),
  cavalgar: z.number().default(0),
  conhecimento: z.number().default(0),
  cura: z.number().default(0),
  diplomacia: z.number().default(0),
  enganacao: z.number().default(0),
  fortitude: z.number().default(0),
  furtividade: z.number().default(0),
  guerra: z.number().default(0),
  iniciativa: z.number().default(0),
  intimidacao: z.number().default(0),
  intuicao: z.number().default(0),
  investigacao: z.number().default(0),
  jogatina: z.number().default(0),
  ladinagem: z.number().default(0),
  luta: z.number().default(0),
  misticismo: z.number().default(0),
  nobreza: z.number().default(0),
  oficio: z.number().default(0),
  percepcao: z.number().default(0),
  pilotagem: z.number().default(0),
  pontaria: z.number().default(0),
  reflexos: z.number().default(0),
  religiao: z.number().default(0),
  sobrevivencia: z.number().default(0),
  vontade: z.number().default(0),
});

// Character Sheets (supports both systems)
export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  playerId: varchar("player_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  system: text("system").notNull().default("dnd5e"), // 'dnd5e' or 'tormenta20'
  
  // Basic Info
  name: text("name").notNull(),
  race: text("race"),
  characterClass: text("character_class").notNull(),
  subclass: text("subclass"),
  level: integer("level").notNull().default(1),
  experiencePoints: integer("experience_points").default(0),
  background: text("background"),
  alignment: text("alignment"),
  image: text("image"),
  
  // Combat Stats
  armorClass: integer("armor_class").default(10),
  initiative: integer("initiative").default(0),
  speed: integer("speed").default(30),
  currentHp: integer("current_hp").default(10),
  maxHp: integer("max_hp").default(10),
  tempHp: integer("temp_hp").default(0),
  hitDice: text("hit_dice"),
  
  // Attributes (JSON - depends on system)
  attributes: jsonb("attributes").$type<Record<string, number>>(),
  savingThrows: jsonb("saving_throws").$type<Record<string, number>>(),
  skills: jsonb("skills").$type<Record<string, number>>(),
  
  // Proficiencies
  proficiencyBonus: integer("proficiency_bonus").default(2),
  proficiencies: text("proficiencies").array(),
  languages: text("languages").array(),
  
  // Equipment & Inventory
  equipment: jsonb("equipment").$type<Array<{name: string; quantity: number; weight?: number}>>(),
  currency: jsonb("currency").$type<{gold?: number; silver?: number; copper?: number; platinum?: number; electrum?: number}>(),
  
  // Features & Abilities
  features: jsonb("features").$type<Array<{name: string; description: string; source?: string}>>(),
  spellcasting: jsonb("spellcasting").$type<{
    spellcastingAbility?: string;
    spellSaveDC?: number;
    spellAttackBonus?: number;
    spellSlots?: Record<string, number>;
    spellsKnown?: Array<{name: string; level: number; prepared?: boolean}>;
  }>(),
  
  // Tormenta 20 Specific
  mana: integer("mana").default(0),
  maxMana: integer("max_mana").default(0),
  divindade: text("divindade"),
  origem: text("origem"),
  poderes: jsonb("poderes").$type<Array<{name: string; description: string; type?: string}>>(),
  
  // Notes
  personalityTraits: text("personality_traits"),
  ideals: text("ideals"),
  bonds: text("bonds"),
  flaws: text("flaws"),
  backstory: text("backstory"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Character Change Log (for DM to track changes)
export const characterChangeLogs = pgTable("character_change_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  characterId: varchar("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  playerId: varchar("player_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  changeType: text("change_type").notNull(), // 'create', 'update', 'hp_change', 'level_up', 'item_add', etc.
  fieldChanged: text("field_changed"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  description: text("description"),
  seenByDm: boolean("seen_by_dm").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Items (shared inventory for campaign)
export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id, { onDelete: "cascade" }),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  rarity: text("rarity").notNull(),
  weight: integer("weight").notNull().default(1),
  quantity: integer("quantity").notNull().default(1),
  image: text("image"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Maps
export const maps = pgTable("maps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id, { onDelete: "cascade" }),
  dmId: varchar("dm_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  markers: jsonb("markers").$type<Array<{
    id: string;
    x: number;
    y: number;
    label: string;
    visibleToPlayers?: boolean;
  }>>(),
  notes: text("notes"),
  visibleToPlayers: boolean("visible_to_players").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// DM Notes
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id, { onDelete: "cascade" }),
  dmId: varchar("dm_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  category: text("category").notNull(),
  isPrivate: boolean("is_private").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  role: z.enum(["dm", "player"]).optional(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({ 
  id: true, 
  createdAt: true, 
  dmId: true,
  inviteCode: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  playerId: true,
});

export const insertItemSchema = createInsertSchema(items).omit({ 
  id: true, 
  createdAt: true, 
  ownerId: true 
});

export const insertMapSchema = createInsertSchema(maps).omit({ 
  id: true, 
  createdAt: true, 
  dmId: true 
});

export const insertNoteSchema = createInsertSchema(notes).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  dmId: true 
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignMember = typeof campaignMembers.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;
export type CharacterChangeLog = typeof characterChangeLogs.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;
export type InsertMap = z.infer<typeof insertMapSchema>;
export type Map = typeof maps.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;
