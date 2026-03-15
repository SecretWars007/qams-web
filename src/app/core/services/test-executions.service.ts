import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestExecutionDto, CreateTestExecutionDto } from '../dto/test-execution.dto';
import { TestExecution } from '../models/test-execution.model';
import { TestExecutionMapper } from '../mappers/test-execution.mapper';
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

        if (testCaseId) {
            const url = `${this.apiUrl}/testcase/${testCaseId}`;
            return this.http.get<TestExecutionDto[]>(url).pipe(
                map(dtos => dtos.map(dto => TestExecutionMapper.fromDto(dto)))
            );
        }

        const url = `${this.apiUrl}/my-executions`;
        return this.http.get<TestExecutionDto[]>(url).pipe(
            map(dtos => dtos.map(dto => TestExecutionMapper.fromDto(dto)))
        );
    }

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
