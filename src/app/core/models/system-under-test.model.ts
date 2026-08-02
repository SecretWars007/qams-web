// src/app/core/models/system-under-test.model.ts
// Modelos para Sistemas Bajo Prueba (SUT — ISTQB)

export interface SystemUnderTest {
  id: string;
  name: string;
  version?: string;
  description?: string;
  environment?: string;
  platformTypeId: number;
  platformTypeName?: string;
  platformTypeCode?: string;
  baseUrl?: string;
  url?: string; // Mantener para compatibilidad
  executablePath?: string;
  processName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateSystemUnderTest {
  name: string;
  version?: string;
  description?: string;
  environment?: string;
  platformTypeId: number;
  baseUrl?: string;
  executablePath?: string;
  processName?: string;
}

export interface UpdateSystemUnderTest {
  name: string;
  version?: string;
  description?: string;
  environment?: string;
  platformTypeId?: number;
  baseUrl?: string;
  executablePath?: string;
  processName?: string;
  isActive?: boolean;
}

export interface PlatformType {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

