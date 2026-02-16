// src/app/core/models/kanban.model.ts
export interface KanbanBoard {
  id: string;
  projectId: string;
  name: string;
  columns: KanbanColumn[];
}

export interface KanbanColumn {
  id: string;
  name: string;
  orderIndex: number;
  tasks: KanbanTask[];
}

export interface KanbanTask {
  id: string;
  kanbanColumnId: string;
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
}

export interface CreateKanbanTask {
  kanbanColumnId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  testCaseId: string | null;
  priorityId: number;
  dueDate: string | null;
}

export interface MoveTask {
  targetColumnId: string;
  newOrderIndex: number;
}

export interface CreateBoard {
  projectId: string;
  name: string;
}
