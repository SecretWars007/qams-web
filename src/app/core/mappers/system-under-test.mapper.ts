// src/app/core/mappers/system-under-test.mapper.ts
import { SystemUnderTestDto } from '../dto/system-under-test.dto';
import { SystemUnderTest } from '../models/system-under-test.model';

export class SystemUnderTestMapper {
  static fromDto(dto: SystemUnderTestDto): SystemUnderTest {
    return {
      id: dto.id,
      name: dto.name,
      version: dto.version,
      description: dto.description,
      environment: dto.environment,
      platformTypeId: dto.platformTypeId || 1,
      platformTypeName: dto.platformTypeName || 'Aplicación Web',
      platformTypeCode: dto.platformTypeCode || 'WEB',
      baseUrl: dto.baseUrl || dto.url,
      url: dto.baseUrl || dto.url,
      executablePath: dto.executablePath,
      processName: dto.processName,
      isActive: dto.isActive,
      createdAt: new Date(dto.createdAt),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
    };
  }
}
