-- Script de verificação: Compara schema TypeScript com banco de dados
-- Execute este script para verificar se todas as tabelas e colunas existem

-- Lista todas as tabelas esperadas
WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'users', 'campaigns', 'campaign_members', 'characters', 'character_change_logs',
    'campaign_sessions', 'campaign_chapters', 'campaign_npcs', 'items', 'maps',
    'notes', 'auth_tokens', 'homebrew_content', 'combats', 'tokens', 'events'
  ]) AS table_name
),
existing_tables AS (
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'runaway' 
    AND table_type = 'BASE TABLE'
)
SELECT 
  et.table_name AS expected_table,
  CASE WHEN ext.table_name IS NOT NULL THEN '✓ Existe' ELSE '✗ FALTANDO' END AS status
FROM expected_tables et
LEFT JOIN existing_tables ext ON et.table_name = ext.table_name
ORDER BY et.table_name;

-- Lista colunas faltando em cada tabela (exemplo para users)
-- Você pode executar isso para cada tabela manualmente
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'runaway' 
  AND table_name = 'users'
ORDER BY ordinal_position;

