// src/app/core/mappers/test-suite.mapper.ts
import { TestSuiteDto } from '../dto/test-suite.dto';
import { TestSuite } from '../models/test-suite.model';

export class TestSuiteMapper {
    static fromDto(dto: TestSuiteDto): TestSuite {
        return new TestSuite(
            dto.id,
            dto.projectId,
            dto.name,
            dto.description,
            dto.statusId,
            dto.statusName,
            
            dto.executionPriorityId,
            dto.executionPriorityName,
            dto.testLevelId,
            dto.testLevelName,
            dto.testTypeId,
            dto.testTypeName,
            dto.automationStatusId,
            dto.automationStatusName,
            dto.testDesignTechniqueId,
            dto.testDesignTechniqueName,
            dto.reviewStatusId,
            dto.reviewStatusName,
            dto.testEnvironmentId,
            dto.testEnvironmentName,
            dto.ownerUserId,
            dto.ownerName,
            dto.preconditions,
            dto.coverageObjective,
            dto.estimatedDurationHours,
            dto.tags || [],
            
            dto.testCaseCount,
            dto.passedCount,
            dto.failedCount,
            dto.blockedCount,
            dto.pendingCount,
            dto.executionProgress,
            dto.lastExecutionDate ? new Date(dto.lastExecutionDate) : undefined,
            dto.defectCount,
            dto.testPlanId,
            new Date(dto.createdAt)
        );
    }

    static toDto(suite: TestSuite): TestSuiteDto {
        return {
            id: suite.id,
            projectId: suite.projectId,
            testPlanId: suite.testPlanId,
            name: suite.name,
            description: suite.description,
            statusId: suite.statusId,
            statusName: suite.statusName,
            
            executionPriorityId: suite.executionPriorityId,
            executionPriorityName: suite.executionPriorityName,
            testLevelId: suite.testLevelId,
            testLevelName: suite.testLevelName,
            testTypeId: suite.testTypeId,
            testTypeName: suite.testTypeName,
            automationStatusId: suite.automationStatusId,
            automationStatusName: suite.automationStatusName,
            testDesignTechniqueId: suite.testDesignTechniqueId,
            testDesignTechniqueName: suite.testDesignTechniqueName,
            reviewStatusId: suite.reviewStatusId,
            reviewStatusName: suite.reviewStatusName,
            testEnvironmentId: suite.testEnvironmentId,
            testEnvironmentName: suite.testEnvironmentName,
            ownerUserId: suite.ownerUserId,
            ownerName: suite.ownerName,
            preconditions: suite.preconditions,
            coverageObjective: suite.coverageObjective,
            estimatedDurationHours: suite.estimatedDurationHours,
            tags: suite.tags,
            
            testCaseCount: suite.testCaseCount,
            passedCount: suite.passedCount,
            failedCount: suite.failedCount,
            blockedCount: suite.blockedCount,
            pendingCount: suite.pendingCount,
            executionProgress: suite.executionProgress,
            lastExecutionDate: suite.lastExecutionDate?.toISOString(),
            defectCount: suite.defectCount,
            
            createdAt: suite.createdAt.toISOString()
        };
    }
}
