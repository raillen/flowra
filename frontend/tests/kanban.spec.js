import { test, expect } from '@playwright/test';

// Reuse credentials from auth spec or create new ones? 
// For isolation, let's create a simplified flow or assume auth state.
// Ideally usage of global setup for auth is best, but for now we inline auth.

const TEST_EMAIL = `e2e_kanban_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
const PROJECT_NAME = 'E2E Project';
const BOARD_NAME = 'E2E Board';

test.describe('Kanban Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Quick Auth
        await page.goto('/login');
        await page.getByText('Criar conta').click();
        await page.getByPlaceholder('Ex: Maria Silva').fill('Kanban Tester');
        await page.getByPlaceholder('Sua Empresa').fill(`Test Corp ${Date.now()}`);
        await page.getByPlaceholder('seu@email.com').fill(TEST_EMAIL);
        await page.getByPlaceholder('••••••••', { exact: true }).nth(0).fill(TEST_PASSWORD);
        await page.getByPlaceholder('••••••••', { exact: true }).nth(1).fill(TEST_PASSWORD);
        await page.getByRole('button', { name: 'Criar Conta Grátis' }).click();
        await page.waitForURL(/\/login/);

        await page.getByPlaceholder('seu@email.com').fill(TEST_EMAIL);
        await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
        await page.getByRole('button', { name: 'Entrar na Plataforma' }).click();
        await expect(page.getByText('Dashboard')).toBeVisible();
    });

    test('should create project, board and move card', async ({ page }) => {
        test.slow(); // Give this test 3x timeout

        // 1. Create Project
        await page.getByText('Novo Projeto').click();
        await page.getByRole('button', { name: 'Criar Novo Projeto' }).click();

        await page.getByPlaceholder('Ex: Redesign do Site').fill(PROJECT_NAME);
        // Robustness: Select first company if dropdown exists (it might simple be pre-selected)

        await page.getByRole('button', { name: 'Criar Projeto' }).click();

        // 2. Open Project
        // Wait for list to appear
        await page.getByText(PROJECT_NAME).first().click();

        // 3. Create Board
        const createBoardBtn = page.getByRole('button', { name: 'Criar Novo Quadro' }).or(page.getByText('Criar Novo Quadro'));
        await createBoardBtn.first().click(); // .first() in case of multiple View occurrences

        await page.getByPlaceholder('Ex: Sprint 10...').fill(BOARD_NAME);
        await page.getByRole('button', { name: /Criar (Board|Quadro)/i }).click();

        // 4. Open Board
        await page.getByText(BOARD_NAME, { exact: true }).first().click();

        // 5. Create Card
        await page.getByText('Adicionar Novo Card').first().click();
        await page.getByPlaceholder('O que precisa ser feito?').fill('E2E Card');
        await page.getByRole('button', { name: /Salvar|Adicionar/i }).click();

        // Verify card exists
        const card = page.getByText('E2E Card');
        await expect(card).toBeVisible();

        // 6. Drag and Drop
        // Ensure columns are rendered
        // We know standard columns: "A Fazer", "Em Andamento", "Concluído" etc.
        const sourceColumn = page.locator('.flex-col > .p-4').filter({ hasText: 'A Fazer' }).first();
        const targetColumn = page.locator('.flex-col > .p-4').filter({ hasText: /Em (Andamento|Progresso)/ }).first();

        await expect(targetColumn).toBeVisible();

        // Drag using explicit hover points if needed, but dragTo is usually good.
        // We'll drag the card to the center of the target column.
        await card.dragTo(targetColumn.locator('.flex-1'), { force: true });

        // 7. Verify Move
        await page.waitForTimeout(1000); // Wait for backend sync
        await expect(card).toBeVisible();
    });
});
