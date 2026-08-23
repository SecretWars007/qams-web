// src/app/core/services/kanban.service.ts
// Servicio del tablero Kanban: estandarización de columnas, carga de tareas por proyecto y movimientos.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { KanbanBoard, KanbanTask, CreateKanbanTask, STANDARD_KANBAN_COLUMNS } from '../models/kanban.model';

@Injectable({ providedIn: 'root' })
export class KanbanService {
    /** Prefijo para logs de seguimiento */
    private readonly LOG_TAG = '[KanbanService]';

    /** URL base del endpoint de Kanban */
    private readonly apiUrl = `${environment.apiUrl}/Kanban`;

    private readonly http = inject(HttpClient);

    /**
     * Construye un tablero con las 5 columnas estándar limpias y vacías.
     */
    private createEmptyStandardBoard(projectId: string = 'ALL'): KanbanBoard {
        return {
            id: `board-${projectId || 'global'}`,
            projectId: projectId || 'ALL',
            name: 'Tablero Ágil QA (Kanban)',
            columns: STANDARD_KANBAN_COLUMNS.map(col => ({
                id: col.id,
                name: col.name,
                orderIndex: col.orderIndex,
                tasks: []
            }))
        };
    }

    /**
     * Mapea el nombre o ID de una columna de origen a una de las 4 columnas estándar.
     */
    private mapToStandardColumnId(columnIdOrName: string, statusCode?: string | null): string {
        const text = (columnIdOrName || '').toLowerCase();
        const status = (statusCode || '').toUpperCase();

        if (text.includes('tarea') || text.includes('backlog') || text.includes('historia') || text.includes('propuest') || text.includes('col-backlog')) {
            return 'col-backlog';
        }
        if (text.includes('hacer') || text.includes('todo') || text.includes('to do') || text.includes('por ejecutar') || text.includes('pendiente') || text.includes('col-todo') || status === 'PENDING') {
            return 'col-todo';
        }
        if (text.includes('proceso') || text.includes('progreso') || text.includes('ejecut') || text.includes('in progress') || text.includes('col-in-progress') || text.includes('revis') || text.includes('review') || text.includes('pares') || text.includes('col-review') || status === 'IN_PROGRESS' || status === 'BLOCKED') {
            return 'col-in-progress';
        }
        if (text.includes('complet') || text.includes('done') || text.includes('final') || text.includes('cerrad') || text.includes('aprob') || text.includes('col-done') || status === 'PASSED') {
            return 'col-done';
        }

        return 'col-todo';
    }

    /**
     * Normaliza cualquier tablero recibido del backend para que coincida exactamente
     * con la estructura estándar de 4 columnas, preservando los GUIDs reales del backend.
     */
    private normalizeToStandardBoard(rawBoard: KanbanBoard | null, projectId: string = 'ALL'): KanbanBoard {
        if (!rawBoard?.columns) {
            return this.createEmptyStandardBoard(projectId);
        }

        // Construir columnas estándar con arrays independientes
        const columns = STANDARD_KANBAN_COLUMNS.map(col => ({
            id: col.id,
            backendColumnId: '',
            name: col.name,
            orderIndex: col.orderIndex,
            tasks: [] as KanbanTask[]
        }));

        // Asociar GUIDs reales del backend a las columnas estándar
        rawBoard.columns.forEach(rawCol => {
            const standardColId = this.mapToStandardColumnId(rawCol.id || rawCol.name);
            const targetCol = columns.find(c => c.id === standardColId);
            if (targetCol && !targetCol.backendColumnId && rawCol.id) {
                targetCol.backendColumnId = rawCol.id;
            }
        });

        // Asegurar que ninguna columna estándar quede sin backendColumnId si el backend proporcionó columnas
        const fallbackBackendId = rawBoard.columns[0]?.id || '';
        columns.forEach((col, idx) => {
            if (!col.backendColumnId) {
                // Intentar asignar columna por índice o fallback
                col.backendColumnId = rawBoard.columns[idx]?.id || fallbackBackendId;
            }
        });

        // Recolectar y distribuir todas las tareas en las columnas estándar
        rawBoard.columns.forEach(col => {
            if (col.tasks && col.tasks.length > 0) {
                col.tasks.forEach(t => {
                    const standardColId = this.mapToStandardColumnId(col.id || col.name, t.lastExecutionStatusCode);
                    const enrichedTask: KanbanTask = {
                        ...t,
                        kanbanColumnId: standardColId,
                        backendColumnId: col.id,
                        taskCode: t.taskCode || `QA-TASK-${t.id ? t.id.slice(-3).toUpperCase() : Date.now().toString().slice(-3)}`,
                        tags: t.tags || (t.testCaseTitle ? ['ISTQB', 'Manual'] : ['QA', 'Regresión']),
                        estimatedHours: t.estimatedHours || 2,
                        spentHours: t.spentHours || 1
                    };
                    const targetCol = columns.find(c => c.id === standardColId) || columns[1];
                    targetCol.tasks.push(enrichedTask);
                });
            }
        });

        return {
            id: rawBoard.id || `board-${projectId || 'global'}`,
            projectId: projectId || 'ALL',
            name: rawBoard.name || 'Tablero Ágil QA (Kanban)',
            columns
        };
    }

