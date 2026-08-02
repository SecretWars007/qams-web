// src/app/core/services/dashboard.service.ts
// Servicio del dashboard: resumen de métricas, timeline, burndown, drawdown y KPIs ISTQB.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardSummaryDto, IstqbMetricsDto, UpdateQualityGateRequest } from '../dto/dashboard.dto';
import { DashboardSummary } from '../models/dashboard.model';
import { DashboardMapper } from '../mappers/dashboard.mapper';
import { ProjectsService } from './projects.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    /** Prefijo para logs de seguimiento */
    private readonly LOG_TAG = '[DashboardService]';

    /** URL base del endpoint del dashboard */
    private readonly apiUrl = `${environment.apiUrl}/Dashboard`;

    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly projectsService = inject(ProjectsService);

    /**
     * Obtiene el resumen general del dashboard (KPIs, gráficos, timeline).
     * Si el backend no devuelve timeline, lo reconstruye desde ProjectsService.
     */
    getSummary(): Observable<DashboardSummary> {
        return this.http.get<DashboardSummaryDto>(this.apiUrl).pipe(
            map(dto => {
                if (!dto) return this.getEmptySummary();
                return DashboardMapper.fromSummaryDto(dto);
            }),
            switchMap(summary => {
                if (!summary.projectTimeline || summary.projectTimeline.length === 0) {
                    return this.projectsService.getProjects().pipe(
                        map(projects => {
                            summary.projectTimeline = projects.map(p => ({
                                projectName: p.name,
                                startDate: p.startDate || new Date(),
                                endDate: p.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            }));
                            return summary;
                        }),
                        catchError(() => of(summary))
                    );
                }
                return of(summary);
            }),
            catchError(err => {
                console.error(this.LOG_TAG, 'Error crítico al obtener resumen:', err.status, err.message);
                return of(this.getEmptySummary());
            })
        );
    }

    /** Genera un resumen vacío con todos los campos en cero */
    private getEmptySummary(): DashboardSummary {
        return {
            totalProjects: 0,
            totalTestCases: 0,
            pendingTestCases: 0,
            totalExecutions: 0,
            passedExecutions: 0,
            failedExecutions: 0,
            pendingExecutions: 0,
            passRate: 0,
            taskProgress: [],
            executionsByStatus: [],
            projectTimeline: []
        };
    }

    /**
     * Obtiene los datos del cronograma (timeline) para un proyecto específico.
     * @param projectId - ID del proyecto
     */
    getProjectTimeline(projectId: string): Observable<any> {
        const url = `${this.apiUrl}/project/${projectId}/timeline-chart`;
        return this.http.get<any>(url).pipe(
            catchError(err => {
                console.error(this.LOG_TAG, 'Error al obtener timeline:', err.status);
                return of({ events: [] });
            })
        );
    }

    /**
     * Obtiene los datos de drawdown para un proyecto específico.
     * @param projectId - ID del proyecto
     */
    getDrawdownData(projectId: string): Observable<any[]> {
        const url = `${this.apiUrl}/project/${projectId}/drawdown`;
        return this.http.get<any[]>(url).pipe(
            catchError(err => {
                console.error(this.LOG_TAG, 'Error al obtener drawdown:', err.status);
                return of([]);
            })
        );
    }

    /**
     * Obtiene los datos de burndown para un proyecto específico.
     * @param projectId - ID del proyecto
     */
    getBurndownData(projectId: string): Observable<any[]> {
        const url = `${this.apiUrl}/project/${projectId}/burndown`;
        return this.http.get<any[]>(url).pipe(
            catchError(err => {
                console.error(this.LOG_TAG, 'Error al obtener burndown:', err.status);
                return of([]);
            })
        );
    }

    // ── ISTQB Phase 1: Métricas avanzadas y Quality Gate ──

    /**
     * ISTQB: Obtiene KPIs avanzados (DDP, DRE, MTTR) y el resultado del Quality Gate para un proyecto.
     * @param projectId - ID del proyecto a evaluar
     */
    getIstqbMetrics(projectId: string): Observable<IstqbMetricsDto | null> {
        const url = `${this.apiUrl}/project/${projectId}/istqb-metrics`;
        return this.http.get<IstqbMetricsDto>(url).pipe(
            catchError(err => {
                console.error(this.LOG_TAG, 'Error al obtener métricas ISTQB:', err.status);
                return of(null);
            })
        );
    }

    /**
     * ISTQB: Actualiza los umbrales del Quality Gate de un proyecto.
     * @param projectId - ID del proyecto
     * @param request - Nuevos umbrales configurados
     */
    updateQualityGate(projectId: string, request: UpdateQualityGateRequest): Observable<void> {
        const url = `${this.apiUrl}/project/${projectId}/quality-gate`;
        return this.http.put<void>(url, request).pipe(
            catchError(err => {
                console.error(this.LOG_TAG, 'Error al actualizar Quality Gate:', err.status);
                return of(undefined);
            })
        );
    }
}
