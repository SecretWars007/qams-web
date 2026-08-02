import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DefectsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goTo() {
    await this.navigate('/defects');
  }

  async createDefect(title: string, severityId: string, priorityId: string, steps: string) {
    await this.clickButton('Nuevo Defecto');
    await this.fillInput('title', title);
    await this.selectOption('severityId', severityId);
    await this.selectOption('priorityId', priorityId);
    await this.fillTextarea('stepsToReproduce', steps);
    await this.clickButton('Guardar Defecto');
  }

  async verifyDefectInTable(titleId: string) {
    await expect(this.page.locator('table')).toContainText(titleId);
  }
}
