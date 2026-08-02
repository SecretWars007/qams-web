// src/app/core/dto/api-key.dto.ts

export interface ApiKeyDto {
  id: string;
  projectId: string;
  projectName?: string;
  name: string;
  maskedKey: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface ApiKeyCreatedDto extends ApiKeyDto {
  plainKey: string;
}

export interface CreateApiKeyDto {
  projectId: string;
  name: string;
  expiresAt?: string;
}
