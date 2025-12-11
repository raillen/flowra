# Arquitetura do Backend

## Tecnologias

- **Runtime**: Node.js 20.x
- **Framework**: Fastify
- **ORM**: Prisma
- **Autenticação**: JWT (@fastify/jwt)
- **Validação**: JSON Schema (nativo Fastify)

---

## Estrutura de Camadas

```
┌─────────────────────────────────────┐
│            ROUTES                    │  Define endpoints
├─────────────────────────────────────┤
│          CONTROLLERS                 │  Recebe/responde HTTP
├─────────────────────────────────────┤
│           SERVICES                   │  Lógica de negócio
├─────────────────────────────────────┤
│         REPOSITORIES                 │  Acesso ao banco
├─────────────────────────────────────┤
│            PRISMA                    │  ORM
├─────────────────────────────────────┤
│           DATABASE                   │  SQLite/PostgreSQL
└─────────────────────────────────────┘
```

---

## Principais Arquivos

### `app.js`
Ponto de entrada. Configura plugins, CORS e registra rotas.

```javascript
// Plugins essenciais
fastify.register(cors, corsConfig);
fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET });

// Rotas
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(projectRoutes, { prefix: '/api/projects' });
// ...
```

### Padrão Controller → Service → Repository

**Controller** (HTTP layer):
```javascript
export async function getProjects(request, reply) {
    const projects = await projectService.getAll(request.user.id);
    return reply.send({ success: true, data: projects });
}
```

**Service** (Business logic):
```javascript
export async function getAll(userId) {
    const owned = await projectRepository.findByOwner(userId);
    const member = await projectRepository.findByMember(userId);
    return [...owned, ...member];
}
```

**Repository** (Data access):
```javascript
export async function findByOwner(userId) {
    return prisma.project.findMany({
        where: { userId },
        include: { boards: true }
    });
}
```

---

## Autenticação

JWT é usado para autenticação stateless.

### Fluxo:
1. Login: `POST /api/auth/login` → retorna token
2. Requests: Header `Authorization: Bearer <token>`
3. Middleware valida e injeta `request.user`

### Middleware:
```javascript
export async function authenticate(request, reply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.code(401).send({ error: 'Token inválido' });
    }
}
```

---

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão | `file:./dev.db` |
| `JWT_SECRET` | Segredo para JWT | `super-secret-key` |
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente | `development` |

---

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Sincronizar schema Prisma
npx prisma db push

# Gerar cliente Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio
```

---

## Próximos Passos

- [Frontend →](./frontend.md)
- [Banco de Dados →](./database.md)
