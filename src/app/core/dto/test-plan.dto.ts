// src/app/core/dto/test-plan.dto.ts

export interface TestPlanCriteriaDto {
  id?: string;
  testPlanId?: string;
  criteriaType: 'ENTRY' | 'EXIT';
  description: string;
  isMet: boolean;
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
  testStrategy?: string;
  riskAnalysis?: string;
  environmentRequirements?: string;
  testSchedule?: string;
  estimatedEffortHours?: number;

  startDate?: string; // ISO string from backend
  endDate?: string;   // ISO string from backend
  statusId?: number;
  statusName?: string;
  status?: { id: number; name: string };
  createdAt: string;  // ISO string
  updatedAt?: string;

  testSuiteIds?: string[];
  criteria?: TestPlanCriteriaDto[];
}

export interface CreateTestPlanDto {
  projectId: string;
  name: string;
  objectives?: string;
  description?: string;

  scope?: string;
  outOfScope?: string;
  testStrategy?: string;
  riskAnalysis?: string;
  environmentRequirements?: string;
  testSchedule?: string;
  estimatedEffortHours?: number;

  startDate: string;
  endDate: string;
  testSuiteIds?: string[];
  criteria?: TestPlanCriteriaDto[];
}

export interface UpdateTestPlanDto {
  name: string;
  objectives?: string;
  description?: string;

  scope?: string;
  outOfScope?: string;
  testStrategy?: string;
  riskAnalysis?: string;
  environmentRequirements?: string;
  testSchedule?: string;
  estimatedEffortHours?: number;

  startDate: string;
  endDate: string;
  statusId: number;
  testSuiteIds?: string[];
  criteria?: TestPlanCriteriaDto[];
}
