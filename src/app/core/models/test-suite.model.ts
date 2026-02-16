// src/app/core/models/test-suite.model.ts
export interface TestSuite {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface CreateTestSuite {
    projectId: string;
    name: string;
    description: string | null;
}
