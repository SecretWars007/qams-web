// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardSummary } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  summary = signal<DashboardSummary | null>(null);

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
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe((data) => {
      this.summary.set(data);
      this.buildCharts(data);
    });
  }

  private buildCharts(data: DashboardSummary): void {
    // Colores por estado
    const colorMap: Record<string, string> = {
      PASSED: '#22c55e',
      FAILED: '#ef4444',
      PENDING: '#f59e0b',
      IN_PROGRESS: '#3b82f6',
      BLOCKED: '#8b5cf6',
      SKIPPED: '#6b7280',
    };

    // Doughnut
    this.doughnutData = {
      labels: data.executionsByStatus.map((s) => s.statusName),
      datasets: [
        {
          data: data.executionsByStatus.map((s) => s.count),
          backgroundColor: data.executionsByStatus.map(
            (s) => colorMap[s.statusCode] || '#6b7280',
          ),
        },
      ],
    };

    // Barras
    this.barData = {
      labels: data.taskProgress.map((t) => t.columnName),
      datasets: [
        {
          data: data.taskProgress.map((t) => t.taskCount),
          backgroundColor: '#3b82f6',
          label: 'Tareas',
        },
      ],
    };
  }
}