    /**
     * Obtiene el tablero Kanban estandarizado para un proyecto o globalmente.
     * Siempre normaliza la respuesta del backend a la estructura de 4 columnas estándar.
     * @param projectId - ID del proyecto (opcional o 'ALL')
     */
    getBoard(projectId?: string): Observable<KanbanBoard> {
        const pId = (!projectId || projectId === 'ALL') ? '' : projectId;
        const url = pId ? `${this.apiUrl}/project/${pId}` : this.apiUrl;

        console.log(this.LOG_TAG, 'Cargando tablero para proyecto:', projectId || '(Todos)');

        return this.http.get<any>(url).pipe(
            map((response: any) => {
                let board: KanbanBoard | null = null;

                if (Array.isArray(response) && response.length > 0) {
                    board = response[0];
                } else if (response?.columns) {
                    board = response;
                }

                return this.normalizeToStandardBoard(board, projectId || 'ALL');
            })
        );
    }

    /**
     * Crea una nueva tarea en el tablero Kanban en el backend.
     * @param task - Datos de la nueva tarea
     */
    createTask(task: CreateKanbanTask): Observable<KanbanTask> {
        console.log(this.LOG_TAG, 'Creando nueva tarea QA en backend:', task.title);
        return this.http.post<KanbanTask>(`${this.apiUrl}/task`, task);
    }

    /**
     * Elimina una tarea del tablero Kanban en el backend.
     * @param taskId - ID de la tarea
     */
    deleteTask(taskId: string): Observable<any> {
        console.log(this.LOG_TAG, 'Eliminando tarea en backend:', taskId);
        return this.http.delete(`${this.apiUrl}/task/${taskId}`);
    }

    /**
     * Actualiza un tablero Kanban completo en el backend.
     * @param board - Tablero con datos actualizados
     */
    updateBoard(board: KanbanBoard): Observable<KanbanBoard> {
        console.log(this.LOG_TAG, 'Actualizando tablero en backend:', board.id);
        return this.http.put<KanbanBoard>(`${this.apiUrl}/board/${board.id}`, board);
    }

    /**
     * Mueve una tarea a otra columna del tablero en el backend.
     * @param taskId - ID de la tarea a mover
     * @param targetColumnId - ID o Guid de la columna destino
     * @param newOrderIndex - Posición dentro de la columna destino
     */
    moveTask(taskId: string, targetColumnId: string, newOrderIndex: number): Observable<any> {
        console.log(this.LOG_TAG, 'Moviendo tarea en backend:', taskId, '→ columna:', targetColumnId, 'orden:', newOrderIndex);
        return this.http.put(`${this.apiUrl}/task/${taskId}/move`, {
            targetColumnId,
            newOrderIndex
        });
    }
}


