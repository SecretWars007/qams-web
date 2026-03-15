// src/app/core/services/dashboard.mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DashboardSummary } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardMockService {

    getSummary(userId?: string): Observable<DashboardSummary> {
        const mockData: DashboardSummary = {
            totalProjects: 4,
            totalTestCases: 15,
            pendingTestCases: 5,
            totalExecutions: 23,
            passedExecutions: 18,
            failedExecutions: 3,
            pendingExecutions: 2,
            passRate: 78,
            taskProgress: [
                { columnName: 'Backlog', count: 5 },
                { columnName: 'In Progress', count: 3 },
                { columnName: 'Review', count: 2 },
                { columnName: 'Done', count: 8 }
            ],
            executionsByStatus: [
                { statusName: 'Passed', statusCode: 'PASSED', count: 18 },
                { statusName: 'Failed', statusCode: 'FAILED', count: 3 },
                { statusName: 'Pending', statusCode: 'PENDING', count: 2 }
            ],
            projectTimeline: [
                { projectName: 'Proyecto Alfa', startDate: new Date('2025-01-01'), endDate: new Date('2025-03-31') },
                { projectName: 'Proyecto Beta', startDate: new Date('2025-02-15'), endDate: new Date('2025-05-15') },
                { projectName: 'Proyecto Gamma', startDate: new Date('2025-04-01'), endDate: new Date('2025-06-30') },
                { projectName: 'Proyecto Delta', startDate: new Date('2025-03-10'), endDate: new Date('2025-04-20') }
            ]
        };

        return of(mockData).pipe(delay(600)); // Simular latencia de red
    }
}
