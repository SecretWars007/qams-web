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
  executionDate: string;
  completedAt: string | null;
  stepResults: StepResult[];
  evidences: Evidence[];
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
}

export interface CreateTestExecution {
  testCaseId: string;
  notes: string | null;
}
