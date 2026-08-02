import { Page } from '@playwright/test';

export class BasePage {
  constructor(public readonly page: Page) {}

  async navigate(path: string) {
    // Asegurar que todas las peticiones a /api incluyan X-Skip-Encryption (una sola vez por contexto)
    await this.page.route('**/api/**', async (route) => {
      const headers = {
        ...route.request().headers(),
        'X-Skip-Encryption': 'true',
      };
      await route.continue({ headers });
    });
    await this.page.goto(`http://localhost:4200${path}`, { waitUntil: 'networkidle' });
  }

  /** Cierra el modal SweetAlert2 si está visible antes de interactuar con la UI */
  async dismissSwal() {
    const swal = this.page.locator('.swal2-container');
    if (await swal.isVisible().catch(() => false)) {
      // Intenta presionar Escape para cerrarlo
      await this.page.keyboard.press('Escape');
      await swal.waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {});
    }
  }

  async clickButton(text: string) {
    await this.dismissSwal();
    await this.page.click(`button:has-text("${text}")`);
  }

  async fillInput(formControlName: string, value: string) {
    await this.page.fill(`input[formControlName="${formControlName}"]`, value);
  }

  async fillTextarea(formControlName: string, value: string) {
    await this.page.fill(`textarea[formControlName="${formControlName}"]`, value);
  }

  async selectOption(formControlName: string, value: string) {
    await this.page.selectOption(`select[formControlName="${formControlName}"]`, value);
  }
}
