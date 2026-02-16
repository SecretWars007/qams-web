// src/app/core/services/kanban.mock.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { KanbanBoard, KanbanTask } from '../models/kanban.model';
import { TestExecutionsMockService } from './test-executions.mock.service';

@Injectable({ providedIn: 'root' })
export class KanbanMockService {

    private executionsService = inject(TestExecutionsMockService);

    getBoard(projectId?: string): Observable<KanbanBoard> {
        // Fetch executions and build Kanban board dynamically
        return this.executionsService.getExecutions().pipe(
            map(executions => {
                // Create columns
                const columns = [
                    {
                        id: 'col-pending',
                        name: 'Pendiente',
                        orderIndex: 0,
                        tasks: [] as KanbanTask[]
                    },
                    {
                        id: 'col-progress',
                        name: 'En Ejecución',
                        orderIndex: 1,
                        tasks: [] as KanbanTask[]
                    },
                    {
                        id: 'col-passed',
                        name: 'Aprobado',
                        orderIndex: 2,
                        tasks: [] as KanbanTask[]
                    },
                    {
                        id: 'col-failed',
                        name: 'Fallido',
                        orderIndex: 3,
                        tasks: [] as KanbanTask[]
                    }
                ];

                // Map executions to Kanban tasks
                executions.forEach((exec, index) => {
                    const task: KanbanTask = {
                        id: exec.id,
                        kanbanColumnId: this.getColumnIdForStatus(exec.statusCode),
                        title: exec.testCaseTitle,
                        description: exec.notes || 'Sin notas',
                        assigneeId: exec.testerId,
                        assigneeName: exec.testerName,
                        testCaseId: exec.testCaseId,
                        priorityId: 2,
                        priorityName: 'Medium',
                        priorityCode: 'P2',
                        dueDate: exec.executionDate,
                        orderIndex: index
                    };

                    // Add to appropriate column
                    const column = columns.find(c => c.id === task.kanbanColumnId);
                    if (column) {
                        column.tasks.push(task);
                    }
                });

                const board: KanbanBoard = {
                    id: 'board-exec-1',
                    projectId: projectId || '1',
                    name: 'Tablero de Ejecuciones',
                    columns: columns
                };

                return board;
            }),
            delay(500)
        );
    }

    private getColumnIdForStatus(statusCode: string): string {
        switch (statusCode) {
            case 'PENDING':
            case 'SCHEDULED':
                return 'col-pending';
            case 'IN_PROGRESS':
            case 'RUNNING':
                return 'col-progress';
            case 'PASSED':
                return 'col-passed';
            case 'FAILED':
            case 'BLOCKED':
            case 'SKIPPED':
                return 'col-failed';
            default:
                return 'col-pending';
        }
    }

    updateBoard(board: KanbanBoard): Observable<KanbanBoard> {
        // In a real app, this would update execution statuses based on column changes
        return of(board).pipe(delay(300));
    }
}
