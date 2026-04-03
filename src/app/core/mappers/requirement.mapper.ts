// src/app/core/mappers/requirement.mapper.ts
import { RequirementDto } from '../dto/requirement.dto';
import { Requirement } from '../models/requirement.model';

export class RequirementMapper {
  static fromDto(dto: RequirementDto): Requirement {
    return {
      id: dto.id,
      projectId: dto.projectId,
      title: dto.title,
      description: dto.description,
      code: dto.code,
      acceptanceCriteria: dto.acceptanceCriteria,
      requirementTypeId: dto.requirementTypeId,
      requirementTypeName: dto.requirementTypeName,
      requirementPriorityId: dto.requirementPriorityId,
      requirementPriorityName: dto.requirementPriorityName,
      requirementComplexityId: dto.requirementComplexityId,
      requirementComplexityName: dto.requirementComplexityName,
      requirementStatusId: dto.requirementStatusId,
      requirementStatusName: dto.requirementStatusName,
      source: dto.source,
      createdAt: new Date(dto.createdAt)
    };
  }
}
