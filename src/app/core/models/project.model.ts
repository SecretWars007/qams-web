// src/app/core/models/project.model.ts
export interface ProjectDevolution {
  id: string;
  projectId: string;
  devolutionDate: string;
  notes: string;
  responseDate: string | null;
  responseNotes: string | null;
  createdByUserName: string;
  observationsCount: number;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  testerIds?: string[];         // opcional: el backend no lo retorna, pero el mock lo usa
  testerNames: string[];
  isActive: boolean;
  priority: number;
  projectStatusId: number;
  projectStatusName: string;
  createdAt: string;
  createdByUserName: string;
  testSuiteCount: number;
  kanbanBoardCount: number;
  devolucionesCounter: number;
  historicDevolutions: ProjectDevolution[];
}

export interface CreateProject {
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  priority: number;
  projectStatusId: number;
  testerIds: string[];
}

export interface UpdateProject {
  name?: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  priority?: number;
  projectStatusId?: number;
  testerIds?: string[];
  isActive?: boolean;
}
