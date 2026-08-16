export class TestSuite {
    constructor(
        public id: string,
        public projectId: string,
        public name: string,
        public description: string | null,
        public statusId: number,
        public statusName: string,
        
        // ISTQB Fields
        public executionPriorityId?: number,
        public executionPriorityName?: string,
        public testLevelId?: number,
        public testLevelName?: string,
        public testTypeId?: number,
        public testTypeName?: string,
        public automationStatusId?: number,
        public automationStatusName?: string,
        public testDesignTechniqueId?: number,
        public testDesignTechniqueName?: string,
        public reviewStatusId?: number,
        public reviewStatusName?: string,
        public testEnvironmentId?: number,
        public testEnvironmentName?: string,
        public ownerUserId?: string,
        public ownerName?: string,
        public preconditions?: string,
        public coverageObjective?: string,
        public estimatedDurationHours: number = 0,
        public tags: string[] = [],

        // Execution Metrics
        public testCaseCount: number = 0,
        public passedCount: number = 0,
        public failedCount: number = 0,
        public blockedCount: number = 0,
        public pendingCount: number = 0,
        public executionProgress: number = 0,
        public lastExecutionDate?: Date,
        public defectCount: number = 0,
        public testPlanId?: string,
        public createdAt: Date = new Date()
    ) {}
}

export interface CreateTestSuite {
    projectId: string;
    name: string;
    description: string | null;
    testPlanId?: string;
    
    // ISTQB Fields
    executionPriorityId?: number | null;
    testLevelId?: number | null;
    testTypeId?: number | null;
    automationStatusId?: number | null;
    testDesignTechniqueId?: number | null;
    reviewStatusId?: number | null;
    testEnvironmentId?: number | null;
    ownerUserId?: string | null;
    preconditions?: string | null;
    coverageObjective?: string | null;
    estimatedDurationHours?: number;
    tagIds?: number[];
}
