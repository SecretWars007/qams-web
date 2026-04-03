import Swal from 'sweetalert2';
// src/app/features/kanban/kanban.component.ts
// Componente que renderiza el tablero Kanban interactivo para el seguimiento de ejecuciones.
// Permite mover tareas (casos de prueba/ejecuciones) entre columnas asociadas a estados.
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router, ActivatedRoute } from '@angular/router';
import { KanbanService } from '../../core/services/kanban.service';
import { KanbanBoard, KanbanTask } from '../../core/models/kanban.model';
import { ProjectsService } from '../../core/services/projects.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent implements OnInit {
  /** Tablero kanban actual con sus columnas y tareas */
  board = signal<KanbanBoard | null>(null);
  loading = signal<boolean>(true);
  projectId = signal<string | null>(null);
  projects = signal<Project[]>([]);

  private readonly kanbanService = inject(KanbanService);
  private readonly projectsService = inject(ProjectsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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

  /** Carga la lista de proyectos para el selector superior */
  loadProjects(): void {
    this.projectsService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('[KanbanComponent] Error cargando proyectos:', err)
    });
  }

  /** Maneja el cambio de proyecto seleccionado */
  onProjectChange(event: Event): void {
    const projectId = (event.target as HTMLSelectElement).value;
    this.projectId.set(projectId || null);
    if (projectId) {
      this.loadBoard();
    } else {
      this.board.set(null);
    }
  }

  /** Carga los datos del tablero Kanban para el proyecto actual */
  loadBoard(): void {
    const projectId = this.projectId();
    if (!projectId) {
      console.warn('[KanbanComponent] No se proporcionó projectId');
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
        console.error('[KanbanComponent] Error cargando tablero:', err);
        this.loading.set(false);
        Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al cargar el tablero kanban.',
      confirmButtonColor: '#150fbd'
    });
      }
    });
  }

  /**
   * Maneja el evento drag & drop de Angular CDK al mover una tarea.
   * Actualiza el backend automáticamente tras el movimiento en la UI.
   */
  drop(event: CdkDragDrop<KanbanTask[]>) {
    // Si se mueve en la misma columna, solo reordenar localmente
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) return;
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Transferir a la nueva columna
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
      console.log(`[KanbanComponent] Tarea movida: ${task.id} a columna ${targetColumn.name}`);

      this.kanbanService.moveTask(task.id, targetColumn.id, event.currentIndex).subscribe({
        next: () => console.log('[KanbanComponent] Movimiento persistido con éxito'),
        error: (err) => {
          console.error('[KanbanComponent] Error persistiendo movimiento:', err);
          Swal.fire({
      icon: 'error',
      title: 'Error de sincronización',
      text: 'Ocurrió un error al mover la tarea.',
      confirmButtonColor: '#150fbd'
    });
        }
      });
    }
  }

  /**
   * Abre los detalles de la ejecución de prueba asociada a la tarea seleccionada.
   * @param task - La tarea/tarjeta del Kanban seleccionada
   */
  openExecution(task: KanbanTask) {
    if (task.id) {
      this.router.navigate(['/test-executions'], {
        queryParams: {
          testCaseId: task.testCaseId,
          editExecutionId: task.id
        }
      });
    } else {
      Swal.fire({
      icon: 'warning',
      title: 'Aviso',
      text: 'Esta tarea no está vinculada a una ejecución.',
      confirmButtonColor: '#150fbd'
    });
    }
  }
}
