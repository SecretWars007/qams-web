// src/app/core/services/test-cases.mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TestCase } from '../models/test-case.model';

@Injectable({ providedIn: 'root' })
export class TestCasesMockService {

    // Maintain state for the session
    private testCases: TestCase[] = [
        {
            id: '1',
            projectId: '1',
            projectName: 'E-Commerce Platform v2.0',
            testSuiteId: '101',
            testSuiteName: 'Mock Suite 101',
            title: 'Verify Login with Valid Credentials',
            description: 'Customer should be able to log in',
            preconditions: 'None',
            expectedResult: 'Login successful',
            priorityId: 1,
            priorityName: 'High',
            priorityCode: 'HIGH',
            isActive: true,
            createdAt: '2026-01-20T10:00:00Z',
            steps: [
                { id: 's1', stepOrder: 1, action: 'Open login page', expectedResult: 'Login page visible' },
                { id: 's2', stepOrder: 2, action: 'Enter valid credentials', expectedResult: 'Username and password accepted' },
                { id: 's3', stepOrder: 3, action: 'Click login button', expectedResult: 'Redirected to dashboard' }
            ]
        },
        {
            id: '2',
            projectId: '1',
            projectName: 'E-Commerce Platform v2.0',
            testSuiteId: '101',
            testSuiteName: 'Mock Suite 101',
            title: 'Verify Password Reset',
            description: 'User should be able to reset password',
            preconditions: 'None',
            expectedResult: 'Email sent',
            priorityId: 2,
            priorityName: 'Medium',
            priorityCode: 'MEDIUM',
            isActive: true,
            createdAt: '2026-01-21T11:00:00Z',
            steps: [
                { id: 's4', stepOrder: 1, action: 'Click forgot password', expectedResult: 'Reset page visible' },
                { id: 's5', stepOrder: 2, action: 'Enter email address', expectedResult: 'Email address accepted' }
            ]
        },
        {
            id: '3',
            projectId: '2',
            projectName: 'Mobile App - iOS',
            testSuiteId: '103',
            testSuiteName: 'Mock Suite 103',
            title: 'Verify Checkout Flow',
            description: 'User should be able to complete purchase',
            preconditions: 'Items in cart',
            expectedResult: 'Order confirmation',
            priorityId: 1,
            priorityName: 'High',
            priorityCode: 'HIGH',
            isActive: true,
            createdAt: '2026-02-06T14:30:00Z',
            steps: [
                { id: 's7', stepOrder: 1, action: 'Add items to cart', expectedResult: 'Items visible in cart' },
                { id: 's8', stepOrder: 2, action: 'Select credit card payment', expectedResult: 'Payment form visible' },
                { id: 's9', stepOrder: 3, action: 'Complete payment', expectedResult: 'Success message shown' }
            ]
        },
        {
            id: '1001',
            projectId: '10',
            projectName: 'Kanban Integration 141736',
            testSuiteId: '201',
            testSuiteName: 'Mock Suite 201',
            title: 'Kanban Task Case',
            description: 'Test case matching user screenshot.',
            preconditions: 'Project created',
            expectedResult: 'Task is correctly integrated in Kanban.',
            priorityId: 1,
            priorityName: 'High',
            priorityCode: 'HIGH',
            isActive: true,
            createdAt: new Date().toISOString(),
            steps: [
                { id: 's10', stepOrder: 1, action: 'Open Kanban board', expectedResult: 'Board is visible' },
                { id: 's11', stepOrder: 2, action: 'Create a new task', expectedResult: 'Task is created' },
                { id: 's12', stepOrder: 3, action: 'Move task to Done', expectedResult: 'Task status updated' }
            ]
        }
    ];

    getTestCases(projectId?: string): Observable<TestCase[]> {
        let filtered = this.testCases;
        if (projectId) {
            filtered = this.testCases.filter(t => t.projectId === projectId);
        }
        return of([...filtered]).pipe(delay(500));
    }

    getTestCaseById(id: string): Observable<TestCase | undefined> {
        const testCase = this.testCases.find(t => t.id === id);
        return of(testCase).pipe(delay(300));
    }

    getTestSteps(testCaseId: string): Observable<any[]> {
        const testCase = this.testCases.find(tc => tc.id === testCaseId);
        return of(testCase?.steps || []).pipe(delay(300));
    }

    createTestCase(testCase: any): Observable<TestCase> {
        const priorityNames: any = { 1: 'High', 2: 'Medium', 3: 'Low' };
        const priorityCodes: any = { 1: 'HIGH', 2: 'MEDIUM', 3: 'LOW' };

        const newTestCase: TestCase = {
            id: (this.testCases.length + 100).toString(),
            projectId: testCase.projectId,
            projectName: testCase.projectId === '10' ? 'Kanban Integration 141736' : 'Mock Project',
            testSuiteId: testCase.testSuiteId,
            testSuiteName: 'Mock Suite',
            title: testCase.title,
            description: testCase.description,
            preconditions: testCase.preconditions,
            expectedResult: testCase.expectedResult,
            priorityId: testCase.priorityId,
            priorityName: priorityNames[testCase.priorityId] || 'Medium',
            priorityCode: priorityCodes[testCase.priorityId] || 'MEDIUM',
            isActive: true,
            createdAt: new Date().toISOString(),
            steps: (testCase.steps || []).map((s: any, index: number) => ({
                id: `s-new-${index}`,
                stepOrder: s.stepOrder,
                action: s.action,
                expectedResult: s.expectedResult
            }))
        };
        this.testCases.unshift(newTestCase);
        return of(newTestCase).pipe(delay(400));
    }

    updateTestCase(id: string, updatedData: any): Observable<TestCase> {
        const index = this.testCases.findIndex(t => t.id === id);
        if (index !== -1) {
            this.testCases[index] = { ...this.testCases[index], ...updatedData };
            return of(this.testCases[index]).pipe(delay(400));
        }
        return of(updatedData).pipe(delay(400));
    }
}
