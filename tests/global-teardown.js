import { testReporter } from './utils/test-reporter.js';

/**
 * Teardown global após todos os testes
 */
async function globalTeardown() {
  console.log('📊 Gerando relatórios finais...');
  
  // Salvar relatórios
  testReporter.saveReport();
  testReporter.generateMarkdownReport();
  
  console.log('✅ Teardown global concluído');
}

export default globalTeardown;

