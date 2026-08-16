// src/app/core/services/test-plans.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TestPlan, CreateTestPlan, UpdateTestPlan, ApproveTestPlan } from '../models/test-plan.model';
import { TestPlanDto } from '../dto/test-plan.dto';
import { TestPlanMapper } from '../mappers/test-plan.mapper';

@Injectable({ providedIn: 'root' })
export class TestPlansService {
  private readonly apiUrl = `${environment.apiUrl}/TestPlans`;
  private readonly http = inject(HttpClient);
  private readonly LOG_TAG = '[TestPlansService]';

  getAll(): Observable<TestPlan[]> {
    return this.http.get<TestPlanDto[]>(this.apiUrl).pipe(
      map(dtos => dtos.map(dto => TestPlanMapper.fromDto(dto))),
      catchError(err => {
        console.error(this.LOG_TAG, 'Error fetching all test plans', err);
        return of([]);
      })
    );
  }

  getByProject(projectId: string): Observable<TestPlan[]> {
    return this.http.get<TestPlanDto[]>(`${this.apiUrl}/project/${projectId}`).pipe(
      map(dtos => dtos.map(dto => TestPlanMapper.fromDto(dto))),
      catchError(err => {
        console.error(this.LOG_TAG, `Error fetching test plans for project ${projectId}`, err);
        return of([]);
      })
    );
  }

  getBySut(sutId: string): Observable<TestPlan[]> {
    return this.http.get<TestPlanDto[]>(`${this.apiUrl}/sut/${sutId}`).pipe(
      map(dtos => dtos.map(dto => TestPlanMapper.fromDto(dto))),
      catchError(err => {
        console.error(this.LOG_TAG, `Error fetching test plans for SUT ${sutId}`, err);
        return of([]);
      })
    );
  }

  getById(id: string): Observable<TestPlan> {
    return this.http.get<TestPlanDto>(`${this.apiUrl}/${id}`).pipe(
      map(dto => TestPlanMapper.fromDto(dto))
    );
  }

  create(testPlan: CreateTestPlan): Observable<TestPlan> {
    return this.http.post<TestPlanDto>(this.apiUrl, testPlan).pipe(
      map(dto => TestPlanMapper.fromDto(dto))
    );
  }

  update(id: string, testPlan: UpdateTestPlan): Observable<TestPlan> {
    return this.http.put<TestPlanDto>(`${this.apiUrl}/${id}`, testPlan).pipe(
      map(dto => TestPlanMapper.fromDto(dto))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  approve(id: string, dto: ApproveTestPlan): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/approve`, dto);
  }
}
