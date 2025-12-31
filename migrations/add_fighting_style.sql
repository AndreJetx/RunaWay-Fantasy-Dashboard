-- Add fighting_style column to characters table
-- For Fighter, Paladin, and Ranger classes

ALTER TABLE characters ADD COLUMN IF NOT EXISTS fighting_style TEXT;

COMMENT ON COLUMN characters.fighting_style IS 'Fighting Style chosen by Fighter (1), Paladin (2), or Ranger (2)';
