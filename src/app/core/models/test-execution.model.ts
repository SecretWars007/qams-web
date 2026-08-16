// src/app/core/models/test-execution.model.ts

export class TestExecution {
  constructor(
    public id: string,
    public testCase: {
      id: string;
      title: string;
    },
    public project: {
      id: string;
      name: string;
    },
    public status: {
      id: number;
      name: string;
      code: string;
    },
    public executionDate: Date,
    public tester: {
      id: string;
      name: string;
    },
    public actualTimeHours: number,
    public notes: string,
    public testPlan?: {
      id: string;
      name: string;
    },
    public stepResults: TestExecutionStepResult[] = [],
    public evidences: Evidence[] = [],
    public cycleNumber: number = 1
  ) {}
}

export interface Evidence {
  id: string;
  fileUrl: string;
  fileName: string;
  fileTypeName: string;
  fileSize: number;
  description: string | null;
  uploadedAt: Date;
  executionStepResultId?: string;
}

export interface Observation {
  id: string;
  observation: string;
  createdBy: string;
  createdAt: Date;
  response: string | null;
}

export interface TestExecutionStepResult {
  id: string;
  stepId: string;
  stepOrder: number;
  action: string;
  description?: string;
  status: {
    id: number;
    name: string;
    code: string;
  };
  actualResult: string;
  notes: string;
  evidences: Evidence[];
  observations: Observation[];
}
