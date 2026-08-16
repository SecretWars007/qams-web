// src/app/core/dto/test-case.dto.ts

export interface TestCaseDto {
  id: string;
  projectId: string;
  projectName: string;
  testSuiteId: string;
  testSuiteName: string;
  title: string;
  description: string;
  preconditions: string;
  expectedResult: string;
  priorityId: number;
  priorityName: string;
  priorityCode: string;
  isActive: boolean;
  createdAt: string;
  createdByUserName: string;
  steps: TestCaseStepDto[];
  impactLevel?: number;
  likelihoodLevel?: number;
  riskScore?: number;
  requirementIds?: string[];
  postconditions?: string | null;
  isBdd?: boolean;
  bddScenario?: string | null;
  lastCycleNumber?: number | null;
}

export interface TestCaseStepDto {
  id: string;
  stepOrder: number;
  action: string;
  expectedResult: string;
}

export interface CreateTestCaseDto {
  projectId: string;
  testSuiteId: string;
  title: string;
  description: string;
  preconditions: string;
  expectedResult: string;
  priorityId: number;
  impactLevel?: number;
  likelihoodLevel?: number;
  requirementIds?: string[];
  postconditions?: string | null;
  isBdd?: boolean;
  bddScenario?: string | null;
  testTypeId?: number;
  estimatedTimeHours?: number;
  steps?: any[];
}
