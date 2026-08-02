// src/app/core/models/test-environment.model.ts
export interface TestEnvironment {
  id: string;
  projectId: string;
  projectName?: string;
  name: string;
  description?: string;
  baseUrl?: string;
  operatingSystem?: string;
  browser?: string;
  environmentType: string; // 'Development' | 'Staging' | 'QA' | 'UAT' | 'Production'
  softwareVersion?: string;
  additionalConfig?: string;
  isActive: boolean;
  createdAt: string;
  createdByUserName?: string;
}

export interface CreateTestEnvironmentDto {
  projectId: string;
  name: string;
  description?: string;
  baseUrl?: string;
  operatingSystem?: string;
  browser?: string;
  environmentType: string;
  softwareVersion?: string;
  additionalConfig?: string;
}

export interface UpdateTestEnvironmentDto {
  name: string;
  description?: string;
  baseUrl?: string;
  operatingSystem?: string;
  browser?: string;
  environmentType: string;
  softwareVersion?: string;
  additionalConfig?: string;
  isActive: boolean;
}
