import { test, expect } from '@playwright/test';
import { testReporter } from '../utils/test-reporter.js';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

test.describe('API - Autenticação', () => {
  test('deve retornar erro 400 ao registrar sem dados obrigatórios', async ({ request }) => {
    await test.step('Tentar registrar sem dados', async () => {
      try {
        const response = await request.post(`${API_BASE_URL}/auth/register`, {
          data: {},
        });

        if (response.status() !== 400 && response.status() !== 422) {
          testReporter.addError('api-register-validacao', new Error(`Esperado 400/422, recebido ${response.status()}`));
        }
      } catch (error) {
        testReporter.addError('api-register-request', error);
      }
    });
  });

  test('deve retornar erro 400 ao registrar com email inválido', async ({ request }) => {
    await test.step('Tentar registrar com email inválido', async () => {
      try {
        const response = await request.post(`${API_BASE_URL}/auth/register`, {
          data: {
            name: 'Test User',
            email: 'email-invalido',
            password: 'password123',
          },
        });

        if (response.status() !== 400 && response.status() !== 422) {
          testReporter.addError('api-register-email-invalido', new Error(`Esperado 400/422, recebido ${response.status()}`));
        }
      } catch (error) {
        testReporter.addError('api-register-email-request', error);
      }
    });
  });

  test('deve retornar erro 400 ao fazer login sem credenciais', async ({ request }) => {
    await test.step('Tentar login sem dados', async () => {
      try {
        const response = await request.post(`${API_BASE_URL}/auth/login`, {
          data: {},
        });

        if (response.status() !== 400 && response.status() !== 422) {
          testReporter.addError('api-login-validacao', new Error(`Esperado 400/422, recebido ${response.status()}`));
        }
      } catch (error) {
        testReporter.addError('api-login-request', error);
      }
    });
  });

  test('deve retornar erro 401 ao fazer login com credenciais inválidas', async ({ request }) => {
    await test.step('Tentar login com credenciais inválidas', async () => {
      try {
        const response = await request.post(`${API_BASE_URL}/auth/login`, {
          data: {
            email: 'naoexiste@teste.com',
            password: 'senhaerrada',
          },
        });

        if (response.status() !== 401 && response.status() !== 404) {
          testReporter.addError('api-login-credenciais-invalidas', new Error(`Esperado 401/404, recebido ${response.status()}`));
        }
      } catch (error) {
        testReporter.addError('api-login-credenciais-request', error);
      }
    });
  });

  test('deve retornar 401 ao acessar /me sem token', async ({ request }) => {
    await test.step('Tentar acessar endpoint protegido sem token', async () => {
      try {
        const response = await request.get(`${API_BASE_URL}/auth/me`);

        if (response.status() !== 401) {
          testReporter.addError('api-me-sem-token', new Error(`Esperado 401, recebido ${response.status()}`));
        }
      } catch (error) {
        testReporter.addError('api-me-request', error);
      }
    });
  });

  test('deve retornar 401 ao acessar /me com token inválido', async ({ request }) => {
    await test.step('Tentar acessar endpoint protegido com token inválido', async () => {
      try {
        const response = await request.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: 'Bearer token-invalido-12345',
          },
        });

        if (response.status() !== 401) {
          testReporter.addError('api-me-token-invalido', new Error(`Esperado 401, recebido ${response.status()}`));
        }
      } catch (error) {
        testReporter.addError('api-me-token-request', error);
      }
    });
  });

  test('deve verificar se o endpoint de health está funcionando', async ({ request }) => {
    await test.step('Verificar health check', async () => {
      try {
        const response = await request.get('http://localhost:3000/health');
        
        if (response.status() !== 200) {
          testReporter.addError('api-health', new Error(`Health check retornou ${response.status()}`));
        } else {
          const body = await response.json();
          if (!body.status || body.status !== 'ok') {
            testReporter.addWarning('api-health-body', new Error('Health check não retornou status "ok"'));
          }
        }
      } catch (error) {
        testReporter.addError('api-health-request', error);
      }
    });
  });
});

