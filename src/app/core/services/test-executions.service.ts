// src/app/core/services/test-executions.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestExecution } from '../models/test-execution.model';
import { TestExecutionsMockService } from './test-executions.mock.service';

@Injectable({ providedIn: 'root' })
export class TestExecutionsService {
    private readonly apiUrl = `${environment.apiUrl}/TestExecutions`;
    private http = inject(HttpClient);
    private mockService = inject(TestExecutionsMockService);

    getExecutions(testCaseId?: string, projectId?: string, testSuiteId?: string): Observable<TestExecution[]> {
        if (environment.useMock) {
            return this.mockService.getExecutions(testCaseId, projectId, testSuiteId);
        }

        // Si tenemos testCaseId, usamos el endpoint específico del backend
        if (testCaseId) {
            const url = `${this.apiUrl}/testcase/${testCaseId}`;
            console.log('TestExecutionsService: Llamando a endpoint por testCaseId:', url);
            return this.http.get<TestExecution[]>(url);
        }

        // Si no hay testCaseId, el backend no permite listar todo. 
        // Usamos "my-executions" como vista por defecto para evitar el error 405.
        const url = `${this.apiUrl}/my-executions`;
        console.log('TestExecutionsService: Llamando a mis ejecuciones por defecto:', url);
        return this.http.get<TestExecution[]>(url);
    }

    getExecutionById(id: string): Observable<TestExecution> {
        if (environment.useMock) {
            // Unir la búsqueda mock si es necesario, por ahora retornamos de la lista local
            return this.mockService.getExecutions().pipe(
                map((list: TestExecution[]) => list.find((e: TestExecution) => e.id === id)!)
            );
        }
        return this.http.get<TestExecution>(`${this.apiUrl}/${id}`);
    }

    createExecution(execution: any): Observable<TestExecution> {
        if (environment.useMock) {
            return this.mockService.createExecution(execution);
        }
        // El backend prefiere el endpoint "complete" para creaciones con pasos
        return this.http.post<TestExecution>(`${this.apiUrl}/complete`, execution);
    }

    updateExecution(id: string, execution: any): Observable<TestExecution> {
        if (environment.useMock) {
            return this.mockService.updateExecution(id, execution);
        }

        // Si tenemos stepResults, enviamos el objeto completo para actualización total y re-evaluación automática
        if (execution.stepResults && execution.stepResults.length > 0) {
            const payload = {
                notes: execution.notes,
                actualTimeHours: execution.actualTimeHours,
                globalStatusId: execution.statusId, // Opcional, el backend re-evaluará
                stepResults: execution.stepResults.map((sr: any) => ({
                    testStepId: sr.testStepId,
                    statusId: sr.statusId,
                    actualResult: sr.actualResult,
                    notes: sr.notes
                }))
            };
            console.log('TestExecutionsService: Enviando actualización completa:', payload);
            return this.http.put<TestExecution>(`${this.apiUrl}/${id}/full-update`, payload);
        }

        // Fallback para actualización simple de estado si no hay pasos
        const payload = {
            statusId: execution.statusId
        };

        return this.http.put<TestExecution>(`${this.apiUrl}/${id}`, payload);
    }

    uploadEvidence(executionId: string, file: File, description?: string, stepResultId?: string): Observable<any> {
        if (environment.useMock) {
            return this.mockService.uploadEvidence(executionId, file, description, stepResultId);
        }

        const formData = new FormData();
        formData.append('File', file);
        if (description) formData.append('Description', description);
        if (stepResultId) formData.append('StepResultId', stepResultId);

        return this.http.post(`${this.apiUrl}/${executionId}/evidence`, formData);
    }

    addObservation(stepResultId: string, observation: string, file?: File): Observable<any> {
        if (environment.useMock) {
            return this.mockService.addObservation(stepResultId, observation, file);
        }
        const formData = new FormData();
        formData.append('ExecutionStepResultId', stepResultId);
        formData.append('Observation', observation);
        if (file) formData.append('File', file);

        return this.http.post(`${this.apiUrl}/observation`, formData);
    }

    respondToObservation(observationId: string, response: string): Observable<any> {
        if (environment.useMock) {
            return this.mockService.respondToObservation(observationId, response);
        }
        return this.http.post(`${this.apiUrl}/observation/${observationId}/response`, { response });
    }

    updateStepResult(executionId: string, stepResultId: string, payload: any): Observable<any> {
        if (environment.useMock) {
            return this.mockService.updateStepResult(executionId, stepResultId, payload);
        }
        return this.http.put(`${this.apiUrl}/${executionId}/step-result`, {
            testStepId: payload.testStepId,
            statusId: payload.statusId,
            actualResult: payload.actualResult,
            notes: payload.notes
        });
    }

    completeExecution(executionId: string, statusId: number): Observable<any> {
        if (environment.useMock) {
            return this.mockService.completeExecution(executionId, statusId);
        }
        return this.http.put(`${this.apiUrl}/${executionId}/complete/${statusId}`, {});
    }
}
