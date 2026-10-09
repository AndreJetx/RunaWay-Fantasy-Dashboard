-- Migration: Add mystic_arcanum column to characters table
-- For Warlocks to store their Mystic Arcanum spells (levels 6-9)
-- Date: 2026-01-02

ALTER TABLE characters
ADD COLUMN mystic_arcanum jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN characters.mystic_arcanum IS 'Mystic Arcanum spells for Warlocks - high level spells (6th-9th) learned at levels 11, 13, 15, 17. Format: {"6": "spell-id", "7": "spell-id", ...}';
