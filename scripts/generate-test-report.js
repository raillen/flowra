import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para gerar relatório final dos testes
 * Consolida resultados do Playwright e do test-reporter
 */

const resultsDir = path.join(__dirname, '../test-results');
const playwrightResultsFile = path.join(resultsDir, 'results.json');
const testReportFile = path.join(resultsDir, 'test-report.json');

function generateFinalReport() {
  console.log('📊 Gerando relatório final dos testes...\n');

  // Ler resultados do Playwright
  let playwrightResults = null;
  if (fs.existsSync(playwrightResultsFile)) {
    try {
      const content = fs.readFileSync(playwrightResultsFile, 'utf-8');
      playwrightResults = JSON.parse(content);
    } catch (error) {
      console.warn('⚠️  Não foi possível ler resultados do Playwright:', error.message);
    }
  }

  // Ler relatório de erros/warnings
  let testReport = null;
  if (fs.existsSync(testReportFile)) {
    try {
      const content = fs.readFileSync(testReportFile, 'utf-8');
      testReport = JSON.parse(content);
    } catch (error) {
      console.warn('⚠️  Não foi possível ler relatório de erros:', error.message);
    }
  }

  // Consolidar relatório
  const finalReport = {
    timestamp: new Date().toISOString(),
    summary: {
      playwright: playwrightResults ? {
        total: playwrightResults.stats?.total || 0,
        passed: playwrightResults.stats?.passed || 0,
        failed: playwrightResults.stats?.failed || 0,
        skipped: playwrightResults.stats?.skipped || 0,
      } : null,
      errors: testReport?.summary?.totalErrors || 0,
      warnings: testReport?.summary?.totalWarnings || 0,
    },
    playwrightResults: playwrightResults,
    errors: testReport?.errors || [],
    warnings: testReport?.warnings || [],
  };

  // Salvar relatório final
  const finalReportFile = path.join(resultsDir, 'final-report.json');
  fs.writeFileSync(finalReportFile, JSON.stringify(finalReport, null, 2), 'utf-8');

  // Gerar relatório em texto
  const textReport = generateTextReport(finalReport);
  const textReportFile = path.join(resultsDir, 'final-report.txt');
  fs.writeFileSync(textReportFile, textReport, 'utf-8');

  // Gerar relatório Markdown
  const markdownReport = generateMarkdownReport(finalReport);
  const markdownReportFile = path.join(resultsDir, 'final-report.md');
  fs.writeFileSync(markdownReportFile, markdownReport, 'utf-8');

  console.log('✅ Relatórios gerados:');
  console.log(`   - JSON: ${finalReportFile}`);
  console.log(`   - TXT: ${textReportFile}`);
  console.log(`   - MD: ${markdownReportFile}`);
  console.log('\n📈 Resumo:');
  console.log(`   - Testes executados: ${finalReport.summary.playwright?.total || 'N/A'}`);
  console.log(`   - Testes passaram: ${finalReport.summary.playwright?.passed || 'N/A'}`);
  console.log(`   - Testes falharam: ${finalReport.summary.playwright?.failed || 'N/A'}`);
  console.log(`   - Erros encontrados: ${finalReport.summary.errors}`);
  console.log(`   - Warnings encontrados: ${finalReport.summary.warnings}`);
}

function generateTextReport(report) {
  let text = '='.repeat(80) + '\n';
  text += 'RELATÓRIO FINAL DE TESTES - KBSYS\n';
  text += '='.repeat(80) + '\n\n';
  text += `Data: ${new Date(report.timestamp).toLocaleString('pt-BR')}\n\n`;

  text += 'RESUMO\n';
  text += '-'.repeat(80) + '\n';
  if (report.summary.playwright) {
    text += `Testes Executados: ${report.summary.playwright.total}\n`;
    text += `Testes Passaram: ${report.summary.playwright.passed}\n`;
    text += `Testes Falharam: ${report.summary.playwright.failed}\n`;
    text += `Testes Ignorados: ${report.summary.playwright.skipped}\n`;
  }
  text += `Erros Encontrados: ${report.summary.errors}\n`;
  text += `Warnings Encontrados: ${report.summary.warnings}\n\n`;

  if (report.errors.length > 0) {
    text += 'ERROS\n';
    text += '-'.repeat(80) + '\n';
    report.errors.forEach((error, index) => {
      text += `\n${index + 1}. ${error.test}\n`;
      text += `   Mensagem: ${error.message}\n`;
      text += `   Fonte: ${error.context?.source || 'test'}\n`;
      text += `   Timestamp: ${error.timestamp}\n`;
      if (error.stack) {
        text += `   Stack: ${error.stack.substring(0, 200)}...\n`;
      }
    });
    text += '\n';
  }

  if (report.warnings.length > 0) {
    text += 'WARNINGS\n';
    text += '-'.repeat(80) + '\n';
    report.warnings.forEach((warning, index) => {
      text += `\n${index + 1}. ${warning.test}\n`;
      text += `   Mensagem: ${warning.message}\n`;
      text += `   Fonte: ${warning.context?.source || 'test'}\n`;
      text += `   Timestamp: ${warning.timestamp}\n`;
    });
    text += '\n';
  }

  return text;
}

function generateMarkdownReport(report) {
  let md = `# Relatório Final de Testes - KBSys\n\n`;
  md += `**Data:** ${new Date(report.timestamp).toLocaleString('pt-BR')}\n\n`;

  md += `## Resumo\n\n`;
  if (report.summary.playwright) {
    md += `| Métrica | Valor |\n`;
    md += `|---------|-------|\n`;
    md += `| Testes Executados | ${report.summary.playwright.total} |\n`;
    md += `| Testes Passaram | ${report.summary.playwright.passed} |\n`;
    md += `| Testes Falharam | ${report.summary.playwright.failed} |\n`;
    md += `| Testes Ignorados | ${report.summary.playwright.skipped} |\n`;
    md += `| Erros Encontrados | ${report.summary.errors} |\n`;
    md += `| Warnings Encontrados | ${report.summary.warnings} |\n\n`;
  } else {
    md += `- **Erros Encontrados:** ${report.summary.errors}\n`;
    md += `- **Warnings Encontrados:** ${report.summary.warnings}\n\n`;
  }

  if (report.errors.length > 0) {
    md += `## Erros (${report.errors.length})\n\n`;
    report.errors.forEach((error, index) => {
      md += `### Erro ${index + 1}: ${error.test}\n\n`;
      md += `- **Mensagem:** ${error.message}\n`;
      md += `- **Fonte:** ${error.context?.source || 'test'}\n`;
      md += `- **Timestamp:** ${error.timestamp}\n`;
      if (error.context?.url) {
        md += `- **URL:** ${error.context.url}\n`;
      }
      if (error.stack) {
        md += `\n\`\`\`\n${error.stack}\n\`\`\`\n`;
      }
      md += `\n`;
    });
  }

  if (report.warnings.length > 0) {
    md += `## Warnings (${report.warnings.length})\n\n`;
    report.warnings.forEach((warning, index) => {
      md += `### Warning ${index + 1}: ${warning.test}\n\n`;
      md += `- **Mensagem:** ${warning.message}\n`;
      md += `- **Fonte:** ${warning.context?.source || 'test'}\n`;
      md += `- **Timestamp:** ${warning.timestamp}\n`;
      if (warning.context?.url) {
        md += `- **URL:** ${warning.context.url}\n`;
      }
      md += `\n`;
    });
  }

  return md;
}

// Executar
generateFinalReport();

