-- Adicionar campos para gerenciar level up
ALTER TABLE characters
ADD COLUMN IF NOT EXISTS needs_level_up BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pending_hit_dice_roll INTEGER;

