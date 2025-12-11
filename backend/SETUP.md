# Guia de Setup do Backend

## ✅ O que foi implementado

### Estrutura Completa
- ✅ Configurações (environment, database, logger)
- ✅ Utilitários (errors, responses)
- ✅ Middlewares (auth, error, validation)
- ✅ Autenticação completa (register, login, JWT)
- ✅ Módulo de Projetos (CRUD completo)
- ✅ App principal com Fastify
- ✅ Swagger/OpenAPI configurado

### Próximos Módulos (Opcional)
- ⏳ Módulo de Empresas
- ⏳ Módulo de Colaboradores
- ⏳ Módulo de Boards

## 🚀 Setup Rápido

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados

```bash
# Criar arquivo .env
cp .env.example .env

# Editar .env com suas credenciais PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost:5432/kbsys
```

### 3. Configurar Prisma

```bash
# Gerar Prisma Client
npm run prisma:generate

# Criar banco de dados (se não existir)
# Criar manualmente no PostgreSQL ou usar:
createdb kbsys

# Rodar migrations
npm run prisma:migrate dev --name init
```

### 4. Iniciar Servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

## 📡 Endpoints Disponíveis

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter usuário atual (requer auth)

### Projetos (requer autenticação)
- `GET /api/projects` - Listar projetos (com paginação)
- `POST /api/projects` - Criar projeto
- `GET /api/projects/:id` - Obter projeto por ID
- `PUT /api/projects/:id` - Atualizar projeto
- `DELETE /api/projects/:id` - Deletar projeto

### Outros
- `GET /health` - Health check
- `GET /docs` - Documentação Swagger

## 🔑 Autenticação

Todas as rotas de projetos requerem autenticação via JWT.

**Header necessário:**
```
Authorization: Bearer <token>
```

O token é retornado no login/register.

## 🧪 Testar a API

### 1. Registrar usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Criar projeto (usar token do login)
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-token>" \
  -d '{
    "name": "Meu Projeto",
    "description": "Descrição do projeto"
  }'
```

## 📝 Próximos Passos

1. **Testar a API** - Use Postman ou curl para testar os endpoints
2. **Conectar Frontend** - Atualizar `frontend/src/config/api.js` com a URL do backend
3. **Implementar outros módulos** - Empresas, Colaboradores, Boards
4. **Adicionar testes** - Testes unitários e de integração

## ⚠️ Problemas Comuns

### Erro de conexão com banco
- Verifique se PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Verifique se o banco `kbsys` existe

### Erro de migração
```bash
# Resetar banco (CUIDADO: apaga todos os dados)
npm run prisma:migrate reset

# Ou criar migration manual
npm run prisma:migrate dev
```

### Porta já em uso
- Altere `PORT` no `.env`
- Ou mate o processo usando a porta 3000

