# Configuração CORS

Este documento explica a configuração de CORS (Cross-Origin Resource Sharing) no backend.

## 🔧 Configuração Atual

O CORS está configurado no arquivo `src/app.js` para permitir requisições do frontend.

### Origens Permitidas

Por padrão, as seguintes origens são permitidas (definidas no `.env`):

- `http://localhost:5173` - Vite dev server (porta padrão)
- `http://127.0.0.1:5173` - Alternativa com IP
- `http://localhost:3000` - Swagger UI

### Configuração no .env

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

Para permitir todas as origens (apenas desenvolvimento):

```env
CORS_ORIGIN=*
```

## 🚨 Problemas Comuns

### Erro: "CORS policy blocked"

**Sintomas:**
```
Requisição cross-origin bloqueada: A diretiva Same Origin não permite a leitura do recurso remoto
```

**Soluções:**

1. **Verificar porta do frontend:**
   - O Vite pode usar uma porta diferente de 5173
   - Verifique no terminal do frontend qual porta está sendo usada
   - Adicione essa porta ao `CORS_ORIGIN` no `.env`

2. **Adicionar origem ao .env:**
   ```env
   CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173
   ```

3. **Reiniciar o servidor:**
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

4. **Verificar URL da API no frontend:**
   - Verifique se `VITE_API_URL` no frontend está correto
   - Deve apontar para `http://localhost:3000/api`

### Erro: "Preflight request failed"

Isso geralmente significa que o servidor não está respondendo corretamente às requisições OPTIONS.

**Solução:**
A configuração atual já inclui suporte para OPTIONS. Certifique-se de que o servidor está rodando e acessível.

## 🔍 Debug

### Verificar CORS no navegador

1. Abra o DevTools (F12)
2. Vá para a aba Network
3. Tente fazer uma requisição
4. Verifique os headers da resposta:
   - `Access-Control-Allow-Origin` deve conter sua origem
   - `Access-Control-Allow-Credentials` deve ser `true`

### Testar CORS manualmente

```bash
# Teste com curl
curl -X OPTIONS http://localhost:3000/api/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

A resposta deve incluir:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

## 📝 Configuração Avançada

### Permitir múltiplas origens

No `.env`, separe as origens por vírgula:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,https://meusite.com
```

### Configuração para produção

Em produção, seja específico com as origens permitidas:

```env
CORS_ORIGIN=https://meusite.com,https://www.meusite.com
```

**Nunca use `*` em produção** se você estiver usando `credentials: true`.

## 🔐 Segurança

### Credentials

A configuração atual usa `credentials: true` para permitir cookies e headers de autenticação. Isso significa:

- ✅ Cookies podem ser enviados
- ✅ Headers de autenticação funcionam
- ⚠️ Não pode usar `origin: '*'` com credentials

### Headers Permitidos

Os seguintes headers são permitidos:
- `Content-Type`
- `Authorization`

Para adicionar mais headers, edite `src/app.js`:

```javascript
allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header'],
```

## ✅ Checklist

Antes de reportar problemas de CORS:

- [ ] Verificou a porta do frontend no terminal?
- [ ] Adicionou a origem correta ao `CORS_ORIGIN` no `.env`?
- [ ] Reiniciou o servidor backend após mudar o `.env`?
- [ ] Verificou se `VITE_API_URL` no frontend está correto?
- [ ] Testou no DevTools do navegador?
- [ ] Verificou se não há erros no console do servidor?

## 🆘 Ainda com problemas?

1. Verifique os logs do servidor para erros
2. Verifique o console do navegador para mensagens de erro
3. Teste a API diretamente com Postman ou curl
4. Verifique se o servidor está realmente rodando na porta 3000

