// src/app/core/dto/requirement.dto.ts

export interface RequirementDto {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  code: string;
  acceptanceCriteria: string | null;
  requirementTypeId: number;
  requirementTypeName: string;
  requirementPriorityId: number;
  requirementPriorityName: string;
  requirementComplexityId: number;
  requirementComplexityName: string;
  requirementStatusId: number;
  requirementStatusName: string;
  source: string | null;
  createdAt: string;
}

export interface CreateRequirementDto {
  title: string;
  description: string | null;
  code: string;
  acceptanceCriteria: string | null;
  requirementTypeId: number;
  requirementPriorityId: number;
  requirementComplexityId: number;
  source: string | null;
}
