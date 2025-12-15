# Troubleshooting (Solução de Problemas) 🔧

Guia rápido para problemas comuns.

## 1. Servidor não inicia
*   **Erro**: `EADDRINUSE: address already in use :::3000`
*   **Causa**: Outro processo já está usando a porta 3000.
*   **Solução**: Identifique e mate o processo (`lsof -i :3000` ou `taskkill` no Windows).

## 2. Erro de Banco de Dados
*   **Erro**: `P1001: Can't reach database server`
*   **Solução**: Verifique se o arquivo do SQLite existe e tem permissões de escrita.

## 3. Frontend não conecta ao Socket
*   **Sintoma**: Chat não funciona, mudanças não atualizam.
*   **Solução**: Verifique se `VITE_SOCKET_URL` aponta corretamente para o backend e se não há bloqueios de firewall/proxy para WebSockets.
