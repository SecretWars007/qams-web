// src/app/core/services/mock-data.service.ts
// Servicio con datos mock para todas las características del sistema
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

// ==================== INTERFACES ====================

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Archived';
  startDate: string;
  endDate?: string;
  lead: string;
}

export interface TestCase {
  id: string;
  projectId: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  status: 'Draft' | 'Active' | 'Deprecated';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdBy: string;
  createdDate: string;
}

export interface TestExecution {
  id: string;
  testCaseId: string;
  projectId: string;
  status: 'Pass' | 'Fail' | 'Blocked' | 'Skipped';
  executedBy: string;
  executedDate: string;
  notes?: string;
  attachments?: string[];
}

export interface DashboardMetrics {
  totalProjects: number;
  totalTestCases: number;
  totalExecutions: number;
  passRate: number;
  failRate: number;
  blockedRate: number;
  skippedRate: number;
  averageExecutionTime: number; // minutos
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'InProgress' | 'InReview' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee: string;
  dueDate?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }>;
}

// ==================== MOCK DATA ====================

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Platform v2.0',
    description: 'Sistema de comercio electrónico con pago integrado',
    status: 'Active',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    lead: 'qa_lead',
  },
  {
    id: '2',
    name: 'Mobile App - iOS',
    description: 'Aplicación móvil para iOS con sincronización en tiempo real',
    status: 'Active',
    startDate: '2024-02-01',
    lead: 'qa_lead',
  },
  {
    id: '3',
    name: 'API Gateway Refactor',
    description: 'Refactorización de la puerta de enlace de API',
    status: 'Active',
    startDate: '2024-03-10',
    lead: 'pm',
  },
  {
    id: '4',
    name: 'Dashboard Analytics',
    description: 'Sistema de análisis y reportes en tiempo real',
    status: 'Inactive',
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    lead: 'qa_lead',
  },
];

const MOCK_TEST_CASES: TestCase[] = [
  {
    id: '1',
    projectId: '1',
    title: 'Validar flujo de checkout',
    description: 'Verificar que el carrito de compras se procesa correctamente',
    steps: [
      'Agregar 3 productos al carrito',
      'Ir al checkout',
      'Ingresar datos de envío',
      'Seleccionar método de pago',
      'Confirmar compra',
    ],
    expectedResult: 'La compra se procesa exitosamente y se confirma con email',
    status: 'Active',
    priority: 'Critical',
    createdBy: 'qa_lead',
    createdDate: '2024-01-20',
  },
  {
    id: '2',
    projectId: '1',
    title: 'Validar validación de tarjeta de crédito',
    description: 'Verificar que se validen correctamente los datos de tarjeta',
    steps: [
      'Ingresar número de tarjeta inválido',
      'Intentar procesar pago',
    ],
    expectedResult: 'Se muestra error y no se procesa el pago',
    status: 'Active',
    priority: 'High',
    createdBy: 'tester',
    createdDate: '2024-01-25',
  },
  {
    id: '3',
    projectId: '2',
    title: 'Prueba de login en iOS',
    description: 'Validar autenticación en dispositivo iOS',
    steps: [
      'Instalar app en iPhone',
      'Ingresar credenciales válidas',
      'Verificar acceso a dashboard',
    ],
    expectedResult: 'Usuario autenticado y puede acceder al dashboard',
    status: 'Active',
    priority: 'Critical',
    createdBy: 'qa_lead',
    createdDate: '2024-02-05',
  },
  {
    id: '4',
    projectId: '3',
    title: 'Validar latencia de API',
    description: 'Verificar que los endpoints responden dentro del SLA',
    steps: [
      'Hacer 100 requests al endpoint /api/users',
      'Medir tiempo de respuesta',
      'Calcular promedio',
    ],
    expectedResult: 'Tiempo de respuesta promedio < 200ms',
    status: 'Active',
    priority: 'High',
    createdBy: 'developer',
    createdDate: '2024-03-15',
  },
];

