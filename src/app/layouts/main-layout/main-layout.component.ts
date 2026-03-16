import { Component, signal, inject, effect, ChangeDetectorRef } from '@angular/core';
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
    <div class="min-h-screen bg-[#F6F6F8] flex overflow-hidden font-display text-slate-800 relative">
      <!-- Background Pattern Layer (Forced Visibility) -->
      <div 
        class="fixed inset-0 opacity-[0.25] pointer-events-none transition-opacity duration-700"
        style="background-image: url('/images/bg-qa.png?v=4'); background-repeat: repeat; background-size: 800px; z-index: 1;"
      ></div>

      <!-- ============ SIDEBAR ============ -->
      <aside
        class="fixed inset-y-0 left-0 z-40 w-72 bg-[#0B0F19]/95 backdrop-blur-xl text-white flex flex-col
               transform transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
      >
        <!-- Logo -->
        <div class="flex flex-col px-6 py-6 border-b border-white/5 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden">
              <img src="/images/logo.png" alt="QAMS logo" class="w-full h-full object-cover" />
            </div>
            <span class="text-white font-bold text-xl tracking-tight">QAMS</span>
          </div>
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-1">Quality Assurance</span>
        </div>

        <!-- Navegación -->
        <nav class="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-6">
          <p class="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-2">Menú Principal</p>
          
          <!-- Dashboard -->
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-[#150fbd]/20 text-white border-l-4 border-[#150fbd] shadow-[inset_0_0_20px_rgba(21,15,189,0.15)]"
            [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <i class="fas fa-home-alt w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-semibold">Dashboard</span>
          </a>

          <!-- Proyectos -->
          <a
            *hasPermission="'PROJECTS_VIEW'"
            routerLink="/projects"
            routerLinkActive="bg-[#150fbd]/20 text-white border-l-4 border-[#150fbd] shadow-[inset_0_0_20px_rgba(21,15,189,0.15)]"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <i class="fas fa-folder w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-medium group-[.active]:font-semibold">Proyectos</span>
          </a>

          <!-- Escenarios -->
          <a
            *hasPermission="'TEST_CASES_VIEW'"
            routerLink="/test-scenarios"
            routerLinkActive="bg-[#150fbd]/20 text-white border-l-4 border-[#150fbd] shadow-[inset_0_0_20px_rgba(21,15,189,0.15)]"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <i class="fas fa-layer-group w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-medium group-[.active]:font-semibold">Escenarios</span>
          </a>

          <!-- Casos de Prueba -->
          <a
            *hasPermission="'TEST_CASES_VIEW'"
            routerLink="/test-cases"
            routerLinkActive="bg-[#150fbd]/20 text-white border-l-4 border-[#150fbd] shadow-[inset_0_0_20px_rgba(21,15,189,0.15)]"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <i class="fas fa-clipboard-check w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-medium group-[.active]:font-semibold">Casos de Prueba</span>
          </a>

          <!-- Ejecuciones -->
          <a
            *hasPermission="'EXECUTIONS_VIEW'"
            routerLink="/test-executions"
            routerLinkActive="bg-[#150fbd]/20 text-white border-l-4 border-[#150fbd] shadow-[inset_0_0_20px_rgba(21,15,189,0.15)]"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <i class="fas fa-play-circle w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-medium group-[.active]:font-semibold">Ejecuciones</span>
          </a>

          <!-- Kanban -->
          <a
            *hasPermission="'KANBAN_VIEW'"
            routerLink="/kanban"
            routerLinkActive="bg-[#150fbd]/20 text-white border-l-4 border-[#150fbd] shadow-[inset_0_0_20px_rgba(21,15,189,0.15)]"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <i class="fas fa-columns w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-medium group-[.active]:font-semibold">Tablero Kanban</span>
          </a>

          <!-- Reportes -->
          <a
            *hasPermission="'DASHBOARD_VIEW'"
            routerLink="/reports"
            routerLinkActive="bg-[#150fbd]/20 text-white border-l-4 border-[#150fbd] shadow-[inset_0_0_20px_rgba(21,15,189,0.15)]"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <i class="fas fa-chart-pie w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span class="font-medium group-[.active]:font-semibold">Reportes</span>
          </a>

          <!-- Separador Admin -->
          <ng-container *ngIf="authService.isAdmin()">
            <div class="pt-6 pb-2">
              <p class="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Configuración
              </p>
            </div>

            <!-- Usuarios -->
            <a
              routerLink="/admin/users"
              routerLinkActive="bg-[#150fbd]/20 text-white border-l-4 border-[#150fbd] shadow-[inset_0_0_20px_rgba(21,15,189,0.15)]"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                      text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <i class="fas fa-users w-5 text-center group-hover:scale-110 transition-transform"></i>
              <span class="font-medium group-[.active]:font-semibold">Usuarios</span>
            </a>

            <!-- Roles -->
            <a
              routerLink="/admin/roles"
              routerLinkActive="bg-[#150fbd]/20 text-white border-l-4 border-[#150fbd] shadow-[inset_0_0_20px_rgba(21,15,189,0.15)]"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                      text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <i class="fas fa-shield-alt w-5 text-center group-hover:scale-110 transition-transform"></i>
              <span class="font-medium group-[.active]:font-semibold">Roles y Permisos</span>
            </a>

            <!-- Catálogos -->
            <a
              routerLink="/admin/catalogs"
              routerLinkActive="bg-[#150fbd]/20 text-white border-l-4 border-[#150fbd] shadow-[inset_0_0_20px_rgba(21,15,189,0.15)]"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                      text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <i class="fas fa-database w-5 text-center group-hover:scale-110 transition-transform"></i>
              <span class="font-medium group-[.active]:font-semibold">Catálogos</span>
            </a>

            <!-- Test Reset Password -->
            <a
              routerLink="/auth/reset-password"
              routerLinkActive="bg-[#150fbd]/20 text-white border-l-4 border-[#150fbd] shadow-[inset_0_0_20px_rgba(21,15,189,0.15)]"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                      text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all group mt-6 border border-rose-500/10"
            >
              <i class="fas fa-key w-5 text-center group-hover:scale-110 transition-transform"></i>
              <span class="font-medium group-[.active]:font-semibold">Test Reset Password</span>
            </a>
          </ng-container>
        </nav>
      </aside>

      <!-- ============ CONTENIDO PRINCIPAL ============ -->
      <div class="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-72 bg-transparent">
        <!-- Header -->
        <header
          class="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between"
        >
          <div class="flex items-center gap-4">
             <!-- Botón hamburguesa (móvil) -->
             <button
                (click)="toggleSidebar($event)"
                class="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <i class="fas" [class.fa-bars]="!sidebarOpen()" [class.fa-times]="sidebarOpen()"></i>
              </button>

            <div class="hidden sm:flex flex-col">
              <nav class="flex items-center text-xs text-slate-500 mb-1 font-medium">
                <span>QAMS</span>
                <i class="fas fa-chevron-right text-[8px] mx-2 text-slate-300"></i>
                <span class="text-[#150fbd]">Portal</span>
              </nav>
              <!-- We can add a dynamic title later or leave it to standard views -->
            </div>
          </div>

          <div class="flex items-center gap-5">
            <button class="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 relative hover:text-slate-800 transition-colors shadow-sm">
              <i class="fas fa-bell"></i>
              <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            <!-- Separator -->
            <div class="hidden sm:block h-8 w-px bg-slate-200"></div>

            <!-- User Info & Avatar -->
            <div class="flex items-center gap-3 relative">
              <div class="flex flex-col items-end hidden sm:flex">
                <span class="text-sm font-bold text-slate-900 leading-tight">
                  {{ authService.fullName() }}
                </span>
                <span class="text-xs text-slate-500 font-medium">En línea</span>
              </div>

              <div class="relative cursor-pointer" (click)="toggleUserMenu($event)">
                <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center ring-2 ring-indigo-500/20 shadow-sm overflow-hidden">
                   {{ getInitials() }}
                </div>
                <div class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                
                <!-- Menú Desplegable -->
                @if (userMenuOpen) {
                  <!-- Overlay para cerrar el menú desde clickear afuera -->
                  <div class="fixed inset-0 z-40 bg-transparent" (click)="closeUserMenu()"></div>
                  
                  <div
                    class="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right"
                  >
                    <div class="px-4 py-3 border-b border-slate-100 mb-2 sm:hidden">
                       <p class="text-sm font-bold text-slate-900">{{ authService.fullName() }}</p>
                    </div>

                    <button
                      (click)="goToChangePassword()"
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <i class="fas fa-key w-4 text-center text-slate-400"></i>
                      <span>Cambiar Contraseña</span>
                    </button>
                    
                    <div class="h-px bg-slate-100 my-1 mx-2"></div>
                    
                    <button
                      (click)="doLogout()"
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <i class="fas fa-sign-out-alt w-4 text-center text-rose-400"></i>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </header>

        <!-- Área de contenido -->
        <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8">
          <div class="max-w-screen-2xl mx-auto animate-in fade-in duration-500">
            <router-outlet />
          </div>
        </main>
      </div>

      <div
        *ngIf="sidebarOpen()"
        (click)="toggleSidebar($event)"
        class="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-all duration-300"
      ></div>

      <!-- Marca Personal Oculta (Easter Egg) -->
      <div class="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center group">
        <i class="fas fa-paw text-5xl text-[#f59e0b] opacity-[0.2] drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]
                   hover:opacity-60 transition-all duration-500 filter blur-[0.5px]"></i>
        <div class="h-1 w-12 bg-gradient-to-r from-transparent via-[#f59e0b]/20 to-transparent blur-xl mt-1"></div>
      </div>
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
  // Estado para controlar el menú de usuario
  userMenuOpen: boolean = false;

  // Señal para controlar visibilidad del sidebar en móvil
  sidebarOpen = signal(false);

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor(public authService: AuthService) {
    // Escuchar cambios de ruta para cerrar el sidebar y menús en móvil
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.sidebarOpen.set(false);
      this.closeUserMenu();
    });
  }

  /** Alterna visibilidad del menú de usuario */
  toggleUserMenu(event: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.userMenuOpen = !this.userMenuOpen;
    this.cdr.detectChanges();
  }

  /** Cierra el menú de usuario */
  closeUserMenu(): void {
    this.userMenuOpen = false;
    this.cdr.detectChanges();
  }

  /** Navegar a Cambio de Contraseña */
  goToChangePassword(): void {
    this.closeUserMenu();
    this.router.navigate(['/change-password']);
  }

  /** Ejecutar Cierre de Sesión */
  doLogout(): void {
    this.closeUserMenu();
    this.authService.logout();
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
