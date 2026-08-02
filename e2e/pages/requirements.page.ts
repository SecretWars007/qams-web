import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class RequirementsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goTo() {
    await this.navigate('/requirements');
  }

  async createRequirement(title: string, description: string, type: string, priority: string) {
    await this.clickButton('Nuevo Requisito');
    await this.fillInput('title', title);
    await this.fillTextarea('description', description);
    await this.selectOption('type', type);
    await this.selectOption('priority', priority);
    await this.clickButton('Guardar');
  }

  async verifyRequirementInTable(title: string) {
    await expect(this.page.locator('table')).toContainText(title);
  }
}
