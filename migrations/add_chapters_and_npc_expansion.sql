-- Migration: Add campaign chapters and expand NPCs with D&D stats
-- Run this in your Supabase SQL editor

-- 1. Create campaign_chapters table
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

-- 2. Add chapter_id to maps
ALTER TABLE maps 
ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES campaign_chapters(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_initial_map BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_maps_chapter_id ON maps(chapter_id);

-- 3. Expand campaign_npcs table with D&D stats
-- First, create a new table with all the fields
CREATE TABLE IF NOT EXISTS campaign_npcs_new (
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
  -- D&D Attributes
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
  -- Attacks and abilities
  attacks JSONB DEFAULT '[]'::jsonb,
  abilities JSONB DEFAULT '[]'::jsonb,
  resistances TEXT[],
  immunities TEXT[],
  vulnerabilities TEXT[],
  -- Additional info
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

-- Migrate existing data if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campaign_npcs') THEN
    INSERT INTO campaign_npcs_new (
      id, campaign_id, name, role, alignment, attitude, description, image, 
      is_hostile, last_seen, created_at
    )
    SELECT 
      id, campaign_id, name, role, alignment, attitude, description, image,
      is_hostile, last_seen, created_at
    FROM campaign_npcs;
    
    -- Drop old table and rename new one
    DROP TABLE campaign_npcs;
  END IF;
END $$;

ALTER TABLE campaign_npcs_new RENAME TO campaign_npcs;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaign_npcs_campaign_id ON campaign_npcs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_npcs_chapter_id ON campaign_npcs(chapter_id);
CREATE INDEX IF NOT EXISTS idx_campaign_npcs_type ON campaign_npcs(type);

-- Add comments for documentation
COMMENT ON TABLE campaign_chapters IS 'Chapters/checkpoints of a campaign for progress tracking';
COMMENT ON TABLE campaign_npcs IS 'NPCs and enemies with full D&D 5e character sheet';
COMMENT ON COLUMN maps.is_initial_map IS 'True if this is the starting map of the campaign';
COMMENT ON COLUMN campaign_npcs.challenge_rating IS 'Challenge Rating (CR) for monsters, e.g., "1/4", "1/2", "1", "2", etc.';
COMMENT ON COLUMN campaign_npcs.type IS 'Type of NPC: npc, enemy, or boss';

