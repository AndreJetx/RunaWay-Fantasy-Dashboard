import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["player", "dm", "admin"]);
export const campaignStatusEnum = pgEnum("campaign_status", [
  "Active",
  "Paused",
  "Completed",
  "Archived",
]);
export const itemRarityEnum = pgEnum("item_rarity", [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
  "Artifact",
]);
export const itemTypeEnum = pgEnum("item_type", [
  "Weapon",
  "Armor",
  "Consumable",
  "Gem",
  "Material",
  "Tool",
  "Quest",
  "Other",
]);
export const changeTypeEnum = pgEnum("change_type", [
  "level_up",
  "stat_update",
  "equipment",
  "story",
  "misc",
]);
export const noteCategoryEnum = pgEnum("note_category", [
  "Sessions",
  "NPCs",
  "Loot",
  "Quests",
  "World",
  "Misc",
]);
export const tokenTypeEnum = pgEnum("token_type", ["reset", "refresh"]);

const userColumns = {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("player"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  lastLogin: timestamp("last_login", { withTimezone: true }),
  isPremium: boolean("is_premium").default(false),
};

export const users = pgTable("users", userColumns, (table) => ({
  usernameUnique: uniqueIndex("users_username_unique").on(table.username),
  emailUnique: uniqueIndex("users_email_unique").on(table.email),
}));

const campaignColumns = {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  dmId: uuid("dm_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  system: text("system").notNull().default("dnd5e"),
  status: campaignStatusEnum("status").notNull().default("Active"),
  currentSession: text("current_session"),
  nextSession: timestamp("next_session", { withTimezone: true }),
  progress: integer("progress").notNull().default(0),
  totalChapters: integer("total_chapters").default(10), // Número total de capítulos da campanha
  image: text("image"),
  inviteCode: varchar("invite_code"),
  attributeSystem: text("attribute_system").default("fixed"), // "fixed", "point_buy", "roll_4d6"
  initialMoney: text("initial_money").default("0"), // Quantidade de dinheiro inicial em nível 1
  maxPlayers: integer("max_players").default(6), // Número máximo de jogadores
  visibility: text("visibility").default("private"), // "public" ou "private"
  campaignDate: text("campaign_date").default("1-1-1490"), // Data atual da campanha (formato: dia-mês-ano)
  campaignTime: text("campaign_time").default("08:00"), // Hora atual da campanha (formato: HH:mm)
  calendarSystem: text("calendar_system").default("faerun"), // Sistema de calendário: "faerun" ou "custom"
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
};

export const campaigns = pgTable("campaigns", campaignColumns, (table) => ({
  inviteCodeUnique: uniqueIndex("campaigns_invite_code_unique").on(
    table.inviteCode,
  ),
}));

const campaignMemberColumns = {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").notNull().default("player"),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
};

export const campaignMembers = pgTable(
  "campaign_members",
  campaignMemberColumns,
  (table) => ({
    memberUnique: uniqueIndex("campaign_members_campaign_user_unique").on(
      table.campaignId,
      table.userId,
    ),
  }),
);

const characterColumns = {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  campaignId: uuid("campaign_id") // Nullable for standalone characters
    .references(() => campaigns.id, { onDelete: "cascade" }),
  playerId: uuid("player_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  system: text("system").notNull().default("dnd5e"),
  name: text("name").notNull(),
  race: text("race"),
  subrace: text("subrace"), // Subrace (ex: Hill Dwarf, High Elf, etc)
  characterClass: text("character_class").notNull(),
  subclass: text("subclass"),
  pact: text("pact"), // Para Bruxos: Pacto da Lâmina, Pacto da Corrente, etc.
  dragonType: text("dragon_type"), // Para Feiticeiros Dracônicos: tipo de dragão ancestral
  fightingStyle: text("fighting_style"), // Para Guerreiro, Paladino, Ranger: estilo de combate
  level: integer("level").notNull().default(1),
  experiencePoints: integer("experience_points").default(0),
  background: text("background"),
  alignment: text("alignment"),
  image: text("image"),
  armorClass: integer("armor_class").default(10),
  initiative: integer("initiative").default(0),
  speed: integer("speed").default(30),
  currentHp: integer("current_hp").default(10),
  maxHp: integer("max_hp").default(10),
  tempHp: integer("temp_hp").default(0),
  hitDice: text("hit_dice"),
  hpBonusPerLevel: integer("hp_bonus_per_level").default(0), // Bônus de HP por nível (ex: Anão Hill = 1)
  attributes: jsonb("attributes").default(sql`'{}'::jsonb`),
  savingThrows: jsonb("saving_throws").default(sql`'{}'::jsonb`),
  skills: jsonb("skills").default(sql`'{}'::jsonb`),
  proficiencyBonus: integer("proficiency_bonus").default(2),
  proficiencies: text("proficiencies").array(),
  languages: text("languages").array(),
  equipment: jsonb("equipment").default(sql`'{}'::jsonb`),
  currency: jsonb("currency").default(sql`'{}'::jsonb`),
  inventory: jsonb("inventory").default(sql`'[]'::jsonb`),
  features: jsonb("features").default(sql`'{}'::jsonb`),
  spellcasting: jsonb("spellcasting").default(sql`'{}'::jsonb`),
  mana: integer("mana").default(0),
  maxMana: integer("max_mana").default(0),
  divindade: text("divindade"),
  origem: text("origem"),
  poderes: jsonb("poderes").default(sql`'{}'::jsonb`),
  personalityTraits: text("personality_traits"),
  ideals: text("ideals"),
  bonds: text("bonds"),
  flaws: text("flaws"),
  backstory: text("backstory"),
  notes: text("notes"),
  feats: jsonb("feats").default(sql`'[]'::jsonb`), // Array de feats escolhidos
  eldritchInvocations: text("eldritch_invocations").array().default(sql`'{}'`), // Array de IDs de Invocações Arcanas (Bruxo)
  bookOfShadowsCantrips: text("book_of_shadows_cantrips").array().default(sql`'{}'`), // Array de IDs de truques do Livro das Sombras (Pacto do Tomo)
  mysticArcanum: jsonb("mystic_arcanum").default(sql`'{}'::jsonb`), // Mystic Arcanum spells (Bruxo níveis 11+) - {"6": "spell-id", "7": "spell-id", ...}
  preparedSpells: jsonb("prepared_spells").default(sql`'[]'::jsonb`), // Array de magias preparadas (apenas para classes que preparam)
  lastSpellPrepDate: text("last_spell_prep_date"), // Última data em que magias foram preparadas
  usedSpellSlots: jsonb("used_spell_slots").default(sql`'{}'::jsonb`), // Slots de magia usados por nível
  needsLevelUp: boolean("needs_level_up").default(false),
  pendingHitDiceRoll: integer("pending_hit_dice_roll"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
};

export const characters = pgTable("characters", characterColumns, (table) => ({
  uniqueNamePerCampaign: uniqueIndex("characters_campaign_id_name_unique").on(
    table.campaignId,
    table.name,
  ),
}));

export const characterChangeLogs = pgTable("character_change_logs", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  characterId: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  playerId: uuid("player_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  changeType: changeTypeEnum("change_type").notNull(),
  fieldChanged: text("field_changed"),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  description: text("description"),
  seenByDm: boolean("seen_by_dm").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

const campaignSessionColumns = {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  sessionDate: timestamp("session_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
};

export const campaignSessions = pgTable(
  "campaign_sessions",
  campaignSessionColumns,
  (table) => ({
    uniqueSequence: uniqueIndex("campaign_sessions_campaign_sequence_unique").on(
      table.campaignId,
      table.sequence,
    ),
  }),
);

// Campaign Chapters - para organizar progresso da campanha
export const campaignChapters = pgTable("campaign_chapters", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  chapterNumber: integer("chapter_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
}, (table) => ({
  uniqueChapterNumber: uniqueIndex("campaign_chapters_campaign_number_unique").on(
    table.campaignId,
    table.chapterNumber,
  ),
}));

// NPCs/Inimigos com ficha D&D completa
const npcColumns = {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  chapterId: uuid("chapter_id")
    .references(() => campaignChapters.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  race: text("race"),
  characterClass: text("character_class"),
  subclass: text("subclass"),
  level: integer("level").default(1),
  challengeRating: text("challenge_rating"), // CR para monstros
  type: text("type"), // "npc", "enemy", "boss", etc
  alignment: text("alignment"),
  image: text("image"),
  // Atributos D&D
  armorClass: integer("armor_class").default(10),
  initiative: integer("initiative").default(0),
  speed: integer("speed").default(30),
  currentHp: integer("current_hp").default(10),
  maxHp: integer("max_hp").default(10),
  tempHp: integer("temp_hp").default(0),
  hitDice: text("hit_dice"),
  attributes: jsonb("attributes").default(sql`'{}'::jsonb`), // {strength, dexterity, constitution, intelligence, wisdom, charisma}
  savingThrows: jsonb("saving_throws").default(sql`'{}'::jsonb`),
  skills: jsonb("skills").default(sql`'{}'::jsonb`),
  proficiencyBonus: integer("proficiency_bonus").default(2),
  // Ataques e habilidades
  attacks: jsonb("attacks").default(sql`'[]'::jsonb`), // Array de ataques
  abilities: jsonb("abilities").default(sql`'[]'::jsonb`), // Habilidades especiais
  resistances: text("resistances").array(),
  immunities: text("immunities").array(),
  vulnerabilities: text("vulnerabilities").array(),
  // Informações adicionais
  role: text("role"), // Roleplay: "merchant", "guard", "villain", etc
  attitude: text("attitude"), // "friendly", "neutral", "hostile"
  description: text("description"),
  backstory: text("backstory"),
  notes: text("notes"),
  isHostile: boolean("is_hostile").default(false),
  lastSeen: text("last_seen"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
};

export const campaignNpcs = pgTable("campaign_npcs", npcColumns, (table) => ({
  uniqueNamePerCampaign: uniqueIndex("campaign_npcs_campaign_id_name_unique").on(
    table.campaignId,
    table.name,
  ),
}));

export const items = pgTable("items", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  campaignId: uuid("campaign_id") // Nullable for standalone character items
    .references(() => campaigns.id, { onDelete: "cascade" }),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: itemTypeEnum("type").notNull(),
  rarity: itemRarityEnum("rarity").notNull(),
  weight: numeric("weight", { precision: 10, scale: 2 }).notNull().default("1"),
  quantity: integer("quantity").notNull().default(1),
  image: text("image"),
  description: text("description"),
  attunementRequired: boolean("attunement_required").default(false),
  equipped: boolean("equipped").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const maps = pgTable("maps", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  chapterId: uuid("chapter_id")
    .references(() => campaignChapters.id, { onDelete: "set null" }),
  dmId: uuid("dm_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  markers: jsonb("markers").default(sql`'[]'::jsonb`),
  notes: text("notes"),
  isInitialMap: boolean("is_initial_map").default(false), // Mapa inicial da campanha
  visibleToPlayers: boolean("visible_to_players").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const notes = pgTable("notes", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  dmId: uuid("dm_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  category: noteCategoryEnum("category").notNull().default("Misc"),
  tags: text("tags").array(),
  isPrivate: boolean("is_private").default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

const authTokenColumns = {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  type: tokenTypeEnum("type").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
};

export const authTokens = pgTable("auth_tokens", authTokenColumns, (table) => ({
  tokenUnique: uniqueIndex("auth_tokens_token_unique").on(table.token),
}));

export const homebrewContent = pgTable("homebrew_content", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "spell", "item", "monster", "subclass", "background", "race", "class"
  name: text("name").notNull(),
  description: text("description"),
  data: jsonb("data").default(sql`'{}'::jsonb`).notNull(), // Specific fields for each type
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  role: z.enum(["player", "dm", "admin"]).optional(),
}).pick({
  username: true,
  email: true,
  password: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignMember = typeof campaignMembers.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type CharacterChangeLog = typeof characterChangeLogs.$inferSelect;
export type CampaignSession = typeof campaignSessions.$inferSelect;
export type CampaignChapter = typeof campaignChapters.$inferSelect;
export type CampaignNpc = typeof campaignNpcs.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Map = typeof maps.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type AuthToken = typeof authTokens.$inferSelect;
export type HomebrewContent = typeof homebrewContent.$inferSelect;
