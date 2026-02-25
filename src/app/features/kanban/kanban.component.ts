import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { KanbanService } from '../../core/services/kanban.service';
import { KanbanBoard, KanbanColumn, KanbanTask } from '../../core/models/kanban.model';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ProjectsService } from '../../core/services/projects.service';
import { Project } from '../../core/models/project.model';
import { TestExecutionsService } from '../../core/services/test-executions.service';

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
  projects = signal<Project[]>([]);

  private kanbanService = inject(KanbanService);
  private projectsService = inject(ProjectsService);
  private testExecutionsService = inject(TestExecutionsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadProjects();
    this.route.queryParams.subscribe(params => {
      const projectId = params['projectId'];
      if (projectId) {
        this.projectId.set(projectId);
        this.loadBoard();
      } else {
        this.loading.set(false);
      }
    });
  }

  loadProjects(): void {
    this.projectsService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('KanbanComponent: Error cargando proyectos:', err)
    });
  }

  onProjectChange(event: Event): void {
    const projectId = (event.target as HTMLSelectElement).value;
    this.projectId.set(projectId || null);
    if (projectId) {
      this.loadBoard();
    } else {
      this.board.set(null);
    }
  }

  loadBoard(): void {
    const projectId = this.projectId();

    if (!projectId) {
      console.warn('KanbanComponent: No se proporcionó projectId');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.kanbanService.getBoard(projectId).subscribe({
      next: (data: KanbanBoard) => {
        this.board.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('KanbanComponent: Error cargando tablero:', err);
        this.loading.set(false);
      }
    });
  }

  drop(event: CdkDragDrop<KanbanTask[]>) {
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) return;
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

    const task = event.container.data[event.currentIndex];
    const targetColumn = this.board()?.columns.find(col => col.tasks === event.container.data);

    if (targetColumn) {
      console.log('KanbanComponent: Task movida:', task.id, 'a columna', targetColumn.name);

      // 1. Persistir movimiento en el tablero
      this.kanbanService.moveTask(task.id, targetColumn.id, event.currentIndex).subscribe({
        next: () => console.log('KanbanComponent: Movimiento persistido con éxito'),
        error: (err) => console.error('KanbanComponent: Error persistiendo movimiento:', err)
      });

      // 2. Sincronizar estado de la ejecución
      // Nota: No llamamos a testExecutionsService.updateExecution aquí porque el backend 
      // ya realiza esta sincronización automáticamente en KanbanService.MoveTaskAsync
      // usando el TestCaseId vinculado a la tarea.
      console.log('KanbanComponent: Sincronización de ejecución delegada al backend');
    }
  }

  openExecution(task: KanbanTask) {
    if (task.id) {
      this.router.navigate(['/test-executions'], {
        queryParams: {
          testCaseId: task.testCaseId,
          editExecutionId: task.id
        }
      });
    } else {
      alert('Esta tarea no está vinculada a una Ejecución.');
    }
  }
}
