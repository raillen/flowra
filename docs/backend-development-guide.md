# Guia de Desenvolvimento do Backend - KBSys

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Arquitetura](#arquitetura)
5. [Configuração e Setup](#configuração-e-setup)
6. [Padrões de Código](#padrões-de-código)
7. [Documentação da API](#documentação-da-api)
8. [Testes](#testes)
9. [Deploy](#deploy)

---

## Visão Geral

O backend do KBSys é uma API RESTful desenvolvida em Node.js seguindo as melhores práticas de engenharia de software. A arquitetura segue o padrão de separação de responsabilidades com camadas bem definidas: Controllers, Services, Repositories e Models.

### Princípios Aplicados

- **DRY (Don't Repeat Yourself)**: Código reutilizável e sem duplicação
- **SOLID**: Princípios de design orientado a objetos
- **Separation of Concerns**: Separação clara de responsabilidades
- **Single Responsibility**: Cada módulo tem uma única responsabilidade
- **Dependency Injection**: Dependências injetadas, facilitando testes

---

## Stack Tecnológica

### Core
- **Node.js** 18+ - Runtime JavaScript
- **Fastify** 4.x - Web framework rápido e eficiente
- **PostgreSQL** 15+ - Banco de dados relacional
- **Prisma** 5.x - ORM moderno com TypeScript support

### Autenticação e Segurança
- **@fastify/jwt** - Autenticação JWT
- **@fastify/helmet** - Headers de segurança
- **@fastify/cors** - Configuração CORS
- **bcryptjs** - Hash de senhas

### Validação
- **Zod** 3.x - Schema validation com TypeScript inference

### Logging
- **Pino** - Logger estruturado e performático
- **pino-pretty** - Formatação legível para desenvolvimento

### Documentação
- **@fastify/swagger** - Geração automática de documentação OpenAPI
- **@fastify/swagger-ui** - Interface visual da documentação

### Testes
- **Jest** - Framework de testes
- **Supertest** - Testes de integração HTTP

### Ferramentas de Desenvolvimento
- **ESLint** - Linter de código
- **Prettier** - Formatação automática
- **Nodemon** - Hot reload em desenvolvimento

---

## Estrutura do Projeto

```
kbsys-backend/
├── src/
│   ├── config/              # Configurações da aplicação
│   │   ├── database.js      # Configuração Prisma
│   │   ├── environment.js   # Variáveis de ambiente
│   │   └── logger.js        # Configuração de logging
│   │
│   ├── controllers/         # Camada de controle HTTP
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   ├── company.controller.js
│   │   ├── collaborator.controller.js
│   │   └── board.controller.js
│   │
│   ├── services/            # Lógica de negócio
│   │   ├── auth.service.js
│   │   ├── project.service.js
│   │   ├── company.service.js
│   │   ├── collaborator.service.js
│   │   └── board.service.js
│   │
│   ├── repositories/         # Camada de acesso a dados
│   │   ├── user.repository.js
│   │   ├── project.repository.js
│   │   ├── company.repository.js
│   │   ├── collaborator.repository.js
│   │   └── board.repository.js
│   │
│   ├── middleware/          # Middlewares customizados
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validation.middleware.js
│   │   └── logger.middleware.js
│   │
│   ├── routes/              # Definição de rotas
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   ├── company.routes.js
│   │   ├── collaborator.routes.js
│   │   └── board.routes.js
│   │
│   ├── validators/          # Schemas de validação Zod
│   │   ├── auth.validator.js
│   │   ├── project.validator.js
│   │   ├── company.validator.js
│   │   └── collaborator.validator.js
│   │
│   ├── utils/               # Utilitários
│   │   ├── errors.js        # Classes de erro customizadas
│   │   ├── responses.js     # Formatadores de resposta
│   │   └── helpers.js       # Funções auxiliares
│   │
│   └── app.js               # Ponto de entrada da aplicação
│
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   └── migrations/         # Migrations do Prisma
│
├── tests/
│   ├── unit/                # Testes unitários
│   │   ├── services/
│   │   ├── repositories/
│   │   └── utils/
│   ├── integration/         # Testes de integração
│   │   ├── auth.test.js
│   │   ├── projects.test.js
│   │   └── companies.test.js
│   └── setup.js            # Configuração dos testes
│
├── docs/
│   ├── architecture.md      # Documentação de arquitetura
│   ├── api.md              # Documentação da API
│   ├── deployment.md       # Guia de deploy
│   └── adr/                # Architecture Decision Records
│
├── scripts/
│   ├── migrate.js          # Script de migrations
│   ├── seed.js             # Script de seed
│   └── health-check.js     # Health check
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── jest.config.js
├── package.json
└── README.md
```

---

## Arquitetura

### Camadas da Aplicação

```
┌─────────────────────────────────────┐
│         HTTP Request                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Routes Layer                 │  ← Define endpoints e middlewares
│  - Validação de entrada             │
│  - Autenticação                      │
│  - Roteamento                        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Controllers Layer               │  ← Processa requisições HTTP
│  - Recebe request/response           │
│  - Chama services                    │
│  - Formata respostas                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       Services Layer                 │  ← Lógica de negócio
│  - Regras de negócio                 │
│  - Validações complexas              │
│  - Orquestração                      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Repositories Layer                │  ← Acesso a dados
│  - Queries do banco                  │
│  - Abstração do Prisma               │
│  - Transações                        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Database (PostgreSQL)          │
└─────────────────────────────────────┘
```

### Fluxo de Dados

1. **Request** → Middleware de autenticação
2. **Routes** → Validação de entrada (Zod)
3. **Controller** → Extrai dados da requisição
4. **Service** → Aplica lógica de negócio
5. **Repository** → Acessa banco de dados
6. **Response** → Formata e retorna

---

## Configuração e Setup

### Pré-requisitos

- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

### Instalação

```bash
# 1. Clonar repositório
git clone <repository-url>
cd kbsys-backend

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 4. Gerar Prisma Client
npm run prisma:generate

# 5. Rodar migrations
npm run prisma:migrate

# 6. (Opcional) Popular banco com dados de teste
npm run seed

# 7. Iniciar servidor em desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
# Aplicação
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/kbsys

# Autenticação
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=86400

# CORS
CORS_ORIGIN=*

# Logging
LOG_LEVEL=debug

# Swagger
ENABLE_SWAGGER=true
```

---

## Padrões de Código

### Convenções de Nomenclatura

- **Variáveis e funções**: `camelCase`
- **Classes**: `PascalCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Arquivos**: `kebab-case.js` ou `camelCase.js`

### Estrutura de Funções

```javascript
/**
 * Descrição clara da função
 * 
 * @param {Type} paramName - Descrição do parâmetro
 * @returns {Type} Descrição do retorno
 * @throws {ErrorType} Quando o erro ocorre
 * 
 * @example
 * const result = functionName(param);
 */
export async function functionName(param) {
  // Implementação
}
```

### Tratamento de Erros

```javascript
// Usar classes de erro customizadas
import { NotFoundError, ValidationError } from '../utils/errors.js';

if (!resource) {
  throw new NotFoundError('Resource not found');
}

if (!isValid) {
  throw new ValidationError('Validation failed', { field: 'error' });
}
```

### Validação

```javascript
// Usar Zod para validação
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
});

// Validar antes de processar
const validated = schema.parse(data);
```

### Logging

```javascript
import { logger } from '../config/logger.js';

// Logs estruturados
logger.info({ userId, projectId }, 'Project created');
logger.error({ error, context }, 'Failed to create project');
```

---

## Documentação da API

### Swagger/OpenAPI

A documentação da API está disponível em:
- **Desenvolvimento**: `http://localhost:3000/docs`
- **Produção**: `https://api.kbsys.com/docs`

### Exemplo de Endpoint Documentado

```javascript
fastify.post(
  '/api/projects',
  {
    preHandler: [authenticate, validationMiddleware(createProjectSchema)],
    schema: {
      description: 'Create a new project',
      tags: ['projects'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
  },
  projectController.createProject
);
```

---

## Testes

### Estrutura de Testes

- **Unit Tests**: Testam funções isoladas
- **Integration Tests**: Testam fluxos completos
- **Coverage**: Mínimo de 80%

### Executar Testes

```bash
# Todos os testes
npm test

# Com coverage
npm test -- --coverage

# Watch mode
npm run test:watch

# Apenas integração
npm run test:integration
```

### Exemplo de Teste

```javascript
import { describe, it, expect } from '@jest/globals';
import { createProject } from '../services/project.service.js';

describe('Project Service', () => {
  it('should create a project', async () => {
    const projectData = {
      name: 'Test Project',
      userId: 'user-123',
    };
    
    const project = await createProject(projectData, 'user-123');
    
    expect(project).toHaveProperty('id');
    expect(project.name).toBe('Test Project');
  });
});
```

---

## Deploy

### Docker

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Logs
docker-compose logs -f backend

# Stop
docker-compose down
```

### VPS (Ubuntu)

```bash
# 1. Instalar dependências do sistema
sudo apt update
sudo apt install docker.io docker-compose -y

# 2. Clonar repositório
git clone <repository-url>
cd kbsys-backend

# 3. Configurar .env
nano .env

# 4. Deploy
docker-compose up -d

# 5. Verificar status
docker-compose ps
```

### Scripts de Deploy

```bash
#!/bin/bash
# deploy.sh

git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```

---

## Próximos Passos

1. Implementar todos os módulos (Auth, Projects, Companies, etc.)
2. Adicionar testes completos
3. Configurar CI/CD
4. Documentar decisões arquiteturais (ADRs)
5. Implementar monitoramento e health checks

---

## Referências

- [Fastify Documentation](https://www.fastify.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev/)
- [Jest Documentation](https://jestjs.io/)

