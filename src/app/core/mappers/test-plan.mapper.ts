// src/app/core/mappers/test-plan.mapper.ts
import { TestPlanDto } from '../dto/test-plan.dto';
import { TestPlan } from '../models/test-plan.model';

export class TestPlanMapper {
  static fromDto(dto: TestPlanDto): TestPlan {
    return {
      id: dto.id,
      name: dto.name,
      objectives: dto.objectives || dto.description,
      description: dto.description || dto.objectives,
      projectId: dto.projectId,
      projectName: dto.projectName,

      // ISTQB Fields
      scope: dto.scope,
      outOfScope: dto.outOfScope,
      testStrategy: dto.testStrategy,
      riskAnalysis: dto.riskAnalysis,
      environmentRequirements: dto.environmentRequirements,
      testSchedule: dto.testSchedule,
      estimatedEffortHours: dto.estimatedEffortHours,

      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      statusId: dto.statusId,
      statusName: dto.statusName || dto.status?.name,
      createdAt: new Date(dto.createdAt),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,

      criteria: dto.criteria?.map(c => ({
        id: c.id,
        testPlanId: c.testPlanId,
        criteriaType: c.criteriaType,
        description: c.description,
        isMet: c.isMet
      })) || []
    };
  }
}
