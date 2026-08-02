import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, Then } = createBdd();

Given('navega a {string}', async ({ page }, url: string) => {
  await page.goto(`http://localhost:4200/${url}`, { waitUntil: 'networkidle' });
});

Then('verifica que el encabezado es {string}', async ({ page }, heading: string) => {
  await expect(page.locator('h1', { hasText: heading })).toBeVisible();
});
