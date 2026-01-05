CREATE TYPE "public"."campaign_status" AS ENUM('Active', 'Paused', 'Completed', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."change_type" AS ENUM('level_up', 'stat_update', 'equipment', 'story', 'misc');--> statement-breakpoint
CREATE TYPE "public"."item_rarity" AS ENUM('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Artifact');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('Weapon', 'Armor', 'Consumable', 'Gem', 'Material', 'Tool', 'Quest', 'Other');--> statement-breakpoint
CREATE TYPE "public"."note_category" AS ENUM('Sessions', 'NPCs', 'Loot', 'Quests', 'World', 'Misc');--> statement-breakpoint
CREATE TYPE "public"."token_type" AS ENUM('reset', 'refresh');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('player', 'dm', 'admin');--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"type" "token_type" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"chapter_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "user_role" DEFAULT 'player' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_npcs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"chapter_id" uuid,
	"name" text NOT NULL,
	"race" text,
	"character_class" text,
	"subclass" text,
	"level" integer DEFAULT 1,
	"challenge_rating" text,
	"type" text,
	"alignment" text,
	"image" text,
	"armor_class" integer DEFAULT 10,
	"initiative" integer DEFAULT 0,
	"speed" integer DEFAULT 30,
	"current_hp" integer DEFAULT 10,
	"max_hp" integer DEFAULT 10,
	"temp_hp" integer DEFAULT 0,
	"hit_dice" text,
	"attributes" jsonb DEFAULT '{}'::jsonb,
	"saving_throws" jsonb DEFAULT '{}'::jsonb,
	"skills" jsonb DEFAULT '{}'::jsonb,
	"proficiency_bonus" integer DEFAULT 2,
	"attacks" jsonb DEFAULT '[]'::jsonb,
	"abilities" jsonb DEFAULT '[]'::jsonb,
	"resistances" text[],
	"immunities" text[],
	"vulnerabilities" text[],
	"role" text,
	"attitude" text,
	"description" text,
	"backstory" text,
	"notes" text,
	"is_hostile" boolean DEFAULT false,
	"last_seen" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"session_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dm_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"system" text DEFAULT 'dnd5e' NOT NULL,
	"status" "campaign_status" DEFAULT 'Active' NOT NULL,
	"current_session" text,
	"next_session" timestamp with time zone,
	"progress" integer DEFAULT 0 NOT NULL,
	"total_chapters" integer DEFAULT 10,
	"image" text,
	"invite_code" varchar,
	"attribute_system" text DEFAULT 'fixed',
	"initial_money" text DEFAULT '0',
	"max_players" integer DEFAULT 6,
	"visibility" text DEFAULT 'private',
	"campaign_date" text DEFAULT '1-1-1490',
	"campaign_time" text DEFAULT '08:00',
	"calendar_system" text DEFAULT 'faerun',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_change_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"change_type" "change_type" NOT NULL,
	"field_changed" text,
	"old_value" jsonb,
	"new_value" jsonb,
	"description" text,
	"seen_by_dm" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"player_id" uuid NOT NULL,
	"system" text DEFAULT 'dnd5e' NOT NULL,
	"name" text NOT NULL,
	"race" text,
	"subrace" text,
	"character_class" text NOT NULL,
	"subclass" text,
	"pact" text,
	"dragon_type" text,
	"fighting_style" text,
	"level" integer DEFAULT 1 NOT NULL,
	"experience_points" integer DEFAULT 0,
	"background" text,
	"alignment" text,
	"image" text,
	"armor_class" integer DEFAULT 10,
	"initiative" integer DEFAULT 0,
	"speed" integer DEFAULT 30,
	"current_hp" integer DEFAULT 10,
	"max_hp" integer DEFAULT 10,
	"temp_hp" integer DEFAULT 0,
	"hit_dice" text,
	"hp_bonus_per_level" integer DEFAULT 0,
	"attributes" jsonb DEFAULT '{}'::jsonb,
	"saving_throws" jsonb DEFAULT '{}'::jsonb,
	"skills" jsonb DEFAULT '{}'::jsonb,
	"proficiency_bonus" integer DEFAULT 2,
	"proficiencies" text[],
	"languages" text[],
	"equipment" jsonb DEFAULT '{}'::jsonb,
	"currency" jsonb DEFAULT '{}'::jsonb,
	"inventory" jsonb DEFAULT '[]'::jsonb,
	"features" jsonb DEFAULT '{}'::jsonb,
	"spellcasting" jsonb DEFAULT '{}'::jsonb,
	"mana" integer DEFAULT 0,
	"max_mana" integer DEFAULT 0,
	"sorcery_points" integer DEFAULT 0,
	"max_sorcery_points" integer DEFAULT 0,
	"divindade" text,
	"origem" text,
	"poderes" jsonb DEFAULT '{}'::jsonb,
	"personality_traits" text,
	"ideals" text,
	"bonds" text,
	"flaws" text,
	"backstory" text,
	"notes" text,
	"feats" jsonb DEFAULT '[]'::jsonb,
	"eldritch_invocations" text[] DEFAULT '{}',
	"book_of_shadows_cantrips" text[] DEFAULT '{}',
	"mystic_arcanum" jsonb DEFAULT '{}'::jsonb,
	"prepared_spells" jsonb DEFAULT '[]'::jsonb,
	"last_spell_prep_date" text,
	"used_spell_slots" jsonb DEFAULT '{}'::jsonb,
	"needs_level_up" boolean DEFAULT false,
	"pending_hit_dice_roll" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homebrew_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "item_type" NOT NULL,
	"rarity" "item_rarity" NOT NULL,
	"weight" numeric(10, 2) DEFAULT '1' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"image" text,
	"description" text,
	"attunement_required" boolean DEFAULT false,
	"equipped" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"chapter_id" uuid,
	"dm_id" uuid NOT NULL,
	"title" text NOT NULL,
	"image_url" text NOT NULL,
	"markers" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"is_initial_map" boolean DEFAULT false,
	"visible_to_players" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"dm_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"category" "note_category" DEFAULT 'Misc' NOT NULL,
	"tags" text[],
	"is_private" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'player' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login" timestamp with time zone,
	"is_premium" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_chapters" ADD CONSTRAINT "campaign_chapters_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_members" ADD CONSTRAINT "campaign_members_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_members" ADD CONSTRAINT "campaign_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_npcs" ADD CONSTRAINT "campaign_npcs_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_npcs" ADD CONSTRAINT "campaign_npcs_chapter_id_campaign_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."campaign_chapters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_sessions" ADD CONSTRAINT "campaign_sessions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_dm_id_users_id_fk" FOREIGN KEY ("dm_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_change_logs" ADD CONSTRAINT "character_change_logs_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_change_logs" ADD CONSTRAINT "character_change_logs_player_id_users_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_change_logs" ADD CONSTRAINT "character_change_logs_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_player_id_users_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homebrew_content" ADD CONSTRAINT "homebrew_content_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_chapter_id_campaign_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."campaign_chapters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_dm_id_users_id_fk" FOREIGN KEY ("dm_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_dm_id_users_id_fk" FOREIGN KEY ("dm_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_tokens_token_unique" ON "auth_tokens" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_chapters_campaign_number_unique" ON "campaign_chapters" USING btree ("campaign_id","chapter_number");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_members_campaign_user_unique" ON "campaign_members" USING btree ("campaign_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_npcs_campaign_id_name_unique" ON "campaign_npcs" USING btree ("campaign_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_sessions_campaign_sequence_unique" ON "campaign_sessions" USING btree ("campaign_id","sequence");--> statement-breakpoint
CREATE UNIQUE INDEX "campaigns_invite_code_unique" ON "campaigns" USING btree ("invite_code");--> statement-breakpoint
CREATE UNIQUE INDEX "characters_campaign_id_name_unique" ON "characters" USING btree ("campaign_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");