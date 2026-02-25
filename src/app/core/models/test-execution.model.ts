// src/app/core/models/test-execution.model.ts
export interface TestExecution {
  id: string;
  testCaseId: string;
  testCaseTitle: string;
  testerId: string;
  testerName: string;
  statusId: number;
  statusName: string;
  statusCode: string;
  notes: string | null;
  actualTimeHours?: number | null;
  executionDate: string;
  completedAt: string | null;
  stepResults: StepResult[];
  evidences: Evidence[];
}

export interface Observation {
  id: string;
  executionStepResultId: string;
  observation: string;
  response: string | null;
  createdByUserName: string;
  createdAt: string;
  respondedByUserName: string | null;
  respondedAt: string | null;
  fileName: string | null;
  filePath: string | null;
}

export interface StepResult {
  id: string;
  testStepId: string;
  stepOrder: number;
  action: string;
  statusId: number;
  statusName: string;
  actualResult: string | null;
  notes: string | null;
  evidences?: Evidence[];
  observations?: Observation[];
}

export interface UpdateStepResult {
  testStepId: string;
  statusId: number;
  actualResult: string | null;
  notes: string | null;
}

export interface Evidence {
  id: string;
  fileTypeId: number;
  fileTypeName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  description: string | null;
  uploadedAt: string;
  executionStepResultId?: string;
}

export interface CreateTestExecution {
  testCaseId: string;
  notes: string | null;
}
