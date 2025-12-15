import { test, expect } from '@playwright/test';

const TEST_EMAIL = `e2e_test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
const TEST_NAME = 'E2E Test User';
const TEST_COMPANY = `E2E Corp ${Date.now()}`;

test.describe('Auth Flow', () => {
    test('should register a new user', async ({ page }) => {
        // Navigate to Login/Register area
        await page.goto('/login');

        // Check if we are on login or need to click 'Criar uma conta'
        await expect(page).toHaveTitle(/KBSys|Login/);
        if (await page.getByText('Criar conta').isVisible()) {
            await page.getByText('Criar conta').click();
        }

        // Wait for Register form
        await expect(page.getByRole('heading', { name: 'Criar Conta' })).toBeVisible();

        // Fill form
        await page.getByPlaceholder('Seu nome').fill(TEST_NAME);
        await page.getByPlaceholder('Sua empresa').fill(TEST_COMPANY);
        await page.getByPlaceholder('seu@empresa.com').fill(TEST_EMAIL);
        await page.getByPlaceholder('••••••••', { exact: true }).nth(0).fill(TEST_PASSWORD);
        await page.getByPlaceholder('••••••••', { exact: true }).nth(1).fill(TEST_PASSWORD);

        // Submit
        await page.getByRole('button', { name: 'Criar Conta Grátis' }).click();

        // Wait for redirect to Login or Dashboard
        // App.jsx sets token immediately on success, rendering Layout.
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page.locator('header')).toBeVisible();
    });

    test('should login with the registered user', async ({ page }) => {
        await page.goto('/login');

        // Fill Login
        await page.getByPlaceholder('seu@email.com').fill(TEST_EMAIL);
        await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);

        await page.getByRole('button', { name: 'Entrar na Plataforma' }).click();

        // Expect to be on dashboard
        // Currently dashboard might be '/' or '/dashboard';
        // Wait for URL to confirm login transition
        await page.waitForURL('**/*');

        // Also check for a header or sidebar element common to Layout
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('aside')).toBeVisible();
    });
});
