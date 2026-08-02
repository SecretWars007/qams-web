// src/app/core/mappers/project.mapper.ts
import { ProjectDto, ProjectDevolutionDto } from '../dto/project.dto';
import { Project, ProjectDevolution } from '../models/project.model';

export class ProjectMapper {
  static fromDto(dto: ProjectDto): Project {
    return new Project(
      dto.id,
      dto.name,
      dto.description,
      dto.startDate ? new Date(dto.startDate) : null,
      dto.endDate ? new Date(dto.endDate) : null,
      dto.testerNames,
      dto.isActive,
      dto.priority,
      {
        id: dto.projectStatusId,
        name: dto.projectStatusName
      },
      new Date(dto.createdAt),
      dto.createdByUserName,
      {
        suites: dto.testSuiteCount,
        kanbanTasks: dto.kanbanBoardCount,
        devolutions: dto.devolucionesCounter
      },
      dto.historicDevolutions?.map(this.fromDevolutionDto) || [],
      dto.systemUnderTestId || null,
      dto.systemUnderTestName || null
    );
  }

  static fromDevolutionDto(dto: ProjectDevolutionDto): ProjectDevolution {
    return {
      id: dto.id,
      projectId: dto.projectId,
      date: new Date(dto.devolutionDate),
      notes: dto.notes,
      responseDate: dto.responseDate ? new Date(dto.responseDate) : null,
      responseNotes: dto.responseNotes,
      createdBy: dto.createdByUserName,
      observationsCount: dto.observationsCount
    };
  }
}
