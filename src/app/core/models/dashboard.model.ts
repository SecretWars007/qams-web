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
  totalRequirements?: number;
  coveredRequirements?: number;
  requirementCoverageRate?: number;
  openDefects?: number;
  istqbMetrics?: IstqbMetrics;
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

export interface IstqbMetrics {
  projectId: string;
  projectName: string;
  passRate: number;
  ddp: number; // Defect Detection Percentage
  dre: number; // Defect Removal Efficiency
  mttrHours: number; // Mean Time To Repair
  totalRequirements: number;
  coveredRequirements: number;
  requirementCoverageRate: number;
  totalDefects: number;
  openDefects: number;
  closedDefects: number;
  minRequirementCoverage: number;
  minPassRate: number;
  maxOpenDefects: number;
  requireSutLinked: boolean;
  qualityGatePassed: boolean;
  qualityGateFailures: string[];
  qualityGateStatus?: string;
  defectDetectionPercentage?: number;
  defectRemovalEfficiency?: number;
  meanTimeToRepairHours?: number;
  defectDensityPerRequirement?: number;
}

