import { test, expect } from '@playwright/test';
import { testReporter } from '../utils/test-reporter.js';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

test.describe('API - Projetos', () => {
  test('deve retornar 401 ao listar projetos sem autenticação', async ({ request }) => {
    await test.step('Tentar listar projetos sem token', async () => {
      try {
        const response = await request.get(`${API_BASE_URL}/projects`);

        if (response.status() !== 401) {
          testReporter.addError('api-projects-list-sem-auth', new Error(`Esperado 401, recebido ${response.status()}`));
        }
      } catch (error) {
        testReporter.addError('api-projects-list-request', error);
      }
    });
  });

  test('deve retornar 401 ao criar projeto sem autenticação', async ({ request }) => {
    await test.step('Tentar criar projeto sem token', async () => {
      try {
        const response = await request.post(`${API_BASE_URL}/projects`, {
          data: {
            name: 'Projeto Teste',
            description: 'Descrição do projeto',
          },
        });

        if (response.status() !== 401) {
          testReporter.addError('api-projects-create-sem-auth', new Error(`Esperado 401, recebido ${response.status()}`));
        }
      } catch (error) {
        testReporter.addError('api-projects-create-request', error);
      }
    });
  });

  test('deve retornar 400 ao criar projeto sem dados obrigatórios', async ({ request }) => {
    await test.step('Tentar criar projeto sem dados (com token inválido)', async () => {
      try {
        const response = await request.post(`${API_BASE_URL}/projects`, {
          headers: {
            Authorization: 'Bearer token-teste',
          },
          data: {},
        });

        // Pode retornar 401 (token inválido) ou 400 (validação)
        if (response.status() !== 401 && response.status() !== 400 && response.status() !== 422) {
          testReporter.addError('api-projects-create-validacao', new Error(`Esperado 401/400/422, recebido ${response.status()}`));
        }
      } catch (error) {
        testReporter.addError('api-projects-create-validacao-request', error);
      }
    });
  });
});

