import { testReporter } from './utils/test-reporter.js';

/**
 * Setup global antes de todos os testes
 */
async function globalSetup() {
  console.log('🔧 Configurando ambiente de testes...');
  
  // Limpar relatórios anteriores
  testReporter.clear();
  
  console.log('✅ Setup global concluído');
}

export default globalSetup;