const MOCK_EXECUTIONS: TestExecution[] = [
  {
    id: '1',
    testCaseId: '1',
    projectId: '1',
    status: 'Pass',
    executedBy: 'tester',
    executedDate: '2024-03-10T10:30:00',
    notes: 'Flujo completamente funcional',
  },
  {
    id: '2',
    testCaseId: '1',
    projectId: '1',
    status: 'Pass',
    executedBy: 'tester',
    executedDate: '2024-03-09T14:15:00',
    notes: 'Prueba exitosa después del fix del bug #234',
  },
  {
    id: '3',
    testCaseId: '2',
    projectId: '1',
    status: 'Fail',
    executedBy: 'tester',
    executedDate: '2024-03-08T09:45:00',
    notes: 'Error: Se permitió tarjeta inválida 4111-1111-1111-1112',
  },
  {
    id: '4',
    testCaseId: '3',
    projectId: '2',
    status: 'Pass',
    executedBy: 'qa_lead',
    executedDate: '2024-03-07T16:20:00',
    notes: 'App instalada y funcionando correctamente en iPhone 14',
  },
  {
    id: '5',
    testCaseId: '4',
    projectId: '3',
    status: 'Pass',
    executedBy: 'developer',
    executedDate: '2024-03-06T11:00:00',
    notes: 'Latencia promedio: 145ms - Dentro del SLA',
  },
  {
    id: '6',
    testCaseId: '2',
    projectId: '1',
    status: 'Blocked',
    executedBy: 'tester',
    executedDate: '2024-03-05T13:30:00',
    notes: 'Ambiente de staging no disponible',
  },
];

const MOCK_KANBAN_TASKS: KanbanTask[] = [
  {
    id: '1',
    title: 'Ejecutar casos de prueba - Sprint 5',
    description: 'Ejecutar 25 casos de prueba del módulo de pagos',
    status: 'InProgress',
    priority: 'High',
    assignee: 'tester',
    dueDate: '2024-03-15',
  },
  {
    id: '2',
    title: 'Revisar reportes de ejecución',
    description: 'Revisar y documentar los resultados de las últimas ejecuciones',
    status: 'InReview',
    priority: 'Medium',
    assignee: 'qa_lead',
    dueDate: '2024-03-14',
  },
  {
    id: '3',
    title: 'Crear casos de prueba - Nuevas features',
    description: 'Crear 15 nuevos casos para las features del sprint 6',
    status: 'Todo',
    priority: 'High',
    assignee: 'qa_lead',
    dueDate: '2024-03-18',
  },
  {
    id: '4',
    title: 'Ejecutar pruebas de regresión',
    description: 'Verificar que los fixes no rompieron funcionalidad existente',
    status: 'Todo',
    priority: 'Critical',
    assignee: 'tester',
    dueDate: '2024-03-16',
  },
  {
    id: '5',
    title: 'Documentar casos fallidos',
    description: 'Documentar y crear tickets para los 3 casos que fallaron',
    status: 'Done',
    priority: 'Medium',
    assignee: 'qa_lead',
    dueDate: '2024-03-10',
  },
];

