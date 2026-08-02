import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model para el módulo de Reportes
 * Ruta: /reports (rtm-matrix y risk-management redirigen aquí)
 *
 * Pestañas disponibles:
 *  - qualityGate  → Quality Gate & Generación PDF
 *  - rtm          → Matriz RTM
 *  - rbt          → Gestión de Riesgos RBT
 *  - burndown     → Burndown & Métricas
 */
export class ReportsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goTo() {
    await this.navigate('/reports');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyHeading() {
    await expect(
      this.page.locator('h1, h2').filter({ hasText: /Reportes/i })
    ).toBeVisible({ timeout: 10000 });
  }

  async verifyOnReportsPage() {
    await expect(this.page).toHaveURL(/.*reports/, { timeout: 10000 });
  }

  /** Selecciona la pestaña por su label visible */
  async selectTab(tabLabel: string) {
    const tabMap: Record<string, string> = {
      'RTM':         "button:has-text('RTM')",
      'RBT':         "button:has-text('Riesgos')",
      'Quality Gate':"button:has-text('Quality Gate')",
      'Burndown':    "button:has-text('Burndown')",
    };
    const selector = tabMap[tabLabel];
    if (!selector) throw new Error(`Tab desconocida: "${tabLabel}"`);
    await this.page.click(selector);
    await this.page.waitForTimeout(400);
  }

  /** Verifica que el contenedor de la Matriz RTM esté visible */
  async verifyRTMVisible() {
    const rtmContainer = this.page.locator('app-rtm-matrix, [data-testid="rtm-matrix"]');
    await expect(rtmContainer).toBeVisible({ timeout: 10000 });
  }

  /** Verifica que el contenedor de Gestión de Riesgos RBT esté visible */
  async verifyRBTVisible() {
    const rbtContainer = this.page.locator('app-risk-management, [data-testid="risk-management"]');
    await expect(rbtContainer).toBeVisible({ timeout: 10000 });
  }

  /** Verifica que los filtros de Quality Gate estén disponibles */
  async verifyQualityGateFilters() {
    // El tab de Quality Gate muestra filtros de proyecto y botones de generar reporte
    const filterSection = this.page.locator(
      'select[formControlName="projectId"], button:has-text("Generar"), input[formControlName="startDate"]'
    ).first();
    await expect(filterSection).toBeVisible({ timeout: 10000 });
  }

  /** Navega directamente a una ruta y verifica que redirija a /reports */
  async navigateAndVerifyRedirect(route: string) {
    await this.navigate(`/${route}`);
    await expect(this.page).toHaveURL(/.*reports/, { timeout: 10000 });
  }
}
