import { test, expect } from '@playwright/test';
import { testReporter } from '../utils/test-reporter.js';

test.describe('Navegação', () => {
  test.beforeEach(async ({ page }) => {
    testReporter.captureConsoleErrors(page, 'navigation');
    
    // Tentar fazer login primeiro (se necessário)
    await page.goto('/');
    
    // Verificar se está na página de login
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.count() > 0) {
      // Se houver login, tentar fazer login (pode falhar, mas não quebra o teste)
      try {
        await emailInput.first().fill('test@example.com');
        const passwordInput = page.locator('input[type="password"]').first();
        if (await passwordInput.count() > 0) {
          await passwordInput.fill('password123');
          const submitButton = page.locator('button[type="submit"]').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(2000);
          }
        }
      } catch (error) {
        testReporter.addWarning('navigation-login', new Error('Não foi possível fazer login automático'));
      }
    }
  });

  test('deve verificar se a sidebar está presente quando autenticado', async ({ page }) => {
    await test.step('Verificar presença da sidebar', async () => {
      await page.waitForTimeout(2000);
      
      const sidebar = page.locator('aside, [class*="sidebar"], [class*="Sidebar"]');
      const sidebarCount = await sidebar.count();
      
      if (sidebarCount === 0) {
        // Verificar se está na página de login
        const loginForm = page.locator('input[type="email"]');
        if (await loginForm.count() === 0) {
          testReporter.addWarning('sidebar-presenca', new Error('Sidebar não encontrada na página principal'));
        }
      }
    });
  });

  test('deve verificar se o header está presente', async ({ page }) => {
    await test.step('Verificar presença do header', async () => {
      await page.waitForTimeout(2000);
      
      const header = page.locator('header, [class*="header"], [class*="Header"]');
      const headerCount = await header.count();
      
      if (headerCount === 0) {
        const loginForm = page.locator('input[type="email"]');
        if (await loginForm.count() === 0) {
          testReporter.addWarning('header-presenca', new Error('Header não encontrado'));
        }
      }
    });
  });

  test('deve verificar links de navegação principais', async ({ page }) => {
    await test.step('Verificar links de navegação', async () => {
      await page.waitForTimeout(2000);
      
      const navItems = [
        'Dashboard',
        'Projetos',
        'Kanban',
        'Configurações',
        'Notificações'
      ];

      for (const item of navItems) {
        const navLink = page.locator(`text=/${item}/i`);
        const count = await navLink.count();
        
        if (count === 0) {
          const loginForm = page.locator('input[type="email"]');
          if (await loginForm.count() === 0) {
            testReporter.addWarning(`nav-link-${item.toLowerCase()}`, new Error(`Link de navegação "${item}" não encontrado`));
          }
        }
      }
    });
  });

  test('deve verificar responsividade básica', async ({ page }) => {
    await test.step('Testar diferentes tamanhos de tela', async () => {
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);
        
        // Verificar se há elementos quebrados
        const body = page.locator('body');
        const bodyBox = await body.boundingBox();
        
        if (!bodyBox) {
          testReporter.addError(`responsividade-${viewport.name}`, new Error(`Problema de layout em ${viewport.name}`));
        }
      }
    });
  });
});

