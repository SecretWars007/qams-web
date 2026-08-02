import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class TestCasesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goTo() {
    await this.navigate('/test-cases');
  }

  async createTestCase(title: string, description: string, priority: string, action: string, expectedResult: string) {
    await this.clickButton('Nuevo Caso');
    await this.fillInput('title', title);
    await this.fillTextarea('description', description);
    await this.selectOption('priority', priority);
    
    // Add step
    await this.clickButton('Agregar Paso');
    await this.fillInput('action', action);
    await this.fillInput('expectedResult', expectedResult);
    
    await this.clickButton('Guardar Caso');
  }

  async verifyTestCaseInTable(title: string) {
    await expect(this.page.locator('table')).toContainText(title);
  }
}
