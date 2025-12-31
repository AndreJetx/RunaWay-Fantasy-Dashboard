-- Migration: Add hp_bonus_per_level column to characters table
-- Description: Adds support for racial HP bonuses per level (e.g., Hill Dwarf gets +1 HP per level)

ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS hp_bonus_per_level INTEGER DEFAULT 0;

-- Add comment to column
COMMENT ON COLUMN characters.hp_bonus_per_level IS 'Bonus HP per level from race/subrace (e.g., Hill Dwarf = 1)';

-- Note: Existing characters will need to have this field updated manually or via the fix-hp-bonus API endpoint
-- For Hill Dwarves, set hp_bonus_per_level = 1
