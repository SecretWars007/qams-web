// src/app/core/services/test-suites.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestSuite, CreateTestSuite } from '../models/test-suite.model';
import { TestSuiteDto } from '../dto/test-suite.dto';
import { TestSuiteMapper } from '../mappers/test-suite.mapper';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TestSuitesService {
    private readonly apiUrl = `${environment.apiUrl}/TestSuites`;
    private readonly http = inject(HttpClient);

    getTestSuitesByProjectId(projectId: string): Observable<TestSuite[]> {
        return this.http.get<TestSuiteDto[]>(`${this.apiUrl}/project/${projectId}`).pipe(
            map(dtos => dtos.map(dto => TestSuiteMapper.fromDto(dto)))
        );
    }

    createTestSuite(testSuite: CreateTestSuite): Observable<TestSuite> {
        return this.http.post<TestSuiteDto>(this.apiUrl, testSuite).pipe(
            map(dto => TestSuiteMapper.fromDto(dto))
        );
    }

    getTestSuiteById(id: string): Observable<TestSuite | undefined> {
        return this.http.get<TestSuiteDto>(`${this.apiUrl}/${id}`).pipe(
            map(dto => TestSuiteMapper.fromDto(dto))
        );
    }

    updateTestSuite(id: string, testSuite: any): Observable<TestSuite> {
        return this.http.put<TestSuite>(`${this.apiUrl}/${id}`, testSuite);
    }

    deleteTestSuite(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
