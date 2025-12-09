# Guia de Troubleshooting - Erro de Conexão com Banco de Dados

## Erro: "Error connecting to database: fetch failed"

Este erro indica que a aplicação não consegue se conectar ao banco de dados Neon.

### Possíveis Causas e Soluções

#### 1. **URL do Banco Incorreta**

A `DATABASE_URL` no arquivo `.env` pode estar incorreta ou no formato errado.

**Solução:**
1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá para **Settings** > **Database**
3. Copie a **Connection string** > **URI**
4. Deve ter o formato: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

**Para Neon:**
- A URL deve ser a connection string padrão do Neon
- Formato: `postgresql://[user]:[password]@[host]/[database]`

#### 2. **URL HTTP vs WebSocket**

O Neon oferece duas URLs diferentes:
- **Connection String** (para bibliotecas tradicionais)
- **HTTP Connection String** (para `@neondatabase/serverless`)

**Solução:**
Se estiver usando Neon, certifique-se de usar a URL HTTP. No dashboard do Neon:
1. Vá para **Connection Details**
2. Use a URL da seção **"HTTP"** ou **"Serverless"**
3. Formato: `https://[project].neon.tech` ou similar

#### 3. **Variáveis de Ambiente Não Carregadas**

O Next.js pode não estar carregando o arquivo `.env` corretamente.

**Solução:**
1. Certifique-se de que o arquivo `.env` está na raiz do projeto
2. Reinicie o servidor após alterar o `.env`:
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```
3. Verifique se as variáveis estão sendo carregadas:
   ```bash
   npm run test:env
   ```

#### 4. **Firewall ou Rede**

Seu firewall ou rede pode estar bloqueando a conexão.

**Solução:**
1. Verifique se consegue acessar o dashboard do Supabase/Neon no navegador
2. Teste a conexão diretamente:
   ```bash
   npm run test:db
   ```

#### 5. **Formato da URL**

A URL pode ter caracteres especiais que precisam ser codificados.

**Solução:**
- Se a senha contém caracteres especiais (`@`, `#`, `%`, etc.), eles devem ser codificados:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - Espaços → `%20`

#### 6. **Projeto Neon Pausado**

Se estiver usando Neon, projetos gratuitos podem pausar após inatividade.

**Solução:**
1. Acesse o dashboard do Neon
2. Verifique se o projeto está ativo
3. Se estiver pausado, clique em "Resume"

### Teste de Diagnóstico

Execute o teste de conexão:
```bash
npm run test:db
```

Este teste vai:
- Verificar se `DATABASE_URL` está configurada
- Tentar conectar ao banco
- Verificar se as tabelas existem
- Mostrar erros detalhados

### Verificação Manual

1. **Verificar arquivo .env:**
   ```bash
   # No Windows PowerShell
   Get-Content .env | Select-String "DATABASE_URL"
   ```

2. **Testar conexão direta (se tiver psql instalado):**
   ```bash
   psql "sua-database-url-aqui"
   ```

3. **Verificar logs do servidor:**
   - Quando iniciar o servidor com `npm run dev`, você deve ver:
     ```
     🔌 Database URL: postgresql://postgres.****@...
     ```
   - Se não aparecer, a URL não está sendo carregada

### Exemplo de .env Correto

```env
# Supabase
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Neon
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

### Ainda com Problemas?

1. Compartilhe a saída de `npm run test:db`
2. Verifique os logs do servidor ao tentar criar uma campanha
3. Confirme que está usando a URL correta do seu provedor (Supabase vs Neon)

