// src/app/core/services/test-executions.service.ts
// Servicio de ejecuciones de prueba: CRUD, evidencias, observaciones, resultados de pasos.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestExecutionDto } from '../dto/test-execution.dto';
import { TestExecution } from '../models/test-execution.model';
import { TestExecutionMapper } from '../mappers/test-execution.mapper';
import { TestExecutionsMockService } from './test-executions.mock.service';

@Injectable({ providedIn: 'root' })
export class TestExecutionsService {
    /** Prefijo para logs de seguimiento */
    private readonly LOG_TAG = '[TestExecutionsService]';

    /** URL base del endpoint de ejecuciones */
    private readonly apiUrl = `${environment.apiUrl}/TestExecutions`;

    private readonly http = inject(HttpClient);
    private readonly mockService = inject(TestExecutionsMockService);

    /**
     * Obtiene ejecuciones, opcionalmente filtradas por caso, proyecto o suite.
     * @param testCaseId - Filtro por caso de prueba (opcional)
     * @param projectId - Filtro por proyecto (opcional)
     * @param testSuiteId - Filtro por suite de prueba (opcional)
     */
    getExecutions(testCaseId?: string, projectId?: string, testSuiteId?: string): Observable<TestExecution[]> {
        if (environment.useMock) {
            return this.mockService.getExecutions(testCaseId, projectId, testSuiteId);
        }

        if (testCaseId) {
            const url = `${this.apiUrl}/testcase/${testCaseId}`;
            console.log(this.LOG_TAG, 'Obteniendo ejecuciones del caso:', testCaseId);
            return this.http.get<TestExecutionDto[]>(url).pipe(
                map(dtos => dtos.map(dto => TestExecutionMapper.fromDto(dto)))
            );
        }

        const url = `${this.apiUrl}/my-executions`;
        console.log(this.LOG_TAG, 'Obteniendo mis ejecuciones');
        return this.http.get<TestExecutionDto[]>(url).pipe(
            map(dtos => dtos.map(dto => TestExecutionMapper.fromDto(dto)))
        );
    }

    /**
     * Obtiene una ejecución por su ID con detalles completos.
     * @param id - ID de la ejecución
     */
    getExecutionById(id: string): Observable<TestExecution> {
        if (environment.useMock) {
            return this.mockService.getExecutions().pipe(
                map((list: TestExecution[]) => list.find((e: TestExecution) => e.id === id)!)
            );
        }
        return this.http.get<TestExecutionDto>(`${this.apiUrl}/${id}`).pipe(
            map(dto => TestExecutionMapper.fromDto(dto))
        );
    }

    /**
     * Crea una nueva ejecución de prueba con sus pasos.
     * @param execution - Datos de la ejecución a crear
     */
    createExecution(execution: any): Observable<TestExecution> {
        if (environment.useMock) {
            return this.mockService.createExecution(execution);
        }
        console.log(this.LOG_TAG, 'Creando ejecución para caso:', execution.testCaseId);
        return this.http.post<TestExecution>(`${this.apiUrl}/complete`, execution);
    }

    /**
     * Actualiza una ejecución existente. Si incluye stepResults, usa full-update.
     * @param id - ID de la ejecución
     * @param execution - Datos a actualizar (puede incluir stepResults)
     */
    updateExecution(id: string, execution: any): Observable<TestExecution> {
        if (environment.useMock) {
            return this.mockService.updateExecution(id, execution);
        }

        // Actualización completa con resultados de pasos → re-evaluación automática del backend
        if (execution.stepResults && execution.stepResults.length > 0) {
            const payload = {
                notes: execution.notes,
                actualTimeHours: execution.actualTimeHours,
                globalStatusId: execution.statusId,
                stepResults: execution.stepResults.map((sr: any) => ({
                    testStepId: sr.testStepId,
                    statusId: sr.statusId,
                    actualResult: sr.actualResult,
                    notes: sr.notes
                }))
            };
            console.log(this.LOG_TAG, 'Actualización completa de ejecución:', id, '- Pasos:', payload.stepResults.length);
            return this.http.put<TestExecution>(`${this.apiUrl}/${id}/full-update`, payload);
        }

        // Actualización simple de estado (sin pasos)
        const payload = { statusId: execution.statusId };
        console.log(this.LOG_TAG, 'Actualización simple de ejecución:', id);
        return this.http.put<TestExecution>(`${this.apiUrl}/${id}`, payload);
    }

