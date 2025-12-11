import { test, expect } from '@playwright/test';
import { testReporter } from '../utils/test-reporter.js';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

test.describe('API - Empresas', () => {
  test('deve retornar 401 ao listar empresas sem autenticação', async ({ request }) => {
    await test.step('Tentar listar empresas sem token', async () => {
      try {
        const response = await request.get(`${API_BASE_URL}/companies`);

        if (response.status() !== 401) {
          testReporter.addError('api-companies-list-sem-auth', new Error(`Esperado 401, recebido ${response.status()}`));
        }
      } catch (error) {
        testReporter.addError('api-companies-list-request', error);
      }
    });
  });

  test('deve retornar 401 ao criar empresa sem autenticação', async ({ request }) => {
    await test.step('Tentar criar empresa sem token', async () => {
      try {
        const response = await request.post(`${API_BASE_URL}/companies`, {
          data: {
            name: 'Empresa Teste',
            cnpj: '12.345.678/0001-90',
          },
        });

        if (response.status() !== 401) {
          testReporter.addError('api-companies-create-sem-auth', new Error(`Esperado 401, recebido ${response.status()}`));
        }
      } catch (error) {
        testReporter.addError('api-companies-create-request', error);
      }
    });
  });
});

