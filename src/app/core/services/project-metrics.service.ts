// src/app/core/services/project-metrics.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DashboardService } from './dashboard.service';
import { IstqbMetricsDto } from '../dto/dashboard.dto';

@Injectable({ providedIn: 'root' })
export class ProjectMetricsService {
  private readonly dashboardService = inject(DashboardService);

  /** Signal para almacenar las métricas del proyecto activo */
  activeMetrics = signal<IstqbMetricsDto | null>(null);
  loading = signal<boolean>(false);

  /**
   * Obtiene las métricas ISTQB del proyecto y actualiza la señal reactiva compartida.
   * @param projectId - ID del proyecto a consultar
   */
  loadMetrics(projectId: string): Observable<IstqbMetricsDto | null> {
    this.loading.set(true);
    return this.dashboardService.getIstqbMetrics(projectId).pipe(
      tap({
        next: (metrics) => {
          this.activeMetrics.set(metrics);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }
}
