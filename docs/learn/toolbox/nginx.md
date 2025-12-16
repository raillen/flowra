# Nginx: O "Porteiro" do Servidor 🚪

> **Resumo (TL;DR)**: O Nginx é um servidor web super rápido que usamos como "porteiro". Ele recebe as requisições da internet (porta 80) e as encaminha para o lugar certo (Frontend React ou Backend Node.js).

---

## O que é o Nginx?

Imagine que seu servidor é um prédio comercial gigante com várias salas (Frontend, Backend, Banco de Dados).

Sem um porteiro, os entregadores (usuários) teriam que saber exatamente o número da sala e bater na porta certa (ex: `meusite.com:3000` para backend, `meusite.com:5173` para frontend). Isso é confuso e inseguro.

O **Nginx** é o recepcionista eficiente na entrada principal (Porta 80):
1.  "Quer ver o site? Vá para a sala do Frontend."
2.  "Quer fazer login? Vou chamar o Backend para você."
3.  "Sala escura? Vou acender a luz (SSL/HTTPS)."

## Nossa Configuração Explicada

No Flowra, usamos o arquivo `nginx.conf` para "treinar" esse porteiro. Vamos analisar o arquivo linha por linha:

### 1. O Bloco do Servidor

```nginx
server {
    listen 80;          # Escute na porta 80 (padrão da web)
    server_name _;      # Aceite qualquer nome (flowra.com, localhost, etc)
    root /usr/share/nginx/html; # Onde estão os arquivos do site? (Frontend buildado)
    index index.html;   # Qual arquivo abrir primeiro?
```

### 2. Rotas (Locations)

Aqui definimos as regras de encaminhamento.

#### Rota da API (`/api/`)

Quando alguém acessa `flowra.com/api/usuarios`, o Nginx entende que isso é para o backend.

```nginx
    location /api/ {
        # proxy_pass: "Passe a requisição para..."
        # http://flowra-backend:3000 -> Nome do serviço no Docker + Porta interna
        proxy_pass http://flowra-backend:3000/;
        
        # Cabeçalhos importantes para o backend saber quem chamou
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Configuração necessária para WebSockets funcionarem
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
```

#### Rota do Socket.IO (`/socket.io/`)

Para comunicação em tempo real (chat, atualizações do kanban).

```nginx
    location /socket.io/ {
        # Encaminha especificamente para o endpoint de websockets do backend
        proxy_pass http://flowra-backend:3000/socket.io/;
        
        # Essencial para manter a conexão aberta (WebSocket handshake)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
```

#### Rota Padrão (Frontend SPA)

Se não for `/api` nem `/socket.io`, mostre o site.

```nginx
    location / {
        # try_files: Tente encontrar o arquivo (ex: logo.png).
        # Se não achar, mostre o index.html (SPA Fallback).
        # Isso é crucial para React Router funcionar!
        try_files $uri $uri/ /index.html;
    }
```

> **Por que `try_files ... /index.html`?**
> Apps React (SPA) tem apenas UM arquivo HTML real (`index.html`). Quando você navega para `/projetos`, essa pasta não existe no servidor. O Nginx precisa entregar o `index.html` e deixar o Javascript do React "fingir" que mudou de página.

## Conceitos Chave

### Reverse Proxy (Proxy Reverso)
É quando o servidor (Nginx) busca a informação em outro lugar (Backend Node.js) e entrega para o usuário, sem que o usuário saiba que falou com o Node.js. Isso protege o backend e simplifica a URL.

### Upstream
É o servidor "acima do rio" (backend) para onde o Nginx manda os dados. No Docker, usamos o nome do serviço (`flowra-backend`) como endereço, e o Docker resolve o IP magicamente (DNS interno).

## Por que usamos Nginx e não direto o Node.js?
1.  **Arquivos Estáticos**: Nginx serve imagens e HTML MUITO mais rápido que Node.js.
2.  **Segurança**: Esconde a arquitetura interna.
3.  **Flexibilidade**: Fácil adicionar SSL, compressão (Gzip) e cache.
