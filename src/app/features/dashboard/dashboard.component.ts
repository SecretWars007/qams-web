// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { tap, switchMap } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';
import { ProjectsService } from '../../core/services/projects.service';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { Project } from '../../core/models/project.model';
import { SystemUnderTest } from '../../core/models/system-under-test.model';
import { User } from '../../core/models/user.model';
import { ProjectContextService } from '../../core/services/project-context.service';
import { AuthService } from '../../core/services/auth.service';
import { SystemsUnderTestService } from '../../core/services/systems-under-test.service';
import { UsersService } from '../../core/services/users.service';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
  summary = signal<DashboardSummary | null>(null);
  projects = signal<Project[]>([]);
  selectedProjectId = signal<string | null>(null);
  loading = signal<boolean>(false);
  today = new Date();

  // Filtros activos
  selectedSutId = signal<string | null>(null);
  selectedTesterUserId = signal<string | null>(null);

  // Catálogos para los selects
  suts = signal<SystemUnderTest[]>([]);
  testers = signal<User[]>([]);

  // Derivados del auth service
  private authServiceRef = inject(AuthService);
  readonly canUseAdvancedFilters = this.authServiceRef.canUseAdvancedFilters;
  readonly isTesterOnly = this.authServiceRef.isTesterOnly;

  // Configuración del gráfico Doughnut
  doughnutData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
  };

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  // Configuración del gráfico de Barras
  barData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: '#3b82f6', label: 'Tareas' }],
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(30, 27, 75, 0.9)',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#6b7280' },
        grid: { color: 'rgba(229, 231, 235, 0.8)' }
      },
      x: {
        ticks: { color: '#6b7280' },
        grid: { display: false }
      }
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false
      }
    }
  };







  constructor(
    private readonly dashboardService: DashboardService,
    private readonly projectsService: ProjectsService,
    private readonly projectContextService: ProjectContextService,
    private readonly authService: AuthService,
    private readonly sutService: SystemsUnderTestService,
    private readonly usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.loading.set(true);

    if (this.canUseAdvancedFilters()) {
      this.sutService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => this.suts.set(data));
      this.usersService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(users => {
        // Filtrar solo usuarios con rol Tester
        this.testers.set(users.filter(u => {
          const roles = Array.isArray(u.roles) ? u.roles : [u.roles];
          return roles.some(r => r && r.toLowerCase() === 'tester');
        }));
      });
    }

    this.applyFilters();
  }

  applyFilters(): void {
    this.loading.set(true);
    const sutId = this.selectedSutId() || undefined;
    const testerId = this.selectedTesterUserId() || undefined;

    this.dashboardService.getSummary(sutId, testerId).pipe(
      tap((data: DashboardSummary) => {
        this.summary.set(data);
        this.buildCharts(data);
      }),
      switchMap(() => this.projectsService.getProjects(sutId, testerId)),
      tap((projects: Project[]) => {
        this.projects.set(projects);
        
        // Sobreescribir el totalProjects del resumen global con los proyectos filtrados
        const currentSummary = this.summary();
        if (currentSummary) {
          this.summary.set({ ...currentSummary, totalProjects: projects.length });
        }

        if (projects.length > 0) {
          const firstProjectId = projects[0].id;
          if (!this.selectedProjectId() || !projects.find(p => p.id === this.selectedProjectId())) {
            this.selectedProjectId.set(firstProjectId);
            this.loadProjectMetrics(firstProjectId);
          }
          this.projectContextService.initializeIfEmpty(firstProjectId);
        } else {
          this.selectedProjectId.set(null);
        }
      }), takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        console.error('DashboardComponent: Error loading data:', err);
        this.loading.set(false);
      }
    });
  }

  onSutChange(sutId: string): void {
    this.selectedSutId.set(sutId === 'ALL' ? null : sutId);
    this.applyFilters();
  }

  onTesterChange(testerId: string): void {
    this.selectedTesterUserId.set(testerId === 'ALL' ? null : testerId);
    this.applyFilters();
  }

  /** Carga y renderiza los datos de todas las métricas del proyecto */
  private loadProjectMetrics(projectId: string): void {
    // Se eliminaron las llamadas a timeline, burndown y drawdown para limpiar la consola
    // y simplificar el dashboard según solicitud del usuario.
  }

  onProjectChange(projectId: string): void {
    this.selectedProjectId.set(projectId === 'ALL' ? null : projectId);
    if (this.selectedProjectId()) {
       this.projectContextService.setActiveProject(this.selectedProjectId()!);
       this.loadProjectMetrics(this.selectedProjectId()!);
    }
  }



  private buildCharts(data: DashboardSummary): void {
    const colorMap: Record<string, string> = {
      PASSED: '#22c55e',
      FAILED: '#ef4444',
      PENDING: '#f59e0b',
      IN_PROGRESS: '#3b82f6',
      BLOCKED: '#8b5cf6',
      SKIPPED: '#6b7280',
    };

    const columnColorMap: Record<string, string> = {
      'Tareas Pendientes': '#94a3b8',
      'Por Hacer': '#6b7280',
      'En Progreso': '#3b82f6',
      'En Revisión': '#8b5cf6',
      'Completado': '#22c55e',
      'Backlog': '#94a3b8',
      'Done': '#22c55e',
      'Review': '#8b5cf6',
      'In Progress': '#3b82f6',
    };

    // Doughnut
    const statusData = data.executionsByStatus || [];
    this.doughnutData = {
      labels: statusData.map((s) => s.statusName),
      datasets: [
        {
          data: statusData.map((s) => s.count),
          backgroundColor: statusData.map(
            (s) => colorMap[s.statusCode] || '#6b7280',
          ),
        },
      ],
    };

    // Barras
    const standardColumns = ['Tareas Pendientes', 'Por Hacer', 'En Progreso', 'En Revisión', 'Completado'];
    const progressData = data.taskProgress || [];

    const chartData = standardColumns.map(colName => {
      const found = progressData.find(t => t.columnName.toLowerCase() === colName.toLowerCase());
      return found ? found.count : 0;
    });

    this.barData = {
      labels: standardColumns,
      datasets: [
        {
          data: chartData,
          backgroundColor: standardColumns.map(col => columnColorMap[col] || '#3b82f6'),
          label: 'Tareas',
        },
      ],
    };
  }
}
