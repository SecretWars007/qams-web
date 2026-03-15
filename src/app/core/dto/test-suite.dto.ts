// src/app/core/dto/test-suite.dto.ts

export interface TestSuiteDto {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
}
