# Deploy com Docker

Este guia cobre o deploy usando Docker e Docker Compose.

---

## Pré-requisitos

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install -y docker-compose
```

---

## Dockerfile - Backend

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY prisma ./prisma
COPY src ./src

# Gerar cliente Prisma
RUN npx prisma generate

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "src/app.js"]
```

---

## Dockerfile - Frontend

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Nginx para servir
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

---

## Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: flowra
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: flowra
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://flowra:${DB_PASSWORD}@db:5432/flowra
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
      PORT: 3000
    depends_on:
      - db
    ports:
      - "3000:3000"
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## Deploy

### 1. Criar arquivo .env

```bash
cp .env.example .env
nano .env
```

```env
DB_PASSWORD=senha_forte_aqui
JWT_SECRET=chave_jwt_secreta
```

### 2. Build e iniciar

```bash
docker-compose build
docker-compose up -d
```

### 3. Migrar banco

```bash
docker-compose exec backend npx prisma migrate deploy
```

### 4. Verificar status

```bash
docker-compose ps
docker-compose logs -f
```

---

## Comandos Úteis

```bash
# Parar containers
docker-compose down

# Rebuild
docker-compose up -d --build

# Logs de um serviço
docker-compose logs -f backend

# Shell no container
docker-compose exec backend sh

# Backup do banco
docker-compose exec db pg_dump -U flowra flowra > backup.sql
```

---

## Próximos Passos

- [Variáveis de Ambiente →](./environment.md)
- [Monitoramento →](../maintenance/monitoring.md)
