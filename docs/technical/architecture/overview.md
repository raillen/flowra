# Visão Geral da Arquitetura

## Sumário

O **KBSys** é uma plataforma de gerenciamento de projetos desenvolvida com arquitetura moderna e escalável.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| **Frontend** | React + Vite | 18.x |
| **Estilização** | Tailwind CSS | 3.x |
| **Backend** | Node.js + Fastify | 20.x |
| **ORM** | Prisma | 5.x |
| **Banco de Dados** | SQLite (dev) / PostgreSQL (prod) | - |
| **Autenticação** | JWT | - |

---

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                               │
│                     (Browser/App)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                               │
│                   React + Vite (SPA)                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │Dashboard│ │ Kanban  │ │Calendar │ │Briefing │            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND                                │
│                   Node.js + Fastify                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │  Auth   │ │Projects │ │  Cards  │ │  Chat   │            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│                           │                                  │
│                    ┌──────┴──────┐                          │
│                    │   Prisma    │                          │
│                    │    ORM      │                          │
│                    └──────┬──────┘                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ SQL
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     BANCO DE DADOS                           │
│                  SQLite / PostgreSQL                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Diretórios

```
kbsys/
├── backend/
│   ├── prisma/           # Schema e migrações
│   ├── src/
│   │   ├── config/       # Configurações
│   │   ├── controllers/  # Handlers de rotas
│   │   ├── middleware/   # Auth, validation
│   │   ├── repositories/ # Acesso ao banco
│   │   ├── routes/       # Definição de rotas
│   │   ├── services/     # Lógica de negócio
│   │   └── app.js        # Entrada do app
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── contexts/     # Contextos globais
│   │   ├── services/     # APIs do frontend
│   │   ├── config/       # Configuração axios
│   │   └── App.jsx       # Entrada do app
│   └── package.json
│
├── docs/                 # Esta documentação
└── docker-compose.yml    # Orquestração Docker
```

---

## Fluxo de Dados

1. **Usuário** interage com a interface React
2. **Frontend** faz requisição via Axios para a API
3. **Backend** (Fastify) recebe e valida a requisição
4. **Middleware** de autenticação verifica JWT
5. **Controller** delega para o **Service**
6. **Service** usa **Repository** para acessar dados
7. **Prisma** executa query no banco
8. Resposta volta pelo mesmo caminho

---

## Próximos Passos

- [Backend →](./backend.md)
- [Frontend →](./frontend.md)
- [Banco de Dados →](./database.md)
