import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TestSuite, CreateTestSuite } from '../models/test-suite.model';

@Injectable({ providedIn: 'root' })
export class TestSuitesMockService {
    private readonly suites: TestSuite[] = [
        new TestSuite(
            '101',
            '1',
            'Smoke Tests',
            'Critical business flows',
            true,
            new Date('2026-01-15T10:00:00Z')
        ),
        new TestSuite(
            '102',
            '1',
            'Regression Pack',
            'Full system regression',
            true,
            new Date('2026-01-20T11:30:00Z')
        ),
        new TestSuite(
            '103',
            '2',
            'Mobile UI Tests',
            'UI/UX verification',
            true,
            new Date('2026-02-05T09:00:00Z')
        ),
        new TestSuite(
            '201',
            '10',
            'Default Suite',
            'Default test suite for Kanban Integration',
            true,
            new Date()
        )
    ];

    getTestSuitesByProjectId(projectId: string): Observable<TestSuite[]> {
        const filtered = this.suites.filter(s => s.projectId === projectId);
        return of(filtered).pipe(delay(400));
    }

    createTestSuite(testSuite: CreateTestSuite): Observable<TestSuite> {
        const newSuite = new TestSuite(
            (this.suites.length + 200).toString(),
            testSuite.projectId,
            testSuite.name,
            testSuite.description,
            true,
            new Date()
        );
        this.suites.unshift(newSuite);
        return of(newSuite).pipe(delay(300));
    }

    getTestSuiteById(id: string): Observable<TestSuite | undefined> {
        const suite = this.suites.find(s => s.id === id);
        return of(suite).pipe(delay(300));
    }
}
