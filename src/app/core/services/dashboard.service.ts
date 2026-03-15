// src/app/core/services/dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { map, catchError, switchMap, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardSummaryDto } from '../dto/dashboard.dto';
import { DashboardSummary } from '../models/dashboard.model';
import { DashboardMapper } from '../mappers/dashboard.mapper';
import { ProjectsService } from './projects.service';
import { TestCasesService } from './test-cases.service';
import { TestExecutionsService } from './test-executions.service';
import { DashboardMockService } from './dashboard.mock.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly apiUrl = `${environment.apiUrl}/Dashboard`;
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private mockService = inject(DashboardMockService);
    private projectsService = inject(ProjectsService);
    private testCasesService = inject(TestCasesService);
    private testExecutionsService = inject(TestExecutionsService);

    getSummary(): Observable<DashboardSummary> {
        if (environment.useMock) {
            console.log('DashboardService: Using MOCK for summary');
            return this.mockService.getSummary();
        }

        const userId = this.authService.getUserId();
        if (!userId) {
            console.error('DashboardService: No se encontró userId para el dashboard. ¿Está logueado?');
            return of(this.getEmptySummary());
        }

        const params = new HttpParams().set('userId', userId);
        console.log('DashboardService: Solicitando resumen al backend:', this.apiUrl, { userId });

        return this.http.get<DashboardSummaryDto>(this.apiUrl, { params }).pipe(
            map(dto => {
                if (!dto) {
                    console.warn('DashboardService: El backend retornó un resumen nulo o vacío');
                    return this.getEmptySummary();
                }
                return DashboardMapper.fromSummaryDto(dto);
            }),
            switchMap(summary => {
                // Si el backend no devuelve timeline o está vacío, construirlo desde los proyectos
                if (!summary.projectTimeline || summary.projectTimeline.length === 0) {
                    console.log('DashboardService: Reconstruyendo timeline desde ProjectsService (fallback)');
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
                console.error('DashboardService: Error crítico al obtener resumen del dashboard:', err);
                return of(this.getEmptySummary());
            })
        );
    }

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

    /** Obtiene los datos del cronograma (timeline) para un proyecto específico */
    getProjectTimeline(projectId: string): Observable<any> {
        if (environment.useMock) {
            // Reusar datos del mock para pruebas
            return this.mockService.getSummary().pipe(map(s => ({ events: s.projectTimeline || [] })));
        }

        const url = `${this.apiUrl}/project/${projectId}/timeline-chart`;
        return this.http.get<any>(url).pipe(
            catchError(err => {
                console.error('DashboardService: Error al obtener el cronograma del proyecto:', err);
                return of({ events: [] });
            })
        );
    }

    getDrawdownData(projectId: string): Observable<any[]> {
        if (environment.useMock) {
            return of([]).pipe(delay(500));
        }
        const url = `${this.apiUrl}/project/${projectId}/drawdown`;
        return this.http.get<any[]>(url).pipe(
            catchError(err => {
                console.error('DashboardService: Error fetching drawdown data:', err);
                return of([]);
            })
        );
    }

    getBurndownData(projectId: string): Observable<any[]> {
        const url = `${this.apiUrl}/project/${projectId}/burndown`;
        return this.http.get<any[]>(url).pipe(
            catchError(err => {
                console.error('DashboardService: Error fetching burndown data:', err);
                return of([]);
            })
        );
    }

    private buildSummaryFromServices(): Observable<DashboardSummary> {
        return combineLatest([
            this.projectsService.getProjects().pipe(catchError(() => of([]))),
            this.testCasesService.getTestCases().pipe(catchError(() => of([]))),
            this.testExecutionsService.getExecutions().pipe(catchError(() => of([]))),
        ]).pipe(
            map(([projects, testCases, executions]) => {
                const passed = (executions || []).filter((e: any) =>
                    e.statusCode === 'PASSED' || e.status?.code === 'PASSED'
                ).length;
                const failed = (executions || []).filter((e: any) =>
                    e.statusCode === 'FAILED' || e.status?.code === 'FAILED'
                ).length;
                const pending = (executions || []).filter((e: any) =>
                    e.statusCode === 'PENDING' || e.status?.code === 'PENDING' ||
                    e.statusCode === 'IN_PROGRESS' || e.status?.code === 'IN_PROGRESS'
                ).length;
                const total = (executions || []).length;

                const passedTestCasesCount = (executions || [])
                    .filter((e: any) => e.statusCode === 'PASSED' || e.status?.code === 'PASSED')
                    .map((e: any) => e.testCaseId)
                    .filter((v: any, i: number, a: any[]) => a.indexOf(v) === i)
                    .length;

                return {
                    totalProjects: (projects || []).length,
                    totalTestCases: (testCases || []).length,
                    pendingTestCases: Math.max(0, (testCases || []).length - passedTestCasesCount),
                    totalExecutions: total,
                    passedExecutions: passed,
                    failedExecutions: failed,
                    pendingExecutions: pending,
                    passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
                    taskProgress: [],
                    executionsByStatus: [
                        { statusName: 'Passed', statusCode: 'PASSED', count: passed },
                        { statusName: 'Failed', statusCode: 'FAILED', count: failed },
                        { statusName: 'Pending', statusCode: 'PENDING', count: pending },
                    ],
                    projectTimeline: (projects || []).map((p: any) => ({
                        projectName: p.name,
                        startDate: new Date(p.startDate),
                        endDate: new Date(p.endDate)
                    }))
                } as DashboardSummary;
            })
        );
    }
}

