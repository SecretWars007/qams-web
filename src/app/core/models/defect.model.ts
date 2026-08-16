// src/app/core/models/defect.model.ts
// Modelos para Defectos (ISTQB: Defect Management)

export interface Defect {
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
  testExecutionStepResultId?: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  environmentInfo?: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateDefect {
  projectId: string;
  title: string;
  description?: string;
  severityId?: number;
  priorityId?: number;
  defectPriorityId?: number;
  defectSeverityId?: number;
  defectStatusId?: number;
  assignedToUserId?: string;
  testCaseId?: string;
  testExecutionId?: string;
  testExecutionStepResultId?: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  environmentInfo?: string;
}

export interface UpdateDefect {
  title: string;
  description?: string;
  severityId?: number;
  statusId?: number;
  priorityId?: number;
  defectPriorityId?: number;
  defectSeverityId?: number;
  defectStatusId?: number;
  assignedToUserId?: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  environmentInfo?: string;
}
