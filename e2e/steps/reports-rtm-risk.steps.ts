/**
 * Step Definitions para: reports-rtm-risk.feature
 * Cubre: acceso a Reportes, navegación por pestañas (RTM, RBT, Quality Gate)
 * y redirecciones desde rutas /rtm-matrix y /risk-management.
 */
import { createBdd } from 'playwright-bdd';
import { ReportsPage } from '../pages/reports.page';

const { Given, When, Then, Before } = createBdd();

let reportsPage: ReportsPage;

// Inicializar reportsPage antes de cada escenario de este feature
Before(async ({ page }) => {
  reportsPage = new ReportsPage(page);
});

// ─────────────────────────────────────────────────────────────────────────────
// GIVEN - NOTE: 'navega a la sección de reportes' está definido en generate-manual.steps.ts
// Aquí solo definimos steps exclusivos de este feature
// ─────────────────────────────────────────────────────────────────────────────

Given('el usuario navega directamente a la ruta {string}', async ({ page }, route: string) => {
  const baseUrl = process.env['BASE_URL'] ?? 'http://localhost:4200';
  await page.goto(`${baseUrl}/${route}`, { waitUntil: 'networkidle' });
  await page.waitForLoadState('networkidle');
  reportsPage = new ReportsPage(page);
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN
// ─────────────────────────────────────────────────────────────────────────────

When('selecciona la pestaña {string}', async ({}, tabLabel: string) => {
  await reportsPage.selectTab(tabLabel);
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN
// ─────────────────────────────────────────────────────────────────────────────

Then('verifica que la vista de matriz RTM está visible', async () => {
  await reportsPage.verifyRTMVisible();
});

Then('verifica que la vista de gestión de riesgos está visible', async () => {
  await reportsPage.verifyRBTVisible();
});

Then('verifica que los filtros de reporte están disponibles', async () => {
  await reportsPage.verifyQualityGateFilters();
});
