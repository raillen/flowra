# Configuração de VPS

Este guia cobre o deploy do Flowra em um servidor VPS (Ubuntu 22.04+).

---

## Requisitos do Servidor

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| **RAM** | 1 GB | 2 GB |
| **CPU** | 1 core | 2 cores |
| **Disco** | 20 GB | 40 GB |
| **SO** | Ubuntu 20.04+ | Ubuntu 22.04 |

---

## Preparação do Servidor

### 1. Atualizar sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # v20.x
```

### 3. Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 4. Instalar Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

### 5. Instalar PostgreSQL (opcional)

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
```

---

## Deploy do Projeto

### 1. Clonar repositório

```bash
cd /var/www
git clone https://github.com/seu-usuario/flowra.git
cd flowra
```

### 2. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
nano .env  # Editar variáveis
```

**Variáveis `.env`:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/flowra"
JWT_SECRET="sua-chave-secreta-forte"
NODE_ENV="production"
PORT=3000
```

### 3. Migrar banco de dados

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Configurar Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
nano .env
```

**Variáveis `.env`:**
```env
VITE_API_URL=https://api.seudominio.com/api
```

### 5. Build do Frontend

```bash
npm run build
```

---

## Configurar PM2

### Backend

```bash
cd /var/www/flowra/backend
pm2 start src/app.js --name flowra-api
pm2 save
pm2 startup
```

---

## Configurar Nginx

### Backend API

```nginx
# /etc/nginx/sites-available/api.seudominio.com
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend

```nginx
# /etc/nginx/sites-available/seudominio.com
server {
    listen 80;
    server_name seudominio.com;
    root /var/www/flowra/frontend/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Ativar sites

```bash
sudo ln -s /etc/nginx/sites-available/api.seudominio.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/seudominio.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL com Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com -d api.seudominio.com
```

---

## Comandos Úteis

```bash
# Status do backend
pm2 status

# Logs do backend
pm2 logs kbsys-api

# Restart
pm2 restart kbsys-api

# Atualizar código
cd /var/www/kbsys
git pull
cd backend && npm install && pm2 restart kbsys-api
cd ../frontend && npm install && npm run build
```

---

## Próximos Passos

- [Docker →](./docker.md)
- [Variáveis de Ambiente →](./environment.md)
