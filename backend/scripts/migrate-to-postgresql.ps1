# Script PowerShell para migrar de SQLite para PostgreSQL
# Uso: .\scripts\migrate-to-postgresql.ps1

Write-Host "🔄 Migrando de SQLite para PostgreSQL..." -ForegroundColor Cyan

# Backup do schema atual
Write-Host "📦 Fazendo backup do schema SQLite..." -ForegroundColor Yellow
Copy-Item -Path "prisma\schema.prisma" -Destination "prisma\schema.sqlite.backup" -Force

# Substituir schema pelo PostgreSQL
Write-Host "🔄 Atualizando schema para PostgreSQL..." -ForegroundColor Yellow
Copy-Item -Path "prisma\schema.postgresql.prisma" -Destination "prisma\schema.prisma" -Force

# Gerar Prisma Client
Write-Host "🔨 Gerando Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate

# Rodar migrations no PostgreSQL
Write-Host "🚀 Executando migrations no PostgreSQL..." -ForegroundColor Yellow
Write-Host "⚠️  Certifique-se de que DATABASE_URL no .env aponta para PostgreSQL!" -ForegroundColor Red
npm run prisma:migrate

Write-Host "✅ Migração concluída!" -ForegroundColor Green
Write-Host '📝 Lembre-se de atualizar o DATABASE_URL no .env para PostgreSQL' -ForegroundColor Yellow

