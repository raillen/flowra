# Rotinas de Backup 💾

A integridade dos dados é crítica.

## Estratégia
*   **Banco de Dados**: O arquivo `dev.db` (SQLite) deve ser copiado diariamente para um local seguro (S3, Volume Externo).
*   **Uploads**: A pasta `uploads/` contendo anexos também deve ser backupeada.

## Script Sugerido (Linux)
```bash
#!/bin/bash
cp prisma/dev.db backups/db_$(date +%F).db
tar -czf backups/uploads_$(date +%F).tar.gz uploads/
```
