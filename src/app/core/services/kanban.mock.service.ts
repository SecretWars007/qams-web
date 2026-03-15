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
                        id: 'col-todo',
                        name: 'Por Hacer',
                        orderIndex: 0,
                        tasks: [] as KanbanTask[]
                    },
                    {
                        id: 'col-progress',
                        name: 'En Progreso',
                        orderIndex: 1,
                        tasks: [] as KanbanTask[]
                    },
                    {
                        id: 'col-review',
                        name: 'En Revisión',
                        orderIndex: 2,
                        tasks: [] as KanbanTask[]
                    },
                    {
                        id: 'col-done',
                        name: 'Completado',
                        orderIndex: 3,
                        tasks: [] as KanbanTask[]
                    }
                ];

                // Map executions to Kanban tasks
                executions.forEach((exec, index) => {
                    const task: KanbanTask = {
                        id: exec.id,
                        kanbanColumnId: this.getColumnIdForStatus(exec.status.code),
                        title: exec.testCase.title,
                        description: exec.notes || 'Sin notas',
                        assigneeId: exec.executedBy || 'u1',
                        assigneeName: exec.executedBy || 'John Doe',
                        testCaseId: exec.testCase.id,
                        priorityId: 2,
                        priorityName: 'Medium',
                        priorityCode: 'P2',
                        dueDate: exec.executionDate.toISOString(),
                        orderIndex: index
                    };

                    // Add to appropriate column
                    const column = columns.find(c => c.id === task.kanbanColumnId);
                    if (column) {
                        column.tasks.push(task);
                    } else {
                        // Fallback to todo if column doesn't exist
                        columns[0].tasks.push(task);
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
                return 'col-todo';
            case 'IN_PROGRESS':
                return 'col-progress';
            case 'BLOCKED':
            case 'SKIPPED':
                return 'col-review';
            case 'PASSED':
                return 'col-done';
            case 'FAILED':
                return 'col-todo'; // Re-test or keep in todo? Let's say review for now
            default:
                return 'col-todo';
        }
    }

    updateBoard(board: KanbanBoard): Observable<KanbanBoard> {
        // In a real app, this would update execution statuses based on column changes
        return of(board).pipe(delay(300));
    }

    moveTask(taskId: string, targetColumnId: string, newOrder: number): Observable<any> {
        // Map column ID to execution status
        const columnToStatus: any = {
            'col-todo': 'PENDING',
            'col-progress': 'IN_PROGRESS',
            'col-review': 'BLOCKED',
            'col-done': 'PASSED'
        };

        const newStatus = columnToStatus[targetColumnId];
        if (newStatus) {
            // Update the underlying execution
            return this.executionsService.updateExecution(taskId, { statusCode: newStatus });
        }

        return of({ success: true }).pipe(delay(300));
    }
}
