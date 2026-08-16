import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, Then } = createBdd();

Given('navega a {string}', async ({ page }, url: string) => {
  const baseUrl = process.env['BASE_URL'] ?? 'http://localhost:4200';
  await page.goto(`${baseUrl}/${url}`, { waitUntil: 'networkidle' });
});

Then('verifica que el encabezado es {string}', async ({ page }, heading: string) => {
  await expect(page.locator('h1', { hasText: heading })).toBeVisible();
});
