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
        new TestExecution(
            '1',
            { id: '1', title: 'Verify Login with Valid Credentials' },
            { id: '1', name: 'E-Commerce Platform v2.0' },
            { id: 1, name: 'Passed', code: 'PASSED' },
            new Date('2026-02-10T09:15:00Z'),
            'John Doe',
            0.5,
            'Login successful within 2 seconds.',
            [
                { 
                  id: 'sr1', 
                  stepId: 's1', 
                  stepOrder: 1, 
                  action: 'Open login page', 
                  status: { id: 1, name: 'Passed', code: 'PASSED' }, 
                  actualResult: 'Page opened', 
                  notes: 'Fast load',
                  evidences: [],
                  observations: []
                },
                { 
                  id: 'sr2', 
                  stepId: 's2', 
                  stepOrder: 2, 
                  action: 'Enter valid credentials', 
                  status: { id: 1, name: 'Passed', code: 'PASSED' }, 
                  actualResult: 'Credentials entered', 
                  notes: '',
                  evidences: [],
                  observations: []
                }
            ],
            []
        ),
        new TestExecution(
            '4',
            { id: '2', title: 'Verify Logout Functionality' },
            { id: '1', name: 'E-Commerce Platform v2.0' },
            { id: 1, name: 'Passed', code: 'PASSED' },
            new Date('2026-02-13T10:00:00Z'),
            'John Doe',
            0.2,
            'User logged out successfully.',
            [],
            []
        ),
        new TestExecution(
            '2',
            { id: '1', title: 'Verify Login with Valid Credentials' },
            { id: '1', name: 'E-Commerce Platform v2.0' },
            { id: 2, name: 'Failed', code: 'FAILED' },
            new Date('2026-02-11T14:00:00Z'),
            'Jane Smith',
            0.1,
            'Login page timeout.',
            [],
            []
        ),
        new TestExecution(
            '3',
            { id: '3', title: 'Checkout - Process Payment' },
            { id: '1', name: 'E-Commerce Platform v2.0' },
            { id: 3, name: 'Blocked', code: 'BLOCKED' },
            new Date('2026-02-12T11:30:00Z'),
            'John Doe',
            0,
            'Payment gateway sandbox is down.',
            [],
            []
        ),
        new TestExecution(
            '5',
            { id: '4', title: 'Search Product by Name' },
            { id: '1', name: 'E-Commerce Platform v2.0' },
            { id: 4, name: 'In Progress', code: 'IN_PROGRESS' },
            new Date('2026-02-14T08:00:00Z'),
            'Jane Smith',
            0,
            'Currently executing test steps.',
            [],
            []
        ),
        new TestExecution(
            '6',
            { id: '5', title: 'Add Item to Shopping Cart' },
            { id: '1', name: 'E-Commerce Platform v2.0' },
            { id: 4, name: 'In Progress', code: 'IN_PROGRESS' },
            new Date('2026-02-14T09:30:00Z'),
            'QA Team',
            0,
            'Testing cart functionality.',
            [],
            []
        ),
        new TestExecution(
            '7',
            { id: '6', title: 'Verify Email Notifications' },
            { id: '1', name: 'E-Commerce Platform v2.0' },
            { id: 5, name: 'Pending', code: 'PENDING' },
            new Date('2026-02-15T10:00:00Z'),
            'John Doe',
            0,
            'Scheduled for execution.',
            [],
            []
        ),
        new TestExecution(
            '8',
            { id: '7', title: 'Password Reset Flow' },
            { id: '1', name: 'E-Commerce Platform v2.0' },
            { id: 5, name: 'Pending', code: 'PENDING' },
            new Date('2026-02-16T14:00:00Z'),
            'Jane Smith',
            0,
            'Awaiting test environment setup.',
            [],
            []
        ),
        new TestExecution(
            '9',
            { id: '8', title: 'Multi-language Support' },
            { id: '1', name: 'E-Commerce Platform v2.0' },
            { id: 5, name: 'Pending', code: 'PENDING' },
            new Date('2026-02-17T11:00:00Z'),
            'QA Team',
            0,
            'Pending localization data.',
            [],
            []
        )
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
                    filteredCases = filteredCases.filter(tc => tc.suite.id === testSuiteId);
                }

                if (testCaseId) {
                    filteredCases = filteredCases.filter(tc => tc.id === testCaseId);
                }

                const validTestCaseIds = new Set(filteredCases.map(tc => tc.id));
                return this.executions.filter(e => validTestCaseIds.has(e.testCase.id));
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

            const existing = this.executions[index];
            const updated = new TestExecution(
                existing.id,
                execution.testCase || existing.testCase,
                existing.project,
                (statusUpdate as any).status || existing.status,
                existing.executionDate,
                existing.executedBy,
                execution.actualTimeHours !== undefined ? execution.actualTimeHours : existing.actualTimeHours,
                execution.notes !== undefined ? execution.notes : existing.notes,
                execution.stepResults || existing.stepResults,
                existing.evidences
            );
            this.executions[index] = updated;
            return of(updated).pipe(delay(500));
        }
        return of({} as TestExecution).pipe(delay(500));
    }

    createExecution(execution: any): Observable<TestExecution> {
        return this.testCasesService.getTestCaseById(execution.testCaseId).pipe(
            map(testCase => {
                const newExecution = new TestExecution(
                    (this.executions.length + 10).toString(),
                    { id: execution.testCaseId, title: testCase?.title || 'N/A' },
                    { id: '1', name: 'Project 1' },
                    { id: execution.statusId || 4, name: 'In Progress', code: 'IN_PROGRESS' },
                    new Date(),
                    'John Doe (Current)',
                    0,
                    execution.notes || '',
                    execution.stepResults || [],
                    []
                );
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
            fileName: file.name,
            fileUrl: 'https://via.placeholder.com/600x400', // Mock URL
            fileTypeName: 'Image',
            fileSize: file.size,
            description: description || null,
            uploadedAt: new Date()
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
