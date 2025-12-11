# API Endpoints - KBSys Backend

## 🔐 Autenticação

### POST /api/auth/register
Registra um novo usuário.

**Body:**
```json
{
  "name": "Nome do Usuário",
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "name": "...", "email": "..." },
    "token": "jwt-token-here"
  }
}
```

### POST /api/auth/login
Autentica um usuário.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "...", "email": "..." },
    "token": "jwt-token-here"
  }
}
```

### GET /api/auth/me
Obtém dados do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

---

## 📁 Projetos

### GET /api/projects
Lista projetos do usuário autenticado (com paginação).

**Query Params:**
- `page` (opcional, default: 1)
- `limit` (opcional, default: 10, max: 100)

**Headers:** `Authorization: Bearer <token>`

### POST /api/projects
Cria um novo projeto.

**Body:**
```json
{
  "name": "Nome do Projeto",
  "description": "Descrição opcional",
  "companyId": "uuid-opcional",
  "groupId": "uuid-opcional"
}
```

**Headers:** `Authorization: Bearer <token>`

### GET /api/projects/:id
Obtém um projeto por ID.

**Headers:** `Authorization: Bearer <token>`

### PUT /api/projects/:id
Atualiza um projeto.

**Body:** (todos os campos opcionais)
```json
{
  "name": "Novo Nome",
  "description": "Nova Descrição",
  "companyId": "uuid",
  "groupId": "uuid"
}
```

**Headers:** `Authorization: Bearer <token>`

### DELETE /api/projects/:id
Deleta um projeto.

**Headers:** `Authorization: Bearer <token>`

---

## 🏢 Empresas

### GET /api/companies
Lista todas as empresas (com paginação).

**Query Params:**
- `page` (opcional, default: 1)
- `limit` (opcional, default: 10, max: 100)

**Headers:** `Authorization: Bearer <token>`

### POST /api/companies
Cria uma nova empresa.

**Body:**
```json
{
  "name": "Nome Fantasia",
  "legalName": "Razão Social",
  "cnpj": "12.345.678/0001-90",
  "city": "São Paulo",
  "state": "SP",
  "segment": "Tecnologia",
  "contactName": "Nome do Contato",
  "contactEmail": "contato@empresa.com",
  "contactPhone": "(11) 98765-4321"
}
```

**Headers:** `Authorization: Bearer <token>`

### GET /api/companies/:id
Obtém uma empresa por ID.

**Headers:** `Authorization: Bearer <token>`

### PUT /api/companies/:id
Atualiza uma empresa.

**Headers:** `Authorization: Bearer <token>`

### DELETE /api/companies/:id
Deleta uma empresa.

**Headers:** `Authorization: Bearer <token>`

---

## 👥 Colaboradores

### GET /api/collaborators
Lista todos os colaboradores (com paginação).

**Query Params:**
- `page` (opcional, default: 1)
- `limit` (opcional, default: 10, max: 100)

**Headers:** `Authorization: Bearer <token>`

### POST /api/collaborators
Cria um novo colaborador.

**Body:**
```json
{
  "name": "Nome do Colaborador",
  "email": "colaborador@example.com",
  "employeeId": "1001",
  "pis": "123.45678.90-0",
  "status": "Ativo",
  "companyIds": ["uuid-empresa-1", "uuid-empresa-2"],
  "groupIds": ["uuid-grupo-1"]
}
```

**Headers:** `Authorization: Bearer <token>`

### GET /api/collaborators/:id
Obtém um colaborador por ID.

**Headers:** `Authorization: Bearer <token>`

### PUT /api/collaborators/:id
Atualiza um colaborador.

**Headers:** `Authorization: Bearer <token>`

### DELETE /api/collaborators/:id
Deleta um colaborador.

**Headers:** `Authorization: Bearer <token>`

---

## 📋 Grupos

### GET /api/groups
Lista todos os grupos.

**Headers:** `Authorization: Bearer <token>`

### POST /api/groups
Cria um novo grupo.

**Body:**
```json
{
  "name": "Marketing"
}
```

**Headers:** `Authorization: Bearer <token>`

### GET /api/groups/:id
Obtém um grupo por ID.

**Headers:** `Authorization: Bearer <token>`

### PUT /api/groups/:id
Atualiza um grupo.

**Body:**
```json
{
  "name": "Novo Nome"
}
```

**Headers:** `Authorization: Bearer <token>`

### DELETE /api/groups/:id
Deleta um grupo.

**Headers:** `Authorization: Bearer <token>`

---

## 📊 Boards (Kanban)

### GET /api/projects/:projectId/boards
Lista todos os boards de um projeto.

**Headers:** `Authorization: Bearer <token>`

### POST /api/projects/:projectId/boards
Cria um novo board.

**Body:**
```json
{
  "name": "Sprint 10"
}
```

**Headers:** `Authorization: Bearer <token>`

### GET /api/projects/:projectId/boards/:boardId
Obtém um board por ID.

**Headers:** `Authorization: Bearer <token>`

### PUT /api/projects/:projectId/boards/:boardId
Atualiza um board.

**Body:**
```json
{
  "name": "Novo Nome"
}
```

**Headers:** `Authorization: Bearer <token>`

### DELETE /api/projects/:projectId/boards/:boardId
Deleta um board.

**Headers:** `Authorization: Bearer <token>`

---

## 🏥 Health Check

### GET /health
Verifica saúde da aplicação.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67
}
```

---

## 📚 Documentação

### GET /docs
Interface Swagger/OpenAPI com documentação interativa da API.

---

## 🔒 Autenticação

Todas as rotas (exceto `/api/auth/*` e `/health`) requerem autenticação via JWT.

**Header necessário:**
```
Authorization: Bearer <seu-token-jwt>
```

O token é obtido através de `/api/auth/login` ou `/api/auth/register`.

---

## 📝 Notas

- Todos os IDs são UUIDs
- Datas são retornadas em formato ISO 8601
- Respostas de erro seguem o formato:
  ```json
  {
    "success": false,
    "message": "Error message",
    "errors": { "field": "error detail" }
  }
  ```
- Respostas de sucesso seguem o formato:
  ```json
  {
    "success": true,
    "message": "Success message",
    "data": { ... }
  }
  ```

