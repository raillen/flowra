import { test, expect } from '@playwright/test';
import { testReporter } from '../utils/test-reporter.js';

test.describe('Componentes da Interface', () => {
  test.beforeEach(async ({ page }) => {
    testReporter.captureConsoleErrors(page, 'components');
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('deve verificar se botões principais estão funcionais', async ({ page }) => {
    await test.step('Verificar botões clicáveis', async () => {
      const buttons = page.locator('button:not([disabled])');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        // Testar alguns botões aleatórios
        const buttonsToTest = Math.min(3, buttonCount);
        for (let i = 0; i < buttonsToTest; i++) {
          const button = buttons.nth(i);
          const isVisible = await button.isVisible();
          
          if (isVisible) {
            try {
              await button.click({ timeout: 1000 });
              await page.waitForTimeout(500);
            } catch (error) {
              testReporter.addWarning(`botao-click-${i}`, new Error(`Botão ${i} pode ter problema de interação`));
            }
          }
        }
      }
    });
  });

  test('deve verificar se modais abrem e fecham corretamente', async ({ page }) => {
    await test.step('Procurar e testar modais', async () => {
      // Procurar botões que podem abrir modais
      const modalTriggers = page.locator('button:has-text("Novo"), button:has-text("Adicionar"), button:has-text("Criar"), [class*="modal-trigger"]');
      const triggerCount = await modalTriggers.count();
      
      if (triggerCount > 0) {
        const firstTrigger = modalTriggers.first();
        await firstTrigger.click();
        await page.waitForTimeout(1000);
        
        // Verificar se modal apareceu
        const modal = page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]');
        const modalCount = await modal.count();
        
        if (modalCount > 0) {
          // Tentar fechar o modal
          const closeButton = page.locator('button:has-text("Fechar"), button:has-text("X"), [aria-label*="close" i]');
          if (await closeButton.count() > 0) {
            await closeButton.first().click();
            await page.waitForTimeout(500);
          } else {
            // Tentar clicar fora do modal
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          }
        } else {
          testReporter.addWarning('modal-abertura', new Error('Modal não apareceu após clicar no trigger'));
        }
      }
    });
  });

  test('deve verificar se formulários têm validação', async ({ page }) => {
    await test.step('Verificar validação de formulários', async () => {
      const forms = page.locator('form');
      const formCount = await forms.count();
      
      if (formCount > 0) {
        for (let i = 0; i < formCount; i++) {
          const form = forms.nth(i);
          const inputs = form.locator('input[required], select[required], textarea[required]');
          const requiredCount = await inputs.count();
          
          if (requiredCount > 0) {
            // Tentar submeter formulário vazio
            const submitButton = form.locator('button[type="submit"], input[type="submit"]');
            if (await submitButton.count() > 0) {
              await submitButton.first().click();
              await page.waitForTimeout(1000);
              
              // Verificar se há mensagens de erro
              const errorMessages = form.locator('[class*="error"], [class*="invalid"], [aria-invalid="true"]');
              const errorCount = await errorMessages.count();
              
              if (errorCount === 0) {
                testReporter.addWarning(`form-validacao-${i}`, new Error(`Formulário ${i} pode não ter validação adequada`));
              }
            }
          }
        }
      }
    });
  });

  test('deve verificar se há problemas de acessibilidade', async ({ page }) => {
    await test.step('Verificar elementos de acessibilidade', async () => {
      // Verificar imagens sem alt
      const images = page.locator('img:not([alt])');
      const imageCount = await images.count();
      if (imageCount > 0) {
        testReporter.addWarning('acessibilidade-imagens', new Error(`${imageCount} imagem(ns) sem atributo alt`));
      }

      // Verificar botões sem texto ou aria-label
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      let buttonsWithoutLabel = 0;
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');
        
        if (!text?.trim() && !ariaLabel && !title) {
          buttonsWithoutLabel++;
        }
      }
      
      if (buttonsWithoutLabel > 0) {
        testReporter.addWarning('acessibilidade-botoes', new Error(`${buttonsWithoutLabel} botão(ões) sem texto ou aria-label`));
      }

      // Verificar links sem texto
      const links = page.locator('a:not([aria-label]):not([title])');
      const linkCount = await links.count();
      let linksWithoutText = 0;
      
      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        if (!text?.trim()) {
          linksWithoutText++;
        }
      }
      
      if (linksWithoutText > 0) {
        testReporter.addWarning('acessibilidade-links', new Error(`${linksWithoutText} link(s) sem texto`));
      }
    });
  });

  test('deve verificar se há problemas de performance', async ({ page }) => {
    await test.step('Verificar métricas de performance', async () => {
      const performanceMetrics = await page.evaluate(() => {
        const perfData = window.performance.timing;
        return {
          loadTime: perfData.loadEventEnd - perfData.navigationStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        };
      });

      if (performanceMetrics.loadTime > 5000) {
        testReporter.addWarning('performance-load', new Error(`Tempo de carregamento alto: ${performanceMetrics.loadTime}ms`));
      }

      if (performanceMetrics.domContentLoaded > 3000) {
        testReporter.addWarning('performance-dom', new Error(`DOMContentLoaded lento: ${performanceMetrics.domContentLoaded}ms`));
      }
    });
  });
});

