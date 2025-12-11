import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para executar todos os testes e gerar relatórios
 */

console.log('🚀 Iniciando execução dos testes...\n');

try {
  // Verificar se Playwright está instalado
  try {
    execSync('npx playwright --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('📦 Instalando Playwright...');
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    execSync('npx playwright install --with-deps chromium', { stdio: 'inherit' });
  }

  // Verificar status dos servidores
  try {
    execSync('node scripts/check-servers.js', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..')
    });
  } catch (error) {
    // Ignorar erros na verificação
  }

  // Executar testes
  console.log('\n🧪 Executando testes...\n');
  execSync('npx playwright test', { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, CI: 'false' }
  });

  // Gerar relatório final
  console.log('\n📊 Gerando relatório final...\n');
  execSync('node scripts/generate-test-report.js', { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '..')
  });

  console.log('\n✅ Testes concluídos!');
  console.log('📁 Verifique os relatórios em: test-results/');
  
} catch (error) {
  console.error('\n❌ Erro ao executar testes:', error.message);
  
  // Ainda assim, tentar gerar relatório se houver resultados parciais
  try {
    execSync('node scripts/generate-test-report.js', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..')
    });
  } catch (reportError) {
    console.error('⚠️  Não foi possível gerar relatório:', reportError.message);
  }
  
  process.exit(1);
}

