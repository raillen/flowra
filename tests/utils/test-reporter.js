import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Classe para capturar e reportar erros e warnings dos testes
 */
export class TestReporter {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.resultsDir = path.join(__dirname, '../../test-results');
    this.reportFile = path.join(this.resultsDir, 'test-report.json');
    
    // Criar diretório se não existir
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  /**
   * Adiciona um erro ao relatório
   */
  addError(testName, error, context = {}) {
    this.errors.push({
      test: testName,
      type: 'error',
      message: error.message || String(error),
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  /**
   * Adiciona um warning ao relatório
   */
  addWarning(testName, warning, context = {}) {
    this.warnings.push({
      test: testName,
      type: 'warning',
      message: warning.message || String(warning),
      timestamp: new Date().toISOString(),
      context,
    });
  }

  /**
   * Captura erros do console do navegador
   */
  captureConsoleErrors(page, testName) {
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        this.addError(testName, new Error(text), {
          source: 'console',
          location: msg.location(),
        });
      } else if (type === 'warning') {
        this.addWarning(testName, new Error(text), {
          source: 'console',
          location: msg.location(),
        });
      }
    });

    page.on('pageerror', (error) => {
      this.addError(testName, error, {
        source: 'page',
      });
    });

    page.on('requestfailed', (request) => {
      this.addError(testName, new Error(`Request failed: ${request.url()}`), {
        source: 'network',
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
      });
    });
  }

  /**
   * Salva o relatório em arquivo JSON
   */
  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
      },
      errors: this.errors,
      warnings: this.warnings,
    };

    fs.writeFileSync(this.reportFile, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n📊 Relatório salvo em: ${this.reportFile}`);
    console.log(`   Erros: ${this.errors.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    
    return report;
  }

  /**
   * Gera relatório em formato Markdown
   */
  generateMarkdownReport() {
    const markdownFile = path.join(this.resultsDir, 'test-report.md');
    let markdown = `# Relatório de Testes - KBSys\n\n`;
    markdown += `**Data:** ${new Date().toLocaleString('pt-BR')}\n\n`;
    markdown += `## Resumo\n\n`;
    markdown += `- **Total de Erros:** ${this.errors.length}\n`;
    markdown += `- **Total de Warnings:** ${this.warnings.length}\n\n`;

    if (this.errors.length > 0) {
      markdown += `## Erros\n\n`;
      this.errors.forEach((error, index) => {
        markdown += `### Erro ${index + 1}\n\n`;
        markdown += `- **Teste:** ${error.test}\n`;
        markdown += `- **Mensagem:** ${error.message}\n`;
        markdown += `- **Fonte:** ${error.context.source || 'test'}\n`;
        markdown += `- **Timestamp:** ${error.timestamp}\n`;
        if (error.stack) {
          markdown += `\n\`\`\`\n${error.stack}\n\`\`\`\n`;
        }
        markdown += `\n`;
      });
    }

    if (this.warnings.length > 0) {
      markdown += `## Warnings\n\n`;
      this.warnings.forEach((warning, index) => {
        markdown += `### Warning ${index + 1}\n\n`;
        markdown += `- **Teste:** ${warning.test}\n`;
        markdown += `- **Mensagem:** ${warning.message}\n`;
        markdown += `- **Fonte:** ${warning.context.source || 'test'}\n`;
        markdown += `- **Timestamp:** ${warning.timestamp}\n\n`;
      });
    }

    fs.writeFileSync(markdownFile, markdown, 'utf-8');
    console.log(`📝 Relatório Markdown salvo em: ${markdownFile}`);
    
    return markdownFile;
  }

  /**
   * Limpa os relatórios anteriores
   */
  clear() {
    this.errors = [];
    this.warnings = [];
  }
}

// Instância global do reporter
export const testReporter = new TestReporter();

