import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * Inclui configurações para frontend e backend
 * 
 * Variáveis de ambiente:
 * - SKIP_WEB_SERVER=true: Não inicia servidores (assume que já estão rodando)
 * - CI=true: Modo CI (não reutiliza servidores)
 */

const skipWebServer = process.env.SKIP_WEB_SERVER === 'true';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  globalSetup: './tests/global-setup.js',
  globalTeardown: './tests/global-teardown.js',
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: skipWebServer ? undefined : [
    {
      command: 'cd backend && npm start',
      url: 'http://localhost:3000/health',
      reuseExistingServer: true, // Sempre reutilizar servidor existente em desenvolvimento
      timeout: 120000,
    },
    {
      command: 'cd frontend && npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true, // Sempre reutilizar servidor existente em desenvolvimento
      timeout: 120000,
    },
  ],
});

