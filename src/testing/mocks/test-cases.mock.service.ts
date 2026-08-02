// src/app/core/services/test-cases.mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TestCase } from '../models/test-case.model';

@Injectable({ providedIn: 'root' })
export class TestCasesMockService {

    // Maintain state for the session
    private testCases: TestCase[] = [
        new TestCase(
            '1',
            '1',
            'E-Commerce Platform v2.0',
            { id: '101', name: 'Mock Suite 101' },
            'Verify Login with Valid Credentials',
            'Customer should be able to log in',
            'None',
            'Login successful',
            { id: 1, name: 'High', code: 'HIGH' },
            true,
            new Date('2026-01-20T10:00:00Z'),
            'Admin',
            [
                { id: 's1', stepOrder: 1, action: 'Open login page', expectedResult: 'Login page visible' },
                { id: 's2', stepOrder: 2, action: 'Enter valid credentials', expectedResult: 'Username and password accepted' },
                { id: 's3', stepOrder: 3, action: 'Click login button', expectedResult: 'Redirected to dashboard' }
            ]
        ),
        new TestCase(
            '2',
            '1',
            'E-Commerce Platform v2.0',
            { id: '101', name: 'Mock Suite 101' },
            'Verify Password Reset',
            'User should be able to reset password',
            'None',
            'Email sent',
            { id: 2, name: 'Medium', code: 'MEDIUM' },
            true,
            new Date('2026-01-21T11:00:00Z'),
            'Admin',
            [
                { id: 's4', stepOrder: 1, action: 'Click forgot password', expectedResult: 'Reset page visible' },
                { id: 's5', stepOrder: 2, action: 'Enter email address', expectedResult: 'Email address accepted' }
            ]
        ),
        new TestCase(
            '3',
            '2',
            'Mobile App - iOS',
            { id: '103', name: 'Mock Suite 103' },
            'Verify Checkout Flow',
            'User should be able to complete purchase',
            'Items in cart',
            'Order confirmation',
            { id: 1, name: 'High', code: 'HIGH' },
            true,
            new Date('2026-02-06T14:30:00Z'),
            'Admin',
            [
                { id: 's7', stepOrder: 1, action: 'Add items to cart', expectedResult: 'Items visible in cart' },
                { id: 's8', stepOrder: 2, action: 'Select credit card payment', expectedResult: 'Payment form visible' },
                { id: 's9', stepOrder: 3, action: 'Complete payment', expectedResult: 'Success message shown' }
            ]
        ),
        new TestCase(
            '1001',
            '10',
            'Kanban Integration 141736',
            { id: '201', name: 'Mock Suite 201' },
            'Kanban Task Case',
            'Test case matching user screenshot.',
            'Project created',
            'Task is correctly integrated in Kanban.',
            { id: 1, name: 'High', code: 'HIGH' },
            true,
            new Date(),
            'Admin',
            [
                { id: 's10', stepOrder: 1, action: 'Open Kanban board', expectedResult: 'Board is visible' },
                { id: 's11', stepOrder: 2, action: 'Create a new task', expectedResult: 'Task is created' },
                { id: 's12', stepOrder: 3, action: 'Move task to Done', expectedResult: 'Task status updated' }
            ]
        )
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

        const newTestCase = new TestCase(
            (this.testCases.length + 100).toString(),
            testCase.projectId,
            testCase.projectId === '10' ? 'Kanban Integration 141736' : 'Mock Project',
            { id: testCase.testSuiteId, name: 'Mock Suite' },
            testCase.title,
            testCase.description,
            testCase.preconditions,
            testCase.expectedResult,
            { 
              id: testCase.priorityId, 
              name: priorityNames[testCase.priorityId] || 'Medium', 
              code: priorityCodes[testCase.priorityId] || 'MEDIUM' 
            },
            true,
            new Date(),
            'Current User',
            (testCase.steps || []).map((s: any, index: number) => ({
                id: `s-new-${index}`,
                stepOrder: s.stepOrder,
                action: s.action,
                expectedResult: s.expectedResult
            }))
        );
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
