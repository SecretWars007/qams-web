// src/app/core/services/test-environments.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TestEnvironment,
  CreateTestEnvironmentDto,
  UpdateTestEnvironmentDto
} from '../models/test-environment.model';

@Injectable({
  providedIn: 'root'
})
export class TestEnvironmentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/testenvironments`;

  getByProject(projectId: string): Observable<TestEnvironment[]> {
    return this.http.get<TestEnvironment[]>(`${this.apiUrl}/project/${projectId}`);
  }

  getById(id: string): Observable<TestEnvironment> {
    return this.http.get<TestEnvironment>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateTestEnvironmentDto): Observable<TestEnvironment> {
    return this.http.post<TestEnvironment>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateTestEnvironmentDto): Observable<TestEnvironment> {
    return this.http.put<TestEnvironment>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
