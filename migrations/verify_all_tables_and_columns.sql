-- Migration: Verificação completa de todas as tabelas e colunas
-- Este script verifica e cria todas as tabelas e colunas necessárias conforme o schema TypeScript
-- Execute este script no Supabase SQL Editor

-- ============================================
-- 1. ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('player', 'dm', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('Active', 'Paused', 'Completed', 'Archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE item_rarity AS ENUM ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Artifact');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE item_type AS ENUM ('Weapon', 'Armor', 'Consumable', 'Gem', 'Material', 'Tool', 'Quest', 'Other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE change_type AS ENUM ('level_up', 'stat_update', 'equipment', 'story', 'misc');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE note_category AS ENUM ('Sessions', 'NPCs', 'Loot', 'Quests', 'World', 'Misc');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE token_type AS ENUM ('reset', 'refresh');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. TABELA: users
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'player',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_premium BOOLEAN DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);

-- ============================================
-- 3. TABELA: campaigns
-- ============================================

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dm_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  system TEXT NOT NULL DEFAULT 'dnd5e',
  status campaign_status NOT NULL DEFAULT 'Active',
  current_session TEXT,
  next_session TIMESTAMP WITH TIME ZONE,
  progress INTEGER NOT NULL DEFAULT 0,
  total_chapters INTEGER DEFAULT 10,
  image TEXT,
  invite_code VARCHAR,
  attribute_system TEXT DEFAULT 'fixed',
  initial_money TEXT DEFAULT '0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS campaigns_invite_code_unique ON campaigns(invite_code) WHERE invite_code IS NOT NULL;

-- ============================================
-- 4. TABELA: campaign_members
-- ============================================

CREATE TABLE IF NOT EXISTS campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'player',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_members_campaign_id ON campaign_members(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_members_user_id ON campaign_members(user_id);

-- ============================================
-- 5. TABELA: characters
-- ============================================

CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  system TEXT NOT NULL DEFAULT 'dnd5e',
  name TEXT NOT NULL,
  race TEXT,
  character_class TEXT NOT NULL,
  subclass TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  background TEXT,
  alignment TEXT,
  image TEXT,
  armor_class INTEGER DEFAULT 10,
  initiative INTEGER DEFAULT 0,
  speed INTEGER DEFAULT 30,
  current_hp INTEGER DEFAULT 10,
  max_hp INTEGER DEFAULT 10,
  temp_hp INTEGER DEFAULT 0,
  hit_dice TEXT,
  attributes JSONB DEFAULT '{}'::jsonb,
  saving_throws JSONB DEFAULT '{}'::jsonb,
  skills JSONB DEFAULT '{}'::jsonb,
  proficiency_bonus INTEGER DEFAULT 2,
  proficiencies TEXT[],
  languages TEXT[],
  equipment JSONB DEFAULT '{}'::jsonb,
  currency JSONB DEFAULT '{}'::jsonb,
  inventory JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '{}'::jsonb,
  spellcasting JSONB DEFAULT '{}'::jsonb,
  mana INTEGER DEFAULT 0,
  max_mana INTEGER DEFAULT 0,
  divindade TEXT,
  origem TEXT,
  poderes JSONB DEFAULT '{}'::jsonb,
  personality_traits TEXT,
  ideals TEXT,
  bonds TEXT,
  flaws TEXT,
  backstory TEXT,
  notes TEXT,
  needs_level_up BOOLEAN DEFAULT FALSE,
  pending_hit_dice_roll INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, name)
);

CREATE INDEX IF NOT EXISTS idx_characters_campaign_id ON characters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_characters_player_id ON characters(player_id);

-- ============================================
-- 6. TABELA: character_change_logs
-- ============================================

CREATE TABLE IF NOT EXISTS character_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  change_type change_type NOT NULL,
  field_changed TEXT,
  old_value JSONB,
  new_value JSONB,
  description TEXT,
  seen_by_dm BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_character_change_logs_character_id ON character_change_logs(character_id);
CREATE INDEX IF NOT EXISTS idx_character_change_logs_campaign_id ON character_change_logs(campaign_id);

-- ============================================
-- 7. TABELA: campaign_sessions
-- ============================================

CREATE TABLE IF NOT EXISTS campaign_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, sequence)
);

CREATE INDEX IF NOT EXISTS idx_campaign_sessions_campaign_id ON campaign_sessions(campaign_id);

-- ============================================
-- 8. TABELA: campaign_chapters
-- ============================================

CREATE TABLE IF NOT EXISTS campaign_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS idx_campaign_chapters_campaign_id ON campaign_chapters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_chapters_number ON campaign_chapters(campaign_id, chapter_number);

-- ============================================
-- 9. TABELA: campaign_npcs
-- ============================================

CREATE TABLE IF NOT EXISTS campaign_npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES campaign_chapters(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  race TEXT,
  character_class TEXT,
  subclass TEXT,
  level INTEGER DEFAULT 1,
  challenge_rating TEXT,
  type TEXT,
  alignment TEXT,
  image TEXT,
  armor_class INTEGER DEFAULT 10,
  initiative INTEGER DEFAULT 0,
  speed INTEGER DEFAULT 30,
  current_hp INTEGER DEFAULT 10,
  max_hp INTEGER DEFAULT 10,
  temp_hp INTEGER DEFAULT 0,
  hit_dice TEXT,
  attributes JSONB DEFAULT '{}'::jsonb,
  saving_throws JSONB DEFAULT '{}'::jsonb,
  skills JSONB DEFAULT '{}'::jsonb,
  proficiency_bonus INTEGER DEFAULT 2,
  attacks JSONB DEFAULT '[]'::jsonb,
  abilities JSONB DEFAULT '[]'::jsonb,
  resistances TEXT[],
  immunities TEXT[],
  vulnerabilities TEXT[],
  role TEXT,
  attitude TEXT,
  description TEXT,
  backstory TEXT,
  notes TEXT,
  is_hostile BOOLEAN DEFAULT FALSE,
  last_seen TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, name)
);

