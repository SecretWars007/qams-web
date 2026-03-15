// src/app/core/models/dashboard.model.ts

/**
 * Entidad de dominio Dashboard.
 */
export interface DashboardSummary {
  totalProjects: number;
  totalTestCases: number;
  pendingTestCases: number;
  totalExecutions: number;
  passedExecutions: number;
  failedExecutions: number;
  pendingExecutions: number;
  passRate: number;
  taskProgress: TaskProgress[];
  executionsByStatus: ExecutionsByStatus[];
  projectTimeline: ProjectTimeline[];
}

export interface ProjectTimeline {
  projectName: string;
  startDate: Date;
  endDate: Date;
}

export interface TaskProgress {
  columnName: string;
  count: number;
}

export interface ExecutionsByStatus {
  statusName: string;
  statusCode: string;
  count: number;
}
