// src/app/core/services/dashboard.service.ts
// Servicio del dashboard: resumen de métricas, timeline, burndown y drawdown.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardSummaryDto } from '../dto/dashboard.dto';
import { DashboardSummary } from '../models/dashboard.model';
import { DashboardMapper } from '../mappers/dashboard.mapper';
import { ProjectsService } from './projects.service';
import { DashboardMockService } from './dashboard.mock.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    /** Prefijo para logs de seguimiento */
    private readonly LOG_TAG = '[DashboardService]';

    /** URL base del endpoint del dashboard */
    private readonly apiUrl = `${environment.apiUrl}/Dashboard`;

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private mockService = inject(DashboardMockService);
    private projectsService = inject(ProjectsService);

    /**
     * Obtiene el resumen general del dashboard (KPIs, gráficos, timeline).
     * Si el backend no devuelve timeline, lo reconstruye desde ProjectsService.
     */
    getSummary(): Observable<DashboardSummary> {
        if (environment.useMock) {
            return this.mockService.getSummary();
        }

        // El backend obtiene el usuario del token JWT, no es necesario pasarlo por query string
        // según el Swagger del usuario.
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
        if (environment.useMock) {
            return this.mockService.getSummary().pipe(map(s => ({ events: s.projectTimeline || [] })));
        }

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
        if (environment.useMock) {
            return of([]).pipe(delay(500));
        }
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
}
