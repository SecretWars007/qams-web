// src/app/core/services/kanban.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { KanbanBoard } from '../models/kanban.model';
import { KanbanMockService } from './kanban.mock.service';

@Injectable({ providedIn: 'root' })
export class KanbanService {
    private readonly apiUrl = `${environment.apiUrl}/Kanban`;
    private http = inject(HttpClient);
    private mockService = inject(KanbanMockService);

    getBoard(projectId?: string): Observable<KanbanBoard> {
        if (environment.useMock) {
            return this.mockService.getBoard(projectId);
        }

        // Validar que tenemos un projectId
        if (!projectId) {
            console.error('KanbanService: projectId es requerido para cargar el tablero');
            throw new Error('Se requiere un projectId para cargar el tablero Kanban');
        }

        const url = `${this.apiUrl}/project/${projectId}`;
        console.log('KanbanService: Cargando tableros por proyecto:', url);
        // El backend devuelve una lista, tomamos el primero para el componente actual
        return this.http.get<KanbanBoard[]>(url).pipe(
            map((boards: KanbanBoard[]) => {
                console.log('KanbanService: Tableros recibidos:', boards);
                if (!boards || boards.length === 0) {
                    console.warn('KanbanService: No se encontraron tableros para el proyecto');
                    // Retornar un tablero vacío en lugar de fallar
                    return { id: '', projectId: projectId, name: 'Sin tablero', columns: [] } as KanbanBoard;
                }
                return boards[0];
            })
        );
    }

    updateBoard(board: KanbanBoard): Observable<KanbanBoard> {
        if (environment.useMock) {
            return this.mockService.updateBoard(board);
        }
        // Nota: El backend tiene MoveTask instead of updateBoard complete
        // Pero para mantener la firma, dejamos esto así o llamamos al generic si existiera
        return this.http.put<KanbanBoard>(`${this.apiUrl}/board/${board.id}`, board);
    }

    moveTask(taskId: string, targetColumnId: string, newOrder: number): Observable<any> {
        if (environment.useMock) {
            return this.mockService.moveTask(taskId, targetColumnId, newOrder);
        }
        return this.http.put(`${this.apiUrl}/task/${taskId}/move`, {
            targetColumnId,
            newOrder
        });
    }
}
