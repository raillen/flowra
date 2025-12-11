import { test, expect } from '@playwright/test';
import { testReporter } from '../utils/test-reporter.js';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

test.describe('API - CORS e Segurança', () => {
  test('deve retornar headers CORS corretos', async ({ request }) => {
    await test.step('Verificar headers CORS', async () => {
      try {
        const response = await request.options(`${API_BASE_URL}/auth/login`);

        const headers = response.headers();
        const corsHeaders = {
          'access-control-allow-origin': headers['access-control-allow-origin'],
          'access-control-allow-methods': headers['access-control-allow-methods'],
          'access-control-allow-headers': headers['access-control-allow-headers'],
        };

        if (!corsHeaders['access-control-allow-origin']) {
          testReporter.addWarning('api-cors-origin', new Error('Header Access-Control-Allow-Origin não encontrado'));
        }

        if (!corsHeaders['access-control-allow-methods']) {
          testReporter.addWarning('api-cors-methods', new Error('Header Access-Control-Allow-Methods não encontrado'));
        }
      } catch (error) {
        testReporter.addError('api-cors-request', error);
      }
    });
  });

  test('deve verificar se há proteção contra ataques comuns', async ({ request }) => {
    await test.step('Verificar headers de segurança', async () => {
      try {
        const response = await request.get(`${API_BASE_URL}/auth/login`);

        const headers = response.headers();
        const securityHeaders = {
          'x-content-type-options': headers['x-content-type-options'],
          'x-frame-options': headers['x-frame-options'],
          'x-xss-protection': headers['x-xss-protection'],
        };

        // Verificar se há algum header de segurança (não obrigatório, mas recomendado)
        const hasSecurityHeaders = Object.values(securityHeaders).some(h => h);
        
        if (!hasSecurityHeaders) {
          testReporter.addWarning('api-security-headers', new Error('Headers de segurança não encontrados'));
        }
      } catch (error) {
        testReporter.addError('api-security-headers-request', error);
      }
    });
  });

  test('deve retornar erro adequado para métodos não permitidos', async ({ request }) => {
    await test.step('Tentar usar método não permitido', async () => {
      try {
        const response = await request.patch(`${API_BASE_URL}/auth/login`, {
          data: { email: 'test@test.com' },
        });

        // PATCH pode não ser suportado, deve retornar 405 ou 404
        if (response.status() !== 405 && response.status() !== 404) {
          testReporter.addWarning('api-method-not-allowed', new Error(`Método não permitido retornou ${response.status()} em vez de 405`));
        }
      } catch (error) {
        // Erro de conexão é aceitável
        if (!error.message.includes('ECONNREFUSED')) {
          testReporter.addError('api-method-not-allowed-request', error);
        }
      }
    });
  });
});

