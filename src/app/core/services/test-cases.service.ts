// src/app/core/services/test-cases.service.ts
// Servicio para gestión de casos de prueba: CRUD y pasos de prueba.
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
    /** Prefijo para logs de seguimiento */
    private readonly LOG_TAG = '[TestCasesService]';

    /** URL base del endpoint de casos de prueba */
    private readonly apiUrl = `${environment.apiUrl}/TestCases`;

    private readonly http = inject(HttpClient);
    private readonly mockService = inject(TestCasesMockService);

    /**
     * Obtiene la lista de casos de prueba, opcionalmente filtrados por proyecto.
     * @param projectId - ID del proyecto para filtrar (opcional)
     */
    getTestCases(projectId?: string): Observable<TestCase[]> {
        if (environment.useMock) {
            return this.mockService.getTestCases(projectId);
        }
        let params = new HttpParams();
        if (projectId) {
            params = params.set('projectId', projectId);
        }
        console.log(this.LOG_TAG, 'Obteniendo casos de prueba', projectId ? `para proyecto: ${projectId}` : '(todos)');
        return this.http.get<TestCaseDto[]>(this.apiUrl, { params }).pipe(
            map(dtos => dtos.map(dto => TestCaseMapper.fromDto(dto)))
        );
    }

    /**
     * Crea un nuevo caso de prueba.
     * @param testCase - Datos del caso de prueba a crear
     */
    createTestCase(testCase: CreateTestCaseDto): Observable<TestCase> {
        if (environment.useMock) {
            return this.mockService.createTestCase(testCase as any);
        }
        console.log(this.LOG_TAG, 'Creando caso de prueba:', testCase.title);
        return this.http.post<TestCaseDto>(this.apiUrl, testCase).pipe(
            map(dto => TestCaseMapper.fromDto(dto))
        );
    }

    /**
     * Actualiza un caso de prueba existente.
     * @param id - ID del caso de prueba
     * @param testCase - Campos a actualizar
     */
    updateTestCase(id: string, testCase: any): Observable<TestCase> {
        if (environment.useMock) {
            return this.mockService.updateTestCase(id, testCase);
        }
        console.log(this.LOG_TAG, 'Actualizando caso de prueba:', id);
        return this.http.put<TestCaseDto>(`${this.apiUrl}/${id}`, testCase).pipe(
            map(dto => TestCaseMapper.fromDto(dto))
        );
    }

    /**
     * Obtiene un caso de prueba por su ID.
     * @param id - Identificador único del caso de prueba
     */
    getTestCaseById(id: string): Observable<TestCase | undefined> {
        if (environment.useMock) {
            return this.mockService.getTestCaseById(id);
        }
        return this.http.get<TestCaseDto>(`${this.apiUrl}/${id}`).pipe(
            map(dto => TestCaseMapper.fromDto(dto))
        );
    }

    /**
     * Obtiene los pasos de un caso de prueba.
     * @param testCaseId - ID del caso de prueba
     */
    getTestSteps(testCaseId: string): Observable<any[]> {
        if (environment.useMock) {
            return this.mockService.getTestSteps(testCaseId);
        }
        console.log(this.LOG_TAG, 'Obteniendo pasos del caso:', testCaseId);
        return this.http.get<any[]>(`${this.apiUrl}/${testCaseId}/steps`);
    }
}
