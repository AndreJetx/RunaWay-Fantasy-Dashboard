-- Adicionar campo inventory à tabela characters
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '[]'::jsonb;

