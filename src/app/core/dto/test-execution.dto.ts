// src/app/core/dto/test-execution.dto.ts

export interface TestExecutionDto {
  id: string;
  testCaseId: string;
  testCaseTitle: string;
  projectId: string;
  projectName: string;
  statusId: number;
  statusName: string;
  statusCode: string;
  executionDate: string;
  executedByUserName: string;
  actualTimeHours: number;
  notes: string;
  stepResults: TestExecutionStepResultDto[];
}

export interface TestExecutionStepResultDto {
  id: string;
  testStepId: string;
  testStepOrder: number;
  testStepAction: string;
  testStepDescription: string;
  statusId: number;
  statusName: string;
  statusCode: string;
  actualResult: string;
  notes: string;
}

export interface CreateTestExecutionDto {
  testCaseId: string;
  notes: string;
  actualTimeHours: number;
  stepResults: {
    testStepId: string;
    statusId: number;
    actualResult: string;
    notes: string;
  }[];
}
