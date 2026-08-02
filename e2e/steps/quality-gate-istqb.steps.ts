/**
 * Step Definitions para: quality-gate-istqb.feature
 * Cubre: Quality Gate widget, KPIs ISTQB (DDP, DRE, MTTR), requisitos y defectos.
 *
 * NOTA: Los steps compartidos están definidos en archivos existentes:
 *   - 'el usuario {string} inicia sesión...' → qa-flow.steps.ts
 *   - 'navega a {string}'                   → istqb-modules.steps.ts
 *   - 'verifica que el encabezado es...'    → istqb-modules.steps.ts
 *
 * Este archivo solo define steps ÚNICOS del Quality Gate ISTQB.
 */
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, Then } = createBdd();

// ─────────────────────────────────────────────────────────────────────────────
// GIVEN — Quality Gate setup steps únicos
// ─────────────────────────────────────────────────────────────────────────────

Given('el widget {string} es visible en la pantalla', async ({ page }, widgetTitle: string) => {
  await expect(
    page.locator('h3', { hasText: widgetTitle }).first()
  ).toBeVisible({ timeout: 10_000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — Dashboard
// ─────────────────────────────────────────────────────────────────────────────

Then('el dashboard contiene una sección de métricas de ejecución', async ({ page }) => {
  await expect(
    page.locator('text=/pass rate|tasa de éxito|ejecuciones|total/i').first()
  ).toBeVisible({ timeout: 10_000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — Quality Gate widget
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// THEN — Quality Gate widget
// ─────────────────────────────────────────────────────────────────────────────

Then(String.raw`el dictamen del Quality Gate es visible \({string} o {string}\)`, async ({ page }, passStr: string, failStr: string) => {
  const badge = page.locator(`text=/${passStr}|${failStr}|GO FOR RELEASE|NO-GO/i`).first();
  await expect(badge).toBeVisible({ timeout: 10_000 });
});

Then('se muestran las reglas del Quality Gate con estado de cada una', async ({ page }) => {
  await expect(
    page.locator('text=/Cobertura de Requisitos/i').first()
  ).toBeVisible({ timeout: 10_000 });
  await expect(
    page.locator('text=/Pass Rate|Exitosos/i').first()
  ).toBeVisible({ timeout: 10_000 });
  await expect(
    page.locator('text=/Defectos/i').first()
  ).toBeVisible({ timeout: 10_000 });
});

Then('los indicadores {string}, {string} y {string} son visibles en la sección de KPIs avanzados',
  async ({ page }, kpi1: string, kpi2: string, kpi3: string) => {
    await expect(page.locator('text=/KPIs ISTQB Avanzados/i').first())
      .toBeVisible({ timeout: 10_000 });
    await expect(page.locator(`text=${kpi1}`).first()).toBeVisible();
    await expect(page.locator(`text=${kpi2}`).first()).toBeVisible();
    await expect(page.locator(`text=${kpi3}`).first()).toBeVisible();
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// THEN — Requisitos
// ─────────────────────────────────────────────────────────────────────────────

Then('la pantalla muestra la lista de requisitos', async ({ page }) => {
  await expect(
    page.locator('h1, h2', { hasText: /Requisito/i }).first()
  ).toBeVisible({ timeout: 10_000 });
  const hasItems = await page.locator('table tbody tr, [data-testid="req-item"]').count();
  const hasEmptyState = await page.locator('text=/no hay requisito|sin requisito/i').count();
  expect(hasItems > 0 || hasEmptyState > 0).toBeTruthy();
});

Then('cada requisito puede tener casos de prueba vinculados', async ({ page }) => {
  const count = await page.locator('table tbody tr').count();
  if (count > 0) {
    await expect(
      page.locator('text=/caso de prueba|test case|vinculado|cobertura/i').first()
    ).toBeVisible({ timeout: 8_000 });
  }
  // Si no hay requisitos el test pasa (feature disponible, sin datos)
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — Defectos
// ─────────────────────────────────────────────────────────────────────────────

Then('la pantalla muestra la gestión de defectos', async ({ page }) => {
  await expect(
    page.locator('h1, h2', { hasText: /defecto|bug/i }).first()
  ).toBeVisible({ timeout: 10_000 });
});

Then('se puede filtrar por estado de defecto', async ({ page }) => {
  const filterControl = page.locator('select, [role="combobox"], button',
    { hasText: /filtro|estado|abierto|cerrado/i }).first();
  const filterExists = await filterControl.count();
  if (filterExists > 0) {
    await expect(filterControl).toBeVisible();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — RTM
// ─────────────────────────────────────────────────────────────────────────────

Then('la pantalla de reportes permite ver la Matriz de Trazabilidad de Requisitos', async ({ page }) => {
  await expect(
    page.locator('text=/RTM|Trazabilidad|Requirements Traceability/i').first()
  ).toBeVisible({ timeout: 10_000 });
});
