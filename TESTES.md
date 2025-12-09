# Guia de Testes - Runway Fantasy Dashboard

## 🔧 Correções Implementadas

### 1. Tratamento de Erros Melhorado
- ✅ Mensagens de erro mais detalhadas em modo desenvolvimento
- ✅ Detecção automática de erros de banco de dados
- ✅ Stack traces completos para debug

### 2. Validação de Dados
- ✅ Limpeza de campos vazios antes da validação
- ✅ Validação corrigida para campo `image` (aceita URL ou string vazia)
- ✅ Campos opcionais não são enviados como `undefined` ao banco

### 3. Migração SQL Corrigida
- ✅ Migração agora verifica se a tabela `campaign_npcs` existe antes de migrar dados
- ✅ Evita erros quando a tabela não existe ainda

## 🧪 Scripts de Teste Disponíveis

### 1. Verificar Configuração do Ambiente
```bash
npm run test:env
```
Verifica se o arquivo `.env` está configurado corretamente.

### 2. Testar Conexão com Banco de Dados
```bash
npm run test:db
```
Testa a conexão e verifica se as tabelas necessárias existem.

### 3. Testar API (requer servidor rodando)
```bash
npm run test:api
```
Testa a criação de uma campanha via API.

## 📋 Passos para Resolver o Erro 500

### Passo 1: Verificar Configuração
```bash
npm run test:env
```
Certifique-se de que todas as variáveis estão configuradas.

### Passo 2: Executar Migração SQL

**IMPORTANTE:** A migração precisa ser executada no banco de dados!

1. Abra o **Supabase SQL Editor** (ou seu cliente PostgreSQL)
2. Copie o conteúdo do arquivo `migrations/add_chapters_and_npc_expansion.sql`
3. Execute o SQL no editor
4. Verifique se as tabelas foram criadas:
   - `campaign_chapters`
   - `campaign_npcs` (com todas as colunas expandidas)
   - `maps` (com as novas colunas `chapter_id` e `is_initial_map`)

### Passo 3: Verificar Tabelas
```bash
npm run test:db
```
Este script verifica se todas as tabelas necessárias existem.

### Passo 4: Iniciar Servidor
```bash
npm run dev
```

### Passo 5: Testar Criação de Campanha

1. Acesse `http://localhost:5000/campaigns/new`
2. Preencha o formulário:
   - Título da campanha (obrigatório)
   - Mapa inicial com título e URL (obrigatório)
   - Pelo menos um capítulo (obrigatório)
   - Inimigos do capítulo 1 (opcional)
3. Clique em "Criar Campanha"
4. Verifique o console do servidor para mensagens de erro detalhadas

## 🔍 Debugging

### Se o erro persistir:

1. **Verifique os logs do servidor** (terminal onde `npm run dev` está rodando)
   - Agora os erros mostram mensagens detalhadas
   - Procure por "Error creating campaign:" seguido do erro específico

2. **Verifique a resposta da API no navegador**:
   - Abra o DevTools (F12)
   - Vá para a aba Network
   - Tente criar a campanha novamente
   - Clique na requisição `/api/campaigns`
   - Veja a resposta - agora inclui detalhes do erro em desenvolvimento

3. **Erros comuns e soluções**:

   - **"relation does not exist"** → Execute a migração SQL
   - **"column does not exist"** → Execute a migração SQL
   - **"Unauthorized"** → Verifique se está logado
   - **"Invalid payload"** → Verifique os dados do formulário

## 📝 Estrutura Esperada das Tabelas

### `campaign_chapters`
- `id` (UUID)
- `campaign_id` (UUID, FK)
- `chapter_number` (INTEGER)
- `title` (TEXT)
- `description` (TEXT, nullable)
- `is_completed` (BOOLEAN)
- `completed_at` (TIMESTAMP, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `campaign_npcs`
- Todas as colunas da tabela antiga +
- `chapter_id` (UUID, FK, nullable)
- `race`, `character_class`, `subclass`
- `level`, `challenge_rating`, `type`
- `armor_class`, `initiative`, `speed`
- `current_hp`, `max_hp`, `temp_hp`
- `attributes`, `saving_throws`, `skills` (JSONB)
- `attacks`, `abilities` (JSONB)
- `resistances`, `immunities`, `vulnerabilities` (TEXT[])
- E mais...

### `maps`
- Todas as colunas existentes +
- `chapter_id` (UUID, FK, nullable)
- `is_initial_map` (BOOLEAN)

## ✅ Checklist de Verificação

- [ ] Arquivo `.env` configurado corretamente
- [ ] Migração SQL executada no banco de dados
- [ ] Tabelas `campaign_chapters` e `campaign_npcs` existem
- [ ] Servidor Next.js rodando (`npm run dev`)
- [ ] Usuário autenticado no sistema
- [ ] Formulário preenchido corretamente

## 🆘 Ainda com Problemas?

Se após seguir todos os passos o erro persistir:

1. Compartilhe a mensagem de erro completa do console do servidor
2. Compartilhe a resposta da API (aba Network do DevTools)
3. Verifique se a migração foi executada completamente (sem erros)

