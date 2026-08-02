// src/app/core/mappers/api-key.mapper.ts
import { ApiKeyDto, ApiKeyCreatedDto } from '../dto/api-key.dto';
import { ApiKey, ApiKeyCreated } from '../models/api-key.model';

export class ApiKeyMapper {
  static fromDto(dto: ApiKeyDto): ApiKey {
    return {
      id: dto.id,
      projectId: dto.projectId,
      projectName: dto.projectName,
      name: dto.name,
      maskedKey: dto.maskedKey,
      isActive: dto.isActive,
      createdAt: new Date(dto.createdAt),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    };
  }

  static fromCreatedDto(dto: ApiKeyCreatedDto): ApiKeyCreated {
    return {
      ...this.fromDto(dto),
      plainKey: dto.plainKey
    };
  }
}
