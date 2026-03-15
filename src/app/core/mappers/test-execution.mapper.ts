// src/app/core/mappers/test-execution.mapper.ts
import { TestExecutionDto, TestExecutionStepResultDto } from '../dto/test-execution.dto';
import { TestExecution, TestExecutionStepResult } from '../models/test-execution.model';

export class TestExecutionMapper {
  static fromDto(dto: TestExecutionDto): TestExecution {
    return new TestExecution(
      dto.id,
      { id: dto.testCaseId, title: dto.testCaseTitle },
      { id: dto.projectId, name: dto.projectName },
      { id: dto.statusId, name: dto.statusName, code: dto.statusCode },
      new Date(dto.executionDate),
      dto.executedByUserName,
      dto.actualTimeHours,
      dto.notes,
      dto.stepResults?.map(this.fromStepResultDto) || []
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
      evidences: [],
      observations: []
    };
  }
}
