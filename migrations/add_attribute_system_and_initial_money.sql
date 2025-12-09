-- Adicionar campos attributeSystem e initialMoney na tabela campaigns
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS attribute_system TEXT DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS initial_money TEXT DEFAULT '0';

-- Comentários para documentação
COMMENT ON COLUMN campaigns.attribute_system IS 'Sistema de atributos: fixed (valores fixos), point_buy (compra de pontos), roll_4d6 (rolagem 4d6)';
COMMENT ON COLUMN campaigns.initial_money IS 'Quantidade de dinheiro inicial que cada membro terá no nível 1';

