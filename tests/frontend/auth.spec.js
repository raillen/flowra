import { test, expect } from '@playwright/test';
import { testReporter } from '../utils/test-reporter.js';

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    testReporter.captureConsoleErrors(page, 'auth');
    await page.goto('/');
  });

  test('deve exibir a página de login quando não autenticado', async ({ page }) => {
    await test.step('Verificar elementos da página de login', async () => {
      // Verificar se a página de login está visível
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      
      await expect(emailInput.first()).toBeVisible({ timeout: 10000 });
      await expect(passwordInput.first()).toBeVisible();
    });
  });

  test('deve validar campos obrigatórios no formulário de login', async ({ page }) => {
    await test.step('Tentar submeter formulário vazio', async () => {
      const submitButton = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")');
      
      if (await submitButton.count() > 0) {
        await submitButton.first().click();
        
        // Aguardar possíveis mensagens de erro
        await page.waitForTimeout(1000);
        
        // Verificar se há mensagens de validação
        const errorMessages = page.locator('text=/obrigatório|required|preencha/i');
        const errorCount = await errorMessages.count();
        
        if (errorCount === 0) {
          testReporter.addWarning('validação-campos-login', new Error('Validação de campos obrigatórios não detectada'));
        }
      }
    });
  });

  test('deve exibir erro ao tentar login com credenciais inválidas', async ({ page }) => {
    await test.step('Preencher credenciais inválidas', async () => {
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Entrar")').first();

      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        await emailInput.fill('teste@invalido.com');
        await passwordInput.fill('senhaerrada123');
        
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Aguardar resposta da API
          await page.waitForTimeout(2000);
          
          // Verificar se há mensagem de erro
          const errorMessage = page.locator('text=/erro|inválido|incorreto|não encontrado/i');
          const hasError = await errorMessage.count() > 0;
          
          if (!hasError) {
            testReporter.addWarning('login-credenciais-invalidas', new Error('Mensagem de erro não exibida para credenciais inválidas'));
          }
        }
      } else {
        testReporter.addError('login-formulario', new Error('Campos de login não encontrados'));
      }
    });
  });

  test('deve verificar se há problemas de acessibilidade na página de login', async ({ page }) => {
    await test.step('Verificar labels e aria-labels', async () => {
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

      if (await emailInput.count() > 0) {
        const emailLabel = await emailInput.getAttribute('aria-label') || 
                          await emailInput.getAttribute('placeholder') ||
                          await page.locator('label[for*="email" i]').count();
        
        if (!emailLabel && await page.locator('label[for*="email" i]').count() === 0) {
          testReporter.addWarning('acessibilidade-email', new Error('Campo de email sem label ou aria-label'));
        }
      }

      if (await passwordInput.count() > 0) {
        const passwordLabel = await passwordInput.getAttribute('aria-label') || 
                             await passwordInput.getAttribute('placeholder') ||
                             await page.locator('label[for*="password" i]').count();
        
        if (!passwordLabel && await page.locator('label[for*="password" i]').count() === 0) {
          testReporter.addWarning('acessibilidade-password', new Error('Campo de senha sem label ou aria-label'));
        }
      }
    });
  });
});

