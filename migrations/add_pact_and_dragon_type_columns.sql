-- Migration: Add pact and dragonType columns to characters table
-- Date: 2025-12-17
-- Description: Adds support for Warlock Pacts and Sorcerer Dragon Types

-- Add pact column for Warlocks
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS pact TEXT;

-- Add dragon_type column for Draconic Sorcerers  
ALTER TABLE characters
ADD COLUMN IF NOT EXISTS dragon_type TEXT;

-- Add comments
COMMENT ON COLUMN characters.pact IS 'Warlock pact choice (Pact of the Blade, Chain, or Tome) - chosen at level 3';
COMMENT ON COLUMN characters.dragon_type IS 'Draconic Sorcerer dragon type (Red, Blue, etc.) - chosen at level 1';