    /**
     * Sube un archivo de evidencia para una ejecución.
     * @param executionId - ID de la ejecución
     * @param file - Archivo a subir
     * @param description - Descripción de la evidencia (opcional)
     * @param stepResultId - ID del resultado de paso asociado (opcional)
     */
    uploadEvidence(executionId: string, file: File, description?: string, stepResultId?: string): Observable<any> {
        if (environment.useMock) {
            return this.mockService.uploadEvidence(executionId, file, description, stepResultId);
        }

        const formData = new FormData();
        formData.append('File', file);
        if (description) formData.append('Description', description);
        if (stepResultId) formData.append('StepResultId', stepResultId);

        console.log(this.LOG_TAG, 'Subiendo evidencia para ejecución:', executionId);
        return this.http.post(`${this.apiUrl}/${executionId}/evidence`, formData);
    }

    /**
     * Agrega una observación a un resultado de paso.
     * @param stepResultId - ID del resultado de paso
     * @param observation - Texto de la observación
     * @param file - Archivo adjunto (opcional)
     */
    addObservation(stepResultId: string, observation: string, file?: File): Observable<any> {
        if (environment.useMock) {
            return this.mockService.addObservation(stepResultId, observation, file);
        }
        const formData = new FormData();
        formData.append('ExecutionStepResultId', stepResultId);
        formData.append('Observation', observation);
        if (file) formData.append('File', file);

        console.log(this.LOG_TAG, 'Agregando observación al paso:', stepResultId);
        return this.http.post(`${this.apiUrl}/observation`, formData);
    }

    /**
     * Responde a una observación existente.
     * @param observationId - ID de la observación
     * @param response - Texto de respuesta
     */
    respondToObservation(observationId: string, response: string): Observable<any> {
        if (environment.useMock) {
            return this.mockService.respondToObservation(observationId, response);
        }
        console.log(this.LOG_TAG, 'Respondiendo observación:', observationId);
        return this.http.post(`${this.apiUrl}/observation/${observationId}/response`, { response });
    }

    /**
     * Actualiza el resultado de un paso individual dentro de una ejecución.
     * @param executionId - ID de la ejecución
     * @param stepResultId - ID del resultado de paso
     * @param payload - Datos del paso (statusId, actualResult, notes)
     */
    updateStepResult(executionId: string, stepResultId: string, payload: any): Observable<any> {
        if (environment.useMock) {
            return this.mockService.updateStepResult(executionId, stepResultId, payload);
        }
        console.log(this.LOG_TAG, 'Actualizando resultado de paso:', stepResultId);
        return this.http.put(`${this.apiUrl}/${executionId}/step-result`, {
            testStepId: payload.testStepId,
            statusId: payload.statusId,
            actualResult: payload.actualResult,
            notes: payload.notes
        });
    }

    /**
     * Marca una ejecución como completada con un estado final.
     * @param executionId - ID de la ejecución
     * @param statusId - ID del estado final (e.g., 1=PASSED, 2=FAILED)
     */
    completeExecution(executionId: string, statusId: number): Observable<any> {
        if (environment.useMock) {
            return this.mockService.completeExecution(executionId, statusId);
        }
        console.log(this.LOG_TAG, 'Completando ejecución:', executionId, 'con estado:', statusId);
        return this.http.put(`${this.apiUrl}/${executionId}/complete/${statusId}`, {});
    }
}
