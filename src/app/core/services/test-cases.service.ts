// src/app/core/services/test-cases.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCase } from '../models/test-case.model';

@Injectable({ providedIn: 'root' })
export class TestCasesService {
    private readonly apiUrl = `${environment.apiUrl}/TestCases`;
    private http = inject(HttpClient);

    getTestCases(projectId?: string): Observable<TestCase[]> {
        let params = new HttpParams();
        if (projectId) {
            params = params.set('projectId', projectId);
        }
        return this.http.get<TestCase[]>(this.apiUrl, { params });
    }

    createTestCase(testCase: any): Observable<TestCase> {
        return this.http.post<TestCase>(this.apiUrl, testCase);
    }

    getTestCaseById(id: string): Observable<TestCase | undefined> {
        return this.http.get<TestCase>(`${this.apiUrl}/${id}`);
    }
}
