# Verificação Completa de Schema do Banco de Dados

Este documento descreve a verificação completa de todas as tabelas e colunas do projeto.

## 📋 Tabelas Esperadas (16 tabelas)

1. **users** - Usuários do sistema
2. **campaigns** - Campanhas de D&D
3. **campaign_members** - Membros de campanhas
4. **characters** - Personagens dos jogadores
5. **character_change_logs** - Log de mudanças em personagens
6. **campaign_sessions** - Sessões de campanha
7. **campaign_chapters** - Capítulos de campanha
8. **campaign_npcs** - NPCs e inimigos
9. **items** - Itens do jogo
10. **maps** - Mapas das campanhas
11. **notes** - Notas do DM
12. **auth_tokens** - Tokens de autenticação
13. **homebrew_content** - Conteúdo homebrew
14. **combats** - Combates ativos (VTT)
15. **tokens** - Tokens no mapa (VTT)
16. **events** - Eventos do jogo (VTT)

## 🔧 Como Verificar

### Opção 1: Migration Completa (Recomendado)

Execute a migration completa que cria todas as tabelas e colunas:

```sql
-- Execute no Supabase SQL Editor
-- Arquivo: migrations/verify_all_tables_and_columns.sql
```

Esta migration:
- ✅ Cria todos os ENUMs necessários
- ✅ Cria todas as tabelas com todas as colunas
- ✅ Cria todos os índices
- ✅ Cria todos os triggers para `updated_at`
- ✅ Usa `IF NOT EXISTS` para não quebrar dados existentes

### Opção 2: Script de Verificação Automática

Execute o script Node.js que compara o schema TypeScript com o banco:

```bash
npm run check:db
```

Ou diretamente:

```bash
tsx scripts/verify-database-schema.ts
```

Este script:
- ✅ Lista todas as tabelas existentes
- ✅ Identifica tabelas faltando
- ✅ Verifica colunas principais de cada tabela
- ✅ Mostra colunas faltando ou extras

### Opção 3: Verificação Manual SQL

Execute o script SQL de verificação:

```sql
-- Execute no Supabase SQL Editor
-- Arquivo: scripts/verify_schema.sql
```

## 📝 Colunas Críticas Verificadas

### users
- ✅ `is_premium` (adicionada em `add_is_premium_column.sql`)

### campaigns
- ✅ `total_chapters` (adicionada em `add_total_chapters_column.sql`)
- ✅ `attribute_system` (adicionada em `add_attribute_system_and_initial_money.sql`)
- ✅ `initial_money` (adicionada em `add_attribute_system_and_initial_money.sql`)

### characters
- ✅ `needs_level_up` (adicionada em `add_level_up_fields.sql`)
- ✅ `pending_hit_dice_roll` (adicionada em `add_level_up_fields.sql`)
- ✅ `inventory` (adicionada em `add_inventory_field.sql`)

### maps
- ✅ `chapter_id` (adicionada em `add_chapters_and_npc_expansion.sql`)
- ✅ `is_initial_map` (adicionada em `add_chapters_and_npc_expansion.sql`)

### campaign_npcs
- ✅ Todas as colunas D&D (adicionadas em `add_chapters_and_npc_expansion.sql`)

### VTT Tables
- ✅ `combats` (criada em `add_vtt_tables.sql`)
- ✅ `tokens` (criada em `add_vtt_tables.sql`)
- ✅ `events` (criada em `add_vtt_tables.sql`)

## 🚨 Problemas Conhecidos e Soluções

### Problema: Coluna `is_premium` não existe
**Solução**: Execute `migrations/add_is_premium_column.sql`

### Problema: Erro ao criar capítulo
**Causa**: Select sem especificar colunas tenta buscar `is_premium`
**Solução**: ✅ Corrigido - todos os selects agora especificam colunas explicitamente

### Problema: API `my-campaigns` sendo chamada repetidamente
**Causa**: Loop infinito no `CampaignContext`
**Solução**: ✅ Corrigido - removida dependência circular

## 📦 Arquivos Criados

1. **migrations/verify_all_tables_and_columns.sql**
   - Migration completa que cria todas as tabelas e colunas
   - Segura para executar múltiplas vezes (usa `IF NOT EXISTS`)

2. **scripts/verify-database-schema.ts**
   - Script Node.js para verificação automática
   - Compara schema TypeScript com banco de dados

3. **scripts/verify_schema.sql**
   - Script SQL para verificação manual
   - Lista tabelas e colunas existentes

## ✅ Checklist de Verificação

- [ ] Execute `migrations/verify_all_tables_and_columns.sql` no Supabase
- [ ] Execute `npm run check:db` para verificar
- [ ] Verifique se todas as 16 tabelas existem
- [ ] Verifique se não há erros de coluna faltando
- [ ] Teste criar um capítulo (deve funcionar sem erros)
- [ ] Verifique se a API `my-campaigns` não está sendo chamada repetidamente

## 🔄 Próximos Passos

1. Execute a migration completa
2. Execute o script de verificação
3. Se houver problemas, corrija conforme indicado
4. Teste funcionalidades críticas (criar capítulo, criar personagem, etc.)

