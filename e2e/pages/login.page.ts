import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goTo() {
    await this.navigate('/auth/login');
  }

  async login(username: string, pass: string) {
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', pass);
    await this.page.click('button[type="submit"]');

    // Esperar a que desaparezca el overlay de SweetAlert2 si aparece
    await this.page.waitForTimeout(500);
    const swal = this.page.locator('.swal2-container');
    if (await swal.isVisible()) {
      await swal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    await this.page.waitForURL(/\/dashboard/, { timeout: 20000 });
  }

  async loginWithInvalidCredentials(username: string, pass: string) {
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', pass);
    await this.page.click('button[type="submit"]');

    // Esperar el Swal de error
    const swal = this.page.locator('.swal2-container');
    await swal.waitFor({ state: 'visible', timeout: 10000 });
  }

  async loginWithEmptyFields() {
    // Clic en submit sin llenar campos
    await this.page.click('button[type="submit"]');

    // Esperar el Swal de advertencia
    const swal = this.page.locator('.swal2-container');
    await swal.waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifySwalErrorVisible() {
    const swal = this.page.locator('.swal2-container');
    await expect(swal).toBeVisible();
  }

  async verifySwalTitle(expectedTitle: string) {
    const swalTitle = this.page.locator('.swal2-title');
    await expect(swalTitle).toContainText(expectedTitle);
  }

  async verifyDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 20000 });
  }

  async logout() {
    // Buscar el botón de cerrar sesión en el sidebar o menú
    const logoutBtn = this.page.locator('[data-testid="logout-btn"], button:has-text("Cerrar"), button:has-text("Salir"), a:has-text("Cerrar sesión")').first();

    // Si hay un avatar/menú de usuario, intentar abrirlo primero
    const userMenuBtn = this.page.locator('[data-testid="user-menu"], .user-avatar, button:has-text("Perfil")').first();
    if (await userMenuBtn.isVisible().catch(() => false)) {
      await userMenuBtn.click();
      await this.page.waitForTimeout(500);
    }

    await logoutBtn.click();
    await this.page.waitForURL(/\/auth\/login/, { timeout: 10000 });
  }

  async verifyLoginPage() {
    await expect(this.page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  }
}
