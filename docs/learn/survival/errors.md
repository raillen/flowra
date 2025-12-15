# Guia: Entendendo Erros 🚑

O terminal ficou vermelho? Calma! O computador está tentando te dizer o que houve.

## Erros Comuns

### 🔴 `EADDRINUSE: address already in use`
*   **Tradução**: "A porta 3000 já tem gente!"
*   **Causa**: Você (ou outro programa) já está rodando o servidor.
*   **Solução**: Feche o outro terminal ou use `taskkill` para matar o processo fantasma.

### 🔴 `404 Not Found`
*   **Tradução**: "Não achei!"
*   **Causa**: Link errado, arquivo faltando ou rota inexistente.
*   **Solução**: Verifique se você digitou o endereço certo ou se criou o arquivo no lugar certo.

### 🔴 `500 Internal Server Error`
*   **Tradução**: "Explodi!"
*   **Causa**: Erro no código do Backend (Lógica quebrada, banco offline).
*   **Solução**: Olhe o terminal do Backend. Lá vai ter o "Stack Trace" (o rastro do crime) dizendo a linha exata do erro.

### 🔴 `Cors Error / Network Error`
*   **Tradução**: "O Frontend não consegue falar com o Backend."
*   **Causa**: Backend desligado ou bloqueio de segurança.
*   **Solução**: Veja se `npm run dev` está rodando na pasta `backend`.
