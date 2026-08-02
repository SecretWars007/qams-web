// src/app/core/dto/defect.dto.ts

export interface DefectDto {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  severityId?: number;
  severityName?: string;
  statusId?: number;
  statusName?: string;
  priorityId?: number;
  priorityName?: string;
  reportedByUserId?: string;
  reportedByName?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  testCaseId?: string;
  testExecutionId?: string;
  stepsToReproduce?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDefectDto {
  projectId: string;
  title: string;
  description?: string;
  severityId?: number;
  priorityId?: number;
  assignedToUserId?: string;
  testCaseId?: string;
  testExecutionId?: string;
  stepsToReproduce?: string;
}

export interface UpdateDefectDto {
  title: string;
  description?: string;
  severityId?: number;
  statusId?: number;
  priorityId?: number;
  assignedToUserId?: string;
  stepsToReproduce?: string;
}
