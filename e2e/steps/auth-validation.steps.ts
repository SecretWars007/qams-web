/**
 * Step Definitions para: auth-validation.feature
 * Cubre: login exitoso, login fallido, campos vacíos y logout.
 */
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

const { Given, When, Then } = createBdd();

// ─────────────────────────────────────────────────────────────────────────────
// GIVEN
// ─────────────────────────────────────────────────────────────────────────────

Given('el usuario navega a la página de login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN
// ─────────────────────────────────────────────────────────────────────────────

When('ingresa credenciales válidas con usuario {string} y contraseña {string}', async ({ page }, username: string, password: string) => {
  const loginPage = new LoginPage(page);
  await loginPage.login(username, password);
});

When('ingresa credenciales inválidas con usuario {string} y contraseña {string}', async ({ page }, username: string, password: string) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginWithInvalidCredentials(username, password);
});

When('hace clic en ingresar sin completar los campos', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginWithEmptyFields();
});

When('cierra sesión desde el menú de usuario', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.logout();
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN
// ─────────────────────────────────────────────────────────────────────────────

Then('es redirigido al dashboard', async ({ page }) => {
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
});

Then('ve un mensaje de error de acceso', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.verifySwalErrorVisible();
  await loginPage.verifySwalTitle('Error');
});

Then('ve una alerta de campos obligatorios', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.verifySwalErrorVisible();
  // El componente muestra "Atención" cuando los campos están vacíos
  await loginPage.verifySwalTitle('Atención');
});

Then('es redirigido a la página de login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.verifyLoginPage();
});

Then('es redirigido al módulo de reportes', async ({ page }) => {
  await expect(page).toHaveURL(/.*reports/, { timeout: 10000 });
});
