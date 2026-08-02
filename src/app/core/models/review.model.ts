// src/app/core/models/review.model.ts
export interface ReviewSession {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description?: string;
  artifactUnderReview?: string;
  reviewTypeId: number;
  reviewTypeCode: string;
  reviewTypeName: string;
  statusId: number;
  statusCode: string;
  statusName: string;
  scheduledDate?: string;
  completedDate?: string;
  moderatorId?: string;
  moderatorName?: string;
  authorId?: string;
  authorName?: string;
  entryCriteria?: string;
  exitCriteria?: string;
  conclusions?: string;
  createdAt: string;
  createdByUserName?: string;
  findings: ReviewFinding[];
  participants: ReviewParticipant[];
}

export interface ReviewFinding {
  id: string;
  reviewSessionId: string;
  description: string;
  location?: string;
  findingTypeId: number;
  findingTypeCode: string;
  findingTypeName: string;
  severityId: number;
  severityCode: string;
  severityName: string;
  findingStatusId: number;
  findingStatusCode: string;
  findingStatusName: string;
  assignedToId?: string;
  assignedToName?: string;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface ReviewParticipant {
  id: string;
  reviewSessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  attended: boolean;
  invitedAt: string;
}

export interface CreateReviewSessionDto {
  projectId: string;
  title: string;
  description?: string;
  artifactUnderReview?: string;
  reviewTypeId: number;
  statusId?: number;
  scheduledDate?: string;
  moderatorId?: string;
  authorId?: string;
  entryCriteria?: string;
  exitCriteria?: string;
  conclusions?: string;
  participantUserIds?: string[];
}

export interface CreateReviewFindingDto {
  reviewSessionId: string;
  description: string;
  location?: string;
  findingTypeId: number;
  severityId: number;
  findingStatusId?: number;
  assignedToId?: string;
}

export interface UpdateReviewFindingDto {
  description?: string;
  location?: string;
  findingTypeId?: number;
  severityId?: number;
  findingStatusId?: number;
  assignedToId?: string;
  resolution?: string;
  isResolved?: boolean;
}
