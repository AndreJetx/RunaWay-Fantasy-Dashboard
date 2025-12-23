-- Adicionar colunas para limite de jogadores e visibilidade
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 6;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private';
