// src/app/core/dto/system-under-test.dto.ts

export interface SystemUnderTestDto {
  id: string;
  name: string;
  version?: string;
  description?: string;
  environment?: string;
  platformTypeId: number;
  platformTypeName?: string;
  platformTypeCode?: string;
  baseUrl?: string;
  url?: string; // Para compatibilidad
  executablePath?: string;
  processName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSystemUnderTestDto {
  name: string;
  version?: string;
  description?: string;
  environment?: string;
  platformTypeId: number;
  baseUrl?: string;
  executablePath?: string;
  processName?: string;
}

export interface UpdateSystemUnderTestDto {
  name?: string;
  version?: string;
  description?: string;
  environment?: string;
  platformTypeId?: number;
  baseUrl?: string;
  executablePath?: string;
  processName?: string;
  isActive?: boolean;
}
