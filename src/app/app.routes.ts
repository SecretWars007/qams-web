// src/app/app.routes.ts
// Configuración de rutas con lazy loading y guards de seguridad
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  // ====== RUTAS PÚBLICAS (Sin autenticación) ======
  {
    path: 'auth',
    // Lazy load del layout de autenticación
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(
        (m) => m.AuthLayoutComponent,
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login/login.component').then(
            (m) => m.LoginComponent,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ====== RUTAS PROTEGIDAS (Requieren autenticación) ======
  {
    path: '',
    // Lazy load del layout principal con sidebar
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    // Guard de autenticación para todas las rutas hijas
    canActivate: [authGuard],
    children: [
      // Dashboard (página principal)
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
        data: { permission: 'DASHBOARD_VIEW' },
        canActivate: [permissionGuard],
      },

      // Cambiar Contraseña (Cualquier usuario autenticado)
      {
        path: 'change-password',
        loadComponent: () =>
          import('./features/auth/change-password/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
      },

      // Proyectos
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/projects/projects.component').then(
            (m) => m.ProjectsComponent,
          ),
        data: { permission: 'PROJECTS_VIEW' },
        canActivate: [permissionGuard],
      },

      // Casos de Prueba
      {
        path: 'test-cases',
        loadComponent: () =>
          import('./features/test-cases/test-cases.component').then(
            (m) => m.TestCasesComponent,
          ),
        data: { permission: 'TEST_CASES_VIEW' },
        canActivate: [permissionGuard],
      },

      // Escenarios (Test Suites)
      {
        path: 'test-scenarios',
        loadComponent: () =>
          import('./features/test-scenarios/test-scenarios.component').then(
            (m) => m.TestScenariosComponent,
          ),
        data: { permission: 'TEST_CASES_VIEW' }, // Use same permission for now
        canActivate: [permissionGuard],
      },

      // Ejecuciones de Prueba
      {
        path: 'test-executions',
        loadComponent: () =>
          import('./features/test-executions/test-executions.component').then(
            (m) => m.TestExecutionsComponent,
          ),
        data: { permission: 'EXECUTIONS_VIEW' },
        canActivate: [permissionGuard],
      },

      // Ejecución individual (detalle)
      {
        path: 'test-executions/:id',
        loadComponent: () =>
          import('./features/test-executions/execution-detail/execution-detail.component').then(
            (m) => m.ExecutionDetailComponent,
          ),
        data: { permission: 'EXECUTIONS_VIEW' },
        canActivate: [permissionGuard],
      },

      // Reportes
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then(
            (m) => m.ReportsComponent,
          ),
        data: { permission: 'DASHBOARD_VIEW' },
        canActivate: [permissionGuard],
      },

      // Reporte Burndown
      {
        path: 'burndown-report',
        loadComponent: () =>
          import('./features/burndown-report/burndown-report.component').then(
            (m) => m.BurndownReportComponent,
          ),
        data: { permission: 'DASHBOARD_VIEW' },
        canActivate: [permissionGuard],
      },

      // Tablero Kanban
      {
        path: 'kanban',
        loadComponent: () =>
          import('./features/kanban/kanban.component').then(
            (m) => m.KanbanComponent,
          ),
        data: { permission: 'KANBAN_VIEW' },
        canActivate: [permissionGuard],
      },

      // Admin: Usuarios
      {
        path: 'admin/users',
        loadComponent: () =>
          import('./features/admin/users/users.component').then(
            (m) => m.UsersComponent,
          ),
        data: { permission: 'USERS_VIEW' },
        canActivate: [permissionGuard],
      },

      // Admin: Roles
      {
        path: 'admin/roles',
        loadComponent: () =>
          import('./features/admin/roles/roles.component').then(
            (m) => m.RolesComponent,
          ),
        data: { permission: 'ROLES_VIEW' },
        canActivate: [permissionGuard],
      },

      // Admin: Catálogos
      {
        path: 'admin/catalogs',
        loadComponent: () =>
          import('./features/admin/catalogs/catalogs.component').then(
            (m) => m.CatalogsComponent,
          ),
        data: { permission: 'CATALOGS_VIEW' },
        canActivate: [permissionGuard],
      },

      // Redireccion por defecto
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Ruta catch-all: redirigir a auth/login
  { path: '**', redirectTo: 'auth/login' },
];
