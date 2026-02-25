// src/app/core/models/test-case.model.ts
export interface TestCase {
  id: string;
  projectId: string; // Relación directa con el proyecto
  projectName: string; // Nombre del proyecto para visualización rápida
  testSuiteId: string;
  testSuiteName: string; // Nombre de la suite para visualización rápida
  title: string;
  description: string | null;
  preconditions: string | null;
  expectedResult: string;
  priorityId: number;
  priorityName: string;
  priorityCode: string;
  isActive: boolean;
  createdAt: string;
  steps: TestStep[];
}

export interface TestStep {
  id: string;
  stepOrder: number;
  action: string;
  expectedResult: string;
}

export interface CreateTestCase {
  projectId: string;
  testSuiteId: string;
  title: string;
  description: string | null;
  preconditions: string | null;
  expectedResult: string;
  priorityId: number;
  estimatedTimeHours: number;
  startDate: string;
  endDate: string;
  testTypeId: number;
  certifierUserIds: string[];
  steps: CreateTestStep[];
}

export interface CreateTestStep {
  stepOrder: number;
  action: string;
  expectedResult: string;
}
