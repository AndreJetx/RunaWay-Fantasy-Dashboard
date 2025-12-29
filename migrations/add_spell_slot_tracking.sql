-- Adicionar campo para rastrear slots de magia usados
-- Este campo armazena um objeto JSON com os slots usados por nível
-- Exemplo: {"level1": 2, "level2": 1, "level3": 0}

ALTER TABLE characters ADD COLUMN IF NOT EXISTS used_spell_slots JSONB DEFAULT '{}'::jsonb;

-- Comentário explicativo
COMMENT ON COLUMN characters.used_spell_slots IS 'Rastreamento de slots de magia usados por nível. Reseta em descanso longo.';
