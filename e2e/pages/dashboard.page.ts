import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goTo() {
    await this.navigate('/dashboard');
  }

  async verifyOnDashboard() {
    await expect(this.page.locator('h1')).toContainText('Tablero de Control QA');
  }

  async verifyMetricsLoaded() {
    await expect(this.page.getByText('Proyectos activos').locator('..').locator('p').nth(1)).not.toBeEmpty();
  }
}
