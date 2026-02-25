// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { tap, switchMap } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ProjectsService } from '../../../core/services/projects.service';
import { DashboardSummary } from '../../../core/models/dashboard.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  summary = signal<DashboardSummary | null>(null);
  projects = signal<Project[]>([]);
  selectedProjectId = signal<string | null>(null);
  loading = signal<boolean>(false);
  today = new Date();

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
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#9ca3af' },
        grid: { color: 'rgba(229, 231, 235, 0.1)' }
      },
      x: {
        ticks: { color: '#9ca3af' },
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

  // Configuración del gráfico de Timeline (Gantt)
  timelineData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Duración del Proyecto',
      data: [],
      backgroundColor: '#8b5cf6',
      borderRadius: 10,
      borderSkipped: false,
      barThickness: 12,
      maxBarThickness: 16,
    }],
  };

  timelineOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const range = context.raw as [number, number];
            const start = new Date(range[0]).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            const end = new Date(range[1]).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            return ` ${start} - ${end}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        beginAtZero: false,
        ticks: {
          callback: (value: any) => new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
          color: '#9ca3af'
        },
        grid: { color: 'rgba(229, 231, 235, 0.1)' }
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { display: false }
      }
    }
  };

  // ============================================================
  // Burndown Chart Configuration
  // ============================================================
  burndownData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Ideal',
        data: [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderDash: [6, 4],
        fill: true,
        tension: 0,
        pointRadius: 3,
        pointBackgroundColor: '#6366f1',
      },
      {
        label: 'Real',
        data: [],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#f59e0b',
      }
    ]
  };

  burndownOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#9ca3af', usePointStyle: true, pointStyleWidth: 10 }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(1)}h`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#9ca3af', callback: (v) => `${v}h` },
        grid: { color: 'rgba(229, 231, 235, 0.08)' },
        title: { display: true, text: 'Horas restantes', color: '#6b7280' }
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { display: false }
      }
    }
  };

  // ============================================================
  // Drawdown Chart Configuration
  // ============================================================
  drawdownData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Drawdown',
        data: [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#ef4444',
      }
    ]
  };

  drawdownOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        callbacks: {
          label: (ctx) => ` Drawdown: ${Number(ctx.parsed.y).toFixed(1)}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: '#9ca3af', callback: (v) => `${v}%` },
        grid: { color: 'rgba(229, 231, 235, 0.08)' }
      },
      x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private projectsService: ProjectsService
  ) { }

  ngOnInit(): void {
    this.loading.set(true);

    // Flujo secuencial: 
    // 1. Obtener Resumen (incluye Tasa de Aprobación)
    // 2. Obtener Lista de Proyectos
    // 3. Inicializar primer proyecto si existe
    this.dashboardService.getSummary().pipe(
      tap((data: DashboardSummary) => {
        console.log('📊 [Dashboard] Respuesta completa del backend:', data);
        console.log('📊 [Dashboard] Summary detalle:', JSON.stringify(data, null, 2));
        this.summary.set(data);
        this.buildCharts(data);
      }),
      switchMap(() => this.projectsService.getProjects()),
      tap((projects: Project[]) => {
        console.log('📂 [Dashboard] Proyectos cargados:', projects.length);
        this.projects.set(projects);
        if (projects.length > 0 && !this.selectedProjectId()) {
          const firstProjectId = projects[0].id;
          console.log('📂 [Dashboard] Seleccionando primer proyecto por defecto:', firstProjectId);
          this.selectedProjectId.set(firstProjectId);
          this.loadProjectMetrics(firstProjectId);
        } else if (projects.length === 0) {
          console.warn('📂 [Dashboard] No hay proyectos disponibles para cargar métricas');
        }
      })
    ).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        console.error('DashboardComponent: Error en el flujo de carga inicial:', err);
        this.loading.set(false);
      }
    });
  }

  private loadProjectMetrics(projectId: string): void {
    // Cargar timeline
    this.dashboardService.getProjectTimeline(projectId).subscribe({
      next: (data) => {
        console.log('📅 [Dashboard] Timeline data:', data);
        this.renderTimeline(data);
      },
      error: (err) => console.error('DashboardComponent: Error cargando timeline:', err)
    });

    // Cargar burndown
    this.dashboardService.getBurndownData(projectId).subscribe({
      next: (data) => {
        console.log('📉 [Dashboard] Burndown data:', data);
        this.renderBurndown(data);
      },
      error: (err) => console.error('DashboardComponent: Error cargando burndown:', err)
    });

    // Cargar drawdown
    this.dashboardService.getDrawdownData(projectId).subscribe({
      next: (data) => {
        console.log('📉 [Dashboard] Drawdown data:', data);
        this.renderDrawdown(data);
      },
      error: (err) => console.error('DashboardComponent: Error cargando drawdown:', err)
    });
  }

  onProjectChange(projectId: string): void {
    this.selectedProjectId.set(projectId);
    this.loadProjectMetrics(projectId);
  }

  private renderDrawdown(points: any[]): void {
    if (!points || points.length === 0) {
      this.drawdownData = {
        labels: [],
        datasets: [{ ...this.drawdownData.datasets[0], data: [] }]
      };
      return;
    }

    this.drawdownData = {
      labels: points.map(p => p.dateLabel || p.date || ''),
      datasets: [
        {
          label: 'Drawdown',
          data: points.map(p => Number(p.value ?? 0)),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#ef4444',
        }
      ]
    };
  }

  /**
   * Renderiza el gráfico de cronograma (Timeline). 
   * Soporta tanto el listado de proyectos (resumen) como los eventos de ejecución de un proyecto.
   */
  private renderTimeline(data: any): void {
    let list: any[] = [];

    // El backend puede enviar un array directo o un objeto con la propiedad 'events'
    if (Array.isArray(data)) {
      list = data;
    } else if (data && Array.isArray(data.events)) {
      list = data.events;
    } else if (data) {
      list = [data];
    }

    if (list.length === 0) {
      this.timelineData = { labels: [], datasets: [{ ...this.timelineData.datasets[0], data: [] }] };
      return;
    }

    this.timelineData = {
      labels: list.map(item => item.projectName || item.testCaseTitle || item.name || 'Sin nombre'),
      datasets: [{
        label: 'Ejecuciones / Cronograma',
        data: list.map(item => {
          // Si es un evento de ejecución, usamos ExecutionDate
          // Si es un proyecto, usamos startDate y endDate
          const sDate = new Date(item.executionDate || item.startDate);
          const eDate = new Date(item.executionDate || item.endDate);

          const isInvalid = (d: Date) => isNaN(d.getTime()) || d.getFullYear() < 1990;
          let s = isInvalid(sDate) ? Date.now() : sDate.getTime();
          let e = (isInvalid(eDate) || eDate.getTime() <= s) ? s + (15 * 60 * 1000) : eDate.getTime(); // 15 min de duración mínima para visualización

          return [s, e] as any;
        }),
        backgroundColor: list.map(item => item.statusColor || '#8b5cf6'),
        borderRadius: 20,
        borderSkipped: false,
        barThickness: 10,
        maxBarThickness: 12,
      }],
    };
  }

  private renderBurndown(points: any[]): void {
    if (!points || points.length === 0) {
      this.burndownData = {
        labels: [],
        datasets: [
          { ...this.burndownData.datasets[0], data: [] },
          { ...this.burndownData.datasets[1], data: [] }
        ]
      };
      return;
    }

    this.burndownData = {
      labels: points.map(p => p.dateLabel || p.date || ''),
      datasets: [
        {
          label: 'Ideal',
          data: points.map(p => Number(p.idealHours ?? 0)),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderDash: [6, 4],
          fill: true,
          tension: 0,
          pointRadius: 3,
          pointBackgroundColor: '#6366f1',
        },
        {
          label: 'Real',
          data: points.map(p => Number(p.actualHours ?? 0)),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#f59e0b',
        }
      ]
    };
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
      return found ? found.taskCount : 0;
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
