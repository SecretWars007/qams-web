import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ProjectsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goTo() {
    await this.navigate('/projects');
  }

  async createProject(name: string, description: string) {
    await this.clickButton('Nuevo Proyecto');
    await this.fillInput('name', name);
    await this.fillTextarea('description', description);
    await this.clickButton('Guardar');
  }

  async verifyProjectInTable(name: string) {
    await expect(this.page.locator('table')).toContainText(name);
  }

  async activateProject(name: string) {
    await this.page.locator('tr', { hasText: name }).locator('button:has-text("Activar")').click();
  }
}
