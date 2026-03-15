// src/app/core/dto/dashboard.dto.ts

export interface ProjectTimelineDto {
  projectName: string;
  startDate: string;
  endDate: string;
}

export interface TaskProgressDto {
  columnName: string;
  taskCount: number;
}

export interface ExecutionsByStatusDto {
  statusName: string;
  statusCode: string;
  count: number;
}

export interface DashboardSummaryDto {
  totalProjects: number;
  totalTestCases: number;
  pendingTestCases: number;
  totalExecutions: number;
  passedExecutions: number;
  failedExecutions: number;
  pendingExecutions: number;
  passRate: number;
  taskProgress: TaskProgressDto[];
  executionsByStatus: ExecutionsByStatusDto[];
  projectTimeline: ProjectTimelineDto[];
}
