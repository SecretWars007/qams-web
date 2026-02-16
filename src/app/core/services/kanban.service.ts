// src/app/core/services/kanban.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { KanbanBoard } from '../models/kanban.model';
import { KanbanMockService } from './kanban.mock.service';

@Injectable({ providedIn: 'root' })
export class KanbanService {
    private mockService = inject(KanbanMockService);

    getBoard(projectId?: string): Observable<KanbanBoard> {
        return this.mockService.getBoard(projectId);
    }

    updateBoard(board: KanbanBoard): Observable<KanbanBoard> {
        return this.mockService.updateBoard(board);
    }
}
