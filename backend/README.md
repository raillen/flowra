# KBSys Backend API

Sistema de gestão de projetos - Backend API

## 🚀 Tecnologias

- **Node.js** 18+
- **Fastify** - Web framework
- **PostgreSQL** 15+ - Database
- **Prisma** 5.x - ORM
- **Zod** - Validação
- **JWT** - Autenticação
- **Pino** - Logging estruturado

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

## 🛠️ Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 3. Gerar Prisma Client
npm run prisma:generate

# 4. Criar banco de dados (se não existir)
createdb kbsys

# 5. Rodar migrations
npm run prisma:migrate dev --name init

# 6. Iniciar em desenvolvimento
npm run dev
```

## 📚 Documentação

- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health
- **Endpoints**: Ver `API_ENDPOINTS.md`
- **Setup**: Ver `SETUP.md`

## 🔑 Autenticação

Todas as rotas (exceto `/api/auth/*` e `/health`) requerem autenticação via JWT.

**Header necessário:**
```
Authorization: Bearer <token>
```

O token é obtido através de `/api/auth/login` ou `/api/auth/register`.

## 📡 Módulos Implementados

- ✅ **Autenticação** - Register, Login, JWT
- ✅ **Projetos** - CRUD completo
- ✅ **Empresas** - CRUD completo
- ✅ **Colaboradores** - CRUD completo
- ✅ **Grupos** - CRUD completo
- ✅ **Boards** - CRUD completo (Kanban)

## 🧪 Testes

```bash
# Todos os testes
npm test

# Com coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## 📝 Scripts Disponíveis

- `npm run dev` - Desenvolvimento com hot reload
- `npm start` - Produção
- `npm test` - Executar testes
- `npm run lint` - Verificar código
- `npm run lint:fix` - Corrigir código
- `npm run format` - Formatar código
- `npm run prisma:generate` - Gerar Prisma Client
- `npm run prisma:migrate` - Rodar migrations
- `npm run prisma:studio` - Abrir Prisma Studio

## 🏗️ Estrutura

```
backend/
├── src/
│   ├── config/          # Configurações
│   ├── controllers/     # Controllers HTTP
│   ├── services/        # Lógica de negócio
│   ├── repositories/    # Acesso a dados
│   ├── middleware/      # Middlewares
│   ├── routes/          # Rotas
│   ├── validators/      # Validações Zod
│   ├── utils/           # Utilitários
│   └── app.js           # Aplicação principal
├── prisma/
│   └── schema.prisma    # Schema do banco
└── tests/               # Testes
```

## 📖 Mais Informações

- Ver `SETUP.md` para guia detalhado de setup
- Ver `API_ENDPOINTS.md` para lista completa de endpoints
- Ver `docs/backend-complete.md` para status completo

