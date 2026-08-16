// src/app/core/mappers/test-plan.mapper.ts
import { TestPlanDto } from '../dto/test-plan.dto';
import { TestPlan } from '../models/test-plan.model';

export class TestPlanMapper {
  static fromDto(dto: TestPlanDto): TestPlan {
    return {
      id: dto.id,
      name: dto.name,
      objectives: dto.objectives || dto.description,
      description: dto.description || dto.objectives,
      projectId: dto.projectId,
      projectName: dto.projectName,

      // ISTQB Catalog Fields
      scope: dto.scope,
      outOfScope: dto.outOfScope,
      testStrategyId: dto.testStrategyId,
      testStrategy: dto.testStrategy,
      testPlanTypeId: dto.testPlanTypeId,
      testPlanType: dto.testPlanType,
      testLevelId: dto.testLevelId,
      testLevel: dto.testLevel,
      testManagerId: dto.testManagerId,
      testManagerName: dto.testManagerName,
      riskLevelId: dto.riskLevelId,
      riskLevel: dto.riskLevel,
      testEnvironmentId: dto.testEnvironmentId,
      testEnvironment: dto.testEnvironment,
      testSchedule: dto.testSchedule,
      estimatedEffortHours: dto.estimatedEffortHours,

      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      statusId: dto.statusId,
      statusName: dto.statusName || (dto as any).status?.name,
      isClosed: dto.isClosed,
      createdAt: new Date(dto.createdAt),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,

      // Criteria
      criteria: dto.criteria?.map(c => ({
        id: c.id,
        testPlanId: c.testPlanId,
        criteriaType: c.criteriaType as 'ENTRY' | 'EXIT',
        description: c.description,
        isMet: c.isMet,
        priority: c.priority,
        category: c.category
      })) || [],

      // Milestones — el backend usa 'dueDate', el model frontend usa 'targetDate'
      milestones: dto.milestones?.map((m: any) => ({
        id: m.id,
        testPlanId: m.testPlanId,
        name: m.name,
        description: m.description,
        targetDate: m.dueDate || m.targetDate,
        isCompleted: m.isCompleted || false
      })) || [],

      // Risks — el backend usa probability/impact (int), el model frontend usa likelihood/impact (string)
      risks: dto.risks?.map((r: any) => ({
        id: r.id,
        testPlanId: r.testPlanId,
        description: r.description,
        likelihood: r.likelihood ?? String(r.probability ?? 3),
        impact: r.impact ?? String(r.impact ?? 3),
        mitigationStrategy: r.mitigation || r.mitigationStrategy || '',
        // Preservar campos originales del backend
        probability: r.probability,
        mitigation: r.mitigation
      })) || [],

      approvalLogs: dto.approvalLogs?.map((log: any) => ({
        id: log.id,
        testPlanId: log.testPlanId,
        userId: log.userId,
        userFullName: log.userFullName,
        userEmail: log.userEmail,
        status: log.verdict || log.status,
        comments: log.comments,
        signatureDate: new Date(log.createdAt || log.signatureDate)
      })) || []
    };
  }
}
