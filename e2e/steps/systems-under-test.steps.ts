/**
 * Step Definitions para: systems-under-test.feature
 * Cubre: visualización, creación, edición y eliminación de SUTs.
 */
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { SystemsUnderTestPage } from '../pages/systems-under-test.page';

const { Given, When, Then } = createBdd();

let sutPage: SystemsUnderTestPage;

// ─────────────────────────────────────────────────────────────────────────────
// GIVEN
// ─────────────────────────────────────────────────────────────────────────────

Given('navega a la sección de sistemas bajo prueba', async ({ page }) => {
  sutPage = new SystemsUnderTestPage(page);
  await sutPage.goTo();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN
// ─────────────────────────────────────────────────────────────────────────────

When('abre el formulario de nuevo SUT', async () => {
  await sutPage.openCreateModal();
});

When('completa el formulario del SUT con nombre {string}, versión {string}, tipo {string} y descripción {string}',
  async ({}, name: string, version: string, type: string, description: string) => {
    await sutPage.fillSUTForm(name, version, type, description);
  }
);

When('guarda el formulario del SUT', async () => {
  await sutPage.submitSUTForm();
});

When('edita el SUT llamado {string} cambiando la versión a {string}',
  async ({}, name: string, newVersion: string) => {
    await sutPage.editSUT(name, newVersion);
  }
);

When('elimina el SUT llamado {string}', async ({}, name: string) => {
  await sutPage.deleteSUT(name);
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN
// ─────────────────────────────────────────────────────────────────────────────

Then('verifica que el encabezado de la página es {string}', async ({ page }, heading: string) => {
  await expect(page.locator('h1', { hasText: heading })).toBeVisible({ timeout: 10000 });
});

Then('verifica que el SUT {string} aparece en la lista', async ({}, name: string) => {
  await sutPage.verifySUTInCards(name);
});

Then('verifica que el SUT {string} muestra versión {string}',
  async ({}, name: string, version: string) => {
    await sutPage.verifySUTVersionInCards(name, version);
  }
);

Then('verifica que el SUT {string} ya no aparece en la lista', async ({}, name: string) => {
  await sutPage.verifySUTNotInCards(name);
});
