import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ExecutionsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goTo() {
    await this.navigate('/test-executions');
  }

  async createExecution(testCaseName: string, statusId: string, hours: string) {
    await this.clickButton('Nueva Ejecución');
    await this.page.selectOption('select[formControlName="testCaseId"]', { label: testCaseName });
    await this.selectOption('statusId', statusId);
    await this.fillInput('actualTimeHours', hours);
    await this.clickButton('Guardar Ejecución');
  }

  async verifyExecutionStatus(statusText: string) {
    await expect(this.page.locator('table')).toContainText(statusText);
  }
}
