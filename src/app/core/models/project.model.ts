// src/app/core/models/project.model.ts
export interface Project {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  testerIds: string[];
  testerNames: string[];
  isActive: boolean;
  priority: number;
  projectStatusId: number;
  projectStatusName: string;
  createdAt: string;
  createdByUserName: string;
  testSuiteCount: number;
  kanbanBoardCount: number;
}

export interface CreateProject {
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  testerIds: string[];
}

export interface UpdateProject {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}
