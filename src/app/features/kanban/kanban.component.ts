// src/app/features/kanban/kanban.component.ts
import Swal from 'sweetalert2';
import { Component, OnInit, signal, inject, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router, ActivatedRoute } from '@angular/router';
import { KanbanService } from '../../core/services/kanban.service';
import { KanbanBoard, KanbanTask, CreateKanbanTask, STANDARD_KANBAN_COLUMNS } from '../../core/models/kanban.model';
import { ProjectsService } from '../../core/services/projects.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import { TestCasesService } from '../../core/services/test-cases.service';
import { UsersService } from '../../core/services/users.service';
import { Project } from '../../core/models/project.model';
import { TestCase } from '../../core/models/test-case.model';
import { User } from '../../core/models/user.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/** Tipo de filtro rápido disponible en la barra superior. */
export type QuickFilter = 'all' | 'mine' | 'high-priority' | 'with-defects' | 'overdue' | 'automated';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly kanbanService = inject(KanbanService);
  private readonly projectsService = inject(ProjectsService);
  private readonly projectContextService = inject(ProjectContextService);
  private readonly testCasesService = inject(TestCasesService);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // ── Columnas estándar de referencia ──
  readonly standardColumns = STANDARD_KANBAN_COLUMNS;

  // ── Signals de estado ──
  board = signal<KanbanBoard | null>(null);
  loading = signal<boolean>(true);
  syncing = signal<boolean>(false);
  syncMessage = signal<string>('');
  selectedProjectId = signal<string>('ALL');
  projects = signal<Project[]>([]);
  testCases = signal<TestCase[]>([]);
  users = signal<User[]>([]);

  // Sprints disponibles
  sprints = signal<string[]>([
    'Sprint 14 - Q3 Release',
    'Sprint 15 - Regresión General',
    'Sprint 16 - Hotfixes QA',
    'Sprint 17 - Pruebas de Carga'
  ]);
  selectedSprint = signal<string>('Sprint 14 - Q3 Release');

  // Filtros y Búsqueda
  activeFilter = signal<QuickFilter>('all');
  searchQuery = signal<string>('');

  // Modal de nueva tarjeta
  isModalOpen = signal<boolean>(false);
  isSavingTask = signal<boolean>(false);
  targetColumnForNewTask = signal<string>('col-todo');

  newTaskForm = {
    title: '',
    description: '',
    kanbanColumnId: 'col-todo',
    priorityId: 2,
    priorityCode: 'P2',
    priorityName: 'Media',
    assigneeId: '',
    testCaseId: '',
    dueDate: '',
    estimatedHours: 2,
    tagsString: 'Regresión, QA'
  };

  quickFilters = [
    { key: 'all',           label: 'Todas',          icon: 'ri-apps-line' },
    { key: 'mine',          label: 'Mis Tareas',     icon: 'ri-user-star-line' },
    { key: 'high-priority', label: 'Alta Prioridad', icon: 'ri-fire-line' },
    { key: 'with-defects',  label: 'Con Defectos',   icon: 'ri-bug-line' },
    { key: 'overdue',       label: 'Vencidas',       icon: 'ri-alarm-warning-line' },
    { key: 'automated',     label: 'Automated',      icon: 'ri-robot-line' }
  ];

  // ── Computed: columnas filtradas con búsqueda y filtros activos ──
  filteredBoard = computed<KanbanBoard | null>(() => {
    const b = this.board();
    if (!b) return null;
    const filter = this.activeFilter();
    const query = this.searchQuery().toLowerCase().trim();

    return {
      ...b,
      columns: b.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(task => {
          const matchSearch = !query ||
            task.title.toLowerCase().includes(query) ||
            (task.taskCode ?? '').toLowerCase().includes(query) ||
            (task.testCaseTitle ?? '').toLowerCase().includes(query) ||
            (task.assigneeName ?? '').toLowerCase().includes(query) ||
            !!task.tags?.some(tag => tag.toLowerCase().includes(query));

          const matchFilter = (() => {
            switch (filter) {
              case 'mine':
                return task.assigneeId != null;
              case 'high-priority':
                return task.priorityCode === 'P0' || task.priorityCode === 'P1' || task.priorityId <= 1;
              case 'with-defects':
                return task.openDefectsCount > 0;
              case 'overdue':
                return task.isOverdue;
              case 'automated':
                return task.tags?.some(t => t.toLowerCase().includes('auto')) ||
                       task.title.toLowerCase().includes('auto') ||
                       task.title.toLowerCase().includes('cypress') ||
                       task.title.toLowerCase().includes('api');
              default:
                return true;
            }
          })();

          return matchSearch && matchFilter;
        })
      }))
    };
  });

  // ── Computed: Stats completas del tablero ──
  boardStats = computed(() => {
    const b = this.board();
    if (!b) return { total: 0, passed: 0, failed: 0, inProgress: 0, pending: 0, withDefects: 0, done: 0 };
    const allTasks = b.columns.flatMap(c => c.tasks);
    const doneColTasks = b.columns.find(c => c.id === 'col-done')?.tasks.length || 0;

    return {
      total:       allTasks.length,
      passed:      allTasks.filter(t => t.lastExecutionStatusCode === 'PASSED').length,
      failed:      allTasks.filter(t => t.lastExecutionStatusCode === 'FAILED').length,
      inProgress:  allTasks.filter(t => t.kanbanColumnId === 'col-in-progress' || t.lastExecutionStatusCode === 'IN_PROGRESS').length,
      pending:     allTasks.filter(t => t.kanbanColumnId === 'col-todo' || t.kanbanColumnId === 'col-backlog').length,
      withDefects: allTasks.filter(t => t.openDefectsCount > 0).length,
      done:        doneColTasks
    };
  });

  // ── Computed: Porcentaje de avance del Sprint ──
  sprintProgress = computed(() => {
    const stats = this.boardStats();
    if (stats.total === 0) return 0;
    return Math.round((stats.done / stats.total) * 100);
  });

  // ── Computed: true si el filtro activo deja vacías todas las columnas ──
  isFilterEmpty = computed(() => {
    const fb = this.filteredBoard();
    return !this.loading() && !!this.board() && this.activeFilter() !== 'all' &&
           !!fb?.columns && fb.columns.every(c => c.tasks.length === 0);
  });

  ngOnInit(): void {
    this.loadCatalogData();
    this.initProjectContext();
  }

  /**
   * Carga catálogos de apoyo (proyectos, casos de prueba y usuarios).
   */
  private loadCatalogData(): void {
    this.projectsService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('[KanbanComponent] Error cargando proyectos:', err)
    });

    this.testCasesService.getTestCases().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.testCases.set(data),
      error: (err) => console.error('[KanbanComponent] Error cargando casos de prueba:', err)
    });

    this.usersService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.users.set(data),
      error: (err) => console.error('[KanbanComponent] Error cargando usuarios:', err)
    });
  }

  /**
   * Inicializa la suscripción al queryParam o al ProjectContextService.
   */
  private initProjectContext(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const qpProjectId = params['projectId'];
      if (qpProjectId) {
        this.selectedProjectId.set(qpProjectId);
        this.projectContextService.setActiveProject(qpProjectId);
      } else {
        const activeCtxId = this.projectContextService.activeProjectId();
        if (activeCtxId) {
          this.selectedProjectId.set(activeCtxId);
        } else {
          this.selectedProjectId.set('ALL');
        }
      }
      this.loadBoard();
    });
  }

  /**
   * Manejador al cambiar el proyecto en el dropdown superior.
   */
  onProjectChange(event: Event): void {
    const pId = (event.target as HTMLSelectElement).value || 'ALL';
    this.selectedProjectId.set(pId);
    if (pId !== 'ALL') {
      this.projectContextService.setActiveProject(pId);
    }
    this.loadBoard();
  }

  /**
   * Manejador al cambiar el Sprint.
   */
  onSprintChange(event: Event): void {
    const sprint = (event.target as HTMLSelectElement).value;
    this.selectedSprint.set(sprint);
  }

  /**
   * Carga el tablero estandarizado (siempre 5 columnas, solo cambian las tareas).
   */
  loadBoard(): void {
    const currentProjectId = this.selectedProjectId();
    this.loading.set(true);

    this.kanbanService.getBoard(currentProjectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: KanbanBoard) => {
        this.board.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[KanbanComponent] Error al cargar tablero estandarizado:', err);
        this.loading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Error de Carga',
          text: 'No se pudo cargar el tablero Kanban.',
          confirmButtonColor: '#10B981',
          background: '#111E30',
          color: '#DAE3F6'
        });
      }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter as QuickFilter);
  }

  onSearchChange(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  /**
   * Drag & Drop entre las 5 columnas estándar.
   */
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
      task.kanbanColumnId = targetColumn.id;
      const targetBackendId = targetColumn.backendColumnId || targetColumn.id;
      this.syncing.set(true);
      this.syncMessage.set(`Sincronizando "${task.title}" → ${targetColumn.name}`);

      this.kanbanService.moveTask(task.id, targetBackendId, event.currentIndex)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            const msg = `✅ Tarea movida a ${targetColumn.name}`;
            this.syncing.set(false);
            this.showSyncToast(msg);
          },
          error: (err) => {
            console.error('[KanbanComponent] Error al mover tarea:', err);
            this.syncing.set(false);
            Swal.fire({
              icon: 'error',
              title: 'Error de sincronización',
              text: err?.error?.message || 'No se pudo sincronizar el movimiento de la tarea con el servidor.',
              confirmButtonColor: '#10B981',
              background: '#111E30',
              color: '#DAE3F6'
            });
          }
        });
    }
  }

  /**
   * Muestra micro-toast no invasivo de sincronización.
   */
  showSyncToast(message: string): void {
    this.syncMessage.set(message);
    setTimeout(() => this.syncMessage.set(''), 3000);
  }

  /**
   * Abre modal para crear nueva tarjeta QA.
   * @param targetColId - Columna por defecto donde se insertará la tarjeta
   */
  openCreateModal(targetColId: string = 'col-todo'): void {
    this.targetColumnForNewTask.set(targetColId);
    this.newTaskForm = {
      title: '',
      description: '',
      kanbanColumnId: targetColId,
      priorityId: 2,
      priorityCode: 'P2',
      priorityName: 'Media',
      assigneeId: '',
      testCaseId: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      estimatedHours: 2,
      tagsString: 'QA, Manual'
    };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  onPriorityChange(priorityCode: string): void {
    this.newTaskForm.priorityCode = priorityCode;
    const priorityMap: Record<string, { id: number; name: string }> = {
      'P0': { id: 0, name: 'Crítica' },
      'P1': { id: 1, name: 'Alta' },
      'P2': { id: 2, name: 'Media' },
      'P3': { id: 3, name: 'Baja' }
    };
    const target = priorityMap[priorityCode] ?? { id: 2, name: 'Media' };
    this.newTaskForm.priorityId = target.id;
    this.newTaskForm.priorityName = target.name;
  }

  /**
   * Guarda una nueva tarjeta QA en el tablero estándar.
   */
  saveNewTask(): void {
    if (!this.newTaskForm.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Título requerido',
        text: 'Por favor ingresa un título para la tarjeta QA.',
        confirmButtonColor: '#10B981',
        background: '#111E30',
        color: '#DAE3F6'
      });
      return;
    }

    this.isSavingTask.set(true);

    const tags = this.newTaskForm.tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const targetCol = this.board()?.columns.find(c => c.id === this.newTaskForm.kanbanColumnId);
    const backendColId = targetCol?.backendColumnId || this.newTaskForm.kanbanColumnId;

    const taskPayload: CreateKanbanTask = {
      title: this.newTaskForm.title.trim(),
      description: this.newTaskForm.description.trim() || null,
      kanbanColumnId: backendColId,
      priorityId: this.newTaskForm.priorityId,
      priorityCode: this.newTaskForm.priorityCode,
      priorityName: this.newTaskForm.priorityName,
      assigneeId: this.newTaskForm.assigneeId || null,
      testCaseId: this.newTaskForm.testCaseId || null,
      dueDate: this.newTaskForm.dueDate ? new Date(this.newTaskForm.dueDate).toISOString() : null,
      estimatedHours: this.newTaskForm.estimatedHours || 2,
      tags: tags.length > 0 ? tags : ['QA', 'Regresión'],
      projectId: this.selectedProjectId() !== 'ALL' ? this.selectedProjectId() : undefined
    };

    this.kanbanService.createTask(taskPayload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (created: KanbanTask) => {
        this.isSavingTask.set(false);
        this.closeModal();

        // Asignar nombres legibles si se seleccionaron
        if (taskPayload.assigneeId) {
          const user = this.users().find(u => u.id === taskPayload.assigneeId);
          if (user) created.assigneeName = user.fullName || user.username;
        }
        if (taskPayload.testCaseId) {
          const tc = this.testCases().find(t => t.id === taskPayload.testCaseId);
          if (tc) created.testCaseTitle = tc.title;
        }

        // Agregar localmente a la columna correspondiente
        const currentBoard = this.board();
        if (currentBoard) {
          const col = currentBoard.columns.find(c => c.id === created.kanbanColumnId) || currentBoard.columns[1];
          col.tasks.unshift(created);
          this.board.set({ ...currentBoard });
        }

        this.showSyncToast(`✅ Tarjeta "${created.title}" creada con éxito`);
      },
      error: (err) => {
        this.isSavingTask.set(false);
        console.error('[KanbanComponent] Error creando tarea:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la tarjeta QA.',
          confirmButtonColor: '#10B981',
          background: '#111E30',
          color: '#DAE3F6'
        });
      }
    });
  }

  /**
   * Navega al módulo de ejecuciones o muestra detalle de la tarea.
   */
  openExecution(task: KanbanTask): void {
    if (task.testCaseId) {
      this.router.navigate(['/test-executions'], {
        queryParams: { testCaseId: task.testCaseId }
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: task.taskCode || 'Tarjeta QA',
        html: `
          <div class="text-left text-sm space-y-2">
            <p><strong>Título:</strong> ${task.title}</p>
            <p><strong>Descripción:</strong> ${task.description || 'Sin descripción adicional'}</p>
            <p><strong>Prioridad:</strong> ${task.priorityCode} - ${task.priorityName}</p>
            <p><strong>Asignado:</strong> ${task.assigneeName || 'Sin asignar'}</p>
            <p><strong>Estimación:</strong> ${task.estimatedHours || 2} horas</p>
          </div>
        `,
        confirmButtonColor: '#10B981',
        background: '#111E30',
        color: '#DAE3F6'
      });
    }
  }

  /**
   * Obtiene la lista de IDs de columnas conectadas para drag and drop.
   */
  getColumnConnectedIds(): string[] {
    return this.filteredBoard()?.columns.map(c => 'column-' + c.id) ?? [];
  }

  /**
   * Retorna el color semántico del estado de ejecución.
   */
  getStatusColor(code: string | null): string {
    switch (code) {
      case 'PASSED':      return '#10b981';
      case 'FAILED':      return '#ef4444';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'BLOCKED':     return '#f59e0b';
      default:            return '#6b7280';
    }
  }

  /**
   * Obtiene la clase de acento visual para el encabezado y borde de columna.
   */
  getColumnAccentClass(colId: string): string {
    switch (colId) {
      case 'col-backlog':     return 'col-backlog';
      case 'col-todo':        return 'col-todo';
      case 'col-in-progress': return 'col-in-progress';
      case 'col-done':        return 'col-done';
      default:                return 'col-todo';
    }
  }

  /**
   * Retorna el icono representativo de cada columna estándar.
   */
  getColumnIcon(colId: string): string {
    switch (colId) {
      case 'col-backlog':     return 'ri-archive-line';
      case 'col-todo':        return 'ri-time-line';
      case 'col-in-progress': return 'ri-loader-4-line';
      case 'col-done':        return 'ri-checkbox-circle-line';
      default:                return 'ri-layout-column-line';
    }
  }
}

