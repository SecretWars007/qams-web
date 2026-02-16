// src/app/core/services/test-executions.mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TestExecution } from '../models/test-execution.model';

@Injectable({ providedIn: 'root' })
export class TestExecutionsMockService {

    private executions: TestExecution[] = [
        // PASSED Executions
        {
            id: '1',
            testCaseId: '1',
            testCaseTitle: 'Verify Login with Valid Credentials',
            testerId: 'u1',
            testerName: 'John Doe',
            statusId: 1,
            statusName: 'Passed',
            statusCode: 'PASSED',
            notes: 'Login successful within 2 seconds.',
            executionDate: '2026-02-10T09:15:00Z',
            completedAt: '2026-02-10T09:15:05Z',
            stepResults: [],
            evidences: []
        },
        {
            id: '4',
            testCaseId: '2',
            testCaseTitle: 'Verify Logout Functionality',
            testerId: 'u1',
            testerName: 'John Doe',
            statusId: 1,
            statusName: 'Passed',
            statusCode: 'PASSED',
            notes: 'User logged out successfully.',
            executionDate: '2026-02-13T10:00:00Z',
            completedAt: '2026-02-13T10:00:15Z',
            stepResults: [],
            evidences: []
        },
        // FAILED Executions
        {
            id: '2',
            testCaseId: '1',
            testCaseTitle: 'Verify Login with Valid Credentials',
            testerId: 'u2',
            testerName: 'Jane Smith',
            statusId: 2,
            statusName: 'Failed',
            statusCode: 'FAILED',
            notes: 'Login page timeout.',
            executionDate: '2026-02-11T14:00:00Z',
            completedAt: '2026-02-11T14:00:10Z',
            stepResults: [],
            evidences: []
        },
        // BLOCKED Executions
        {
            id: '3',
            testCaseId: '3',
            testCaseTitle: 'Checkout - Process Payment',
            testerId: 'u1',
            testerName: 'John Doe',
            statusId: 3,
            statusName: 'Blocked',
            statusCode: 'BLOCKED',
            notes: 'Payment gateway sandbox is down.',
            executionDate: '2026-02-12T11:30:00Z',
            completedAt: '2026-02-12T11:30:00Z',
            stepResults: [],
            evidences: []
        },
        // IN_PROGRESS Executions
        {
            id: '5',
            testCaseId: '4',
            testCaseTitle: 'Search Product by Name',
            testerId: 'u2',
            testerName: 'Jane Smith',
            statusId: 4,
            statusName: 'In Progress',
            statusCode: 'IN_PROGRESS',
            notes: 'Currently executing test steps.',
            executionDate: '2026-02-14T08:00:00Z',
            completedAt: null,
            stepResults: [],
            evidences: []
        },
        {
            id: '6',
            testCaseId: '5',
            testCaseTitle: 'Add Item to Shopping Cart',
            testerId: 'u3',
            testerName: 'QA Team',
            statusId: 4,
            statusName: 'In Progress',
            statusCode: 'IN_PROGRESS',
            notes: 'Testing cart functionality.',
            executionDate: '2026-02-14T09:30:00Z',
            completedAt: null,
            stepResults: [],
            evidences: []
        },
        // PENDING Executions
        {
            id: '7',
            testCaseId: '6',
            testCaseTitle: 'Verify Email Notifications',
            testerId: 'u1',
            testerName: 'John Doe',
            statusId: 5,
            statusName: 'Pending',
            statusCode: 'PENDING',
            notes: 'Scheduled for execution.',
            executionDate: '2026-02-15T10:00:00Z',
            completedAt: null,
            stepResults: [],
            evidences: []
        },
        {
            id: '8',
            testCaseId: '7',
            testCaseTitle: 'Password Reset Flow',
            testerId: 'u2',
            testerName: 'Jane Smith',
            statusId: 5,
            statusName: 'Pending',
            statusCode: 'PENDING',
            notes: 'Awaiting test environment setup.',
            executionDate: '2026-02-16T14:00:00Z',
            completedAt: null,
            stepResults: [],
            evidences: []
        },
        {
            id: '9',
            testCaseId: '8',
            testCaseTitle: 'Multi-language Support',
            testerId: 'u3',
            testerName: 'QA Team',
            statusId: 5,
            statusName: 'Pending',
            statusCode: 'PENDING',
            notes: 'Pending localization data.',
            executionDate: '2026-02-17T11:00:00Z',
            completedAt: null,
            stepResults: [],
            evidences: []
        }
    ];

    constructor() { }

    getExecutions(testCaseId?: string): Observable<TestExecution[]> {
        let filtered = this.executions;
        if (testCaseId) {
            filtered = this.executions.filter(e => e.testCaseId === testCaseId);
        }
        return of(filtered).pipe(delay(800));
    }
}
