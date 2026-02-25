// src/app/core/models/dashboard.model.ts
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
  startDate: string;
  endDate: string;
}

export interface TaskProgress {
  columnName: string;
  taskCount: number;
}

export interface ExecutionsByStatus {
  statusName: string;
  statusCode: string;
  count: number;
}
