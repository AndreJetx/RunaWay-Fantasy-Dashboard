-- Migration: Add sorcery points for Sorcerer class
-- Sorcerers gain sorcery points starting at level 2

ALTER TABLE characters
ADD COLUMN IF NOT EXISTS sorcery_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_sorcery_points INTEGER DEFAULT 0;

-- Update existing Sorcerers (Feiticeiro) to have correct sorcery points based on their level
-- Sorcery Points = Sorcerer Level (starting from level 2)
UPDATE characters
SET 
  max_sorcery_points = CASE 
    WHEN level >= 2 THEN level
    ELSE 0
  END,
  sorcery_points = CASE 
    WHEN level >= 2 THEN level
    ELSE 0
  END
WHERE character_class = 'Feiticeiro' AND level >= 2;
