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
  totalRequirements?: number;
  coveredRequirements?: number;
  requirementCoverageRate?: number;
  openDefects?: number;
}

// ── ISTQB Phase 1: KPIs avanzados y Quality Gate ──
export interface IstqbMetricsDto {
  projectId: string;
  projectName: string;

  // Pass Rate
  passRate: number;

  // DDP: Defect Detection Percentage
  ddp: number;

  // DRE: Defect Removal Efficiency
  dre: number;

  // MTTR: Mean Time To Repair (horas)
  mttrHours: number;

  // Requisitos
  totalRequirements: number;
  coveredRequirements: number;
  requirementCoverageRate: number;

  // Defectos
  totalDefects: number;
  openDefects: number;
  closedDefects: number;

  // Quality Gate umbrales
  minRequirementCoverage: number;
  minPassRate: number;
  maxOpenDefects: number;
  requireSutLinked: boolean;

  // Resultado del Quality Gate
  qualityGatePassed: boolean;
  qualityGateFailures: string[];
}

export interface UpdateQualityGateRequest {
  minRequirementCoverage: number;
  minPassRate: number;
  maxOpenDefects: number;
  requireSutLinked: boolean;
}
