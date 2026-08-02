// src/app/core/services/exploratory.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ExploratorySession,
  ExploratoryFinding,
  CreateExploratorySessionDto,
  UpdateExploratorySessionDto,
  CreateExploratoryFindingDto
} from '../models/exploratory.model';

@Injectable({
  providedIn: 'root'
})
export class ExploratoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/exploratory`;

  getById(id: string): Observable<ExploratorySession> {
    return this.http.get<ExploratorySession>(`${this.apiUrl}/${id}`);
  }

  getByProject(projectId: string): Observable<ExploratorySession[]> {
    return this.http.get<ExploratorySession[]>(`${this.apiUrl}/project/${projectId}`);
  }

  create(dto: CreateExploratorySessionDto): Observable<ExploratorySession> {
    return this.http.post<ExploratorySession>(this.apiUrl, dto);
  }

  startSession(id: string): Observable<ExploratorySession> {
    return this.http.post<ExploratorySession>(`${this.apiUrl}/${id}/start`, {});
  }

  completeSession(id: string, dto: UpdateExploratorySessionDto): Observable<ExploratorySession> {
    return this.http.post<ExploratorySession>(`${this.apiUrl}/${id}/complete`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addFinding(dto: CreateExploratoryFindingDto): Observable<ExploratoryFinding> {
    return this.http.post<ExploratoryFinding>(`${this.apiUrl}/finding`, dto);
  }

  deleteFinding(findingId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/finding/${findingId}`);
  }
}
