-- Migration: Add subrace column to characters table
-- Description: Adds support for character subraces (e.g., Hill Dwarf, High Elf, Wood Elf, etc)

ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS subrace TEXT;

-- Add comment to column
COMMENT ON COLUMN characters.subrace IS 'Character subrace (e.g., Hill, Mountain for Dwarves; High, Wood, Drow for Elves)';

-- Update Hill Dwarf characters to have hp_bonus_per_level = 1
-- This assumes Hill Dwarves have race = 'Anão' and subrace = 'Hill'
UPDATE characters 
SET hp_bonus_per_level = 1 
WHERE race = 'Anão' AND subrace = 'Hill' AND (hp_bonus_per_level IS NULL OR hp_bonus_per_level = 0);
