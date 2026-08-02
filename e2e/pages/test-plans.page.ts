import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class TestPlansPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goTo() {
    await this.navigate('/test-plans');
  }

  async createTestPlan(title: string, description: string, status: string) {
    await this.clickButton('Nuevo Plan');
    await this.fillInput('title', title);
    await this.fillTextarea('description', description);
    await this.selectOption('status', status);
    await this.clickButton('Guardar');
  }

  async verifyTestPlanInTable(title: string) {
    await expect(this.page.locator('table')).toContainText(title);
  }
}
