// src/app/core/models/kanban.model.ts
export interface KanbanBoard {
  id: string;
  projectId: string;
  name: string;
  columns: KanbanColumn[];
}

export interface KanbanColumn {
  id: string;
  backendColumnId?: string;
  name: string;
  orderIndex: number;
  tasks: KanbanTask[];
}

export interface KanbanTask {
  id: string;
  kanbanColumnId: string;
  backendColumnId?: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  testCaseId: string | null;
  priorityId: number;
  priorityName: string;
  priorityCode: string;
  dueDate: string | null;
  orderIndex: number;

  // ── Metadatos y Tags QA ──
  taskCode?: string;
  tags?: string[];
  estimatedHours?: number;
  spentHours?: number;
  sprint?: string;

  // ── Contexto de Certificación ISTQB ──
  testCaseTitle: string | null;
  totalSteps: number;
  completedSteps: number;
  passedSteps: number;
  openDefectsCount: number;
  lastExecutionStatusCode: string | null;
  lastExecutionStatusName: string | null;
  sutName: string | null;
  isOverdue: boolean;
  stepProgressPercent: number;
}

export interface CreateKanbanTask {
  kanbanColumnId: string;
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  testCaseId?: string | null;
  priorityId: number;
  priorityCode?: string;
  priorityName?: string;
  dueDate?: string | null;
  estimatedHours?: number;
  tags?: string[];
  projectId?: string;
}

export interface MoveTask {
  targetColumnId: string;
  newOrderIndex: number;
}

export interface CreateBoard {
  projectId: string;
  name: string;
}

/** Definición oficial de las 4 columnas estándar de QAMS para cualquier proyecto */
export const STANDARD_KANBAN_COLUMNS: { id: string; name: string; orderIndex: number; icon: string; accentClass: string }[] = [
  { id: 'col-backlog', name: 'Tareas', orderIndex: 0, icon: 'ri-task-line', accentClass: 'col-backlog' },
  { id: 'col-todo', name: 'Por Hacer', orderIndex: 1, icon: 'ri-time-line', accentClass: 'col-todo' },
  { id: 'col-in-progress', name: 'En Proceso', orderIndex: 2, icon: 'ri-loader-4-line', accentClass: 'col-in-progress' },
  { id: 'col-done', name: 'Completado', orderIndex: 3, icon: 'ri-checkbox-circle-line', accentClass: 'col-done' }
];

