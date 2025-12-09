# Guia de Deploy no Vercel

## ✅ Checklist antes do Deploy

### 1. Erros de Build Corrigidos
- ✅ Erros de lint corrigidos
- ✅ TypeScript configurado para ES2018+

### 2. Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no painel do Vercel:

#### Database (PostgreSQL)
```
DATABASE_URL=postgresql://postgres:SUA_SENHA@SEU_HOST:5432/postgres
DIRECT_URL=postgresql://postgres:SUA_SENHA@SEU_HOST:5432/postgres
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
```

#### Auth/Sessions
```
SESSION_SECRET=uma-string-aleatoria-forte-aqui
JWT_SECRET=outra-string-aleatoria-forte-aqui
```

#### Node Environment
```
NODE_ENV=production
```

### 3. Configurações do Vercel

1. **Framework Preset**: Next.js (detectado automaticamente)
2. **Build Command**: `npm run build` (padrão)
3. **Output Directory**: `.next` (padrão)
4. **Install Command**: `npm install` (padrão)
5. **Node Version**: 18.x ou superior (recomendado 20.x)

### 4. Migrações do Banco de Dados

⚠️ **IMPORTANTE**: Execute as migrações SQL no seu banco de dados antes ou após o deploy:

```sql
-- Execute todas as migrações na pasta migrations/
-- Exemplo: migrations/add_inventory_field.sql
ALTER TABLE characters
ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '[]'::jsonb;
```

Você pode executar as migrações:
- **Antes do deploy**: Via script local ou cliente PostgreSQL
- **Após o deploy**: Via script de build ou manualmente

### 5. Build Settings no Vercel

No painel do Vercel, vá em **Settings > Build & Development Settings**:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 6. Deploy

#### Opção 1: Via GitHub/GitLab/Bitbucket (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Faça push para a branch principal
4. O Vercel fará o deploy automaticamente

#### Opção 2: Via Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 7. Pós-Deploy

1. ✅ Verifique se o build foi bem-sucedido
2. ✅ Teste as funcionalidades principais:
   - Login/Autenticação
   - Criação de campanhas
   - Criação de personagens
   - Loja e compras
3. ✅ Verifique os logs no painel do Vercel
4. ✅ Configure domínio personalizado (opcional)

### 8. Troubleshooting

#### Erro: "Module not found"
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente para verificar

#### Erro: "Environment variable not found"
- Verifique se todas as variáveis de ambiente estão configuradas no Vercel
- Certifique-se de que as variáveis `NEXT_PUBLIC_*` estão expostas corretamente

#### Erro: "Database connection failed"
- Verifique se o `DATABASE_URL` está correto
- Verifique se o banco de dados permite conexões do Vercel (IP whitelist)
- Para Supabase, verifique as configurações de conexão

#### Erro: "Build failed"
- Verifique os logs de build no Vercel
- Execute `npm run build` localmente para reproduzir o erro
- Verifique se há erros de TypeScript: `npm run check`

### 9. Scripts Úteis

```bash
# Verificar erros de TypeScript
npm run check

# Verificar lint
npm run lint

# Build local
npm run build

# Testar build localmente
npm run start
```

## 📝 Notas Importantes

- ⚠️ **Nunca commite** arquivos `.env` ou `.env.local` no Git
- ✅ Use variáveis de ambiente do Vercel para dados sensíveis
- ✅ Execute migrações de banco de dados antes do primeiro deploy
- ✅ Configure CORS e políticas de segurança no Supabase se necessário
- ✅ Monitore os logs do Vercel para erros em produção

## 🔗 Links Úteis

- [Documentação do Vercel](https://vercel.com/docs)
- [Next.js no Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variáveis de Ambiente no Vercel](https://vercel.com/docs/projects/environment-variables)

