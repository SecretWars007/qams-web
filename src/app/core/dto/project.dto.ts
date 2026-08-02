// src/app/core/dto/project.dto.ts

export interface ProjectDevolutionDto {
  id: string;
  projectId: string;
  devolutionDate: string;
  notes: string;
  responseDate: string | null;
  responseNotes: string | null;
  createdByUserName: string;
  observationsCount: number;
}

export interface ProjectDto {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  testerNames: string[];
  isActive: boolean;
  priority: number;
  projectStatusId: number;
  projectStatusName: string;
  systemUnderTestId?: string | null;
  systemUnderTestName?: string | null;
  createdAt: string;
  createdByUserName: string;
  testSuiteCount: number;
  kanbanBoardCount: number;
  devolucionesCounter: number;
  historicDevolutions: ProjectDevolutionDto[];
}

export interface CreateProjectDto {
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  priority: number;
  projectStatusId: number;
  systemUnderTestId?: string | null;
  testerIds: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  priority?: number;
  projectStatusId?: number;
  systemUnderTestId?: string | null;
  testerIds?: string[];
  isActive?: boolean;
}