// ==================== MOCK DATA SERVICE ====================

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  // ===== PROYECTOS =====

  getProjects(): Observable<Project[]> {
    return of(MOCK_PROJECTS).pipe(delay(300));
  }

  getProjectById(id: string): Observable<Project | undefined> {
    return of(MOCK_PROJECTS.find((p) => p.id === id)).pipe(delay(200));
  }

  createProject(project: Omit<Project, 'id'>): Observable<Project> {
    const newProject = { ...project, id: Date.now().toString() };
    return of(newProject).pipe(delay(400));
  }

  updateProject(id: string, project: Partial<Project>): Observable<Project | undefined> {
    const updated = MOCK_PROJECTS.find((p) => p.id === id);
    if (updated) {
      Object.assign(updated, project);
    }
    return of(updated).pipe(delay(300));
  }

  deleteProject(id: string): Observable<boolean> {
    const index = MOCK_PROJECTS.findIndex((p) => p.id === id);
    if (index > -1) {
      MOCK_PROJECTS.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  // ===== CASOS DE PRUEBA =====

  getTestCases(projectId?: string): Observable<TestCase[]> {
    const filtered = projectId
      ? MOCK_TEST_CASES.filter((tc) => tc.projectId === projectId)
      : MOCK_TEST_CASES;
    return of(filtered).pipe(delay(300));
  }

  getTestCaseById(id: string): Observable<TestCase | undefined> {
    return of(MOCK_TEST_CASES.find((tc) => tc.id === id)).pipe(delay(200));
  }

  createTestCase(testCase: Omit<TestCase, 'id'>): Observable<TestCase> {
    const newTestCase = { ...testCase, id: Date.now().toString() };
    return of(newTestCase).pipe(delay(400));
  }

  updateTestCase(id: string, testCase: Partial<TestCase>): Observable<TestCase | undefined> {
    const updated = MOCK_TEST_CASES.find((tc) => tc.id === id);
    if (updated) {
      Object.assign(updated, testCase);
    }
    return of(updated).pipe(delay(300));
  }

  deleteTestCase(id: string): Observable<boolean> {
    const index = MOCK_TEST_CASES.findIndex((tc) => tc.id === id);
    if (index > -1) {
      MOCK_TEST_CASES.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  // ===== EJECUCIONES DE PRUEBA =====

  getExecutions(testCaseId?: string): Observable<TestExecution[]> {
    const filtered = testCaseId
      ? MOCK_EXECUTIONS.filter((e) => e.testCaseId === testCaseId)
      : MOCK_EXECUTIONS;
    return of(filtered).pipe(delay(300));
  }

  getExecutionById(id: string): Observable<TestExecution | undefined> {
    return of(MOCK_EXECUTIONS.find((e) => e.id === id)).pipe(delay(200));
  }

  createExecution(execution: Omit<TestExecution, 'id'>): Observable<TestExecution> {
    const newExecution = { ...execution, id: Date.now().toString() };
    MOCK_EXECUTIONS.push(newExecution);
    return of(newExecution).pipe(delay(400));
  }

  updateExecution(id: string, execution: Partial<TestExecution>): Observable<TestExecution | undefined> {
    const updated = MOCK_EXECUTIONS.find((e) => e.id === id);
    if (updated) {
      Object.assign(updated, execution);
    }
    return of(updated).pipe(delay(300));
  }

  // ===== KANBAN =====

  getKanbanTasks(status?: string): Observable<KanbanTask[]> {
    const filtered = status
      ? MOCK_KANBAN_TASKS.filter((t) => t.status === status)
      : MOCK_KANBAN_TASKS;
    return of(filtered).pipe(delay(300));
  }

  updateKanbanTask(id: string, task: Partial<KanbanTask>): Observable<KanbanTask | undefined> {
    const updated = MOCK_KANBAN_TASKS.find((t) => t.id === id);
    if (updated) {
      Object.assign(updated, task);
    }
    return of(updated).pipe(delay(300));
  }

  // ===== MÉTRICAS DEL DASHBOARD =====

  getDashboardMetrics(): Observable<DashboardMetrics> {
    const totalExecutions = MOCK_EXECUTIONS.length;
    const passes = MOCK_EXECUTIONS.filter((e) => e.status === 'Pass').length;
    const fails = MOCK_EXECUTIONS.filter((e) => e.status === 'Fail').length;
    const blocked = MOCK_EXECUTIONS.filter((e) => e.status === 'Blocked').length;
    const skipped = MOCK_EXECUTIONS.filter((e) => e.status === 'Skipped').length;

    return of({
      totalProjects: MOCK_PROJECTS.length,
      totalTestCases: MOCK_TEST_CASES.length,
      totalExecutions,
      passRate: (passes / totalExecutions) * 100,
      failRate: (fails / totalExecutions) * 100,
      blockedRate: (blocked / totalExecutions) * 100,
      skippedRate: (skipped / totalExecutions) * 100,
      averageExecutionTime: 145,
    }).pipe(delay(300));
  }

  // ===== GRÁFICOS =====

  getExecutionsByStatusChart(): Observable<ChartData> {
    const statuses = ['Pass', 'Fail', 'Blocked', 'Skipped'];
    const counts = statuses.map(
      (status) => MOCK_EXECUTIONS.filter((e) => e.status === status).length,
    );

    return of({
      labels: statuses,
      datasets: [
        {
          label: 'Ejecuciones por Estado',
          data: counts,
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6366f1'],
        },
      ],
    }).pipe(delay(300));
  }

  getExecutionsTrendChart(): Observable<ChartData> {
    const dates = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const passes = [12, 15, 10, 18, 16, 8, 5];
    const fails = [2, 3, 1, 2, 1, 0, 1];

    return of({
      labels: dates,
      datasets: [
        {
          label: 'Pasadas',
          data: passes,
          borderColor: ['#10b981'],
          backgroundColor: ['#10b98133'],
        },
        {
          label: 'Fallidas',
          data: fails,
          borderColor: ['#ef4444'],
          backgroundColor: ['#ef444433'],
        },
      ],
    }).pipe(delay(300));
  }

  getProjectStatusChart(): Observable<ChartData> {
    const statuses = ['Active', 'Inactive', 'Archived'];
    const counts = statuses.map(
      (status) => MOCK_PROJECTS.filter((p) => p.status === status).length,
    );

    return of({
      labels: statuses,
      datasets: [
        {
          label: 'Proyectos por Estado',
          data: counts,
          backgroundColor: ['#3b82f6', '#9ca3af', '#6b7280'],
        },
      ],
    }).pipe(delay(300));
  }

  getPriorityDistributionChart(): Observable<ChartData> {
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const counts = priorities.map(
      (priority) => MOCK_TEST_CASES.filter((tc) => tc.priority === priority).length,
    );

    return of({
      labels: priorities,
      datasets: [
        {
          label: 'Casos de Prueba por Prioridad',
          data: counts,
          backgroundColor: ['#86efac', '#fbbf24', '#fb923c', '#f87171'],
        },
      ],
    }).pipe(delay(300));
  }
}
