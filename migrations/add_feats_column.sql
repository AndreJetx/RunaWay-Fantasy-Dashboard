-- Migration: Add feats column to characters table
-- Date: 2025-12-17
-- Description: Adds support for character Feats (Talentos)

-- Add feats column
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS feats JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN characters.feats IS 'Array of feats (talentos) chosen by the character, stored as JSON';

