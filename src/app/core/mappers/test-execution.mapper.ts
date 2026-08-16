// src/app/core/mappers/test-execution.mapper.ts
import { TestExecutionDto, TestExecutionStepResultDto, EvidenceDto, ObservationDto } from '../dto/test-execution.dto';
import { TestExecution, TestExecutionStepResult, Evidence, Observation } from '../models/test-execution.model';

export class TestExecutionMapper {
  static fromDto(dto: TestExecutionDto): TestExecution {
    return new TestExecution(
      dto.id,
      { id: dto.testCaseId, title: dto.testCaseTitle },
      { id: dto.projectId, name: dto.projectName },
      { id: dto.statusId, name: dto.statusName, code: dto.statusCode },
      new Date(dto.executionDate),
      { id: dto.testerId, name: dto.testerName },
      dto.actualTimeHours,
      dto.notes,
      dto.testPlanId ? { id: dto.testPlanId, name: dto.testPlanName || '' } : undefined,
      dto.stepResults?.map(sr => this.fromStepResultDto(sr)) || [],
      dto.evidences?.map(ev => this.fromEvidenceDto(ev)) || [],
      dto.cycleNumber || 1
    );
  }

  static fromStepResultDto(dto: TestExecutionStepResultDto): TestExecutionStepResult {
    return {
      id: dto.id,
      stepId: dto.testStepId,
      stepOrder: dto.testStepOrder || 0,
      action: dto.testStepAction || '',
      description: dto.testStepDescription,
      status: {
        id: dto.statusId,
        name: dto.statusName,
        code: dto.statusCode
      },
      actualResult: dto.actualResult,
      notes: dto.notes,
      evidences: dto.evidences?.map(ev => this.fromEvidenceDto(ev)) || [],
      observations: dto.observations?.map(ob => this.fromObservationDto(ob)) || []
    };
  }

  static fromEvidenceDto(dto: EvidenceDto): Evidence {
    return {
      id: dto.id,
      fileName: dto.fileName,
      fileUrl: dto.fileUrl || `/api/testexecutions/evidence/${dto.id}/file`,
      fileTypeName: dto.fileTypeName,
      fileSize: dto.fileSize,
      description: dto.description,
      uploadedAt: new Date(dto.uploadedAt),
      executionStepResultId: dto.executionStepResultId
    };
  }

  static fromObservationDto(dto: ObservationDto): Observation {
    return {
      id: dto.id,
      observation: dto.observation,
      createdBy: dto.createdByUserName,
      createdAt: new Date(dto.createdAt),
      response: dto.response
    };
  }
}
