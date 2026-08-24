import { Component, signal, inject, ChangeDetectorRef, ViewChild, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { filter } from 'rxjs/operators';
import { ProfileModalComponent } from '../../features/profile/profile-modal.component';
import { ProjectsService } from '../../core/services/projects.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import { Project } from '../../core/models/project.model';

import { ThemeService } from '../../core/services/theme.service';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

/** Mapa de rutas a etiquetas de breadcrumb */
const ROUTE_LABELS: Record<string, string> = {
  'dashboard': 'Dashboard',
  'projects': 'Proyectos',
  'requirements': 'Requisitos',
  'test-plans': 'Planes de Prueba',
  'test-scenarios': 'Escenarios de Prueba',
  'test-cases': 'Casos de Prueba',
  'test-executions': 'Ejecuciones de Prueba',
  'evidences': 'Evidencias',
  'defects': 'Defectos',
  'reports': 'Reportes',
  'kanban': 'Tablero Kanban',
  'systems-under-test': 'Sistemas Bajo Prueba',
  'test-environments': 'Entornos de Prueba',
  'exploratory': 'Pruebas Exploratorias',
  'reviews': 'Revisiones Estáticas',
  'admin': 'Administración',
  'users': 'Usuarios',
  'roles': 'Roles y Permisos',
  'catalogs': 'Catálogos',
  'api-keys': 'API Keys',
  'change-password': 'Cambiar Contraseña',
  'profile': 'Mi Perfil',
};

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HasPermissionDirective,
    ProfileModalComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  @ViewChild('profileModal') profileModal!: ProfileModalComponent;
  userMenuOpen: boolean = false;
  sidebarOpen = signal(false);
  /** Modo icon-rail para tablet (solo iconos, sin texto) */
  sidebarCollapsed = signal(false);
  /** Búsqueda global visible */
  globalSearchOpen = signal(false);
  /** Breadcrumbs dinámicos */
  breadcrumbs = signal<BreadcrumbItem[]>([{ label: 'QAMS' }]);

  projects = signal<Project[]>([]);
  private readonly projectsService = inject(ProjectsService);
  private readonly projectContext = inject(ProjectContextService);
  readonly themeService = inject(ThemeService);
  readonly activeProjectId = this.projectContext.activeProjectId;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  // ===== Menús colapsables =====
  planningMenuOpen = signal<boolean>(false);
  testPlansMenuOpen = signal<boolean>(false);
  executionsMenuOpen = signal<boolean>(false);

  /** Ctrl+K / Cmd+K → abrir búsqueda global */
  @HostListener('document:keydown', ['$event'])
  onDocumentKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.globalSearchOpen.update(v => !v);
    }
  }

  // ===== Flujo QA ISTQB Stepper =====
  qaFlowSteps = [
    { label: 'Planificación', route: '/systems-under-test', active: false },
    { label: 'SUT (Sistema)', route: '/systems-under-test', active: false },
    { label: 'Proyecto', route: '/projects', active: false },
    { label: 'Requisitos', route: '/requirements', active: false },
    { label: 'Gestión', route: '/test-plans', active: false },
    { label: 'Escenarios', route: '/test-scenarios', active: false },
    { label: 'Casos de Prueba', route: '/test-cases', active: false },
    { label: 'Ejecución', route: '/test-executions', active: false },
    { label: 'Defectos', route: '/defects', active: false },
    { label: 'Reportes', route: '/reports', active: false },
  ];

  constructor(public authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.sidebarOpen.set(false);
      this.closeUserMenu();
      const currentUrl = event.urlAfterRedirects ?? '';
      
      // Auto-expandir menús según la ruta activa
      if (currentUrl.startsWith('/systems-under-test') || currentUrl.startsWith('/projects') || currentUrl.startsWith('/requirements')) {
        this.planningMenuOpen.set(true);
      }
      if (currentUrl.startsWith('/test-plans') || currentUrl.startsWith('/test-scenarios') || currentUrl.startsWith('/test-cases')) {
        this.testPlansMenuOpen.set(true);
      }
      if (currentUrl.startsWith('/test-executions') || currentUrl.startsWith('/evidences') || currentUrl.startsWith('/defects')) {
        this.executionsMenuOpen.set(true);
      }

      // Actualizar el paso activo del stepper
      this.qaFlowSteps = this.qaFlowSteps.map(step => ({
        ...step,
        active: currentUrl.startsWith(step.route)
      }));

      // Actualizar breadcrumbs dinámicos
      this.breadcrumbs.set(this.buildBreadcrumbs(currentUrl));
    });
  }

  /** Construye breadcrumbs a partir de la URL */
  buildBreadcrumbs(url: string): BreadcrumbItem[] {
    const crumbs: BreadcrumbItem[] = [{ label: 'QAMS' }];
    const segments = url.split('/').filter(s => s && s !== '#');
    let accumulated = '';
    for (const segment of segments) {
      accumulated += '/' + segment;
      const label = ROUTE_LABELS[segment];
      if (label) {
        crumbs.push({ label, route: accumulated });
      } else if (/^\d+$/.test(segment)) {
        // segmento numérico = ID de detalle
        crumbs.push({ label: `#${segment}` });
      }
    }
    return crumbs;
  }

  /** Colapsa/expande el sidebar en modo icon-rail */
  toggleSidebarCollapse(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  ngOnInit(): void {
    this.loadProjects();
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/systems-under-test') || currentUrl.startsWith('/projects') || currentUrl.startsWith('/requirements')) {
      this.planningMenuOpen.set(true);
    }
    if (currentUrl.startsWith('/test-plans') || currentUrl.startsWith('/test-scenarios') || currentUrl.startsWith('/test-cases')) {
      this.testPlansMenuOpen.set(true);
    }
    if (currentUrl.startsWith('/test-executions') || currentUrl.startsWith('/evidences') || currentUrl.startsWith('/defects')) {
      this.executionsMenuOpen.set(true);
    }
    // Breadcrumbs iniciales
    this.breadcrumbs.set(this.buildBreadcrumbs(currentUrl));
  }

  loadProjects(): void {
    this.projectsService.getProjects().subscribe({
      next: (projs) => {
        this.projects.set(projs);
        const currentId = this.activeProjectId();
        if (projs.length > 0) {
          const isValid = currentId && projs.some(p => p.id === currentId);
          if (!isValid) {
            this.projectContext.setActiveProject(projs[0].id);
          }
        } else {
          this.projectContext.clearActiveProject();
        }
      },
      error: (err) => console.error('[MainLayout] Error loading projects:', err)
    });
  }

  onProjectChange(projectId: string): void {
    this.projectContext.setActiveProject(projectId);
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

  /** Abrir Modal de Perfil */
  openProfile(): void {
    this.closeUserMenu();
    this.profileModal.open();
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

  /** Alterna visibilidad del submenú de Planificación */
  togglePlanningMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.planningMenuOpen.update(v => !v);
  }

  /** Alterna visibilidad del submenú de Planes de Prueba */
  toggleTestPlansMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.testPlansMenuOpen.update(v => !v);
  }

  /** Alterna visibilidad del submenú de Ejecuciones */
  toggleExecutionsMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.executionsMenuOpen.update(v => !v);
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
    return (parts[0][0] + parts.at(-1)![0]).toUpperCase();
  }
}
