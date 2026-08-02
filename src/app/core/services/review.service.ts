// src/app/core/services/review.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ReviewSession,
  ReviewFinding,
  CreateReviewSessionDto,
  CreateReviewFindingDto,
  UpdateReviewFindingDto
} from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/review`;

  getById(id: string): Observable<ReviewSession> {
    return this.http.get<ReviewSession>(`${this.apiUrl}/${id}`);
  }

  getByProject(projectId: string): Observable<ReviewSession[]> {
    return this.http.get<ReviewSession[]>(`${this.apiUrl}/project/${projectId}`);
  }

  create(dto: CreateReviewSessionDto): Observable<ReviewSession> {
    return this.http.post<ReviewSession>(this.apiUrl, dto);
  }

  startSession(id: string): Observable<ReviewSession> {
    return this.http.post<ReviewSession>(`${this.apiUrl}/${id}/start`, {});
  }

  completeSession(id: string, conclusions: string, exitCriteria: string): Observable<ReviewSession> {
    return this.http.post<ReviewSession>(`${this.apiUrl}/${id}/complete`, { conclusions, exitCriteria });
  }

  cancelSession(id: string): Observable<ReviewSession> {
    return this.http.post<ReviewSession>(`${this.apiUrl}/${id}/cancel`, {});
  }

  addFinding(dto: CreateReviewFindingDto): Observable<ReviewFinding> {
    return this.http.post<ReviewFinding>(`${this.apiUrl}/finding`, dto);
  }

  updateFinding(findingId: string, dto: UpdateReviewFindingDto): Observable<ReviewFinding> {
    return this.http.put<ReviewFinding>(`${this.apiUrl}/finding/${findingId}`, dto);
  }

  deleteFinding(findingId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/finding/${findingId}`);
  }
}
