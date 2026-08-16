// src/app/core/dto/test-suite.dto.ts

export interface TestSuiteDto {
    id: string;
    projectId: string;
    testPlanId?: string;
    name: string;
    description: string | null;
    isActive?: boolean;
    statusId: number;
    statusName: string;
    
    // ISTQB Fields
    executionPriorityId?: number;
    executionPriorityName?: string;
    testLevelId?: number;
    testLevelName?: string;
    testTypeId?: number;
    testTypeName?: string;
    automationStatusId?: number;
    automationStatusName?: string;
    testDesignTechniqueId?: number;
    testDesignTechniqueName?: string;
    reviewStatusId?: number;
    reviewStatusName?: string;
    testEnvironmentId?: number;
    testEnvironmentName?: string;
    ownerUserId?: string;
    ownerName?: string;
    preconditions?: string;
    coverageObjective?: string;
    estimatedDurationHours: number;
    tags: string[];

    // Execution Metrics
    testCaseCount: number;
    passedCount: number;
    failedCount: number;
    blockedCount: number;
    pendingCount: number;
    executionProgress: number;
    lastExecutionDate?: string;
    defectCount: number;

    createdAt: string;
}
