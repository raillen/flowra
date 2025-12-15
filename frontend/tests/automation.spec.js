import { test, expect } from '@playwright/test';

const TEST_EMAIL = `automation_test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
const PROJECT_NAME = 'Automation Project';
const BOARD_NAME = 'Auto Board';

test.describe('Automation Rules', () => {
    // 1. Setup Auth and Board
    test.beforeEach(async ({ page }) => {
        // Quick Auth
        await page.goto('/login');

        // Check if we need to register
        if (await page.getByText('Criar conta').isVisible()) {
            await page.getByText('Criar conta').click();
            await page.getByRole('heading', { name: 'Criar Conta' }).waitFor();
            await page.getByPlaceholder('Seu nome').fill('Auto Tester');
            await page.getByPlaceholder('Sua empresa').fill(`Auto Corp ${Date.now()}`);
            await page.getByPlaceholder('seu@empresa.com').fill(TEST_EMAIL);
            await page.getByPlaceholder('••••••••', { exact: true }).nth(0).fill(TEST_PASSWORD);
            await page.getByPlaceholder('••••••••', { exact: true }).nth(1).fill(TEST_PASSWORD);
            await page.getByRole('button', { name: 'Criar Conta Grátis' }).click();
            await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
        } else {
            // Try login just in case
            await page.getByPlaceholder('seu@email.com').fill(TEST_EMAIL);
            await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
            await page.getByRole('button', { name: 'Entrar na Plataforma' }).click();
            await expect(page.getByText('Dashboard')).toBeVisible();
        }

        // Create Project
        await page.getByText('Novo Projeto').click();
        await page.getByPlaceholder('Ex: Redesign do Site').fill(PROJECT_NAME);
        await page.getByRole('button', { name: 'Criar Projeto' }).click();
        await page.getByText(PROJECT_NAME).click();

        // Create Board
        const createBoardBtn = page.getByRole('button', { name: 'Criar Novo Quadro' }).or(page.getByText('Criar Novo Quadro'));
        await createBoardBtn.click();
        await page.getByPlaceholder('Ex: Sprint 10...').fill(BOARD_NAME);
        await page.getByRole('button', { name: /Criar (Board|Quadro)/i }).click();
        await page.getByText(BOARD_NAME, { exact: true }).click();
    });

    test('should create and trigger an automation rule', async ({ page }) => {
        // 1. Open Board Settings
        await page.getByRole('button', { name: 'Configurar' }).click();

        // 2. Navigate to Automation Tab
        await page.getByRole('button', { name: 'Automação' }).click();

        // 3. Create Rule
        // 3. Create Rule (Robust Selectors)
        // Select Trigger: Find the container with "Gatilho" label
        await page.locator('div').filter({ hasText: 'Gatilho (Se...)' }).locator('select').selectOption('CARD_MOVE');

        // Select Action: Find the container with "Ação" label
        await page.locator('div').filter({ hasText: 'Ação (Então...)' }).locator('select').selectOption('ARCHIVE_CARD');

        // Ensure button becomes enabled
        const createBtn = page.getByRole('button', { name: 'Criar Automação' });
        await expect(createBtn).toBeEnabled();

        // Wait for potential animations or state updates
        await page.waitForTimeout(500);

        await createBtn.click();

        // Verify Rule appears (Check for text description of the rule)
        await expect(page.getByText('Se Mover Card Então Arquivar Card')).toBeVisible();

        // Close Modal - "Salvar" button at the bottom sidebar
        await page.getByRole('button', { name: 'Salvar' }).click();

        // 4. Trigger the Rule
        // Create a card
        await page.getByText('Adicionar Novo Card').first().click();
        await page.getByPlaceholder('O que precisa ser feito?').fill('Auto Archivable Card');
        await page.getByRole('button', { name: /Salvar|Adicionar/i }).click();

        const card = page.getByText('Auto Archivable Card');
        await expect(card).toBeVisible();

        // Move the card to another column (e.g. 2nd column) to trigger "CARD_MOVE"
        const targetColumn = page.getByText(/Em (Andamento|Progresso)/i).first();
        await card.dragTo(targetColumn);

        // 5. Verify Result (Archived)
        // The card should disappear from the board
        await expect(card).not.toBeVisible({ timeout: 10000 });
    });
});
