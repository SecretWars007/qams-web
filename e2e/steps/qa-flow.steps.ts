import { createBdd } from 'playwright-bdd';

import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { ProjectsPage } from '../pages/projects.page';
import { TestPlansPage } from '../pages/test-plans.page';
import { RequirementsPage } from '../pages/requirements.page';
import { TestCasesPage } from '../pages/test-cases.page';
import { ExecutionsPage } from '../pages/executions.page';
import { DefectsPage } from '../pages/defects.page';

// Playwright BDD init
const { Given, When, Then } = createBdd();

let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let projectsPage: ProjectsPage;
let testPlansPage: TestPlansPage;
let requirementsPage: RequirementsPage;
let testCasesPage: TestCasesPage;
let executionsPage: ExecutionsPage;
let defectsPage: DefectsPage;

Given('el usuario {string} inicia sesión con la contraseña {string}', async ({ page }, username: string, password: string) => {
  loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.login(username, password);
});

Then('verifica que se muestra el dashboard principal', async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  loginPage = new LoginPage(page);
  await loginPage.verifyDashboard();
});

// Proyectos
Given('navega a la sección de proyectos', async ({ page }) => {
  projectsPage = new ProjectsPage(page);
  await projectsPage.goTo();
});

When('crea un nuevo proyecto llamado {string} con la descripción {string}', async ({}, name: string, description: string) => {
  await projectsPage.createProject(name, description);
});

Then('verifica que el proyecto {string} existe en la tabla', async ({}, name: string) => {
  await projectsPage.verifyProjectInTable(name);
});

Then('establece el proyecto {string} como activo', async ({}, name: string) => {
  await projectsPage.activateProject(name);
});

// Test Plans
Given('navega a la sección de test plans', async ({ page }) => {
  testPlansPage = new TestPlansPage(page);
  await testPlansPage.goTo();
});

When('crea un nuevo plan de pruebas con título {string}, descripción {string} y estado {string}', async ({}, title: string, description: string, status: string) => {
  await testPlansPage.createTestPlan(title, description, status);
});

Then('verifica que el plan {string} existe en la tabla', async ({}, title: string) => {
  await testPlansPage.verifyTestPlanInTable(title);
});

// Requisitos
Given('navega a la sección de requisitos', async ({ page }) => {
  requirementsPage = new RequirementsPage(page);
  await requirementsPage.goTo();
});

When('crea un requisito con título {string}, descripción {string}, tipo {string} y prioridad {string}', async ({}, title: string, description: string, type: string, priority: string) => {
  await requirementsPage.createRequirement(title, description, type, priority);
});

Then('verifica que el requisito {string} existe en la tabla', async ({}, title: string) => {
  await requirementsPage.verifyRequirementInTable(title);
});

// Test Cases
Given('navega a la sección de test cases', async ({ page }) => {
  testCasesPage = new TestCasesPage(page);
  await testCasesPage.goTo();
});

When('crea un caso de prueba {string}, descripción {string}, prioridad {string}, acción del paso {string} y resultado esperado {string}', async ({}, title: string, description: string, priority: string, action: string, expectedResult: string) => {
  await testCasesPage.createTestCase(title, description, priority, action, expectedResult);
});

Then('verifica que el caso {string} existe en la tabla', async ({}, title: string) => {
  await testCasesPage.verifyTestCaseInTable(title);
});

// Executions
Given('navega a la sección de test executions', async ({ page }) => {
  executionsPage = new ExecutionsPage(page);
  await executionsPage.goTo();
});

When('registra una ejecución para el caso {string} con estado {string} y {string} hora', async ({}, testCase: string, statusId: string, hours: string) => {
  await executionsPage.createExecution(testCase, statusId, hours);
});

Then('verifica que la ejecución muestra estado {string}', async ({}, statusText: string) => {
  await executionsPage.verifyExecutionStatus(statusText);
});

// Defects
Given('navega a la sección de defectos', async ({ page }) => {
  defectsPage = new DefectsPage(page);
  await defectsPage.goTo();
});

When('reporta un defecto {string}, severidad {string}, prioridad {string} y pasos {string}', async ({}, title: string, severityId: string, priorityId: string, steps: string) => {
  await defectsPage.createDefect(title, severityId, priorityId, steps);
});

Then('verifica que el defecto {string} existe en la tabla', async ({}, title: string) => {
  await defectsPage.verifyDefectInTable(title);
});

// Dashboard
Given('navega al dashboard', async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  await dashboardPage.goTo();
});

Then('verifica que el dashboard está cargado', async () => {
  await dashboardPage.verifyOnDashboard();
});

Then('verifica que las métricas de proyectos están visibles', async () => {
  await dashboardPage.verifyMetricsLoaded();
});
