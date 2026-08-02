// src/app/core/mappers/dashboard.mapper.ts
import { DashboardSummaryDto, ProjectTimelineDto, TaskProgressDto } from '../dto/dashboard.dto';
import { DashboardSummary, ProjectTimeline, TaskProgress } from '../models/dashboard.model';

export class DashboardMapper {
  static fromSummaryDto(dto: DashboardSummaryDto): DashboardSummary {
    return {
      totalProjects: dto.totalProjects || 0,
      totalTestCases: dto.totalTestCases || 0,
      pendingTestCases: dto.pendingTestCases || 0,
      totalExecutions: dto.totalExecutions || 0,
      passedExecutions: dto.passedExecutions || 0,
      failedExecutions: dto.failedExecutions || 0,
      pendingExecutions: dto.pendingExecutions || 0,
      passRate: dto.passRate || 0,
      taskProgress: (dto.taskProgress || []).map(item => this.fromTaskProgressDto(item)),
      executionsByStatus: dto.executionsByStatus || [],
      projectTimeline: (dto.projectTimeline || []).map(item => this.fromTimelineDto(item)),
      totalRequirements: dto.totalRequirements || 0,
      coveredRequirements: dto.coveredRequirements || 0,
      requirementCoverageRate: dto.requirementCoverageRate || 0,
      openDefects: dto.openDefects || 0
    };
  }

  static fromTimelineDto(dto: ProjectTimelineDto): ProjectTimeline {
    return {
      projectName: dto.projectName,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate)
    };
  }

  static fromTaskProgressDto(dto: TaskProgressDto): TaskProgress {
    return {
      columnName: dto.columnName,
      count: dto.taskCount
    };
  }
}
