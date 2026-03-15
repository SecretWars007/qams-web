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
}
