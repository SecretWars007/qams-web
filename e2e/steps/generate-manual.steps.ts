import { createBdd } from 'playwright-bdd';
import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { ProjectsPage } from '../pages/projects.page';
import { RequirementsPage } from '../pages/requirements.page';
import { TestCasesPage } from '../pages/test-cases.page';
import { ExecutionsPage } from '../pages/executions.page';
import { DefectsPage } from '../pages/defects.page';
import { ReportsPage } from '../pages/reports.page';

const { Given, When, Then } = createBdd();

let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let projectsPage: ProjectsPage;
let requirementsPage: RequirementsPage;
let testCasesPage: TestCasesPage;
let executionsPage: ExecutionsPage;
let defectsPage: DefectsPage;
let reportsPage: ReportsPage;

// Helper to take screenshots
async function takeScreenshot(page: any, filename: string) {
  const imagesDir = path.join(__dirname, '../../docs/images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  await page.waitForTimeout(1000); // Wait for animations
  await page.screenshot({ path: path.join(imagesDir, `${filename}.png`), fullPage: true });
}

Given('el usuario {string} navega al login', async ({ page }, username: string) => {
  loginPage = new LoginPage(page);
  await loginPage.goTo();
});

When('ingresa el usuario {string} y contraseña {string}', async ({ page }, username: string, password: string) => {
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
});

When('hace clic en ingresar', async ({ page }) => {
  await page.click('button[type="submit"]');
});

Then('toma una captura de pantalla {string}', async ({ page }, filename: string) => {
  await takeScreenshot(page, filename);
});

When('abre el formulario de nuevo proyecto y lo llena con nombre {string} y descripción {string}', async ({ page }, name: string, description: string) => {
  projectsPage = new ProjectsPage(page);
  await projectsPage.clickButton('Nuevo Proyecto');
  await page.waitForTimeout(500);
  await projectsPage.fillInput('name', name);
  await projectsPage.fillTextarea('description', description);
});

When('guarda el proyecto', async ({ page }) => {
  await projectsPage.clickButton('Guardar');
});

When('abre el formulario de nuevo caso y lo llena con título {string} y descripción {string}', async ({ page }, title: string, description: string) => {
  testCasesPage = new TestCasesPage(page);
  await testCasesPage.clickButton('Nuevo Caso');
  await page.waitForTimeout(500);
  await testCasesPage.fillInput('title', title);
  await testCasesPage.fillTextarea('description', description);
});

Given('navega a la sección de reportes', async ({ page }) => {
  reportsPage = new ReportsPage(page);
  await reportsPage.goTo();
});
