# Variáveis de Ambiente 🌿

O sistema utiliza variáveis de ambiente para configuração sensível e comportamental.

## Backend (.env)
O arquivo `.env` na raiz do backend deve conter:

```env
# Servidor
PORT=3000
NODE_ENV=production

# Banco de Dados
DATABASE_URL="file:./dev.db"

# Segurança
JWT_SECRET="sua_chave_super_secreta"
CORS_ORIGIN="http://localhost:5173"

# Logs
LOG_LEVEL=info
```

## Frontend (.env)
O frontend usa variáveis prefixadas com `VITE_`:

```env
VITE_API_URL="http://localhost:3000/api"
VITE_SOCKET_URL="http://localhost:3000"
```
