// src/app/core/models/test-step.model.ts
export interface TestStep {
    id: string;
    testCaseId: string;
    stepOrder: number;
    action: string;
    expectedResult: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateTestStep {
    stepOrder: number;
    action: string;
    expectedResult: string;
}
