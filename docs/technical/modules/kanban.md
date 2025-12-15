# Módulo Kanban (Boards) 📋

O núcleo do sistema KBsys.

## Componentes
1.  **KanbanBoardView.jsx**: O componente React gigante que gerencia o estado do drag-and-drop.
2.  **dnd-kit**: Biblioteca usada para as interações de arrastar.

## Backend
*   **Cards**: São armazenados com um campo `order` (float) para permitir reordenação eficiente sem reescrever todos os itens.
*   **Columns**: Também possuem ordenação.

## Websocokets
O módulo Kanban usa Socket.io para atualizações em tempo real (ex: quando outro usuário move um card).
