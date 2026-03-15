// src/app/core/models/project.model.ts
import { ProjectDevolutionDto, ProjectDto } from '../dto/project.dto';

/**
 * Entidad de dominio Proyecto.
 * Representa un proyecto dentro de la lógica del frontend.
 */
export class Project {
  constructor(
    public id: string,
    public name: string,
    public description: string | null,
    public startDate: Date | null,
    public endDate: Date | null,
    public testerNames: string[],
    public isActive: boolean,
    public priority: number,
    public status: {
      id: number;
      name: string;
    },
    public createdAt: Date,
    public createdBy: string,
    public stats: {
      suites: number;
      kanbanTasks: number;
      devolutions: number;
    },
    public historicDevolutions: ProjectDevolution[] = []
  ) {}

  /**
   * Determina si el proyecto está actualmente activo y dentro de sus fechas.
   */
  get isCurrentlyActive(): boolean {
    if (!this.isActive) return false;
    const now = new Date();
    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;
    return true;
  }
}

export interface ProjectDevolution {
  id: string;
  projectId: string;
  date: Date;
  notes: string;
  responseDate: Date | null;
  responseNotes: string | null;
  createdBy: string;
  observationsCount: number;
}

export interface CreateProject {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  testerIds: string[];
}

export interface UpdateProject extends Partial<CreateProject> {
  isActive?: boolean;
}
