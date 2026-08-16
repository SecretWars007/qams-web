import { Component, signal, inject, ChangeDetectorRef, ViewChild, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { filter } from 'rxjs/operators';
import { ProfileModalComponent } from '../../features/profile/profile-modal.component';
import { ProjectsService } from '../../core/services/projects.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import { Project } from '../../core/models/project.model';

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

  projects = signal<Project[]>([]);
  private readonly projectsService = inject(ProjectsService);
  private readonly projectContext = inject(ProjectContextService);
  readonly activeProjectId = this.projectContext.activeProjectId;

  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // ===== Menú Ejecuciones colapsable =====
  executionsMenuOpen = signal<boolean>(false);

  // ===== Flujo QA ISTQB Stepper =====
  qaFlowSteps = [
    { label: 'SUT (Sistema)', route: '/systems-under-test', active: false },
    { label: 'Proyecto', route: '/projects', active: false },
    { label: 'Requisitos', route: '/requirements', active: false },
    { label: 'Plan de Pruebas', route: '/test-plans', active: false },
    { label: 'Escenarios', route: '/test-scenarios', active: false },
    { label: 'Casos de Prueba', route: '/test-cases', active: false },
    { label: 'Ejecuciones', route: '/test-executions', active: false },
    { label: 'Defectos', route: '/defects', active: false },
    { label: 'Reportes', route: '/reports', active: false },
  ];

  constructor(public authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.sidebarOpen.set(false);
      this.closeUserMenu();
      // Actualizar el paso activo del stepper
      this.qaFlowSteps = this.qaFlowSteps.map(step => ({
        ...step,
        active: event.urlAfterRedirects?.startsWith(step.route) ?? false
      }));
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectsService.getProjects().subscribe({
      next: (projs) => {
        this.projects.set(projs);
        if (projs.length > 0 && !this.activeProjectId()) {
          const initialId = projs[0].id;
          this.projectContext.setActiveProject(initialId);
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
