// src/app/core/services/test-cases.service.ts
// Servicio para gestión de casos de prueba: CRUD y pasos de prueba.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCaseDto, CreateTestCaseDto } from '../dto/test-case.dto';
import { TestCase } from '../models/test-case.model';
import { TestCaseMapper } from '../mappers/test-case.mapper';

@Injectable({ providedIn: 'root' })
export class TestCasesService {
    /** Prefijo para logs de seguimiento */
    private readonly LOG_TAG = '[TestCasesService]';

    /** URL base del endpoint de casos de prueba */
    private readonly apiUrl = `${environment.apiUrl}/TestCases`;

    private readonly http = inject(HttpClient);

    /**
     * Obtiene la lista de casos de prueba, opcionalmente filtrados por proyecto.
     * @param projectId - ID del proyecto para filtrar (opcional)
     */
    getTestCases(projectId?: string): Observable<TestCase[]> {
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
        return this.http.get<TestCaseDto>(`${this.apiUrl}/${id}`).pipe(
            map(dto => TestCaseMapper.fromDto(dto))
        );
    }

    /**
     * Obtiene los pasos de un caso de prueba.
     * @param testCaseId - ID del caso de prueba
     */
    getTestSteps(testCaseId: string): Observable<any[]> {
        console.log(this.LOG_TAG, 'Obteniendo pasos del caso:', testCaseId);
        return this.http.get<any[]>(`${this.apiUrl}/${testCaseId}/steps`);
    }

    /**
     * Descarga el archivo CSV de casos de prueba de un proyecto.
     */
    exportCsv(projectId: string): Observable<Blob> {
        console.log(this.LOG_TAG, 'Exportando CSV para proyecto:', projectId);
        const params = new HttpParams().set('projectId', projectId);
        return this.http.get(`${this.apiUrl}/export/csv`, { params, responseType: 'blob' });
    }

    /**
     * Realiza la eliminación lógica de un caso de prueba.
     * @param id - ID del caso de prueba a eliminar
     */
    deleteTestCase(id: string): Observable<void> {
        console.log(this.LOG_TAG, 'Eliminando caso de prueba:', id);
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

