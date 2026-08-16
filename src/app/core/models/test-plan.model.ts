// src/app/core/models/test-plan.model.ts
// Modelos para Planes de Prueba (ISTQB / ISO 29119: Test Planning)

export interface TestPlanCriteria {
  id?: string;
  testPlanId?: string;
  criteriaType: 'ENTRY' | 'EXIT';
  description: string;
  isMet: boolean;
  priority?: string;
  category?: string;
}

export interface TestPlanMilestone {
  id?: string;
  testPlanId?: string;
  name: string;
  description?: string;
  targetDate: string;
  isCompleted: boolean;
}

export interface TestPlanRisk {
  id?: string;
  testPlanId?: string;
  description: string;
  likelihood: string; // HIGH, MEDIUM, LOW
  impact: string;     // HIGH, MEDIUM, LOW
  mitigationStrategy?: string;
}

export interface TestPlanApprovalLog {
  id: string;
  testPlanId: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  status: string; // APPROVED, REJECTED
  comments?: string;
  signatureDate: Date;
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
  testStrategyId?: number;
  testStrategy?: any;
  testPlanTypeId?: number;
  testPlanType?: any;
  testLevelId?: number;
  testLevel?: any;
  testManagerId?: string;
  testManagerName?: string;
  riskLevelId?: number;
  riskLevel?: any;
  testEnvironmentId?: number;
  testEnvironment?: any;
  testSchedule?: string;
  estimatedEffortHours?: number;

  startDate?: Date;
  endDate?: Date;
  statusId?: number;
  statusName?: string;
  createdAt: Date;
  updatedAt?: Date;

  criteria?: TestPlanCriteria[];
  milestones?: TestPlanMilestone[];
  risks?: TestPlanRisk[];
  approvalLogs?: TestPlanApprovalLog[];
  isClosed?: boolean;
}

export interface CreateTestPlan {
  projectId: string;
  name: string;
  objectives?: string;
  description?: string;

  scope?: string;
  outOfScope?: string;
  testStrategyId?: number;
  testPlanTypeId?: number;
  testLevelId?: number;
  testManagerId?: string;
  riskLevelId?: number;
  testEnvironmentId?: number;
  testSchedule?: string;
  estimatedEffortHours?: number;

  startDate: string;
  endDate: string;
  criteria?: TestPlanCriteria[];
  milestones?: TestPlanMilestone[];
  risks?: TestPlanRisk[];
}

export interface UpdateTestPlan {
  name: string;
  objectives?: string;
  description?: string;

  scope?: string;
  outOfScope?: string;
  testStrategyId?: number;
  testPlanTypeId?: number;
  testLevelId?: number;
  testManagerId?: string;
  riskLevelId?: number;
  testEnvironmentId?: number;
  testSchedule?: string;
  estimatedEffortHours?: number;

  startDate: string;
  endDate: string;
  statusId: number;
  criteria?: TestPlanCriteria[];
  milestones?: TestPlanMilestone[];
  risks?: TestPlanRisk[];
}

export interface ApproveTestPlan {
  verdict: string;
  comments?: string;
}
