import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  class: text("class").notNull(),
  level: integer("level").notNull().default(1),
  hp: integer("hp").notNull().default(10),
  alignment: text("alignment"),
  image: text("image"),
  attributes: jsonb("attributes").$type<{
    strength?: number;
    dexterity?: number;
    intelligence?: number;
    constitution?: number;
  }>(),
  abilities: text("abilities").array(),
  background: text("background"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  rarity: text("rarity").notNull(),
  weight: integer("weight").notNull().default(1),
  quantity: integer("quantity").notNull().default(1),
  image: text("image"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("Active"),
  nextSession: text("next_session"),
  location: text("location"),
  players: integer("players").default(0),
  progress: integer("progress").default(0),
  image: text("image"),
  npcs: jsonb("npcs").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const maps = pgTable("maps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  markers: jsonb("markers").$type<Array<{
    id: string;
    x: number;
    y: number;
    label: string;
  }>>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({ 
  id: true, 
  createdAt: true, 
  userId: true 
});

export const insertItemSchema = createInsertSchema(items).omit({ 
  id: true, 
  createdAt: true, 
  userId: true 
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({ 
  id: true, 
  createdAt: true, 
  userId: true 
});

export const insertMapSchema = createInsertSchema(maps).omit({ 
  id: true, 
  createdAt: true, 
  userId: true 
});

export const insertNoteSchema = createInsertSchema(notes).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  userId: true 
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertMap = z.infer<typeof insertMapSchema>;
export type Map = typeof maps.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;
