// src/app/layouts/main-layout/main-layout.component.ts
import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive.directive';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HasPermissionDirective,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- ============ SIDEBAR ============ -->
      <aside
        class="fixed inset-y-0 left-0 z-30 w-64 bg-sidebar text-white
               transform transition-transform duration-300 lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
      >
        <!-- Logo -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div
            class="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span class="text-lg font-bold">QAMS</span>
        </div>

        <!-- Navegación -->
        <nav class="mt-4 px-3 space-y-1">
          <!-- Dashboard -->
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-sidebar-active"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Dashboard
          </a>

          <!-- Proyectos -->
          <a
            *hasPermission="'PROJECTS_VIEW'"
            routerLink="/projects"
            routerLinkActive="bg-sidebar-active"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            Proyectos
          </a>

          <!-- Escenarios -->
          <a
            *hasPermission="'TEST_CASES_VIEW'"
            routerLink="/test-scenarios"
            routerLinkActive="bg-sidebar-active"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Escenarios
          </a>

          <!-- Casos de Prueba -->
          <a
            *hasPermission="'TEST_CASES_VIEW'"
            routerLink="/test-cases"
            routerLinkActive="bg-sidebar-active"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Casos de Prueba
          </a>

          <!-- Ejecuciones -->
          <a
            *hasPermission="'EXECUTIONS_VIEW'"
            routerLink="/test-executions"
            routerLinkActive="bg-sidebar-active"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Ejecuciones
          </a>

          <!-- Kanban -->
          <a
            *hasPermission="'KANBAN_VIEW'"
            routerLink="/kanban"
            routerLinkActive="bg-sidebar-active"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
              />
            </svg>
            Tablero Kanban
          </a>

          <!-- Separador Admin -->
          <div *hasPermission="'USERS_VIEW'" class="pt-4 pb-2">
            <p
              class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              Administración
            </p>
          </div>

          <!-- Usuarios -->
          <a
            *hasPermission="'USERS_VIEW'"
            routerLink="/admin/users"
            routerLinkActive="bg-sidebar-active"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Usuarios
          </a>

          <!-- Roles -->
          <a
            *hasPermission="'ROLES_VIEW'"
            routerLink="/admin/roles"
            routerLinkActive="bg-sidebar-active"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Roles y Permisos
          </a>

          <!-- Catálogos -->
          <a
            *hasPermission="'CATALOGS_VIEW'"
            routerLink="/admin/catalogs"
            routerLinkActive="bg-sidebar-active"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              />
            </svg>
            Catálogos
          </a>
        </nav>
      </aside>

      <!-- ============ CONTENIDO PRINCIPAL ============ -->
      <div class="flex-1 lg:ml-64">
        <!-- Navbar Superior -->
        <header
          class="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8"
        >
          <div class="flex items-center justify-between h-16">
            <!-- Botón hamburguesa (móvil) -->
            <button
              (click)="toggleSidebar()"
              class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <!-- Espaciador -->
            <div class="flex-1"></div>

            <!-- Información del usuario y logout -->
            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium text-gray-900">
                  {{ authService.fullName() }}
                </p>
                <p class="text-xs text-gray-500">Conectado</p>
              </div>

              <!-- Avatar -->
              <div
                class="w-9 h-9 bg-primary-100 text-primary-700 rounded-full
                          flex items-center justify-center font-semibold text-sm"
              >
                {{ getInitials() }}
              </div>

              <!-- Botón Logout -->
              <button
                (click)="authService.logout()"
                class="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600
                             transition-colors"
                title="Cerrar Sesión"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Área de contenido -->
        <main class="p-4 sm:p-6 lg:p-8">
          <router-outlet />
        </main>
      </div>

      <!-- Overlay para cerrar sidebar en móvil -->
      @if (sidebarOpen()) {
        <div
          (click)="toggleSidebar()"
          class="fixed inset-0 z-20 bg-black/50 lg:hidden"
        ></div>
      }
    </div>
  `,
})
export class MainLayoutComponent {
  // Señal para controlar visibilidad del sidebar en móvil
  sidebarOpen = signal(false);

  constructor(public authService: AuthService) { }

  /** Alterna visibilidad del sidebar en móvil */
  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  /** Obtiene las iniciales del nombre del usuario para el avatar */
  getInitials(): string {
    const name = this.authService.fullName();
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
