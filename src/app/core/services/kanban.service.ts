// src/app/core/services/kanban.service.ts
// Servicio del tablero Kanban: carga de tableros, movimiento de tareas.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { KanbanBoard } from '../models/kanban.model';
import { KanbanMockService } from './kanban.mock.service';

@Injectable({ providedIn: 'root' })
export class KanbanService {
    /** Prefijo para logs de seguimiento */
    private readonly LOG_TAG = '[KanbanService]';

    /** URL base del endpoint de Kanban */
    private readonly apiUrl = `${environment.apiUrl}/Kanban`;

    private http = inject(HttpClient);
    private mockService = inject(KanbanMockService);

    /**
     * Obtiene el tablero Kanban de un proyecto.
     * El backend devuelve una lista de tableros; se toma el primero.
     * @param projectId - ID del proyecto (requerido)
     */
    getBoard(projectId?: string): Observable<KanbanBoard> {
        if (environment.useMock) {
            return this.mockService.getBoard(projectId);
        }

        if (!projectId) {
            console.error(this.LOG_TAG, 'projectId es requerido para cargar el tablero');
            throw new Error('Se requiere un projectId para cargar el tablero Kanban');
        }

        const url = `${this.apiUrl}/project/${projectId}`;
        console.log(this.LOG_TAG, 'Cargando tablero para proyecto:', projectId);
        return this.http.get<KanbanBoard[]>(url).pipe(
            map((boards: KanbanBoard[]) => {
                if (!boards || boards.length === 0) {
                    console.warn(this.LOG_TAG, 'No se encontraron tableros para el proyecto');
                    return { id: '', projectId: projectId, name: 'Sin tablero', columns: [] } as KanbanBoard;
                }
                console.log(this.LOG_TAG, 'Tablero cargado:', boards[0].name);
                return boards[0];
            })
        );
    }

    /**
     * Actualiza un tablero Kanban completo.
     * @param board - Tablero con datos actualizados
     */
    updateBoard(board: KanbanBoard): Observable<KanbanBoard> {
        if (environment.useMock) {
            return this.mockService.updateBoard(board);
        }
        console.log(this.LOG_TAG, 'Actualizando tablero:', board.id);
        return this.http.put<KanbanBoard>(`${this.apiUrl}/board/${board.id}`, board);
    }

    /**
     * Mueve una tarea a otra columna del tablero.
     * @param taskId - ID de la tarea a mover
     * @param targetColumnId - ID de la columna destino
     * @param newOrder - Posición dentro de la columna destino
     */
    moveTask(taskId: string, targetColumnId: string, newOrder: number): Observable<any> {
        if (environment.useMock) {
            return this.mockService.moveTask(taskId, targetColumnId, newOrder);
        }
        console.log(this.LOG_TAG, 'Moviendo tarea:', taskId, '→ columna:', targetColumnId);
        return this.http.put(`${this.apiUrl}/task/${taskId}/move`, {
            targetColumnId,
            newOrder
        });
    }
}
