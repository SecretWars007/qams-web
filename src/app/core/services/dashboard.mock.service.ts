// src/app/core/services/dashboard.mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DashboardSummary } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardMockService {

    getSummary(): Observable<DashboardSummary> {
        const mockData: DashboardSummary = {
            totalProjects: 4,
            totalTestCases: 15,
            totalExecutions: 23,
            passedExecutions: 18,
            failedExecutions: 3,
            pendingExecutions: 2,
            passRate: 78,
            taskProgress: [
                { columnName: 'Backlog', taskCount: 5 },
                { columnName: 'In Progress', taskCount: 3 },
                { columnName: 'Review', taskCount: 2 },
                { columnName: 'Done', taskCount: 8 }
            ],
            executionsByStatus: [
                { statusName: 'Passed', statusCode: 'PASSED', count: 18 },
                { statusName: 'Failed', statusCode: 'FAILED', count: 3 },
                { statusName: 'Pending', statusCode: 'PENDING', count: 2 }
            ]
        };

        return of(mockData).pipe(delay(600)); // Simular latencia de red
    }
}
