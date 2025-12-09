# Runway Fantasy Dashboard

Um dashboard completo e imersivo para gerenciar campanhas de RPG, personagens, inventário, mapas e notas de mestre. Construído com Next.js 14, TypeScript, Tailwind CSS e Drizzle ORM.

## 🚀 Funcionalidades

- **Dashboard**: Visão geral com estatísticas e gráficos
- **Personagens**: CRUD completo para gerenciar heróis e vilões
- **Inventário**: Sistema de itens com raridade e tipos
- **Campanhas**: Gerenciamento de aventuras e sessões
- **Mapas**: Visualização e marcação de mapas de campanha
- **Notas do Mestre**: Bloco de notas categorizado

## 🛠️ Tecnologias

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase) com Drizzle ORM
- **Gráficos**: Recharts

## 📋 Pré-requisitos

- Node.js 20+
- PostgreSQL (ou conta no Supabase)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd RunwayFantasyDashboard
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

Edite o `.env` e preencha:
- `DATABASE_URL`: String de conexão do PostgreSQL/Supabase
- `SUPABASE_URL`: URL do seu projeto Supabase (opcional)
- `SUPABASE_ANON_KEY`: Chave pública do Supabase (opcional)
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase (opcional)
- `SESSION_SECRET`: String aleatória para sessões (gere com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `JWT_SECRET`: String aleatória para JWT (opcional)

4. Configure o banco de dados:
```bash
npm run db:push
```

Isso sincronizará o schema do Drizzle com seu banco de dados.

## 🚀 Executando

### Desenvolvimento
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:5000`

### Build de Produção
```bash
npm run build
npm start
```

### Verificação de Tipos
```bash
npm run check
```

### Lint
```bash
npm run lint
```

## 📁 Estrutura do Projeto

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes
│   │   └── [routes]/     # Páginas da aplicação
│   ├── components/       # Componentes React
│   │   ├── layout/       # Layouts
│   │   └── ui/           # Componentes UI (Shadcn)
│   ├── features/         # Features/páginas
│   ├── lib/              # Utilitários e helpers
│   └── hooks/            # React Hooks customizados
├── shared/               # Código compartilhado
│   └── schema.ts         # Schema Drizzle
├── public/               # Arquivos estáticos
└── attached_assets/      # Assets do projeto
```

## 🔐 Autenticação

O projeto está preparado para autenticação, mas ainda não está implementada. As rotas de API estão prontas para serem protegidas quando necessário.

## 📝 API Routes

- `GET/POST /api/users` - Gerenciamento de usuários
- `GET/POST /api/campaigns` - Gerenciamento de campanhas
- `GET/POST /api/characters` - Gerenciamento de personagens
- `GET/POST /api/items` - Gerenciamento de itens
- `GET/POST /api/maps` - Gerenciamento de mapas
- `GET/POST /api/notes` - Gerenciamento de notas

## 🚢 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. Deploy automático a cada push

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Railway
- Render
- Fly.io
- AWS Amplify
- Netlify

## 📄 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