CREATE INDEX IF NOT EXISTS idx_campaign_npcs_campaign_id ON campaign_npcs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_npcs_chapter_id ON campaign_npcs(chapter_id);
CREATE INDEX IF NOT EXISTS idx_campaign_npcs_type ON campaign_npcs(type);

-- ============================================
-- 10. TABELA: items
-- ============================================

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type item_type NOT NULL,
  rarity item_rarity NOT NULL,
  weight NUMERIC(10, 2) NOT NULL DEFAULT 1,
  quantity INTEGER NOT NULL DEFAULT 1,
  image TEXT,
  description TEXT,
  attunement_required BOOLEAN DEFAULT FALSE,
  equipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_campaign_id ON items(campaign_id);
CREATE INDEX IF NOT EXISTS idx_items_owner_id ON items(owner_id);

-- ============================================
-- 11. TABELA: maps
-- ============================================

CREATE TABLE IF NOT EXISTS maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES campaign_chapters(id) ON DELETE SET NULL,
  dm_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  markers JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  is_initial_map BOOLEAN DEFAULT FALSE,
  visible_to_players BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maps_campaign_id ON maps(campaign_id);
CREATE INDEX IF NOT EXISTS idx_maps_chapter_id ON maps(chapter_id);

-- ============================================
-- 12. TABELA: notes
-- ============================================

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  dm_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  category note_category NOT NULL DEFAULT 'Misc',
  tags TEXT[],
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_campaign_id ON notes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_notes_dm_id ON notes(dm_id);

-- ============================================
-- 13. TABELA: auth_tokens
-- ============================================

CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  type token_type NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_tokens_token_unique ON auth_tokens(token);

-- ============================================
-- 14. TABELA: homebrew_content
-- ============================================

CREATE TABLE IF NOT EXISTS homebrew_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  data JSONB DEFAULT '{}'::jsonb NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homebrew_content_user_id ON homebrew_content(user_id);

-- ============================================
-- 15. TABELAS VTT (Virtual Tabletop)
-- ============================================

-- 15.1. TABELA: combats
CREATE TABLE IF NOT EXISTS combats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  map_id UUID REFERENCES maps(id) ON DELETE SET NULL,
  turn_order JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_turn INTEGER NOT NULL DEFAULT 0,
  round INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_combats_campaign_id ON combats(campaign_id);
CREATE INDEX IF NOT EXISTS idx_combats_map_id ON combats(map_id);

-- 15.2. TABELA: tokens
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  combat_id UUID REFERENCES combats(id) ON DELETE SET NULL,
  x INTEGER NOT NULL DEFAULT 0,
  y INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#FF0000',
  name TEXT NOT NULL,
  image_url TEXT,
  size INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_campaign_id ON tokens(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tokens_character_id ON tokens(character_id);
CREATE INDEX IF NOT EXISTS idx_tokens_combat_id ON tokens(combat_id);

-- 15.3. TABELA: events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_campaign_id ON events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- ============================================
-- 16. TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at em tokens
CREATE OR REPLACE FUNCTION update_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tokens_updated_at_trigger ON tokens;
CREATE TRIGGER update_tokens_updated_at_trigger
  BEFORE UPDATE ON tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_tokens_updated_at();

-- Trigger para atualizar updated_at em characters
CREATE OR REPLACE FUNCTION update_characters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_characters_updated_at_trigger ON characters;
CREATE TRIGGER update_characters_updated_at_trigger
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_characters_updated_at();

-- Trigger para atualizar updated_at em campaign_npcs
CREATE OR REPLACE FUNCTION update_campaign_npcs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_campaign_npcs_updated_at_trigger ON campaign_npcs;
CREATE TRIGGER update_campaign_npcs_updated_at_trigger
  BEFORE UPDATE ON campaign_npcs
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_npcs_updated_at();

-- Trigger para atualizar updated_at em campaign_chapters
CREATE OR REPLACE FUNCTION update_campaign_chapters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_campaign_chapters_updated_at_trigger ON campaign_chapters;
CREATE TRIGGER update_campaign_chapters_updated_at_trigger
  BEFORE UPDATE ON campaign_chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_chapters_updated_at();

-- Trigger para atualizar updated_at em notes
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notes_updated_at_trigger ON notes;
CREATE TRIGGER update_notes_updated_at_trigger
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_updated_at();

-- Trigger para atualizar updated_at em homebrew_content
CREATE OR REPLACE FUNCTION update_homebrew_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_homebrew_content_updated_at_trigger ON homebrew_content;
CREATE TRIGGER update_homebrew_content_updated_at_trigger
  BEFORE UPDATE ON homebrew_content
  FOR EACH ROW
  EXECUTE FUNCTION update_homebrew_content_updated_at();

-- ============================================
-- FIM DA MIGRATION
-- ============================================

-- Verificação final: Listar todas as tabelas criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'users', 'campaigns', 'campaign_members', 'characters', 'character_change_logs',
    'campaign_sessions', 'campaign_chapters', 'campaign_npcs', 'items', 'maps',
    'notes', 'auth_tokens', 'homebrew_content', 'combats', 'tokens', 'events'
  )
ORDER BY table_name;

