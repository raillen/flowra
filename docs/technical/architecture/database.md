# Banco de Dados

## Visão Geral

O KBSys usa **Prisma** como ORM com suporte a:
- **SQLite** (desenvolvimento)
- **PostgreSQL** (produção)

---

## Schema Principal

### Usuários e Autenticação

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String   // Hash bcrypt
  role      String   @default("user") // user, admin
  avatar    String?
  bio       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Empresas e Grupos

```prisma
model Company {
  id       String @id @default(uuid())
  name     String
  cnpj     String @unique
  projects Project[]
}

model Group {
  id   String @id @default(uuid())
  name String @unique
}
```

### Projetos e Boards

```prisma
model Project {
  id          String  @id @default(uuid())
  name        String
  description String?
  userId      String  // Dono
  companyId   String?
  boards      Board[]
  members     ProjectMember[]
}

model Board {
  id        String   @id @default(uuid())
  name      String
  projectId String
  columns   Column[]
  cards     Card[]
}
```

### Cards (Tarefas)

```prisma
model Card {
  id             String   @id @default(uuid())
  title          String
  description    String?
  priority       String?  // baixa, media, alta, urgente
  status         String?
  dueDate        DateTime?
  startDate      DateTime?
  estimatedHours Int?
  columnId       String
  boardId        String
  assignedUserId String?
  reporterId     String?
  order          Int      @default(0)
}
```

---

## Relacionamentos

```
User ─────┬───── Project (1:N - dono)
          ├───── ProjectMember (N:M - membro)
          └───── Card (N - assignee)

Project ──┬───── Board (1:N)
          └───── Company (N:1)

Board ────┬───── Column (1:N)
          └───── Card (1:N)

Column ───────── Card (1:N)
```

---

## Migrações

### Desenvolvimento (SQLite)

```bash
# Sincronizar schema sem migração formal
npx prisma db push

# Gerar cliente
npx prisma generate

# Visualizar dados
npx prisma studio
```

### Produção (PostgreSQL)

```bash
# Criar migração
npx prisma migrate dev --name add_feature

# Aplicar em produção
npx prisma migrate deploy

# Reset (CUIDADO!)
npx prisma migrate reset
```

---

## Queries Comuns

### Buscar projetos do usuário

```javascript
const projects = await prisma.project.findMany({
  where: {
    OR: [
      { userId: currentUserId },
      { members: { some: { userId: currentUserId } } }
    ]
  },
  include: {
    boards: true,
    members: { include: { user: true } }
  }
});
```

### Buscar cards de um board

```javascript
const cards = await prisma.card.findMany({
  where: { boardId },
  include: {
    assignedUser: true,
    column: true,
    tags: true
  },
  orderBy: { order: 'asc' }
});
```

---

## Backup

```bash
# SQLite
cp prisma/dev.db prisma/backup_$(date +%Y%m%d).db

# PostgreSQL
pg_dump -U user dbname > backup.sql
```

---

## Próximos Passos

- [Deploy VPS →](../deployment/vps-setup.md)
- [Módulos →](../modules/auth.md)
