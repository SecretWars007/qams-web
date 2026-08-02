// src/app/core/models/exploratory.model.ts
export interface ExploratorySession {
  id: string;
  projectId: string;
  projectName?: string;
  testerId: string;
  testerName?: string;
  charter: string;
  statusId: number;
  statusName: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
  findings: ExploratoryFinding[];
}

export interface ExploratoryFinding {
  id: string;
  sessionId: string;
  typeId: number; // 1: Bug, 2: Note, 3: Question
  typeName: string;
  description: string;
  createdAt: string;
  createdByUserName?: string;
}

export interface CreateExploratorySessionDto {
  projectId: string;
  testerId: string;
  charter: string;
  startTime?: string;
  notes?: string;
}

export interface UpdateExploratorySessionDto {
  notes?: string;
  endTime?: string;
  durationMinutes?: number;
}

export interface CreateExploratoryFindingDto {
  sessionId: string;
  typeId: number;
  description: string;
}
