// src/app/core/services/test-executions.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TestExecution } from '../models/test-execution.model';
import { TestExecutionsMockService } from './test-executions.mock.service';

@Injectable({ providedIn: 'root' })
export class TestExecutionsService {
    private mockService = inject(TestExecutionsMockService);

    getExecutions(testCaseId?: string): Observable<TestExecution[]> {
        return this.mockService.getExecutions(testCaseId);
    }
}
