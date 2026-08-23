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
import { TestExecutionsService } from '../../core/services/test-executions.service';
import { CatalogsService } from '../../core/services/catalogs.service';
import { TestExecution } from '../../core/models/test-execution.model';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  summary = signal<DashboardSummary | null>(null);
  projects = signal<Project[]>([]);
  selectedProjectId = signal<string | null>(null);
  loading = signal<boolean>(false);
  readonly today = new Date();

  // Filtros activos
  selectedSutId = signal<string | null>(null);
  selectedTesterUserId = signal<string | null>(null);

  // Catálogos para los selects
  suts = signal<SystemUnderTest[]>([]);
  testers = signal<User[]>([]);
  executionStatuses = signal<{ id: number; code: string; name: string }[]>([]);

  // Mapa oficial de colores por código de catálogo de estado de ejecución
  readonly statusColorMap: Record<string, string> = {
    PASSED:      '#10B981', // Verde esmeralda (Aprobado)
    FAILED:      '#F43F5E', // Rojo carmesí (Fallido)
    IN_PROGRESS: '#34D399', // Verde menta tecnológico (En Progreso)
    BLOCKED:     '#475569', // Pizarra / Gris oscuro (Bloqueado)
    PENDING:     '#F59E0B', // Ámbar (Pendiente)
    SKIPPED:     '#94A3B8'  // Gris claro (Omitido)
  };

  // TestRail Activity Trend Signals
  trendDaysRange = signal<number>(30); // 30 días por defecto para abarcar ejecuciones históricas
  trendStatusSummaries = signal<{
    code: string;
    name: string;
    color: string;
    count: number;
    percentage: number;
  }[]>([]);
  trendTotal = signal<number>(0);

  // Derivados del auth service
  private readonly authServiceRef = inject(AuthService);
  readonly canUseAdvancedFilters = this.authServiceRef.canUseAdvancedFilters;
  readonly isTesterOnly = this.authServiceRef.isTesterOnly;

  // Configuración del gráfico TestRail Line
  activityLineData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  activityLineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleFont: { family: 'Plus Jakarta Sans', weight: 700, size: 12 },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        padding: 12,
        cornerRadius: 10,
        boxPadding: 6,
        usePointStyle: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 3,
        ticks: {
          stepSize: 1,
          precision: 0,
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 }
        },
        grid: { color: 'rgba(16, 185, 129, 0.08)' }
      },
      x: {
        ticks: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 }
        },
        grid: { display: false }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  // Configuración del gráfico Doughnut
  doughnutData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
  };

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 },
          color: '#94a3b8',
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleFont: { family: 'Plus Jakarta Sans', weight: 700 },
        bodyFont:  { family: 'Plus Jakarta Sans' },
        padding: 12,
        cornerRadius: 10,
      }
    },
  };

  // Configuración del gráfico de Barras
  barData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: '#10B981', label: 'Tareas' }],
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleFont: { family: 'Plus Jakarta Sans', weight: 700 },
        bodyFont:  { family: 'Plus Jakarta Sans' },
        padding: 12,
        cornerRadius: 10,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } },
        grid: { color: 'rgba(16, 185, 129, 0.08)' }
      },
      x: {
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } },
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
    private readonly usersService: UsersService,
    private readonly executionsService: TestExecutionsService,
    private readonly catalogsService: CatalogsService
  ) { }

  ngOnInit(): void {
    this.loading.set(true);

    // Cargar catálogo de estados de ejecución desde base de datos
    this.catalogsService.getActive('ExecutionStatus').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (statuses: any[]) => {
        if (statuses && statuses.length > 0) {
          this.executionStatuses.set(statuses);
        }
      },
      error: (err: any) => console.error('Error cargando catálogo ExecutionStatus:', err)
    });

    if (this.canUseAdvancedFilters()) {
      this.sutService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => this.suts.set(data));
      this.usersService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(users => {
        // Filtrar solo usuarios con rol Tester
        this.testers.set(users.filter(u => {
          const roles = Array.isArray(u.roles) ? u.roles : [u.roles];
          return roles.some(r => r?.toLowerCase() === 'tester');
        }));
      });
    }

    this.applyFilters();
  }

  getStatusColor(code: string): string {
    const clean = (code || '').toUpperCase();
    return this.statusColorMap[clean] || '#6366F1';
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
          if (!this.selectedProjectId() || !projects.some(p => p.id === this.selectedProjectId())) {
            this.selectedProjectId.set(firstProjectId);
          }
          this.projectContextService.initializeIfEmpty(firstProjectId);
        } else {
          this.selectedProjectId.set(null);
        }
      }), takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadActivityTrend();
      },
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

  setTrendDays(days: number): void {
    this.trendDaysRange.set(days);
    this.loadActivityTrend();
  }

  loadActivityTrend(): void {
    const days = this.trendDaysRange();
    const projectId = this.selectedProjectId() || undefined;

    this.executionsService.getExecutions(undefined, projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (executions: TestExecution[]) => {
          this.buildActivityTrend(executions || [], days);
        },
        error: (err: any) => console.error('Error cargando ejecuciones para tendencia:', err)
      });
  }

  private buildActivityTrend(executions: TestExecution[], days: number): void {
    const rawStatuses = this.executionStatuses();
    const defaultStatuses = [
      { id: 3, code: 'PASSED', name: 'Aprobado' },
      { id: 4, code: 'FAILED', name: 'Fallido' },
      { id: 2, code: 'IN_PROGRESS', name: 'En Progreso' },
      { id: 5, code: 'BLOCKED', name: 'Bloqueado' },
      { id: 1, code: 'PENDING', name: 'Pendiente' },
      { id: 6, code: 'SKIPPED', name: 'Omitido' }
    ];
    const statuses = rawStatuses.length > 0 ? rawStatuses : defaultStatuses;

    const labels: string[] = [];
    const dateKeys: string[] = [];
    const now = new Date();

    const rangeDays = days > 0 ? days : 30;
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      dateKeys.push(key);
      labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    }

    const statusCountsMap: Record<string, Record<string, number>> = {};
    const statusTotalMap: Record<string, number> = {};

    statuses.forEach(s => {
      const code = s.code.toUpperCase();
      statusCountsMap[code] = {};
      statusTotalMap[code] = 0;
      dateKeys.forEach(k => {
        statusCountsMap[code][k] = 0;
      });
    });

    let totalExecutions = 0;

    executions.forEach(exec => {
      if (!exec.executionDate) return;
      const execDate = new Date(exec.executionDate);
      const k = `${execDate.getFullYear()}-${(execDate.getMonth() + 1).toString().padStart(2, '0')}-${execDate.getDate().toString().padStart(2, '0')}`;

      const code = (exec.status?.code || 'PENDING').toUpperCase();
      if (statusCountsMap[code]?.[k] !== undefined) {
        statusCountsMap[code][k]++;
        statusTotalMap[code]++;
        totalExecutions++;
      }
    });

    // Si dentro del rango elegido no hay ejecuciones pero hay ejecuciones en el proyecto global, contamos el total histórico
    if (totalExecutions === 0 && executions.length > 0) {
      executions.forEach(exec => {
        const code = (exec.status?.code || 'PENDING').toUpperCase();
        if (statusTotalMap[code] !== undefined) {
          statusTotalMap[code]++;
          totalExecutions++;
        }
      });
    }

    const summaries = statuses.map(s => {
      const code = s.code.toUpperCase();
      const count = statusTotalMap[code] || 0;
      const percentage = totalExecutions > 0 ? Math.round((count / totalExecutions) * 100) : 0;
      return {
        code,
        name: s.name,
        color: this.getStatusColor(code),
        count,
        percentage
      };
    });

    this.trendStatusSummaries.set(summaries);
    this.trendTotal.set(totalExecutions);

    this.activityLineData = {
      labels,
      datasets: statuses.map(s => {
        const code = s.code.toUpperCase();
        const color = this.getStatusColor(code);
        return {
          data: dateKeys.map(k => statusCountsMap[code]?.[k] || 0),
          label: s.name,
          borderColor: color,
          backgroundColor: `${color}15`,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: color,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.2,
          fill: false
        };
      })
    };
  }

  /** Carga y renderiza los datos de todas las métricas del proyecto */
  private loadProjectMetrics(projectId: string): void {
    this.loadActivityTrend();
  }

  onProjectChange(projectId: string): void {
    this.selectedProjectId.set(projectId === 'ALL' ? null : projectId);
    if (this.selectedProjectId()) {
       this.projectContextService.setActiveProject(this.selectedProjectId()!);
       this.loadProjectMetrics(this.selectedProjectId()!);
    } else {
       this.loadActivityTrend();
    }
  }

  private buildCharts(data: DashboardSummary): void {
    const statusData = data.executionsByStatus || [];
    this.doughnutData = {
      labels: statusData.map(s => s.statusName),
      datasets: [
        {
          data: statusData.map(s => s.count),
          backgroundColor: statusData.map(s => this.getStatusColor(s.statusCode)),
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverBorderWidth: 4,
        },
      ],
    };

    // Barras — gradiente por columna con paleta unificada de verdes QAMS
    const standardColumns = ['Tareas Pendientes', 'Por Hacer', 'En Progreso', 'En Revisión', 'Completado'];
    const qamsColumnColors: Record<string, string> = {
      'Tareas Pendientes': '#64748B', // Slate
      'Por Hacer':         '#64748B', // Slate
      'En Progreso':       '#34D399', // Mint
      'En Revisión':       '#10B981', // Emerald
      'Completado':        '#059669', // Deep Emerald
      'Backlog':           '#64748B',
      'Done':              '#059669',
      'Review':            '#10B981',
      'In Progress':       '#34D399',
    };
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
          backgroundColor: standardColumns.map(col => qamsColumnColors[col] || '#10B981'),
          label: 'Tareas',
        },
      ],
    };
  }
}
