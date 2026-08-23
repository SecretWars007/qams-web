// src/app/core/services/rtm.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<RtmSummary>(`${this.apiUrl}?projectId=${projectId}`);
  }
}

