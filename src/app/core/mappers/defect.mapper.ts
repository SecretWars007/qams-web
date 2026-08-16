// src/app/core/mappers/defect.mapper.ts
import { DefectDto } from '../dto/defect.dto';
import { Defect } from '../models/defect.model';

export class DefectMapper {
  static fromDto(dto: DefectDto): Defect {
    return {
      id: dto.id,
      projectId: dto.projectId,
      title: dto.title,
      description: dto.description,
      severityId: dto.severityId,
      severityName: dto.severityName,
      statusId: dto.statusId,
      statusName: dto.statusName,
      priorityId: dto.priorityId,
      priorityName: dto.priorityName,
      reportedByUserId: dto.reportedByUserId,
      reportedByName: dto.reportedByName,
      assignedToUserId: dto.assignedToUserId,
      assignedToName: dto.assignedToName,
      testCaseId: dto.testCaseId,
      testExecutionId: dto.testExecutionId,
      testExecutionStepResultId: dto.testExecutionStepResultId,
      stepsToReproduce: dto.stepsToReproduce,
      expectedResult: dto.expectedResult,
      actualResult: dto.actualResult,
      environmentInfo: dto.environmentInfo,
      attachmentUrl: dto.attachmentUrl,
      attachmentFileName: dto.attachmentFileName,
      createdAt: new Date(dto.createdAt),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
    };
  }
}
