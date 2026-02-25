import { Component, signal, inject, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { filter } from 'rxjs/operators';

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
    <div class="min-h-screen bg-gray-50 flex overflow-hidden">
      <!-- ============ SIDEBAR ============ -->
      <aside
        class="fixed inset-y-0 left-0 z-40 w-72 bg-gray-900 text-white
               transform transition-all duration-300 ease-in-out lg:translate-x-0 border-r border-white/5 shadow-2xl shadow-black/50"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
      >
        <!-- Logo -->
        <div class="flex items-center gap-3 px-8 py-6 border-b border-white/5 mb-2">
          <div
            class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            <i class="fas fa-microscope text-lg"></i>
          </div>
          <div>
            <span class="text-xl font-black tracking-tight block">QAMS</span>
            <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Quality Assurance</span>
          </div>
        </div>

        <!-- Navegación -->
        <nav class="mt-2 px-4 space-y-1 h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar pb-10">
          <p class="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 mt-6">Menú Principal</p>
          
          <!-- Dashboard -->
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-white/10 text-white border-l-4 border-indigo-500"
            [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <i class="fas fa-home-alt w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-semibold">Dashboard</span>
          </a>

          <!-- Proyectos -->
          <a
            *hasPermission="'PROJECTS_VIEW'"
            routerLink="/projects"
            routerLinkActive="bg-white/10 text-white border-l-4 border-indigo-500"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <i class="fas fa-project-diagram w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-semibold">Proyectos</span>
          </a>

          <!-- Escenarios -->
          <a
            *hasPermission="'TEST_CASES_VIEW'"
            routerLink="/test-scenarios"
            routerLinkActive="bg-white/10 text-white border-l-4 border-indigo-500"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <i class="fas fa-layer-group w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-semibold">Escenarios</span>
          </a>

          <!-- Casos de Prueba -->
          <a
            *hasPermission="'TEST_CASES_VIEW'"
            routerLink="/test-cases"
            routerLinkActive="bg-white/10 text-white border-l-4 border-indigo-500"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <i class="fas fa-clipboard-list w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-semibold">Casos de Prueba</span>
          </a>

          <!-- Ejecuciones -->
          <a
            *hasPermission="'EXECUTIONS_VIEW'"
            routerLink="/test-executions"
            routerLinkActive="bg-white/10 text-white border-l-4 border-indigo-500"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <i class="fas fa-play-circle w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-semibold">Ejecuciones</span>
          </a>

          <!-- Kanban -->
          <a
            *hasPermission="'KANBAN_VIEW'"
            routerLink="/kanban"
            routerLinkActive="bg-white/10 text-white border-l-4 border-indigo-500"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <i class="fas fa-columns w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-semibold">Tablero Kanban</span>
          </a>

          <!-- Reportes -->
          <a
            *hasPermission="'DASHBOARD_VIEW'"
            routerLink="/reports"
            routerLinkActive="bg-white/10 text-white border-l-4 border-indigo-500"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <i class="fas fa-file-invoice-dollar w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-semibold">Reportes</span>
          </a>

          <!-- Separador Admin -->
          <div *hasPermission="'USERS_VIEW'" class="pt-8 pb-2">
            <p
              class="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest"
            >
              Seguridad y Control
            </p>
          </div>

          <!-- Usuarios -->
          <a
            *hasPermission="'USERS_VIEW'"
            routerLink="/admin/users"
            routerLinkActive="bg-white/10 text-white border-l-4 border-indigo-500"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <i class="fas fa-users w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-semibold">Usuarios</span>
          </a>

          <!-- Roles -->
          <a
            *hasPermission="'ROLES_VIEW'"
            routerLink="/admin/roles"
            routerLinkActive="bg-white/10 text-white border-l-4 border-indigo-500"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <i class="fas fa-user-shield w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-semibold">Roles y Permisos</span>
          </a>

          <!-- Catálogos -->
          <a
            *hasPermission="'CATALOGS_VIEW'"
            routerLink="/admin/catalogs"
            routerLinkActive="bg-white/10 text-white border-l-4 border-indigo-500"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <i class="fas fa-database w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-semibold">Catálogos</span>
          </a>
        </nav>
      </aside>

      <!-- ============ CONTENIDO PRINCIPAL ============ -->
      <div class="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-72 bg-gray-950">
        <!-- Navbar Superior -->
        <header
          class="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 lg:px-8 shadow-sm"
        >
          <div class="flex items-center justify-between h-20">
            <!-- Botón hamburguesa (móvil) -->
            <button
              (click)="toggleSidebar($event)"
              class="lg:hidden p-3 rounded-2xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all border border-white/10"
            >
              <i class="fas" [class.fa-bars]="!sidebarOpen()" [class.fa-times]="sidebarOpen()"></i>
            </button>

            <!-- Espaciador -->
            <div class="flex-1"></div>

            <!-- Información del usuario y logout -->
            <div class="flex items-center gap-3 sm:gap-6">
              <div class="flex flex-col items-end hidden sm:flex">
                <p class="text-sm font-bold text-white tracking-tight leading-tight">
                  {{ authService.fullName() }}
                </p>
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Online</p>
                </div>
              </div>

              <!-- Avatar con Menú (Simplificado) -->
              <div
                class="w-11 h-11 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 rounded-2xl
                          flex items-center justify-center font-black text-sm border border-indigo-500/20 shadow-lg shadow-indigo-500/10"
              >
                {{ getInitials() }}
              </div>

              <!-- Botón Logout -->
              <button
                (click)="authService.logout()"
                class="w-11 h-11 rounded-2xl bg-white/5 text-gray-500 hover:bg-rose-500/10 hover:text-rose-400
                             transition-all border border-white/10 flex items-center justify-center group"
                title="Cerrar Sesión"
              >
                <i class="fas fa-sign-out-alt group-hover:scale-110 transition-transform"></i>
              </button>
            </div>
          </div>
        </header>

        <!-- Área de contenido -->
        <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-10">
          <div class="max-w-screen-2xl mx-auto animate-in fade-in duration-500">
            <router-outlet />
          </div>
        </main>
      </div>

      <!-- Overlay para cerrar sidebar en móvil -->
      <div
        *ngIf="sidebarOpen()"
        (click)="toggleSidebar($event)"
        class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300"
      ></div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
  `]
})
export class MainLayoutComponent {
  // Señal para controlar visibilidad del sidebar en móvil
  sidebarOpen = signal(false);

  private router = inject(Router);

  constructor(public authService: AuthService) {
    // Escuchar cambios de ruta para cerrar el sidebar en móvil
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.sidebarOpen.set(false);
    });
  }

  /** Alterna visibilidad del sidebar en móvil */
  toggleSidebar(event?: Event): void {
    if (event) event.stopPropagation();
    this.sidebarOpen.update((v) => !v);
  }

  /** Obtiene las iniciales del nombre del usuario para el avatar */
  getInitials(): string {
    const name = this.authService.fullName();
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
