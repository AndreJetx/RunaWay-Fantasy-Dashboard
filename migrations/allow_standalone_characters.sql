-- Permitir campaignId NULL para personagens avulsos
-- Personagens podem ser criados sem vínculo a campanhas

ALTER TABLE characters ALTER COLUMN campaign_id DROP NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN characters.campaign_id IS 'ID da campanha (NULL para personagens avulsos/standalone)';
