# Módulo de Projetos 📁

Projetos são a unidade organizadora de nível superior.

## Estrutura de Dados
*   **Project**:
    *   `id`: UUID
    *   `name`: String
    *   `description`: String
    *   `companyId`: Relacionamento com a empresa (Tenant).

## Relacionamentos
*   Um **Projeto** contém muitos **Boards**.
*   Um **Projeto** pertence a uma **Company**.

## API
*   `GET /api/projects`: Lista projetos da empresa do usuário.
*   `POST /api/projects`: Cria novo projeto.
