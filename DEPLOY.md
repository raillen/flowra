# ===========================================
# Flowra Deploy Guide - VPS
# ===========================================

## Pré-requisitos

- Docker e Docker Compose instalados na VPS
- Git instalado
- Pelo menos 1GB de RAM disponível
- Porta 80 liberada no firewall

## Deploy Rápido

### 1. Clone o repositório na VPS

```bash
git clone <seu-repo> flowra
cd flowra
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Edite o arquivo `.env` com suas configurações:

```env
DB_USER=flowra
DB_PASSWORD=SuaSenhaSeguraAqui123!
DB_NAME=flowra
JWT_SECRET=ChaveSuperSecretaParaJWT_MinimoDeDozeCaracteres
APP_PORT=80
CORS_ORIGIN=https://seudominio.com
NODE_ENV=production
```

### 3. Build e inicialização

```bash
# Build das imagens
docker-compose build

# Iniciar em background
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 4. Executar migrations do banco

```bash
# Acessar container do backend
docker-compose exec backend sh

# Dentro do container, rodar migrations
npx prisma migrate deploy

# Opcional: criar usuário admin
npm run create-superuser

# Sair do container
exit
```

## Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Parar todos os containers
docker-compose down

# Reiniciar um serviço específico
docker-compose restart backend

# Ver logs em tempo real
docker-compose logs -f backend

# Limpar tudo (cuidado: perde dados!)
docker-compose down -v
```

## Com Nginx Externo + SSL (Recomendado)

Se você prefere usar Nginx externo com Certbot para SSL:

### 1. Altere o docker-compose.yml

Mude a porta do frontend de `80` para uma interna (ex: `3080`):

```yaml
frontend:
  ports:
    - "3080:80"
```

### 2. Configure o Nginx externo

```nginx
server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name seudominio.com;

    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Gere o certificado SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

## Troubleshooting

### Backend não conecta ao banco

```bash
# Verificar se o banco está rodando
docker-compose ps db

# Ver logs do banco
docker-compose logs db

# Testar conexão manualmente
docker-compose exec db psql -U flowra -d flowra
```

### Frontend retorna 502 Bad Gateway

```bash
# Verificar se o backend está rodando
docker-compose ps backend

# Ver logs do backend
docker-compose logs backend
```

### Reconstruir tudo do zero

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```
