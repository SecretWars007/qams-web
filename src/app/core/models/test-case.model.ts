// src/app/core/models/test-case.model.ts

export class TestCase {
  constructor(
    public id: string,
    public projectId: string,
    public projectName: string,
    public suite: {
      id: string;
      name: string;
    },
    public title: string,
    public description: string,
    public preconditions: string,
    public expectedResult: string,
    public priority: {
      id: number;
      name: string;
      code: string;
    },
    public isActive: boolean,
    public createdAt: Date,
    public createdBy: string,
    public steps: TestCaseStep[] = []
  ) {}
}

export interface TestCaseStep {
  id: string;
  stepOrder: number;
  action: string;
  expectedResult: string;
}
