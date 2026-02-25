// src/app/core/services/test-suites.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestSuite, CreateTestSuite } from '../models/test-suite.model';
import { TestSuitesMockService } from './test-suites.mock.service';

@Injectable({ providedIn: 'root' })
export class TestSuitesService {
    private readonly apiUrl = `${environment.apiUrl}/TestSuites`;
    private http = inject(HttpClient);
    private mockService = inject(TestSuitesMockService);

    getTestSuitesByProjectId(projectId: string): Observable<TestSuite[]> {
        if (environment.useMock) {
            return this.mockService.getTestSuitesByProjectId(projectId);
        }
        return this.http.get<TestSuite[]>(`${this.apiUrl}/project/${projectId}`);
    }

    createTestSuite(testSuite: CreateTestSuite): Observable<TestSuite> {
        if (environment.useMock) {
            return this.mockService.createTestSuite(testSuite);
        }
        return this.http.post<TestSuite>(this.apiUrl, testSuite);
    }

    getTestSuiteById(id: string): Observable<TestSuite | undefined> {
        if (environment.useMock) {
            return this.mockService.getTestSuiteById(id);
        }
        return this.http.get<TestSuite>(`${this.apiUrl}/${id}`);
    }

    updateTestSuite(id: string, testSuite: any): Observable<TestSuite> {
        if (environment.useMock) {
            // Mock not implemented for update yet, but let's at least have the check
            return this.http.put<TestSuite>(`${this.apiUrl}/${id}`, testSuite);
        }
        return this.http.put<TestSuite>(`${this.apiUrl}/${id}`, testSuite);
    }

    deleteTestSuite(id: string): Observable<void> {
        if (environment.useMock) {
            return this.http.delete<void>(`${this.apiUrl}/${id}`);
        }
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
