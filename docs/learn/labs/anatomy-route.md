# Lab: Anatomia de uma Rota 🔬

Vamos dissecar um arquivo de rota real do nosso backend: `src/routes/board.routes.js`.

## O Código
```javascript
export async function boardRoutes(fastify, options) {
  // 1. O Porteiro (Middleware)
  fastify.addHook('onRequest', authenticate);

  // 2. A Rota (GET /)
  fastify.get('/', 
    // 3. O Controlador
    boardController.listBoards 
  );
}
```

## A Explicação Passo-a-Passo

### 1. O Porteiro (`addHook`)
A linha `fastify.addHook('onRequest', authenticate)` diz:
> "Antes de qualquer coisa, verifique se o usuário está logado."
Isso protege todas as rotas abaixo de uma vez só!

### 2. A Definição da Rota (`get`)
`fastify.get('/', ...)` diz:
> "Se alguém acessar o endereço raiz deste módulo..."

### 3. O Controlador
`boardController.listBoards` é a função que vai trabalhar.
É ela que vai no banco de dados, busca os quadros e devolve o JSON.

---
**Tente você**: Procure o arquivo `card.routes.js`. Você consegue identificar o "Porteiro" e o "Controlador" lá?
