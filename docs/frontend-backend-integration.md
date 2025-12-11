# Integração Frontend-Backend

Este documento descreve como o frontend foi conectado ao backend da aplicação KBSys.

## Visão Geral

O frontend React foi completamente integrado com o backend Fastify, utilizando:
- **Autenticação JWT**: Login e registro de usuários
- **API RESTful**: Comunicação com todos os endpoints do backend
- **Gerenciamento de Estado**: Hooks customizados para cada módulo
- **Tratamento de Erros**: Mensagens de erro consistentes
- **Loading States**: Indicadores de carregamento em todas as operações

## Estrutura de Integração

### 1. Configuração da API

**Arquivo**: `frontend/src/config/api.js`

- Configuração centralizada do Axios
- Interceptor para adicionar token JWT automaticamente
- Interceptor de resposta para tratamento de erros 401 (não autorizado)
- Base URL configurável via variável de ambiente `VITE_API_URL`

### 2. Serviços de API

Cada módulo possui seu próprio serviço:

- `authService.js`: Autenticação (login, registro, perfil)
- `projectService.js`: Gerenciamento de projetos
- `companyService.js`: Gerenciamento de empresas
- `collaboratorService.js`: Gerenciamento de colaboradores
- `groupService.js`: Gerenciamento de grupos
- `boardService.js`: Gerenciamento de boards Kanban

Todos os serviços seguem o padrão:
- Retornam dados extraídos de `response.data.data` (formato padrão do backend)
- Tratam arrays e objetos de forma consistente
- Lançam erros que são capturados pelos hooks

### 3. Hooks Customizados

Hooks que gerenciam estado e operações de cada módulo:

- `useAuth.js`: Autenticação e gerenciamento de sessão
- `useProjects.js`: Projetos com CRUD completo
- `useCompanies.js`: Empresas com CRUD completo
- `useCollaborators.js`: Colaboradores com CRUD completo
- `useGroups.js`: Grupos com CRUD completo
- `useBoards.js`: Boards com CRUD completo

Cada hook fornece:
- Estado: `loading`, `error`, dados
- Operações: `fetch`, `add`, `update`, `delete`
- Tratamento automático de erros

### 4. Contextos

#### AuthContext
- Gerencia autenticação global
- Fornece `user`, `token`, `isAuthenticated`
- Métodos: `login`, `register`, `logout`

#### AppContext
- Integra todos os hooks de dados
- Fornece acesso unificado aos dados da aplicação
- Mantém compatibilidade com componentes existentes

### 5. Componentes de Autenticação

#### Login (`components/auth/Login.jsx`)
- Formulário de login
- Validação de campos
- Exibição de erros
- Redirecionamento automático após login

### 6. Proteção de Rotas

**Arquivo**: `frontend/src/App.jsx`

- `ProtectedApp` verifica autenticação
- Redireciona para login se não autenticado
- Mostra loading durante verificação

### 7. Componentes Atualizados

Todos os componentes foram atualizados para usar a API:

- **ProjectsListView**: Lista projetos do backend
- **ProjectDashboard**: Carrega boards do backend
- **ProjectModal**: Cria projetos via API
- **BoardModal**: Cria boards via API
- **KanbanBoardView**: Carrega board específico do backend
- **SettingsModule**: Gerencia empresas, grupos e colaboradores via API
- **UserProfileView**: Usa dados do usuário autenticado
- **Header**: Adiciona menu de usuário com logout

## Fluxo de Autenticação

1. Usuário acessa a aplicação
2. `ProtectedApp` verifica se há token no localStorage
3. Se não houver token, redireciona para `/login`
4. Usuário faz login
5. Token é salvo no localStorage
6. Dados do usuário são carregados via `/auth/me`
7. Aplicação principal é renderizada

## Tratamento de Erros

### Erros de API
- Mensagens de erro são extraídas de `err.response?.data?.message`
- Exibidas em componentes de erro
- Logs no console para debug

### Erros 401 (Não Autorizado)
- Token é removido automaticamente
- Usuário é redirecionado para login
- Mensagem de erro é exibida

## Variáveis de Ambiente

Crie um arquivo `.env` no diretório `frontend/`:

```env
VITE_API_URL=http://localhost:3000/api
```

Para produção, ajuste para a URL do seu backend.

## Como Usar

### 1. Iniciar o Backend

```bash
cd backend
npm install
npm run migrate
npm run dev
```

### 2. Iniciar o Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Fazer Login

1. Acesse `http://localhost:5173` (ou a porta do Vite)
2. Faça login com credenciais válidas
3. Se não tiver conta, registre-se primeiro (ou crie via API)

## Endpoints Utilizados

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter usuário atual

### Projetos
- `GET /api/projects` - Listar projetos
- `GET /api/projects/:id` - Obter projeto
- `POST /api/projects` - Criar projeto
- `PUT /api/projects/:id` - Atualizar projeto
- `DELETE /api/projects/:id` - Deletar projeto

### Empresas
- `GET /api/companies` - Listar empresas
- `GET /api/companies/:id` - Obter empresa
- `POST /api/companies` - Criar empresa
- `PUT /api/companies/:id` - Atualizar empresa
- `DELETE /api/companies/:id` - Deletar empresa

### Colaboradores
- `GET /api/collaborators` - Listar colaboradores
- `GET /api/collaborators/:id` - Obter colaborador
- `POST /api/collaborators` - Criar colaborador
- `PUT /api/collaborators/:id` - Atualizar colaborador
- `DELETE /api/collaborators/:id` - Deletar colaborador

### Grupos
- `GET /api/groups` - Listar grupos
- `GET /api/groups/:id` - Obter grupo
- `POST /api/groups` - Criar grupo
- `PUT /api/groups/:id` - Atualizar grupo
- `DELETE /api/groups/:id` - Deletar grupo

### Boards
- `GET /api/projects/:projectId/boards` - Listar boards
- `GET /api/projects/:projectId/boards/:boardId` - Obter board
- `POST /api/projects/:projectId/boards` - Criar board
- `PUT /api/projects/:projectId/boards/:boardId` - Atualizar board
- `DELETE /api/projects/:projectId/boards/:boardId` - Deletar board

## Próximos Passos

1. **Implementar Refresh Token**: Para renovação automática de tokens
2. **Cache de Dados**: Implementar cache para melhorar performance
3. **Otimistic Updates**: Atualizar UI antes da confirmação do backend
4. **WebSockets**: Para atualizações em tempo real
5. **Testes E2E**: Testes de integração frontend-backend

## Troubleshooting

### Erro: "Network Error"
- Verifique se o backend está rodando
- Verifique a URL da API em `.env`
- Verifique CORS no backend

### Erro: "401 Unauthorized"
- Token expirado ou inválido
- Faça login novamente
- Verifique se o token está sendo enviado no header

### Erro: "Failed to fetch"
- Backend não está acessível
- Verifique a conexão de rede
- Verifique firewall/proxy

## Notas Importantes

- Todos os endpoints requerem autenticação (exceto `/auth/register` e `/auth/login`)
- Tokens são armazenados no `localStorage`
- Dados são persistidos no backend (PostgreSQL)
- Frontend não mantém estado local persistente (exceto autenticação)

