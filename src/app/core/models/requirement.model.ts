// src/app/core/models/requirement.model.ts

export interface Requirement {
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
  createdAt: Date;
}

export interface CreateRequirement {
  title: string;
  description: string | null;
  code: string;
  acceptanceCriteria: string | null;
  requirementTypeId: number;
  requirementPriorityId: number;
  requirementComplexityId: number;
  source: string | null;
}

export interface UpdateRequirement extends Partial<CreateRequirement> {
  requirementStatusId?: number;
}
