# Módulo de Autenticação 🔐

O sistema utiliza autenticação baseada em JWT (JSON Web Tokens).

## Fluxo
1.  **Login**: Usuário envia credenciais.
2.  **Validação**: Backend verifica hash da senha (bcrypt).
3.  **Token**: Backend assina um JWT contendo `userId` e `role`.
4.  **Resposta**: Token é retornado e armazenado no Frontend (localStorage/Context).

## Middleware
*   `authenticate`: Verifica se o token é válido em cada requisição protegida.
*   `authorize`: Verifica se o usuário tem a role necessária (ex: admin).

## Arquivos Chave
*   `src/controllers/auth.controller.js`
*   `src/middleware/auth.middleware.js`
*   `src/services/auth.service.js`
