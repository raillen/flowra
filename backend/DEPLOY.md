# Guia de Deploy - Flowra Backend

## 🐳 Deploy com Docker (Recomendado)

### Pré-requisitos
- Docker instalado
- Docker Compose instalado
- Acesso à VPS/servidor

### Setup Inicial

1. **Configurar variáveis de ambiente:**
```bash
cd backend
cp .env.example .env
nano .env  # Editar com suas configurações
```

2. **Configurar senhas e secrets:**
```env
DB_PASSWORD=sua-senha-segura-aqui
JWT_SECRET=seu-jwt-secret-super-seguro-aqui
```

### Deploy em Produção

```bash
# Usar docker-compose de produção
docker-compose -f docker/docker-compose.yml up -d

# Ver logs
docker-compose -f docker/docker-compose.yml logs -f

# Parar serviços
docker-compose -f docker/docker-compose.yml down
```

### Deploy em Desenvolvimento

```bash
# Usar docker-compose de desenvolvimento (com hot reload)
docker-compose -f docker/docker-compose.dev.yml up -d
```

### Script de Deploy Automatizado

```bash
# Tornar executável
chmod +x scripts/deploy.sh

# Executar deploy
./scripts/deploy.sh
```

---

## 🖥️ Deploy Manual (Sem Docker)

### Na VPS Ubuntu

1. **Instalar dependências:**
```bash
sudo apt update
sudo apt install -y nodejs npm postgresql
```

2. **Configurar PostgreSQL:**
```bash
sudo -u postgres createdb flowra
sudo -u postgres createuser flowra_user
sudo -u postgres psql -c "ALTER USER flowra_user WITH PASSWORD 'sua-senha';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE flowra TO flowra_user;"
```

3. **Clonar e configurar:**
```bash
cd /var/www
git clone <seu-repo> flowra-backend
cd flowra-backend/backend
pm2 start src/app.js --name flowra-backend
npm install --production
cp .env.example .env
nano .env  # Configurar
```

4. **Rodar migrations:**
```bash
npm run prisma:generate
npm run prisma:migrate deploy
```

5. **Usar PM2 para gerenciar processo:**
```bash
npm install -g pm2
pm2 start src/app.js --name flowra-backend
pm2 save
pm2 startup  # Configurar auto-start
```

---

## 🔄 Atualização

### Com Docker
```bash
git pull
docker-compose -f docker/docker-compose.yml build
docker-compose -f docker/docker-compose.yml up -d
docker-compose -f docker/docker-compose.yml exec backend npm run migrate
```

### Com PM2
```bash
git pull
npm install --production
npm run prisma:generate
npm run prisma:migrate deploy
pm2 restart flowra-backend
```

---

## 💾 Backup do Banco de Dados

### Script Automatizado
```bash
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
```

### Manual
```bash
# Com Docker
docker exec flowra-postgres pg_dump -U flowra_user flowra > backup.sql
PGPASSWORD=sua-senha pg_dump -h localhost -U flowra_user flowra > backup.sql
./scripts/restore-db.sh backups/flowra_backup_20240101_120000.sql.gz
```

---

## 🔍 Monitoramento

### Ver Logs
```bash
# Docker
docker-compose -f docker/docker-compose.yml logs -f backend

# PM2
pm2 logs flowra-backend
```

### Health Check
```bash
curl http://localhost:3000/health
```

### Status dos Containers
```bash
docker-compose -f docker/docker-compose.yml ps
```

---

## 🔒 Segurança

### Checklist de Produção

- [ ] Alterar `JWT_SECRET` para valor seguro e único
- [ ] Alterar senha do banco de dados
- [ ] Configurar CORS adequadamente
- [ ] Usar HTTPS (Nginx reverse proxy)
- [ ] Configurar firewall (portas 80, 443, 22)
- [ ] Configurar SSL/TLS
- [ ] Habilitar logs de auditoria
- [ ] Configurar backup automático
- [ ] Desabilitar Swagger em produção (opcional)

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.flowra.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🚨 Troubleshooting

### Container não inicia
```bash
# Ver logs
docker-compose -f docker/docker-compose.yml logs backend

# Verificar variáveis de ambiente
docker-compose -f docker/docker-compose.yml config
```

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
docker-compose -f docker/docker-compose.yml ps postgres

# Testar conexão
docker-compose -f docker/docker-compose.yml exec postgres psql -U flowra_user -d flowra
```

### Porta já em uso
```bash
# Verificar processo usando a porta
sudo lsof -i :3000

# Matar processo
sudo kill -9 <PID>
```

---

## 📝 Comandos Úteis

```bash
# Rebuild containers
docker-compose -f docker/docker-compose.yml build --no-cache

# Limpar volumes (CUIDADO: apaga dados)
docker-compose -f docker/docker-compose.yml down -v

# Executar comandos no container
docker-compose -f docker/docker-compose.yml exec backend npm run prisma:studio

# Ver uso de recursos
docker stats
```

