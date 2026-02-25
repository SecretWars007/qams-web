// src/app/core/services/test-cases.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCase } from '../models/test-case.model';
import { TestCasesMockService } from './test-cases.mock.service';

@Injectable({ providedIn: 'root' })
export class TestCasesService {
    private readonly apiUrl = `${environment.apiUrl}/TestCases`;
    private http = inject(HttpClient);
    private mockService = inject(TestCasesMockService);

    getTestCases(projectId?: string): Observable<TestCase[]> {
        if (environment.useMock) {
            return this.mockService.getTestCases(projectId);
        }
        let params = new HttpParams();
        if (projectId) {
            params = params.set('projectId', projectId);
        }
        return this.http.get<TestCase[]>(this.apiUrl, { params });
    }

    createTestCase(testCase: any): Observable<TestCase> {
        if (environment.useMock) {
            return this.mockService.createTestCase(testCase);
        }
        return this.http.post<TestCase>(this.apiUrl, testCase);
    }

    updateTestCase(id: string, testCase: any): Observable<TestCase> {
        if (environment.useMock) {
            return this.mockService.updateTestCase(id, testCase);
        }
        return this.http.put<TestCase>(`${this.apiUrl}/${id}`, testCase);
    }

    getTestCaseById(id: string): Observable<TestCase | undefined> {
        if (environment.useMock) {
            return this.mockService.getTestCaseById(id);
        }
        return this.http.get<TestCase>(`${this.apiUrl}/${id}`);
    }

    getTestSteps(testCaseId: string): Observable<any[]> {
        if (environment.useMock) {
            return this.mockService.getTestSteps(testCaseId);
        }
        return this.http.get<any[]>(`${this.apiUrl}/${testCaseId}/steps`);
    }
}
