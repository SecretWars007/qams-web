import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model para el módulo Sistemas Bajo Prueba (SUT)
 * Ruta: /systems-under-test
 *
 * El módulo usa tarjetas (cards) en lugar de tabla.
 * El modal de creación/edición usa formControlName para los campos.
 */
export class SystemsUnderTestPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goTo() {
    await this.navigate('/systems-under-test');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyHeading() {
    await expect(
      this.page.locator('h1', { hasText: 'Sistemas Bajo Prueba (SUT)' })
    ).toBeVisible({ timeout: 10000 });
  }

  async openCreateModal() {
    await this.dismissSwal();
    const createBtn = this.page.locator('button', { hasText: 'Nuevo SUT' });
    await createBtn.click();
    // Esperar a que el modal esté visible
    await this.page.locator('form#sut-form').waitFor({ state: 'visible', timeout: 8000 });
  }

  /**
   * Completa el formulario del modal de SUT.
   * platformType puede ser 'WEB', 'DESKTOP' o 'DATA_PROCESSING'.
   * Para tipo WEB selecciona la primera opción del select que contenga "Web".
   */
  async fillSUTForm(name: string, version: string, platformType: string, description: string) {
    await this.page.fill('input[formControlName="name"]', name);
    await this.page.fill('input[formControlName="version"]', version);

    // Seleccionar tipo de plataforma por el option que coincida con el código
    const platformSelect = this.page.locator('select[formControlName="platformTypeId"]');
    const options = await platformSelect.locator('option').all();
    for (const option of options) {
      const text = await option.innerText();
      if (text.toLowerCase().includes(platformType.toLowerCase()) ||
          platformType === 'WEB' && text.toLowerCase().includes('web')) {
        const val = await option.getAttribute('value');
        if (val) {
          await platformSelect.selectOption(val);
          break;
        }
      }
    }

    // Para SUT web, llenar la URL de acceso
    const baseUrlInput = this.page.locator('input[formControlName="baseUrl"]');
    if (await baseUrlInput.isVisible().catch(() => false)) {
      await baseUrlInput.fill('https://localhost:4200');
    }

    if (description) {
      await this.page.fill('textarea[formControlName="description"]', description);
    }
  }

  async submitSUTForm() {
    await this.dismissSwal();
    await this.page.click('button[type="submit"][form="sut-form"]');
    // Esperar Swal de éxito
    const swal = this.page.locator('.swal2-container');
    await swal.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.keyboard.press('Escape');
    await swal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    await this.page.waitForLoadState('networkidle');
  }

  async verifySUTInCards(name: string) {
    // Las tarjetas muestran el nombre en un h3
    await expect(
      this.page.locator('h3', { hasText: name })
    ).toBeVisible({ timeout: 10000 });
  }

  async verifySUTNotInCards(name: string) {
    await expect(
      this.page.locator('h3', { hasText: name })
    ).not.toBeVisible({ timeout: 8000 });
  }

  async verifySUTVersionInCards(name: string, version: string) {
    // La tarjeta del SUT con ese nombre debe mostrar la versión como "v<version>"
    const card = this.page.locator('div', { has: this.page.locator('h3', { hasText: name }) });
    await expect(card.locator(`text=v${version}`)).toBeVisible({ timeout: 10000 });
  }

  async editSUT(name: string, newVersion: string) {
    // Hover sobre la card para que aparezcan los botones de acción
    const card = this.page.locator('div.group', { has: this.page.locator('h3', { hasText: name }) }).first();
    await card.hover();
    await this.page.waitForTimeout(500);

    // Clic en el botón de editar (icono lápiz)
    const editBtn = card.locator('button[title="Editar"]');
    await editBtn.click();

    // Esperar el modal
    await this.page.locator('form#sut-form').waitFor({ state: 'visible', timeout: 8000 });

    // Limpiar y actualizar versión
    const versionInput = this.page.locator('input[formControlName="version"]');
    await versionInput.clear();
    await versionInput.fill(newVersion);

    await this.submitSUTForm();
  }

  async deleteSUT(name: string) {
    // Hover sobre la card
    const card = this.page.locator('div.group', { has: this.page.locator('h3', { hasText: name }) }).first();
    await card.hover();
    await this.page.waitForTimeout(500);

    // Clic en el botón de eliminar (icono papelera)
    const deleteBtn = card.locator('button[title="Eliminar"]');
    await deleteBtn.click();

    // Confirmar en SweetAlert2
    const swal = this.page.locator('.swal2-container');
    await swal.waitFor({ state: 'visible', timeout: 8000 });
    await this.page.click('.swal2-confirm');

    // Esperar confirmación de eliminación
    await this.page.waitForLoadState('networkidle');
  }
}
