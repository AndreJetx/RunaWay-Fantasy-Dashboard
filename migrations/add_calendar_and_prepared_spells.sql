-- Migration: Adicionar Calendário de Campanha e Sistema de Magias Preparadas
-- Este script adiciona os campos necessários para o calendário da campanha e magias preparadas

-- ============================================
-- 1. ADICIONAR CAMPOS DE CALENDÁRIO À TABELA CAMPAIGNS
-- ============================================

-- Adicionar campo para data atual da campanha (formato: dia-mês-ano)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS campaign_date TEXT DEFAULT '1-1-1490';

-- Adicionar campo para hora atual da campanha (formato: HH:mm)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS campaign_time TEXT DEFAULT '08:00';

-- Adicionar campo para sistema de calendário (faerun ou custom)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS calendar_system TEXT DEFAULT 'faerun';

-- ============================================
-- 2. ADICIONAR CAMPOS DE MAGIAS PREPARADAS À TABELA CHARACTERS
-- ============================================

-- Adicionar campo para magias preparadas (array de índices de magias)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS prepared_spells JSONB DEFAULT '[]'::jsonb;

-- Adicionar campo para rastrear última data de preparação de magias
ALTER TABLE characters ADD COLUMN IF NOT EXISTS last_spell_prep_date TEXT;

-- ============================================
-- 3. ADICIONAR CAMPOS ADICIONAIS
-- ============================================

-- Adicionar campo pact à tabela characters (para Bruxos)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS pact TEXT;

-- Adicionar campo dragon_type à tabela characters (para Feiticeiros Dracônicos)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS dragon_type TEXT;

-- Adicionar campo feats à tabela characters (talentos)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS feats JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- FIM DA MIGRATION
-- ============================================

-- Verificação: Listar colunas adicionadas
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'campaigns' 
  AND column_name IN ('campaign_date', 'campaign_time', 'calendar_system')
UNION ALL
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'characters' 
  AND column_name IN ('prepared_spells', 'last_spell_prep_date', 'pact', 'dragon_type', 'feats')
ORDER BY column_name;
