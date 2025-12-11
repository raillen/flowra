#!/bin/bash

# Script para migrar de SQLite para PostgreSQL
# Uso: ./scripts/migrate-to-postgresql.sh

set -e

echo "🔄 Migrando de SQLite para PostgreSQL..."

# Backup do schema atual
echo "📦 Fazendo backup do schema SQLite..."
cp prisma/schema.prisma prisma/schema.sqlite.backup

# Substituir schema pelo PostgreSQL
echo "🔄 Atualizando schema para PostgreSQL..."
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Gerar Prisma Client
echo "🔨 Gerando Prisma Client..."
npm run prisma:generate

# Rodar migrations no PostgreSQL
echo "🚀 Executando migrations no PostgreSQL..."
echo "⚠️  Certifique-se de que DATABASE_URL no .env aponta para PostgreSQL!"
npm run prisma:migrate

echo "✅ Migração concluída!"
echo "📝 Lembre-se de atualizar o DATABASE_URL no .env para PostgreSQL"

