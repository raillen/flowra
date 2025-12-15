# Módulo de Briefings 📝

Sistema de coleta de requisitos e especificações.

## Arquitetura
*   **Templates**: O admin define modelos de briefing (campos dinâmicos).
*   **Respostas**: Instâncias preenchidas desses templates vinculadas a um projeto ou card.

## JSON Schema
Os campos do template são armazenados como JSON no banco de dados, permitindo flexibilidade total (textos, selects, uploads) sem alterar o schema do banco.
