// src/app/core/services/reports.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interfaz para los filtros del reporte de proyecto.
 * Permite filtrar por IDs de estado de ejecución, nombres de estado de tarea y rango de fechas.
 */
export interface ProjectReportFilter {
    projectId: string;
    executionStatusIds?: number[];
    taskStatusNames?: string[];
    startDate?: string;
    endDate?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
    private readonly apiUrl = `${environment.apiUrl}/Reports`;
    private http = inject(HttpClient);

    /** Genera el reporte general del proyecto en formato PDF (Blob) */
    generateProjectReport(filter: ProjectReportFilter): Observable<Blob> {
        let params = new HttpParams().set('ProjectId', filter.projectId);

        if (filter.executionStatusIds && filter.executionStatusIds.length > 0) {
            filter.executionStatusIds.forEach(id => {
                params = params.append('ExecutionStatusIds', id.toString());
            });
        }

        if (filter.taskStatusNames && filter.taskStatusNames.length > 0) {
            filter.taskStatusNames.forEach(name => {
                params = params.append('TaskStatusNames', name);
            });
        }

        if (filter.startDate) {
            params = params.set('StartDate', filter.startDate);
        }

        if (filter.endDate) {
            params = params.set('EndDate', filter.endDate);
        }

        return this.http.get(`${this.apiUrl}/project`, {
            params,
            responseType: 'blob'
        });
    }

    /** Genera el reporte de Burndown para un proyecto específico */
    generateBurndownReport(projectId: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/project/${projectId}/burndown`, {
            responseType: 'blob'
        });
    }

    /** Genera el reporte de Observaciones (incluye historial de devoluciones) */
    generateObservationsReport(projectId: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/project/${projectId}/observations`, {
            responseType: 'blob'
        });
    }

    /** Genera el Certificado de Cumplimiento QA (incluye matriz de trazabilidad básica) */
    generateComplianceReport(projectId: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/project/${projectId}/compliance`, {
            responseType: 'blob'
        });
    }
}
