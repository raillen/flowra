# Guia de Migração de Banco de Dados

Este documento descreve como migrar entre SQLite (desenvolvimento) e PostgreSQL (produção).

## 📋 Visão Geral

- **Desenvolvimento**: SQLite (arquivo local `dev.db`)
- **Produção**: PostgreSQL (banco de dados servidor)

## 🚀 Configuração Inicial (SQLite)

### 1. Configurar .env para SQLite

O arquivo `.env` já está configurado com:

```env
DATABASE_URL=file:./dev.db
```

### 2. Executar Migrations

```bash
npm run migrate
```

Isso criará o arquivo `dev.db` no diretório `backend/`.

### 3. Desenvolvimento

Agora você pode desenvolver normalmente. O banco SQLite será criado automaticamente.

## 🔄 Migrar para PostgreSQL (Deploy)

### Opção 1: Script Automático (Recomendado)

#### Windows (PowerShell):
```powershell
.\scripts\migrate-to-postgresql.ps1
```

#### Linux/Mac:
```bash
chmod +x scripts/migrate-to-postgresql.sh
./scripts/migrate-to-postgresql.sh
```

### Opção 2: Manual

1. **Atualizar .env para PostgreSQL**:
```env
DATABASE_URL=postgresql://usuario:senha@host:5432/kbsys
```

2. **Substituir schema**:
```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

3. **Gerar Prisma Client**:
```bash
npm run prisma:generate
```

4. **Executar migrations**:
```bash
npm run prisma:migrate
```

## 📊 Diferenças entre SQLite e PostgreSQL

### Compatibilidade

O schema foi projetado para ser compatível com ambos:

- **IDs**: Ambos usam `String` (UUIDs são strings no SQLite)
- **Tipos de dados**: Compatíveis
- **Relacionamentos**: Funcionam em ambos
- **Índices**: Suportados em ambos

### Limitações do SQLite

- Não suporta múltiplas conexões simultâneas (limitado em produção)
- Não suporta alguns tipos avançados do PostgreSQL
- Performance inferior em grandes volumes de dados

### Vantagens do SQLite para Desenvolvimento

- ✅ Não precisa instalar servidor de banco
- ✅ Arquivo único, fácil de fazer backup
- ✅ Rápido para desenvolvimento
- ✅ Zero configuração

## 🔙 Voltar para SQLite (Desenvolvimento)

Se precisar voltar para SQLite após usar PostgreSQL:

1. **Atualizar .env**:
```env
DATABASE_URL=file:./dev.db
```

2. **Restaurar schema SQLite**:
```bash
# Se você fez backup
cp prisma/schema.sqlite.backup prisma/schema.prisma

# Ou simplesmente mudar o provider no schema.prisma
# provider = "sqlite"
```

3. **Regenerar Prisma Client**:
```bash
npm run prisma:generate
```

4. **Recriar banco** (opcional, se quiser limpar):
```bash
rm dev.db
npm run migrate
```

## 📝 Notas Importantes

### Backup de Dados

Antes de migrar para produção, faça backup dos dados:

```bash
# SQLite
cp dev.db dev.db.backup

# PostgreSQL
pg_dump -U usuario -d kbsys > backup.sql
```

### Migração de Dados

Para migrar dados do SQLite para PostgreSQL:

1. Exportar dados do SQLite (usar ferramentas como `sqlite3`)
2. Importar no PostgreSQL (usar `psql` ou ferramentas de migração)

**Exemplo básico**:
```bash
# Exportar do SQLite
sqlite3 dev.db .dump > dump.sql

# Ajustar sintaxe para PostgreSQL (pode precisar de ajustes manuais)
# Importar no PostgreSQL
psql -U usuario -d kbsys < dump.sql
```

### Variáveis de Ambiente por Ambiente

Considere usar arquivos `.env` diferentes:

- `.env.development` - SQLite
- `.env.production` - PostgreSQL

E carregar baseado em `NODE_ENV`.

## 🐛 Troubleshooting

### Erro: "Provider mismatch"

Se você mudou o provider mas o Prisma Client ainda está gerado para o outro:

```bash
npm run prisma:generate
```

### Erro: "Database does not exist"

No PostgreSQL, crie o banco antes:

```sql
CREATE DATABASE kbsys;
```

### Erro: "Connection refused"

Verifique:
- PostgreSQL está rodando?
- Credenciais no `.env` estão corretas?
- Firewall permite conexão?

## ✅ Checklist de Deploy

Antes de fazer deploy para produção:

- [ ] Atualizar `DATABASE_URL` para PostgreSQL
- [ ] Executar script de migração
- [ ] Testar conexão com banco
- [ ] Executar migrations
- [ ] Verificar se todas as tabelas foram criadas
- [ ] Testar endpoints da API
- [ ] Fazer backup do banco de produção

