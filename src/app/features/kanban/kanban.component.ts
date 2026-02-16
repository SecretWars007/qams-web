import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { KanbanService } from '../../core/services/kanban.service';
import { KanbanBoard, KanbanColumn, KanbanTask } from '../../core/models/kanban.model';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent implements OnInit {
  board = signal<KanbanBoard | null>(null);
  loading = signal<boolean>(true);
  projectId = signal<string | null>(null);

  private kanbanService = inject(KanbanService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.projectId.set(params['projectId'] || null);
      this.loadBoard();
    });
  }

  loadBoard(): void {
    this.loading.set(true);
    this.kanbanService.getBoard(this.projectId() || undefined).subscribe({
      next: (data: KanbanBoard) => {
        this.board.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  drop(event: CdkDragDrop<KanbanTask[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  openExecution(task: KanbanTask) {
    if (task.testCaseId) {
      this.router.navigate(['/test-executions'], { queryParams: { testCaseId: task.testCaseId } });
    } else {
      // Fallback if no linked test case (e.g. ad-hoc task)
      alert('Esta tarea no está vinculada a un Caso de Prueba.');
    }
  }
}
