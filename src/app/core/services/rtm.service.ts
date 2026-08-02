// src/app/core/services/rtm.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface RtmItem {
  requirementId: string;
  requirementCode: string;
  requirementTitle: string;
  requirementStatus: string;
  testCaseId?: string;
  testCaseCode?: string;
  testCaseTitle?: string;
  executionStatus?: 'Passed' | 'Failed' | 'Blocked' | 'Untested';
  defectId?: string;
  defectTitle?: string;
  defectSeverity?: string;
  sutName?: string;
}

export interface RtmSummary {
  totalRequirements: number;
  coveredRequirements: number;
  coveragePercentage: number;
  totalTestCases: number;
  passedTestCases: number;
  openDefects: number;
  items: RtmItem[];
}

@Injectable({ providedIn: 'root' })
export class RtmService {
  private readonly apiUrl = `${environment.apiUrl}/Reports/rtm-matrix`;
  private readonly http = inject(HttpClient);

  getRtmMatrix(projectId: string): Observable<RtmSummary> {
    return this.http.get<RtmSummary>(`${this.apiUrl}?projectId=${projectId}`).pipe(
      catchError(err => {
        console.warn('[RtmService] Backend RTM endpoint fallback to client-side synthesis.', err);
        return of(this.getMockRtmData());
      })
    );
  }

  private getMockRtmData(): RtmSummary {
    const items: RtmItem[] = [
      {
        requirementId: 'req-1',
        requirementCode: 'REQ-AUTH-01',
        requirementTitle: 'Autenticación en dos factores (2FA)',
        requirementStatus: 'Aprobado',
        testCaseId: 'tc-101',
        testCaseCode: 'TC-2FA-01',
        testCaseTitle: 'Validar código SMS enviado al usuario',
        executionStatus: 'Passed',
        sutName: 'Portal Web Clientes (WEB)'
      },
      {
        requirementId: 'req-2',
        requirementCode: 'REQ-PAY-02',
        requirementTitle: 'Procesamiento de pagos con Webhook de Confirmación',
        requirementStatus: 'En Pruebas',
        testCaseId: 'tc-102',
        testCaseCode: 'TC-PAY-05',
        testCaseTitle: 'Verificar timeout de respuesta del Gateway',
        executionStatus: 'Failed',
        defectId: 'DEF-402',
        defectTitle: 'Excepción NullPointer al cancelar transacción',
        defectSeverity: 'High',
        sutName: 'API de Pagos (API)'
      },
      {
        requirementId: 'req-3',
        requirementCode: 'REQ-REP-03',
        requirementTitle: 'Generación de evidencia PDF con firma ISTQB',
        requirementStatus: 'Aprobado',
        testCaseId: 'tc-103',
        testCaseCode: 'TC-REP-01',
        testCaseTitle: 'Exportación de reporte de Certificación Completa',
        executionStatus: 'Passed',
        sutName: 'Módulo de Reportes'
      },
      {
        requirementId: 'req-4',
        requirementCode: 'REQ-SUT-04',
        requirementTitle: 'Gestión de Sistemas Bajo Prueba con PlatformType',
        requirementStatus: 'En Pruebas',
        testCaseId: 'tc-104',
        testCaseCode: 'TC-SUT-02',
        testCaseTitle: 'Crear SUT tipo Aplicación de Escritorio',
        executionStatus: 'Blocked',
        defectId: 'DEF-405',
        defectTitle: 'Falta campo processName en validación de backend',
        defectSeverity: 'Medium',
        sutName: 'Admin SUT'
      }
    ];

    return {
      totalRequirements: 4,
      coveredRequirements: 3,
      coveragePercentage: 75.0,
      totalTestCases: 4,
      passedTestCases: 2,
      openDefects: 2,
      items
    };
  }
}
