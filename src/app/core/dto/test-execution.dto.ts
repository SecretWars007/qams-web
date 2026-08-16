// src/app/core/dto/test-execution.dto.ts

export interface EvidenceDto {
  id: string;
  executionStepResultId?: string;
  fileName: string;
  filePath: string;
  fileTypeName: string;
  fileSize: number;
  fileUrl?: string;
  description: string | null;
  uploadedAt: string;
}

export interface ObservationDto {
  id: string;
  observation: string;
  createdByUserName: string;
  createdAt: string;
  response: string | null;
  respondedByUserName?: string;
  respondedAt?: string;
}

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
  testerId: string;
  testerName: string;
  actualTimeHours: number;
  notes: string;
  testPlanId?: string;
  testPlanName?: string;
  cycleNumber?: number;
  stepResults: TestExecutionStepResultDto[];
  evidences?: EvidenceDto[];
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
  evidences?: EvidenceDto[];
  observations?: ObservationDto[];
}

export interface CreateTestExecutionDto {
  testCaseId: string;
  testerId?: string;
  notes: string;
  actualTimeHours: number;
  testPlanId?: string;
  stepResults: {
    testStepId: string;
    statusId: number;
    actualResult: string;
    notes: string;
  }[];
}

