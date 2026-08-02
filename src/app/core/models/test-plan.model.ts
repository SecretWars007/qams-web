// src/app/core/models/test-plan.model.ts
// Modelos para Planes de Prueba (ISTQB / ISO 29119: Test Planning)

export interface TestPlanCriteria {
  id?: string;
  testPlanId?: string;
  criteriaType: 'ENTRY' | 'EXIT';
  description: string;
  isMet: boolean;
}

export interface TestPlan {
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

  startDate?: Date;
  endDate?: Date;
  statusId?: number;
  statusName?: string;
  createdAt: Date;
  updatedAt?: Date;

  criteria?: TestPlanCriteria[];
  isClosed?: boolean;
}

export interface CreateTestPlan {
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
  criteria?: TestPlanCriteria[];
}

export interface UpdateTestPlan {
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
  criteria?: TestPlanCriteria[];
}

export interface ApproveTestPlan {
  verdict: string;
  comments?: string;
}
