// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, BaseChartDirective],
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
        this.summary.set(data);
        this.buildCharts(data);
      }),
      switchMap(() => this.projectsService.getProjects()),
      tap((projects: Project[]) => {
        this.projects.set(projects);
        if (projects.length > 0 && !this.selectedProjectId()) {
          const firstProjectId = projects[0].id;
          this.selectedProjectId.set(firstProjectId);
          this.loadProjectMetrics(firstProjectId);
        }
      })
    ).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        console.error('DashboardComponent: Error loading initial data:', err);
        this.loading.set(false);
      }
    });
  }

  /** Carga y renderiza los datos de todas las métricas del proyecto */
  private loadProjectMetrics(projectId: string): void {
    // Se eliminaron las llamadas a timeline, burndown y drawdown para limpiar la consola
    // y simplificar el dashboard según solicitud del usuario.
  }

  onProjectChange(projectId: string): void {
    this.selectedProjectId.set(projectId);
    this.loadProjectMetrics(projectId);
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
