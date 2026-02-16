// src/app/core/services/test-suites.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestSuite, CreateTestSuite } from '../models/test-suite.model';

@Injectable({ providedIn: 'root' })
export class TestSuitesService {
    private readonly apiUrl = `${environment.apiUrl}/TestSuites`;
    private http = inject(HttpClient);

    getTestSuitesByProjectId(projectId: string): Observable<TestSuite[]> {
        return this.http.get<TestSuite[]>(`${this.apiUrl}/project/${projectId}`);
    }

    createTestSuite(testSuite: CreateTestSuite): Observable<TestSuite> {
        return this.http.post<TestSuite>(this.apiUrl, testSuite);
    }

    getTestSuiteById(id: string): Observable<TestSuite> {
        return this.http.get<TestSuite>(`${this.apiUrl}/${id}`);
    }

    updateTestSuite(id: string, testSuite: any): Observable<TestSuite> {
        return this.http.put<TestSuite>(`${this.apiUrl}/${id}`, testSuite);
    }

    deleteTestSuite(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
