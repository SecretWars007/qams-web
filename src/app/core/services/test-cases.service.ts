// src/app/core/services/test-cases.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCaseDto, CreateTestCaseDto } from '../dto/test-case.dto';
import { TestCase } from '../models/test-case.model';
import { TestCaseMapper } from '../mappers/test-case.mapper';
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
        return this.http.get<TestCaseDto[]>(this.apiUrl, { params }).pipe(
            map(dtos => dtos.map(dto => TestCaseMapper.fromDto(dto)))
        );
    }

    createTestCase(testCase: CreateTestCaseDto): Observable<TestCase> {
        if (environment.useMock) {
            return this.mockService.createTestCase(testCase as any);
        }
        return this.http.post<TestCaseDto>(this.apiUrl, testCase).pipe(
            map(dto => TestCaseMapper.fromDto(dto))
        );
    }

    updateTestCase(id: string, testCase: any): Observable<TestCase> {
        if (environment.useMock) {
            return this.mockService.updateTestCase(id, testCase);
        }
        return this.http.put<TestCaseDto>(`${this.apiUrl}/${id}`, testCase).pipe(
            map(dto => TestCaseMapper.fromDto(dto))
        );
    }

    getTestCaseById(id: string): Observable<TestCase | undefined> {
        if (environment.useMock) {
            return this.mockService.getTestCaseById(id);
        }
        return this.http.get<TestCaseDto>(`${this.apiUrl}/${id}`).pipe(
            map(dto => TestCaseMapper.fromDto(dto))
        );
    }

    getTestSteps(testCaseId: string): Observable<any[]> {
        if (environment.useMock) {
            return this.mockService.getTestSteps(testCaseId);
        }
        return this.http.get<any[]>(`${this.apiUrl}/${testCaseId}/steps`);
    }
}
