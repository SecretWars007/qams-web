import Swal from 'sweetalert2';
import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TestCasesService } from '../../core/services/test-cases.service';
import { TestSuitesService } from '../../core/services/test-suites.service';
import { TestCase } from '../../core/models/test-case.model';
import { TestSuite } from '../../core/models/test-suite.model';
import { User } from '../../core/models/user.model';
import { Project } from '../../core/models/project.model';
import { ProjectsService } from '../../core/services/projects.service';
import { UsersService } from '../../core/services/users.service';
import { RequirementsService } from '../../core/services/requirements.service';
import { Requirement } from '../../core/models/requirement.model';
import { CatalogsService } from '../../core/services/catalogs.service';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-test-cases',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HasPermissionDirective],
  templateUrl: './test-cases.component.html',
  styleUrls: ['./test-cases.component.scss']
})
export class TestCasesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  projects = signal<Project[]>([]);
  testCases = signal<TestCase[]>([]);
  loading = signal<boolean>(true);
  projectId = signal<string | null>(null);
  testSuiteId = signal<string | null>(null);
  projectTitle = signal<string>('');
  projectStatus = signal<string>('');
  users = signal<User[]>([]);
  testSuites = signal<TestSuite[]>([]);
  requirements = signal<Requirement[]>([]);
  priorities = signal<any[]>([]);
  testTypes = signal<any[]>([]);
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  showStepsModal = signal<boolean>(false);
  selectedTestCaseSteps = signal<any[]>([]);
  selectedTestCaseTitle = signal<string>('');
  editingTestCaseId = signal<string | null>(null);
  
  // CSV Import / Export Signals
  showImportModal = signal<boolean>(false);
  importedRows = signal<any[]>([]);
  isImporting = signal<boolean>(false);
  importErrors = signal<string[]>([]);
  
  testCaseForm!: FormGroup;

  activeTab: 'general' | 'execution' | 'steps' = 'general';

  // Computed signal for grouped test cases
  groupedTestCases = computed(() => {
    const cases = this.testCases();
    const groups: { projectName: string; testSuiteName: string; items: TestCase[] }[] = [];

    cases.forEach(tc => {
      let group = groups.find(g => g.projectName === tc.projectName && g.testSuiteName === tc.suite.name);
      if (!group) {
        group = { projectName: tc.projectName, testSuiteName: tc.suite.name, items: [] };
        groups.push(group);
      }
      group.items.push(tc);
    });

    return groups;
  });

  private readonly testCasesService = inject(TestCasesService);
  private readonly testSuitesService = inject(TestSuitesService);
  private readonly projectsService = inject(ProjectsService);
  private readonly usersService = inject(UsersService);
  private readonly requirementsService = inject(RequirementsService);
  private readonly catalogsService = inject(CatalogsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.loadCatalogs();
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.projectId.set(params['projectId'] || null);
      this.testSuiteId.set(params['testSuiteId'] || null);

      this.initForm();
      this.loadProjects();
      this.loadUsers();

      if (this.projectId()) {
        this.loadProjectDetails(this.projectId()!);
        this.loadTestSuites(this.projectId()!);
        this.loadRequirements(this.projectId()!);
        this.loadTestCases();
      } else {
        this.loadTestCases();
      }
    });
  }

  private initForm() {
    this.testCaseForm = this.fb.group({
      projectId: [this.projectId() || '', Validators.required],
      testSuiteId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      preconditions: [''],
      expectedResult: ['', Validators.required],
      postconditions: [''],
      priorityId: [3, Validators.required], // 3: High
      testTypeId: [1, Validators.required],  // 1: Functional Manual
      impactLevel: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      likelihoodLevel: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      estimatedTimeHours: [0, [Validators.required, Validators.min(0)]],
      requirementIds: [[]],
      isBdd: [false],
      bddScenario: [''],
      steps: this.fb.array([this.createStepFormGroup(1)]),
      bddSteps: this.fb.array([this.createBddStepFormGroup()])
    });

    // Disable BDD steps by default since isBdd is false
    this.testCaseForm.get('bddSteps')?.disable();

    this.testCaseForm.get('isBdd')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(isBdd => {
      if (isBdd) {
        this.testCaseForm.get('steps')?.disable();
        this.testCaseForm.get('bddSteps')?.enable();
      } else {
        this.testCaseForm.get('steps')?.enable();
        this.testCaseForm.get('bddSteps')?.disable();
      }
    });
  }

  createStepFormGroup(stepOrder?: number): FormGroup {
    const currentStepOrder = stepOrder || (this.testCaseForm ? this.steps.length + 1 : 1);
    return this.fb.group({
      stepOrder: [currentStepOrder],
      action: ['', Validators.required],
      expectedResult: ['', Validators.required]
    });
  }

  get steps(): FormArray {
    return this.testCaseForm.get('steps') as FormArray;
  }

  addStep() {
    this.steps.push(this.createStepFormGroup());
  }

  removeStep(index: number) {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
      this.steps.controls.forEach((control, idx) => {
        control.patchValue({ stepOrder: idx + 1 });
      });
    }
  }

  // --- BDD Steps ---
  createBddStepFormGroup(keyword: string = 'Dado'): FormGroup {
    return this.fb.group({
      keyword: [keyword, Validators.required],
      text: ['', Validators.required]
    });
  }

  get bddSteps(): FormArray {
    return this.testCaseForm.get('bddSteps') as FormArray;
  }

  addBddStep() {
    this.bddSteps.push(this.createBddStepFormGroup('Y'));
  }

  removeBddStep(index: number) {
    if (this.bddSteps.length > 1) {
      this.bddSteps.removeAt(index);
    }
  }

  loadCatalogs(): void {
    this.catalogsService.getActiveByCatalog('TestCasePriority').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any[]) => this.priorities.set(data || []),
      error: (err: any) => console.error('Error loading priorities from catalog:', err)
    });

    this.catalogsService.getActiveByCatalog('TestType').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any[]) => this.testTypes.set(data || []),
      error: (err: any) => console.error('Error loading test types from catalog:', err)
    });
  }

  loadProjectDetails(id: string) {
    this.projectsService.getProjectById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(project => {
      if (project) {
        this.projectTitle.set(project.name);
        this.projectStatus.set(project.isActive ? 'Activo' : 'Inactivo');
      }
    });
  }

  loadUsers() {
    this.usersService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (users) => this.users.set(users),
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadProjects() {
    this.projectsService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Error loading projects:', err)
    });
  }

  onProjectChange(event: any) {
    const projectId = event.target.value;
    this.projectId.set(projectId || null);
    this.testSuiteId.set(null);

    if (projectId) {
      this.loadProjectDetails(projectId);
      this.loadTestSuites(projectId);
      this.loadRequirements(projectId);
    } else {
      this.projectTitle.set('');
      this.projectStatus.set('');
      this.testSuites.set([]);
      this.requirements.set([]);
    }
    this.loadTestCases();
  }

  onSuiteChange(event: any) {
    const suiteId = event.target.value;
    this.testSuiteId.set(suiteId || null);
    this.loadTestCases();
  }

  loadTestSuites(projectId: string) {
    this.testSuitesService.getTestSuitesByProjectId(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (suites) => this.testSuites.set(suites),
      error: (err) => console.error('Error loading test suites:', err)
    });
  }

  loadRequirements(projectId: string) {
    this.requirementsService.getRequirementsByProject(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (reqs) => this.requirements.set(reqs),
      error: (err) => console.error('Error loading requirements:', err)
    });
  }

  loadTestCases() {
    this.loading.set(true);
    const projectId = this.projectId();
    const testSuiteId = this.testSuiteId();

    const request$ = projectId
      ? this.projectsService.getTestCasesByProjectId(projectId)
      : this.testCasesService.getTestCases();

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: TestCase[]) => {
        let filteredData = data;
        if (testSuiteId) {
          filteredData = data.filter(tc => tc.suite.id === testSuiteId);
        }
        this.testCases.set(filteredData);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  exportCsv() {
    const pid = this.projectId();
    if (!pid) {
      Swal.fire('Atención', 'Por favor selecciona un proyecto primero para exportar en CSV.', 'warning');
      return;
    }

    this.testCasesService.exportCsv(pid).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Casos_Prueba_${this.projectTitle().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error exportando CSV:', err);
        Swal.fire('Error', 'No se pudo generar el archivo CSV', 'error');
      }
    });
  }

  getRiskBadgeClass(tc: TestCase): string {
    const score = tc.riskScore || ((tc.impactLevel || 3) * (tc.likelihoodLevel || 3));
    if (score >= 15) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (score >= 8) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  getRiskLevelName(tc: TestCase): string {
    const score = tc.riskScore || ((tc.impactLevel || 3) * (tc.likelihoodLevel || 3));
    if (score >= 15) return `Riesgo Alto (${score})`;
    if (score >= 8) return `Riesgo Medio (${score})`;
    return `Riesgo Bajo (${score})`;
  }

  viewExecutions(testCaseId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/test-executions'], { queryParams: { testCaseId } });
  }

  viewSteps(testCaseId: string, title: string, event: Event) {
    event.stopPropagation();
    this.selectedTestCaseTitle.set(title);
    this.testCasesService.getTestSteps(testCaseId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (steps) => {
        this.selectedTestCaseSteps.set(steps);
        this.showStepsModal.set(true);
      },
      error: (err) => {
        console.error('Error fetching test steps:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los pasos del caso de prueba',
          confirmButtonColor: '#150fbd'
        });
      }
    });
  }

  closeStepsModal() {
    this.showStepsModal.set(false);
    this.selectedTestCaseSteps.set([]);
    this.selectedTestCaseTitle.set('');
  }

  editTestCase(testCase: TestCase, event: Event) {
    event.stopPropagation();
    this.isSubmitting.set(true);

    this.testCasesService.getTestCaseById(testCase.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (fullTestCase) => {
        if (!fullTestCase) {
          this.isSubmitting.set(false);
          return;
        }

        this.editingTestCaseId.set(testCase.id);

        this.testCasesService.getTestSteps(testCase.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (steps) => {
            this.showModal.set(true);
            this.steps.clear();
            if (steps && steps.length > 0) {
              steps.forEach(step => {
                const stepGroup = this.fb.group({
                  stepOrder: [step.stepOrder || this.steps.length + 1],
                  action: [step.action, Validators.required],
                  expectedResult: [step.expectedResult, Validators.required]
                });
                this.steps.push(stepGroup);
              });
            } else {
              this.steps.push(this.createStepFormGroup(1));
            }

            this.testCaseForm.patchValue({
              projectId: fullTestCase.projectId || this.projectId(),
              testSuiteId: fullTestCase.suite.id || '',
              title: fullTestCase.title || '',
              description: fullTestCase.description || '',
              preconditions: fullTestCase.preconditions || '',
              expectedResult: fullTestCase.expectedResult || '',
              postconditions: fullTestCase.postconditions || '',
              priorityId: fullTestCase.priority.id || 3,
              testTypeId: (fullTestCase as any).testTypeId || 1,
              impactLevel: fullTestCase.impactLevel || 3,
              likelihoodLevel: fullTestCase.likelihoodLevel || 3,
              estimatedTimeHours: (fullTestCase as any).estimatedTimeHours || 0,
              requirementIds: fullTestCase.requirementIds || [],
              isBdd: (fullTestCase as any).isBdd || false,
              bddScenario: (fullTestCase as any).bddScenario || ''
            });
            
            // Enable/disable the correct arrays based on the loaded data
            const isBdd = (fullTestCase as any).isBdd || false;
            if (isBdd) {
              this.testCaseForm.get('steps')?.disable();
              this.testCaseForm.get('bddSteps')?.enable();
            } else {
              this.testCaseForm.get('steps')?.enable();
              this.testCaseForm.get('bddSteps')?.disable();
            }

            // Parse BDD Scenario
            this.bddSteps.clear();
            if ((fullTestCase as any).isBdd && (fullTestCase as any).bddScenario) {
              const lines = ((fullTestCase as any).bddScenario as string).split('\n');
              lines.forEach(line => {
                const parts = line.trim().split(' ');
                if (parts.length > 0) {
                  const keyword = parts[0];
                  const text = parts.slice(1).join(' ');
                  this.bddSteps.push(this.fb.group({
                    keyword: [keyword, Validators.required],
                    text: [text, Validators.required]
                  }));
                }
              });
            }
            if (this.bddSteps.length === 0) {
              this.bddSteps.push(this.createBddStepFormGroup('Dado'));
            }

            this.isSubmitting.set(false);
          },
          error: (err) => {
            console.error('Error fetching steps', err);
            this.isSubmitting.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error fetching testcase details', err);
        this.isSubmitting.set(false);
      }
    });
  }

  openModal() {
    this.initForm();
    this.editingTestCaseId.set(null);
    this.activeTab = 'general';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingTestCaseId.set(null);
  }

  onSubmit() {
    if (this.testCaseForm.valid) {
      this.isSubmitting.set(true);
      const formValue = this.testCaseForm.value;

      const payload: any = {
        ...formValue,
        priorityId: Number(formValue.priorityId),
        testTypeId: Number(formValue.testTypeId),
        impactLevel: Number(formValue.impactLevel),
        likelihoodLevel: Number(formValue.likelihoodLevel),
        estimatedTimeHours: Number(formValue.estimatedTimeHours)
      };

      if (formValue.isBdd) {
        payload.bddScenario = (formValue.bddSteps || []).map((s: any) => `${s.keyword} ${s.text}`).join('\n');
        payload.steps = []; // Limpiar pasos tradicionales
      } else {
        payload.bddScenario = '';
        payload.steps = (formValue.steps || []).map((step: any, index: number) => ({
          ...step,
          stepOrder: index + 1
        }));
      }

      if (this.editingTestCaseId()) {
        this.testCasesService.updateTestCase(this.editingTestCaseId()!, payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            this.loadTestCases();
            this.closeModal();
            this.isSubmitting.set(false);
          },
          error: (err) => {
            console.error('Error updating test case:', err);
            this.isSubmitting.set(false);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al actualizar el caso de prueba. Verifica los datos.',
              confirmButtonColor: '#150fbd'
            });
          }
        });
      } else {
        this.testCasesService.createTestCase(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            this.loadTestCases();
            this.closeModal();
            this.isSubmitting.set(false);
          },
          error: (err) => {
            console.error('Error creating test case:', err);
            this.isSubmitting.set(false);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al crear el caso de prueba. Verifica los datos.',
              confirmButtonColor: '#150fbd'
            });
          }
        });
      }
    }
  }

  /**
   * Elimina un caso de prueba con confirmación de SweetAlert2
   */
  deleteTestCase(testCase: TestCase, event: Event) {
    event.stopPropagation();
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el caso de prueba "${testCase.title}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading.set(true);
        this.testCasesService.deleteTestCase(testCase.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El caso de prueba ha sido eliminado.', 'success');
            this.loadTestCases();
          },
          error: (err) => {
            console.error('Error deleting test case', err);
            this.loading.set(false);
            Swal.fire('Error', 'No se pudo eliminar el caso de prueba.', 'error');
          }
        });
      }
    });
  }

  // ================= EXPORT & IMPORT (EXCEL / CSV) =================
  exportToCsv(): void {
    const cases = this.testCases();
    if (!cases || cases.length === 0) {
      Swal.fire('Atención', 'No hay casos de prueba para exportar.', 'info');
      return;
    }

    const headers = ['ID', 'Proyecto', 'Escenario_Suite', 'Titulo', 'Descripcion', 'Precondiciones', 'ResultadoEsperado', 'Prioridad', 'Estado'];
    const rows = cases.map(tc => [
      `"${tc.id}"`,
      `"${(tc.projectName || '').replaceAll('"', '""')}"`,
      `"${(tc.suite?.name || '').replaceAll('"', '""')}"`,
      `"${(tc.title || '').replaceAll('"', '""')}"`,
      `"${(tc.description || '').replaceAll('"', '""')}"`,
      `"${(tc.preconditions || '').replaceAll('"', '""')}"`,
      `"${(tc.expectedResult || '').replaceAll('"', '""')}"`,
      `"${tc.priority?.name || 'Media'}"`,
      `"${tc.isActive ? 'Activo' : 'Inactivo'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Casos_Prueba_${this.projectTitle() || 'QAMS'}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadTemplateCsv(): void {
    const headers = ['Titulo', 'Descripcion', 'Precondiciones', 'ResultadoEsperado', 'Prioridad', 'Paso1_Accion', 'Paso1_ResultadoEsperado', 'Paso2_Accion', 'Paso2_ResultadoEsperado'];
    const exampleRow = [
      '"Iniciar sesión con credenciales válidas"',
      '"Verificar que el usuario pueda autenticarse exitosamente en el portal"',
      '"El usuario debe estar registrado y activo en el sistema"',
      '"El usuario visualiza el dashboard principal"',
      '"Alta"',
      '"Ingresar usuario y contraseña en el formulario de login"',
      '"Los campos se completan correctamente"',
      '"Hacer clic en el botón Iniciar Sesión"',
      '"El sistema redirecciona al Dashboard principal con mensaje de bienvenida"'
    ];

    const csvContent = '\uFEFF' + [headers.join(';'), exampleRow.join(';')].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Plantilla_Casos_Prueba_QAMS.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  openImportModal(): void {
    this.importedRows.set([]);
    this.importErrors.set([]);
    this.showImportModal.set(true);
  }

  closeImportModal(): void {
    this.showImportModal.set(false);
    this.importedRows.set([]);
    this.importErrors.set([]);
  }

  onCsvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      this.parseCsvContent(text);
      input.value = '';
    };
    reader.readAsText(file, 'utf-8');
  }

  private parseCsvContent(content: string): void {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      this.importErrors.set(['El archivo no contiene filas de datos para importar.']);
      return;
    }

    const delimiter = lines[0].includes(';') ? ';' : ',';
    const rows: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
      if (cols.length < 1 || !cols[0]) continue;

      const title = cols[0];
      const description = cols[1] || '';
      const preconditions = cols[2] || '';
      const expectedResult = cols[3] || 'Comportamiento esperado verificado';
      const priorityName = cols[4] || 'Media';

      const steps: any[] = [];
      if (cols[5] || cols[6]) {
        steps.push({ action: cols[5] || '', expectedResult: cols[6] || '', stepOrder: 1 });
      }
      if (cols[7] || cols[8]) {
        steps.push({ action: cols[7] || '', expectedResult: cols[8] || '', stepOrder: 2 });
      }

      rows.push({
        title,
        description,
        preconditions,
        expectedResult,
        priorityName,
        steps
      });
    }

    this.importedRows.set(rows);
    this.importErrors.set(errors);
  }

  confirmImport(): void {
    const rows = this.importedRows();
    const activeProjectId = this.projectId();
    const activeSuiteId = this.testSuiteId() || (this.testSuites().length > 0 ? this.testSuites()[0].id : null);

    if (!activeProjectId) {
      Swal.fire('Error', 'Debes seleccionar un proyecto antes de importar casos.', 'error');
      return;
    }

    if (!activeSuiteId) {
      Swal.fire('Error', 'No se encontró un escenario o suite de pruebas para asignar los casos.', 'error');
      return;
    }

    this.isImporting.set(true);

    const requests = rows.map(r => {
      const payload: any = {
        title: r.title,
        description: r.description,
        preconditions: r.preconditions,
        expectedResult: r.expectedResult || r.steps?.[0]?.expectedResult || 'Verificación exitosa',
        projectId: activeProjectId,
        testSuiteId: activeSuiteId,
        priorityId: 2, // Medium
        testTypeId: 1, // Functional
        steps: r.steps
      };
      return this.testCasesService.createTestCase(payload);
    });

    let completed = 0;
    requests.forEach(req$ => {
      req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          completed++;
          if (completed === requests.length) {
            this.isImporting.set(false);
            this.closeImportModal();
            Swal.fire({
              icon: 'success',
              title: 'Importación Exitosa',
              text: `Se importaron ${completed} caso(s) de prueba exitosamente.`,
              confirmButtonColor: '#150fbd'
            });
            this.loadTestCases();
          }
        },
        error: () => {
          completed++;
          if (completed === requests.length) {
            this.isImporting.set(false);
            this.closeImportModal();
            this.loadTestCases();
          }
        }
      });
    });
  }
}
