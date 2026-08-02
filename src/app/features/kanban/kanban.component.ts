// src/app/features/kanban/kanban.component.ts
import Swal from 'sweetalert2';
import { Component, OnInit, signal, inject, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router, ActivatedRoute } from '@angular/router';
import { KanbanService } from '../../core/services/kanban.service';
import { KanbanBoard, KanbanTask } from '../../core/models/kanban.model';
import { ProjectsService } from '../../core/services/projects.service';
import { Project } from '../../core/models/project.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/** Tipo de filtro rápido disponible en la barra superior. */
type QuickFilter = 'all' | 'mine' | 'high-priority' | 'with-defects' | 'overdue';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  // ── Signals de estado ──
  board            = signal<KanbanBoard | null>(null);
  loading          = signal<boolean>(true);
  syncing          = signal<boolean>(false);
  syncMessage      = signal<string>('');
  projectId        = signal<string | null>(null);
  projects         = signal<Project[]>([]);
  activeFilter     = signal<QuickFilter>('all');
  searchQuery      = signal<string>('');

  quickFilters = [
    { key: 'all',          label: 'Todas',         icon: 'ri-apps-line' },
    { key: 'high-priority',label: 'Alta Prioridad',icon: 'ri-arrow-up-circle-line' },
    { key: 'with-defects', label: 'Con Defectos',  icon: 'ri-bug-line' },
    { key: 'overdue',      label: 'Vencidas',      icon: 'ri-alarm-warning-line' }
  ];

  private readonly kanbanService  = inject(KanbanService);
  private readonly projectsService = inject(ProjectsService);
  private readonly router         = inject(Router);
  private readonly route          = inject(ActivatedRoute);

  // ── Computed: columnas filtradas ──
  filteredBoard = computed<KanbanBoard | null>(() => {
    const b = this.board();
    if (!b) return null;
    const filter  = this.activeFilter();
    const query   = this.searchQuery().toLowerCase();

    return {
      ...b,
      columns: b.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(task => {
          const matchSearch = !query ||
            task.title.toLowerCase().includes(query) ||
            (task.testCaseTitle ?? '').toLowerCase().includes(query) ||
            (task.assigneeName ?? '').toLowerCase().includes(query);

          const matchFilter = (() => {
            switch (filter) {
              case 'mine':          return task.assigneeId != null;
              case 'high-priority': return task.priorityCode === 'P0' || task.priorityCode === 'P1';
              case 'with-defects':  return task.openDefectsCount > 0;
              case 'overdue':       return task.isOverdue;
              default:              return true;
            }
          })();

          return matchSearch && matchFilter;
        })
      }))
    };
  });

  // ── Stats del proyecto ──
  boardStats = computed(() => {
    const b = this.board();
    if (!b) return { total: 0, passed: 0, failed: 0, inProgress: 0, pending: 0, withDefects: 0 };
    const allTasks = b.columns.flatMap(c => c.tasks);
    return {
      total:      allTasks.length,
      passed:     allTasks.filter(t => t.lastExecutionStatusCode === 'PASSED').length,
      failed:     allTasks.filter(t => t.lastExecutionStatusCode === 'FAILED').length,
      inProgress: allTasks.filter(t => t.lastExecutionStatusCode === 'IN_PROGRESS').length,
      pending:    allTasks.filter(t => !t.lastExecutionStatusCode || t.lastExecutionStatusCode === 'PENDING').length,
      withDefects:allTasks.filter(t => t.openDefectsCount > 0).length,
    };
  });

  /** Computed: true si el filtro activo está vacío en todas las columnas */
  isFilterEmpty = computed(() => {
    const fb = this.filteredBoard();
    return !this.loading() && !!this.board() && this.activeFilter() !== 'all' &&
           !!fb?.columns && fb.columns.every(c => c.tasks.length === 0);
  });

  ngOnInit(): void {
    this.loadProjects();
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
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
    this.projectsService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('[KanbanComponent] Error cargando proyectos:', err)
    });
  }

  onProjectChange(event: Event): void {
    const projectId = (event.target as HTMLSelectElement).value;
    this.projectId.set(projectId || null);
    if (projectId) this.loadBoard();
    else this.board.set(null);
  }

  loadBoard(): void {
    const projectId = this.projectId();
    if (!projectId) { this.loading.set(false); return; }

    this.loading.set(true);
    this.kanbanService.getBoard(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: KanbanBoard) => {
        this.board.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[KanbanComponent] Error cargando tablero:', err);
        this.loading.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar el tablero Kanban.', confirmButtonColor: '#150fbd' });
      }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter as QuickFilter);
  }

  onSearchChange(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  /** Drag & Drop: mover entre columnas o reordenar dentro de una columna. */
  drop(event: CdkDragDrop<KanbanTask[]>): void {
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
    const filteredBoard = this.filteredBoard();
    const targetColumn = filteredBoard?.columns.find(col => col.tasks === event.container.data);

    if (targetColumn) {
      this.syncing.set(true);
      this.syncMessage.set(`Moviendo "${task.title}"…`);

      this.kanbanService.moveTask(task.id, targetColumn.id, event.currentIndex)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            const msg = task.testCaseId
              ? `✅ Ejecución sincronizada → ${targetColumn.name}`
              : `✅ Tarea movida a ${targetColumn.name}`;
            this.syncing.set(false);
            this.showSyncToast(msg);
            this.loadBoard(); // Recargar para actualizar contadores
          },
          error: () => {
            this.syncing.set(false);
            Swal.fire({ icon: 'error', title: 'Error de sincronización', text: 'No se pudo mover la tarea.', confirmButtonColor: '#150fbd' });
          }
        });
    }
  }

  /** Muestra un micro-toast de sincronización que desaparece solo. */
  showSyncToast(message: string): void {
    this.syncMessage.set(message);
    setTimeout(() => this.syncMessage.set(''), 3500);
  }

  openExecution(task: KanbanTask): void {
    if (task.testCaseId) {
      this.router.navigate(['/test-executions'], {
        queryParams: { testCaseId: task.testCaseId }
      });
    } else {
      Swal.fire({ icon: 'info', title: 'Sin caso de prueba', text: 'Esta tarea no está vinculada a un caso de prueba.', confirmButtonColor: '#150fbd' });
    }
  }

  getColumnConnectedIds(): string[] {
    return this.filteredBoard()?.columns.map(c => 'column-' + c.id) ?? [];
  }

  getStatusColor(code: string | null): string {
    switch (code) {
      case 'PASSED':      return '#10b981';
      case 'FAILED':      return '#ef4444';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'BLOCKED':     return '#f59e0b';
      default:            return '#6b7280';
    }
  }

  getColumnAccentClass(colName: string): string {
    const name = colName.toLowerCase();
    if (name.includes('pendiente') || name.includes('hacer')) return 'col-pending';
    if (name.includes('progreso'))  return 'col-inprogress';
    if (name.includes('revisi'))    return 'col-review';
    if (name.includes('completo') || name.includes('done')) return 'col-done';
    return 'col-default';
  }

  getColumnIcon(colName: string): string {
    const name = colName.toLowerCase();
    if (name.includes('pendiente') || name.includes('hacer')) return 'ri-time-line';
    if (name.includes('progreso'))  return 'ri-loader-4-line';
    if (name.includes('revisi'))    return 'ri-eye-line';
    if (name.includes('completo') || name.includes('done')) return 'ri-checkbox-circle-line';
    return 'ri-layout-column-line';
  }
}
