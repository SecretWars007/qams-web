// src/app/core/dto/test-plan.dto.ts
// DTOs sincronizados con el backend QAMS.Application.DTOs.TestPlans

export interface CatalogItemDto {
  id: number;
  name: string;
  code?: string;
}

export interface TestPlanCriteriaDto {
  id?: string;
  testPlanId?: string;
  criteriaType: 'ENTRY' | 'EXIT';
  description: string;
  isMet: boolean;
  priority?: string;
  category?: string;
}

export interface TestPlanMilestoneDto {
  id?: string;
  testPlanId?: string;
  name: string;
  description?: string;
  dueDate: string;       // backend usa dueDate
  isCompleted: boolean;
}

export interface TestPlanRiskDto {
  id?: string;
  testPlanId?: string;
  description: string;
  probability: number;   // int 1-5 en backend
  impact: number;        // int 1-5 en backend
  mitigation?: string;   // backend usa mitigation
}

export interface TestPlanApprovalLogDto {
  id: string;
  testPlanId: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  verdict?: string;
  status?: string;
  comments?: string;
  createdAt: string;
  signatureDate?: string;
}

export interface TestPlanDto {
  id: string;
  projectId: string;
  projectName?: string;
  name: string;
  objectives?: string;
  description?: string;

  // ISTQB Fields
  scope?: string;
  outOfScope?: string;
  testStrategyId?: number;
  testStrategy?: CatalogItemDto;
  testPlanTypeId?: number;
  testPlanType?: CatalogItemDto;
  testLevelId?: number;
  testLevel?: CatalogItemDto;
  testManagerId?: string;
  testManagerName?: string;
  riskLevelId?: number;
  riskLevel?: CatalogItemDto;
  testEnvironmentId?: number;
  testEnvironment?: CatalogItemDto;
  testSchedule?: string;
  estimatedEffortHours?: number;

  startDate?: string;
  endDate?: string;
  statusId?: number;
  statusName?: string;
  status?: CatalogItemDto;
  isClosed?: boolean;
  createdAt: string;
  updatedAt?: string;

  testSuiteIds?: string[];
  criteria?: TestPlanCriteriaDto[];
  milestones?: TestPlanMilestoneDto[];
  risks?: TestPlanRiskDto[];
  approvalLogs?: TestPlanApprovalLogDto[];
}
