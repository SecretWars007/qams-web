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
            title: 'Verify Login with Valid Credentials',
            description: 'Ensure user can login with correct username and password.',
            preconditions: 'User receives valid credentials.',
            expectedResult: 'Redirect to Dashboard.',
            priorityId: 1,
            priorityName: 'High',
            priorityCode: 'P1',
            isActive: true,
            createdAt: '2026-02-01T10:00:00Z',
            steps: []
        },
        {
            id: '2',
            projectId: '1',
            projectName: 'E-Commerce Platform v2.0',
            testSuiteId: '101',
            title: 'Verify Login with Invalid Password',
            description: 'Ensure user cannot login with incorrect password.',
            preconditions: 'User exists.',
            expectedResult: 'Show error message.',
            priorityId: 2,
            priorityName: 'Medium',
            priorityCode: 'P2',
            isActive: true,
            createdAt: '2026-02-01T10:10:00Z',
            steps: []
        },
        {
            id: '3',
            projectId: '2',
            projectName: 'Mobile App - iOS',
            testSuiteId: '102',
            title: 'Checkout - Process Payment',
            description: 'Verify credit card payment processing.',
            preconditions: 'User has items in cart.',
            expectedResult: 'Order confirmation page.',
            priorityId: 1,
            priorityName: 'Critical',
            priorityCode: 'P0',
            isActive: true,
            createdAt: '2026-02-05T14:00:00Z',
            steps: []
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

    createTestCase(testCase: any): Observable<TestCase> {
        const newTestCase: TestCase = {
            id: (this.testCases.length + 1).toString(),
            projectId: testCase.projectId || '1',
            projectName: testCase.projectName || 'E-Commerce Platform v2.0',
            testSuiteId: '101', // Default
            title: testCase.title,
            description: testCase.description,
            preconditions: '',
            expectedResult: '',
            priorityId: 2,
            priorityName: 'Medium',
            priorityCode: 'P2',
            isActive: true,
            createdAt: new Date().toISOString(),
            steps: []
        };
        this.testCases.unshift(newTestCase);
        return of(newTestCase).pipe(delay(400));
    }
}
