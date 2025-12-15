# Módulo de Chat 💬

Comunicação em tempo real entre membros da equipe.

## WebSocket
A principal tecnologia aqui é o **Socket.io**.
*   Eventos: `send_message`, `receive_message`, `user_typing`.
*   Salas: Cada `projectId` ou `boardId` pode atuar como uma sala de chat.

## Persistência
As mensagens são salvas no banco de dados para histórico, mas a entrega é imediata via WebSocket.
