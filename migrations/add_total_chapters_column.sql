-- Adicionar coluna total_chapters à tabela campaigns
-- Esta coluna define o número máximo de capítulos que uma campanha pode ter

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS total_chapters INTEGER DEFAULT 10;

-- Comentário na coluna para documentação
COMMENT ON COLUMN campaigns.total_chapters IS 'Número total de capítulos que a campanha terá. Padrão: 10';

