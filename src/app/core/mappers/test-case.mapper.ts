// src/app/core/mappers/test-case.mapper.ts
import { TestCaseDto } from '../dto/test-case.dto';
import { TestCase } from '../models/test-case.model';

export class TestCaseMapper {
  static fromDto(dto: TestCaseDto): TestCase {
    return new TestCase(
      dto.id,
      dto.projectId,
      dto.projectName,
      {
        id: dto.testSuiteId,
        name: dto.testSuiteName
      },
      dto.title,
      dto.description,
      dto.preconditions,
      dto.expectedResult,
      {
        id: dto.priorityId,
        name: dto.priorityName,
        code: dto.priorityCode
      },
      dto.isActive,
      new Date(dto.createdAt),
      dto.createdByUserName,
      dto.steps?.map(s => ({
        id: s.id,
        stepOrder: s.stepOrder,
        action: s.action,
        expectedResult: s.expectedResult
      })) || [],
      dto.impactLevel ?? 3,
      dto.likelihoodLevel ?? 3,
      dto.riskScore ?? ((dto.impactLevel ?? 3) * (dto.likelihoodLevel ?? 3))
    );
  }
}
