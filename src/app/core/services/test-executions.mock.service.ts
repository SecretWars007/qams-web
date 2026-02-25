// src/app/core/services/test-executions.mock.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { TestExecution, Evidence } from '../models/test-execution.model';
import { TestCasesMockService } from './test-cases.mock.service';

@Injectable({ providedIn: 'root' })
export class TestExecutionsMockService {
    private testCasesService = inject(TestCasesMockService);

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
            actualTimeHours: 0.5,
            executionDate: '2026-02-10T09:15:00Z',
            completedAt: '2026-02-10T09:15:05Z',
            stepResults: [
                { id: 'sr1', testStepId: 's1', stepOrder: 1, action: 'Open login page', statusId: 1, statusName: 'Passed', actualResult: 'Page opened', notes: 'Fast load' },
                { id: 'sr2', testStepId: 's2', stepOrder: 2, action: 'Enter valid credentials', statusId: 1, statusName: 'Passed', actualResult: 'Credentials entered', notes: '' }
            ],
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

    getExecutions(testCaseId?: string, projectId?: string, testSuiteId?: string): Observable<TestExecution[]> {
        return this.testCasesService.getTestCases().pipe(
            delay(400),
            map(testCases => {
                let filteredCases = testCases;

                if (projectId) {
                    filteredCases = filteredCases.filter(tc => tc.projectId === projectId);
                }

                if (testSuiteId) {
                    filteredCases = filteredCases.filter(tc => tc.testSuiteId === testSuiteId);
                }

                if (testCaseId) {
                    filteredCases = filteredCases.filter(tc => tc.id === testCaseId);
                }

                const validTestCaseIds = new Set(filteredCases.map(tc => tc.id));
                return this.executions.filter(e => validTestCaseIds.has(e.testCaseId));
            }),
            delay(400)
        );
    }

    updateExecution(id: string, execution: any): Observable<TestExecution> {
        const index = this.executions.findIndex(e => e.id === id);
        if (index !== -1) {
            const statusMap: any = {
                1: { name: 'Passed', code: 'PASSED' },
                2: { name: 'Failed', code: 'FAILED' },
                3: { name: 'Blocked', code: 'BLOCKED' },
                4: { name: 'In Progress', code: 'IN_PROGRESS' },
                5: { name: 'Pending', code: 'PENDING' },
                6: { name: 'Skipped', code: 'SKIPPED' }
            };

            const statusCodeMap: any = {
                'PASSED': { id: 1, name: 'Passed' },
                'FAILED': { id: 2, name: 'Failed' },
                'BLOCKED': { id: 3, name: 'Blocked' },
                'IN_PROGRESS': { id: 4, name: 'In Progress' },
                'PENDING': { id: 5, name: 'Pending' },
                'SKIPPED': { id: 6, name: 'Skipped' }
            };

            let statusUpdate = {};
            if (execution.statusId && statusMap[execution.statusId]) {
                statusUpdate = {
                    statusId: execution.statusId,
                    statusName: statusMap[execution.statusId].name,
                    statusCode: statusMap[execution.statusId].code
                };
            } else if (execution.statusCode && statusCodeMap[execution.statusCode]) {
                statusUpdate = {
                    statusId: statusCodeMap[execution.statusCode].id,
                    statusName: statusCodeMap[execution.statusCode].name,
                    statusCode: execution.statusCode
                };
            }

            this.executions[index] = {
                ...this.executions[index],
                ...execution,
                ...statusUpdate,
                stepResults: execution.stepResults || this.executions[index].stepResults
            };
            return of(this.executions[index]).pipe(delay(500));
        }
        return of({} as TestExecution).pipe(delay(500));
    }

    createExecution(execution: any): Observable<TestExecution> {
        return this.testCasesService.getTestCaseById(execution.testCaseId).pipe(
            map(testCase => {
                const newExecution: TestExecution = {
                    id: (this.executions.length + 10).toString(),
                    testCaseId: execution.testCaseId,
                    testCaseTitle: testCase?.title || execution.testCaseTitle || 'N/A',
                    testerId: 'u1',
                    testerName: 'John Doe (Current)',
                    statusId: execution.statusId || 1,
                    statusName: execution.statusName || 'Passed',
                    statusCode: execution.statusCode || 'PASSED',
                    notes: execution.notes || '',
                    actualTimeHours: execution.actualTimeHours || null,
                    executionDate: new Date().toISOString(),
                    completedAt: new Date().toISOString(),
                    stepResults: execution.stepResults || [],
                    evidences: []
                };
                this.executions.unshift(newExecution);
                return newExecution;
            }),
            delay(500)
        );
    }

    uploadEvidence(executionId: string, file: File, description?: string, stepResultId?: string): Observable<Evidence> {
        const execution = this.executions.find(e => e.id === executionId);

        const newEvidence: Evidence = {
            id: (Math.random() * 1000).toString(),
            fileTypeId: 1, // Assuming image/generic
            fileTypeName: 'Image',
            fileName: file.name,
            fileUrl: 'https://via.placeholder.com/600x400', // Mock URL
            fileSize: file.size,
            description: description || null,
            uploadedAt: new Date().toISOString()
        };

        if (execution) {
            execution.evidences.push(newEvidence);
            // If it's for a specific step, we could also link it there if the model supported it
            // but for now we just add it to the execution's evidence list
        }

        return of(newEvidence).pipe(delay(800));
    }

    addObservation(stepResultId: string, observation: string, file?: File): Observable<any> {
        return of({ id: Math.random().toString(36).substr(2, 9), observation }).pipe(delay(400));
    }

    respondToObservation(observationId: string, response: string): Observable<any> {
        return of({ success: true }).pipe(delay(400));
    }

    updateStepResult(executionId: string, stepResultId: string, payload: any): Observable<any> {
        return of({ success: true }).pipe(delay(400));
    }

    completeExecution(executionId: string, statusId: number): Observable<any> {
        return of({ success: true }).pipe(delay(400));
    }
}
