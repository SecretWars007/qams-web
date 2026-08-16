import Swal from 'sweetalert2';
import { Component, OnInit, signal, inject, DestroyRef, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { TestExecutionsService } from '../../core/services/test-executions.service';
import { TestExecution } from '../../core/models/test-execution.model';

import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TestCasesService } from '../../core/services/test-cases.service';
import { ProjectsService } from '../../core/services/projects.service';
import { TestSuitesService } from '../../core/services/test-suites.service';
import { TestPlansService } from '../../core/services/test-plans.service';
import { UsersService } from '../../core/services/users.service';
import { Project } from '../../core/models/project.model';
import { TestSuite } from '../../core/models/test-suite.model';
import { TestCase } from '../../core/models/test-case.model';
import { TestPlan } from '../../core/models/test-plan.model';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader/skeleton-loader.component';
import { DefectModalComponent } from '../defects/defect-modal/defect-modal.component';
import { DefectsService } from '../../core/services/defects.service';
import { CatalogsService } from '../../core/services/catalogs.service';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/**
 * Componente para visualizar, crear, editar y subir evidencias a Ejecuciones de Prueba.
 */
@Component({
  selector: 'app-test-executions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, SkeletonLoaderComponent, DefectModalComponent],
  templateUrl: './test-executions.component.html',
  styleUrls: ['./test-executions.component.scss']
})
export class TestExecutionsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  executions = signal<TestExecution[]>([]);
  isEditing = signal<boolean>(false);
  editingExecutionId = signal<string | null>(null);
  loading = signal<boolean>(true);
  showSteps = signal<boolean>(true);
  isUploading = signal<boolean>(false);
  screenshotPreview = signal<string | null>(null);
  testCaseTitle = signal<string>('');

  // Catalogs signals
  stepResultStatuses = signal<any[]>([]);
  executionStatuses = signal<any[]>([]);

  // Filter signals
  selectedProjectId = signal<string>('');
  selectedTestPlanId = signal<string>('');
  selectedScenarioId = signal<string>('');
  selectedTestCaseId = signal<string>('');
  selectedStatusFilter = signal<string>('active'); // 'all' | 'active' | 'passed' | 'failed' | 'blocked'

  projects = signal<Project[]>([]);
  testPlans = signal<TestPlan[]>([]);
  scenarios = signal<TestSuite[]>([]);
  testCases = signal<TestCase[]>([]);
  users = signal<any[]>([]);

  selectedExecution = signal<TestExecution | null>(null);
  showModal = signal<boolean>(false);
  showDetailsModal = signal<boolean>(false);
  showUploadModal = signal<boolean>(false);
  showObservationModal = signal<boolean>(false);
  selectedStepResultId = signal<string | null>(null);
  observationText: string = '';
  isSubmitting = signal<boolean>(false);

  // Defect Modal Signals
  showDefectModal = signal<boolean>(false);
  defectModalData = signal<any>(null);
  selectedStepIdForDefect = signal<string | null>(null);

  executionForm!: FormGroup;
  uploadForm!: FormGroup;
  
  // Multi-file Evidence Signals
  selectedEvidenceFiles = signal<File[]>([]);
  evidencePreviews = signal<{ name: string; url: string; size: number }[]>([]);

  // Multi-file Incident / Observation Signals
  selectedIncidentFiles = signal<File[]>([]);
  incidentPreviews = signal<{ name: string; url: string; size: number }[]>([]);

  // Execution Timer Signals (Elapsed Time Tracking)
  elapsedSeconds = signal<number>(0);
  isTimerRunning = signal<boolean>(false);
  private timerInterval: any = null;
  focusedStepIndex = signal<number>(0);

  private readonly fb = inject(FormBuilder);
  private readonly executionsService = inject(TestExecutionsService);
  private readonly defectsService = inject(DefectsService);
  private readonly testCasesService = inject(TestCasesService);
  private readonly projectsService = inject(ProjectsService);
  private readonly scenariosService = inject(TestSuitesService);
  private readonly testPlansService = inject(TestPlansService);
  private readonly usersService = inject(UsersService);
  private readonly catalogsService = inject(CatalogsService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  /** Executions filtered client-side by status (excludes CERTIFIED/CLOSED by default) */
  get filteredExecutions(): TestExecution[] {
    const all = this.executions();
    const filter = this.selectedStatusFilter();
    if (filter === 'all') return all;
    if (filter === 'active') {
      // Exclude "certified" = PASSED and also fully-certified (status codes CERTIFIED, CLOSED, APPROVED)
      return all.filter(e => {
        const code = e.status?.code?.toUpperCase() ?? '';
        return code !== 'CERTIFIED' && code !== 'CLOSED' && code !== 'APPROVED';
      });
    }
    return all.filter(e => e.status?.code?.toUpperCase() === filter.toUpperCase());
  }

  /** Count total evidences across all step results */
  getEvidenceCount(execution: TestExecution): number {
    if (!execution) return 0;
    const stepEvs = (execution.stepResults ?? []).reduce((sum, s) => sum + ((s as any).evidences?.length ?? 0), 0);
    const globalEvs = (execution as any).evidences?.length ?? 0;
    return stepEvs + globalEvs;
  }

  /** Count defects linked through step results */
  getDefectCount(execution: TestExecution): number {
    if (!execution) return 0;
    return (execution.stepResults ?? []).reduce((sum, s) => sum + ((s as any).defects?.length ?? 0), 0);
  }


  ngOnInit(): void {
    this.loadCatalogs();
    this.initForm();
    this.initUploadForm();
    this.loadProjects();
    this.loadUsers();
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const testCaseId = params['testCaseId'];
      const editExecutionId = params['editExecutionId'];

      if (testCaseId) {
        this.selectedTestCaseId.set(testCaseId);
        this.loadTestCaseTitle(testCaseId);
        this.testCasesService.getTestCaseById(testCaseId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(tc => {
          if (tc) {
            this.selectedProjectId.set(tc.projectId);
            this.loadTestPlans(tc.projectId);
            this.loadScenarios(tc.projectId);
            this.selectedScenarioId.set(tc.suite.id);
            this.loadTestCases(tc.suite.id);
          }
        });
      }

      if (editExecutionId) {
        // We handle the auto-edit after executions are loaded or directly if it's a deep link
        this.executionsService.getExecutionById(editExecutionId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(exec => {
          if (exec) {
            this.editExecution(exec);
          }
        });
      }

      this.loadExecutions();
    });
  }

  private initForm() {
    this.executionForm = this.fb.group({
      testCaseId: ['', Validators.required],
      testerId: [null],
      notes: [''],
      statusId: [1, Validators.required], // 1: Passed
      statusCode: ['PASSED'],
      actualTimeHours: [null],
      testPlanId: [null],
      stepResults: this.fb.array([])
    });

    // Sync statusId and statusCode
    this.executionForm.get('statusId')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(val => {
      const statusMap: any = {
        1: 'PASSED',
        2: 'FAILED',
        3: 'BLOCKED',
        4: 'IN_PROGRESS',
        5: 'PENDING',
        6: 'SKIPPED'
      };
      this.executionForm.patchValue({ statusCode: statusMap[val] || 'PASSED' }, { emitEvent: false });
    });

    // Load steps and title when testCaseId changes
    this.executionForm.get('testCaseId')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(val => {
      if (!this.isEditing()) {
        this.stepResults.clear();
        if (val) {
          this.loadTestCaseSteps(val);
          this.loadTestCaseTitle(val);
        }
      }
    });
  }

  private initUploadForm() {
    this.uploadForm = this.fb.group({
      description: [''],
      stepResultId: ['']
    });
  }

  get stepResults(): FormArray {
    return this.executionForm.get('stepResults') as FormArray;
  }

  addStepResult(step?: any) {
    this.stepResults.push(this.fb.group({
      id: [step?.id || ''],
      testStepId: [step?.stepId || step?.testStepId || step?.id || ''],
      stepOrder: [step?.stepOrder !== undefined ? step?.stepOrder : (step?.testStepOrder || 0)],
      action: [step?.action || step?.testStepAction || step?.description || ''],
      expectedResult: [step?.expectedResult || step?.testStepExpectedResult || ''],
      statusId: [step?.status?.id || step?.statusId || 1, Validators.required],
      actualResult: [step?.actualResult || '', Validators.required],
      notes: [step?.notes || ''],
      evidences: [step?.evidences || []],
      observations: [step?.observations || []],
      defects: [step?.defects || []]
    }));
  }

  openModal() {
    this.isEditing.set(false);
    this.editingExecutionId.set(null);
    this.stepResults.clear();
    const defaultTcId = this.selectedTestCaseId() || '';
    this.executionForm.reset({
      testCaseId: defaultTcId,
      testerId: null,
      statusId: 1,
      statusCode: 'PASSED',
      testPlanId: this.selectedTestPlanId() || null,
      notes: '',
      actualTimeHours: null
    }, { emitEvent: false });
    if (defaultTcId) {
      this.loadTestCaseSteps(defaultTcId);
      this.loadTestCaseTitle(defaultTcId);
    }
    this.startTimer();
    this.showModal.set(true);
  }

  /**
   * Dispara una nueva ejecución (nuevo ciclo) para el mismo caso de prueba.
   */
  executeNewCycle(execution: TestExecution, event?: Event) {
    if (event) event.stopPropagation();

    this.isEditing.set(false);
    this.editingExecutionId.set(null);
    this.stepResults.clear();

    const tcId = execution.testCase.id;
    this.testCaseTitle.set(execution.testCase.title);

    this.executionForm.reset({
      testCaseId: tcId,
      testerId: null,
      statusId: 1,
      statusCode: 'PASSED',
      testPlanId: execution.testPlan?.id || this.selectedTestPlanId() || null,
      notes: `Re-ejecución del caso "${execution.testCase.title}" (Nuevo Ciclo)`,
      actualTimeHours: null
    }, { emitEvent: false });

    this.loadTestCaseSteps(tcId);
    this.resetTimer();
    this.startTimer();
    this.showModal.set(true);
  }

  /**
   * Dispara un ciclo de re-test enfocado exclusivamente en los pasos fallidos / bloqueados.
   */
  executeRerunFailed(execution: TestExecution, event?: Event) {
    if (event) event.stopPropagation();

    this.loading.set(true);
    this.isEditing.set(false);
    this.editingExecutionId.set(null);
    this.stepResults.clear();

    this.executionsService.getExecutionById(execution.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (fullExec) => {
        this.loading.set(false);
        const tcId = fullExec.testCase.id;
        this.testCaseTitle.set(fullExec.testCase.title);

        const projectId = fullExec.project?.id || this.selectedProjectId();
        if (projectId) {
          this.selectedProjectId.set(projectId);
          this.loadTestPlans(projectId);
        }

        this.executionForm.reset({
          testCaseId: tcId,
          testerId: null,
          statusId: 2,
          statusCode: 'FAILED',
          testPlanId: fullExec.testPlan?.id || this.selectedTestPlanId() || null,
          notes: `Re-ejecución de Pasos Fallidos / Bloqueados (Ciclo ${((fullExec.cycleNumber || 1) + 1)})`,
          actualTimeHours: null
        }, { emitEvent: false });

        if (fullExec.stepResults && fullExec.stepResults.length > 0) {
          fullExec.stepResults.forEach(sr => {
            const isFailedOrBlocked = sr.status.id === 2 || sr.status.id === 3 || sr.status.code === 'FAILED' || sr.status.code === 'BLOCKED';
            this.addStepResult({
              ...sr,
              status: isFailedOrBlocked ? { id: 2, name: 'FAILED', code: 'FAILED' } : sr.status,
              actualResult: isFailedOrBlocked ? '' : sr.actualResult // Reset actualResult for failed steps to re-verify
            });
          });
        } else {
          this.loadTestCaseSteps(tcId);
        }

        this.resetTimer();
        this.startTimer();
        this.showModal.set(true);

        Swal.fire({
          icon: 'info',
          title: 'Modo Retest Activado',
          text: 'Se precargó un nuevo ciclo con los pasos fallidos/bloqueados en limpio para su re-verificación.',
          confirmButtonColor: '#150fbd',
          timer: 2500
        });
      },
      error: () => {
        this.loading.set(false);
        this.executeNewCycle(execution, event);
      }
    });
  }

  // ================= TIMER METHODS =================
  startTimer() {
    this.isTimerRunning.set(true);
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update(s => s + 1);
    }, 1000);
  }

  pauseTimer() {
    this.isTimerRunning.set(false);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  toggleTimer() {
    if (this.isTimerRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.elapsedSeconds.set(0);
  }

  formattedElapsedTime(): string {
    const total = this.elapsedSeconds();
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // ================= ATALJOS DE TECLADO (FAST-TRACK) =================
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    if (!this.showModal()) return;

    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.onSubmit();
      return;
    }

    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

    if (event.key === 'Escape') {
      this.closeModal();
      return;
    }

    this.processKeyAction(event);
  }

  private processKeyAction(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const statusMap: Record<string, number> = { p: 1, '1': 1, f: 2, '2': 2, b: 3, '3': 3, s: 4, '4': 4 };

    if (statusMap[key]) {
      event.preventDefault();
      this.setStepStatus(this.focusedStepIndex(), statusMap[key]);
      return;
    }

    if (key === 'j' || key === 'arrowdown') {
      event.preventDefault();
      this.moveStepFocus(1);
    } else if (key === 'k' || key === 'arrowup') {
      event.preventDefault();
      this.moveStepFocus(-1);
    }
  }

  private moveStepFocus(delta: number) {
    const newIdx = this.focusedStepIndex() + delta;
    if (newIdx >= 0 && newIdx < this.stepResults.length) {
      this.focusedStepIndex.set(newIdx);
    }
  }

  setStepStatus(stepIndex: number, statusId: number) {
    if (stepIndex >= 0 && stepIndex < this.stepResults.length) {
      const group = this.stepResults.at(stepIndex) as FormGroup;
      group.get('statusId')?.setValue(statusId);
    }
  }

  hasTestCase(id?: string): boolean {
    if (!id) return false;
    return this.testCases().some(tc => tc.id === id);
  }

  hasTestPlan(id?: string): boolean {
    if (!id) return false;
    return this.testPlans().some(p => p.id === id);
  }

  hasTester(id?: string): boolean {
    if (!id) return false;
    return this.users().some(u => u.id === id);
  }

  editExecution(execution: TestExecution, event?: Event) {
    if (event) event.stopPropagation();

    this.loading.set(true);
    this.isEditing.set(true);
    this.editingExecutionId.set(execution.id);

    // Fetch full execution details to ensure we have all steps and data
    this.executionsService.getExecutionById(execution.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (fullExecution) => {
        this.selectedExecution.set(fullExecution);
        this.loadTestCaseTitle(fullExecution.testCase.id);

        const projectId = fullExecution.project?.id || this.selectedProjectId();
        if (projectId) {
          this.selectedProjectId.set(projectId);
          this.loadTestPlans(projectId);
          this.testCasesService.getTestCases(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(tcs => {
            if (tcs) this.testCases.set(tcs);
          });
        }

        this.executionForm.patchValue({
          testCaseId: fullExecution.testCase.id,
          testerId: fullExecution.tester?.id || null,
          notes: fullExecution.notes || '',
          actualTimeHours: fullExecution.actualTimeHours || 0,
          statusId: Number(fullExecution.status.id),
          statusCode: fullExecution.status.code,
          testPlanId: fullExecution.testPlan?.id || null
        }, { emitEvent: false });

        if (projectId) {
          this.defectsService.getByProject(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (defects) => {
              this.stepResults.clear();
              if (fullExecution.stepResults && fullExecution.stepResults.length > 0) {
                fullExecution.stepResults.forEach(sr => {
                  if (defects) {
                    sr.defects = defects.filter(d => d.testExecutionStepResultId === sr.id);
                  }
                  this.addStepResult(sr);
                });
              }
              this.showModal.set(true);
              this.loading.set(false);
            },
            error: () => {
              this.stepResults.clear();
              if (fullExecution.stepResults && fullExecution.stepResults.length > 0) {
                fullExecution.stepResults.forEach(sr => this.addStepResult(sr));
              }
              this.showModal.set(true);
              this.loading.set(false);
            }
          });
        } else {
          this.stepResults.clear();
          if (fullExecution.stepResults && fullExecution.stepResults.length > 0) {
            fullExecution.stepResults.forEach(sr => this.addStepResult(sr));
          }
          this.showModal.set(true);
          this.loading.set(false);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  loadCatalogs(): void {
    this.catalogsService.getActiveByCatalog('StepResultStatus').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any[]) => this.stepResultStatuses.set(data || []),
      error: (err: any) => console.error('Error cargando estados de paso desde catálogo:', err)
    });

    this.catalogsService.getActiveByCatalog('ExecutionStatus').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any[]) => this.executionStatuses.set(data || []),
      error: (err: any) => console.error('Error cargando estados de ejecución desde catálogo:', err)
    });
  }

  loadTestCaseSteps(testCaseId: string) {
    if (!testCaseId) {
      this.stepResults.clear();
      return;
    }
    this.testCasesService.getTestSteps(testCaseId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(steps => {
      this.stepResults.clear();
      if (steps && steps.length > 0) {
        steps.forEach(step => this.addStepResult(step));
      }
    });
  }

  closeModal() {
    this.pauseTimer();
    this.showModal.set(false);
  }

  toggleSteps() {
    this.showSteps.update(v => !v);
  }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    if (this.executionForm.invalid) return;

    this.isSubmitting.set(true);
    const selectedCase = this.testCases().find(tc => tc.id === this.executionForm.value.testCaseId);

    const payload = {
      ...this.executionForm.value,
      testCaseTitle: selectedCase?.title || this.testCaseTitle()
    };

    const obs$ = this.isEditing() && this.editingExecutionId()
      ? this.executionsService.updateExecution(this.editingExecutionId()!, payload)
      : this.executionsService.createExecution(payload);

    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showModal.set(false);
        Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Ejecución guardada exitosamente.',
      confirmButtonColor: '#150fbd'
    });
        this.loadExecutions();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('[TestExecutionsComponent] Error guardando ejecución:', err);
        Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al guardar la ejecución.',
      confirmButtonColor: '#150fbd'
    });
      }
    });
  }

  loadProjects() {
    this.projectsService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => this.projects.set(data));
  }

  loadTestPlans(projectId: string) {
    if (!projectId) {
      this.testPlans.set([]);
      return;
    }
    this.testPlansService.getByProject(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => this.testPlans.set(data));
  }

  loadScenarios(projectId: string) {
    if (!projectId) {
      this.scenarios.set([]);
      this.testCases.set([]);
      return;
    }
    this.scenariosService.getTestSuitesByProjectId(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => this.scenarios.set(data));
  }

  loadTestCases(scenarioId: string) {
    if (!scenarioId) {
      this.testCases.set([]);
      return;
    }
    // We filter local test cases or fetch from service if it supports it
    this.testCasesService.getTestCases(this.selectedProjectId()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.testCases.set(data.filter(tc => tc.suite.id === scenarioId));
    });
  }

  onProjectChange(event: Event) {
    const projectId = (event.target as HTMLSelectElement).value;
    this.selectedProjectId.set(projectId);
    this.selectedTestPlanId.set('');
    this.selectedScenarioId.set('');
    this.selectedTestCaseId.set('');
    this.loadTestPlans(projectId);
    this.loadScenarios(projectId);
    this.loadExecutions();
  }

  onTestPlanChange(event: Event) {
    const testPlanId = (event.target as HTMLSelectElement).value;
    this.selectedTestPlanId.set(testPlanId);
    this.selectedScenarioId.set('');
    this.selectedTestCaseId.set('');
    this.loadExecutions();
  }

  onScenarioChange(event: Event) {
    const scenarioId = (event.target as HTMLSelectElement).value;
    this.selectedScenarioId.set(scenarioId);
    this.selectedTestCaseId.set('');
    this.loadTestCases(scenarioId);
    this.loadExecutions();
  }

  onTestCaseChange(event: Event) {
    const testCaseId = (event.target as HTMLSelectElement).value;
    this.selectedTestCaseId.set(testCaseId);
    this.loadExecutions();
  }

  onStatusFilterChange(filter: string) {
    this.selectedStatusFilter.set(filter);
    // No API call needed — filtering is done client-side via filteredExecutions getter
  }


  loadExecutions() {
    this.loading.set(true);
    this.executionsService.getExecutions(
            this.selectedTestCaseId() || undefined,
            this.selectedProjectId() || undefined,
            this.selectedScenarioId() || undefined,
            this.selectedTestPlanId() || undefined
          ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: TestExecution[]) => {
        this.executions.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadTestCaseTitle(id: string) {
    this.testCasesService.getTestCaseById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(testCase => {
      if (testCase) {
        this.testCaseTitle.set(testCase.title);
      }
    });
  }

  loadUsers() {
    this.usersService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (users) => this.users.set(users),
      error: (err) => console.error('Error loading users', err)
    });
  }

  // --- Filter methods ---& Evidence Methods
  openDetailsModal(execution: TestExecution) {
    this.loading.set(true);
    this.executionsService.getExecutionById(execution.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (fullExecution) => {
        this.selectedExecution.set(fullExecution);
        this.showDetailsModal.set(true);
        this.loading.set(false);

        const projectId = fullExecution.project?.id || this.selectedProjectId();
        if (projectId) {
          this.defectsService.getByProject(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (defects) => {
              if (defects && fullExecution.stepResults) {
                fullExecution.stepResults.forEach(step => {
                  step.defects = defects.filter(d => d.testExecutionStepResultId === step.id);
                });
                this.selectedExecution.set({ ...fullExecution });
              }
            },
            error: (err) => console.error('[TestExecutionsComponent] Error correlacionando defectos:', err)
          });
        }
      },
      error: () => this.loading.set(false)
    });
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedExecution.set(null);
  }

  openUploadModal(execution: TestExecution, event?: Event, stepResultId?: string) {
    if (event) event.stopPropagation();
    this.selectedExecution.set(execution);
    this.uploadForm.reset({
      description: '',
      stepResultId: stepResultId || ''
    });
    this.selectedEvidenceFiles.set([]);
    this.evidencePreviews.set([]);
    this.showUploadModal.set(true);
  }

  onEvidenceFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => this.addEvidenceFile(file));
      input.value = '';
    }
  }

  onEvidencePaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.includes('image')) {
        const blob = item.getAsFile();
        if (blob) {
          this.addEvidenceFile(blob);
        }
      }
    }
  }

  private addEvidenceFile(file: File) {
    this.selectedEvidenceFiles.update(files => [...files, file]);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.evidencePreviews.update(list => [
        ...list,
        { name: file.name || 'Captura Pegada.png', url: e.target.result, size: file.size }
      ]);
    };
    reader.readAsDataURL(file);
  }

  removeEvidenceFile(index: number) {
    this.selectedEvidenceFiles.update(files => files.filter((_, i) => i !== index));
    this.evidencePreviews.update(list => list.filter((_, i) => i !== index));
  }

  clearEvidenceFiles() {
    this.selectedEvidenceFiles.set([]);
    this.evidencePreviews.set([]);
  }

  closeUploadModal() {
    this.showUploadModal.set(false);
  }

  onUploadSubmit() {
    const files = this.selectedEvidenceFiles();
    if (files.length === 0 || !this.selectedExecution()) return;

    this.isUploading.set(true);
    const executionId = this.selectedExecution()!.id;
    const { description, stepResultId } = this.uploadForm.value;

    const uploads$ = files.map(file => 
      this.executionsService.uploadEvidence(executionId, file, description, stepResultId)
    );

    forkJoin(uploads$).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.showUploadModal.set(false);
        Swal.fire({
          icon: 'success',
          title: 'Evidencias Registradas',
          text: `Se registraron ${files.length} evidencia(s) exitosamente.`,
          confirmButtonColor: '#150fbd'
        });
        this.loadExecutions();
        if (this.showDetailsModal() && this.selectedExecution()) {
          this.openDetailsModal(this.selectedExecution()!);
        }
      },
      error: (err) => {
        console.error('[TestExecutionsComponent] Error subiendo evidencias:', err);
        this.isUploading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al registrar algunas de las evidencias.',
          confirmButtonColor: '#150fbd'
        });
      }
    });
  }

  openObservationModal(stepResultId: string, event?: Event) {
    if (event) event.stopPropagation();
    this.selectedStepResultId.set(stepResultId);
    this.observationText = '';
    this.selectedIncidentFiles.set([]);
    this.incidentPreviews.set([]);
    this.showObservationModal.set(true);
  }

  onIncidentFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => this.addIncidentFile(file));
      input.value = '';
    }
  }

  onIncidentPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.includes('image')) {
        const blob = item.getAsFile();
        if (blob) {
          this.addIncidentFile(blob);
        }
      }
    }
  }

  private addIncidentFile(file: File) {
    this.selectedIncidentFiles.update(files => [...files, file]);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.incidentPreviews.update(list => [
        ...list,
        { name: file.name || 'Captura Incidente.png', url: e.target.result, size: file.size }
      ]);
    };
    reader.readAsDataURL(file);
  }

  removeIncidentFile(index: number) {
    this.selectedIncidentFiles.update(files => files.filter((_, i) => i !== index));
    this.incidentPreviews.update(list => list.filter((_, i) => i !== index));
  }

  closeObservationModal() {
    this.showObservationModal.set(false);
    this.selectedStepResultId.set(null);
    this.selectedIncidentFiles.set([]);
    this.incidentPreviews.set([]);
  }

  onAddObservation() {
    const stepResultId = this.selectedStepResultId();
    const text = this.observationText;
    if (!stepResultId || !text.trim()) return;

    this.isSubmitting.set(true);
    this.executionsService.addObservation(stepResultId, text).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const incidentFiles = this.selectedIncidentFiles();
        const execId = this.selectedExecution()?.id || this.editingExecutionId();

        if (incidentFiles.length > 0 && execId) {
          const uploads$ = incidentFiles.map(file =>
            this.executionsService.uploadEvidence(execId, file, `Evidencia de Incidente: ${text.substring(0, 40)}`, stepResultId)
          );

          forkJoin(uploads$).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => this.handleObservationSuccess(),
            error: () => this.handleObservationSuccess()
          });
        } else {
          this.handleObservationSuccess();
        }
      },
      error: (err: any) => {
        console.error('[TestExecutionsComponent] Error adding observation:', err);
        this.isSubmitting.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al agregar el incidente.',
          confirmButtonColor: '#150fbd'
        });
      }
    });
  }

  private handleObservationSuccess() {
    this.isSubmitting.set(false);
    this.closeObservationModal();
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Incidente y sus evidencias registrados exitosamente.',
      confirmButtonColor: '#150fbd'
    });
    if (this.selectedExecution()) {
      this.openDetailsModal(this.selectedExecution()!);
    }
  }

  onRespondObservation(observationId: string, response: string) {
    if (!response.trim()) return;
    this.executionsService.respondToObservation(observationId, response).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Respuesta guardada exitosamente.',
      confirmButtonColor: '#150fbd'
    });
        if (this.selectedExecution()) {
          this.openDetailsModal(this.selectedExecution()!);
        }
      },
      error: (err: any) => {
        console.error('[TestExecutionsComponent] Error al responder observación:', err);
        Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al guardar la respuesta.',
      confirmButtonColor: '#150fbd'
    });
      }
    });
  }

  calculateProgress(execution: TestExecution): number {
    if (!execution.stepResults || execution.stepResults.length === 0) {
      // If there are no steps, we define progress based on global status
      if (execution.status.id === 1) {
        return 100;
      }
      if (execution.status.id === 5) {
        return 0;
      }
      return 50; 
    }
    const total = execution.stepResults.length;
    const completed = execution.stepResults.filter(s => s.status.id === 1 || s.status.id === 2 || s.status.id === 3).length;
    return Math.round((completed / total) * 100);
  }

  /**
   * Abre el modal de defecto pre-llenado con los datos del paso actual fallido.
   */
  reportDefectForStep(step: any, event?: Event): void {
    if (event) event.stopPropagation();

    const stepId = step?.id || step?.stepId || step?.testStepId || null;
    const exec = this.selectedExecution() || this.executions().find(e => e.id === this.editingExecutionId());
    const testCaseId = exec?.testCase?.id || this.executionForm.get('testCaseId')?.value || null;
    const executionId = exec?.id || this.editingExecutionId() || null;

    const stepOrder = step?.stepOrder || (step?.get ? step.get('stepOrder')?.value : '');
    const action = step?.action || (step?.get ? step.get('action')?.value : '') || '';
    const actualResult = step?.actualResult || (step?.get ? step.get('actualResult')?.value : '') || '';
    const expectedResult = step?.expectedResult || (step?.get ? step.get('expectedResult')?.value : '') || '';

    this.selectedStepIdForDefect.set(stepId);
    this.defectModalData.set({
      title: `Fallo en paso ${stepOrder ? '#' + stepOrder + ': ' : ''}${action}`.trim(),
      description: `Defecto reportado durante la ejecución${executionId ? ' #' + executionId.substring(0, 8) : ''} del caso "${exec?.testCase?.title || this.testCaseTitle()}".`,
      stepsToReproduce: `1. Acción: ${action || '-'}\n2. Resultado Esperado: ${expectedResult || '-'}\n3. Resultado Obtenido: ${actualResult || '-'}`,
      expectedResult: expectedResult,
      actualResult: actualResult,
      priorityId: 2,
      severityId: 2,
      statusId: 1,
      testCaseId: testCaseId,
      testExecutionId: executionId,
      testExecutionStepResultId: stepId
    });
    this.showDefectModal.set(true);
  }

  /**
   * Guarda el defecto reportado y asocia opcionalmente las evidencias o archivos adjuntos.
   */
  onSaveDefect(eventData: { defect: any; files: File[] }): void {
    const exec = this.selectedExecution() || this.executions().find(e => e.id === this.editingExecutionId());
    const projectId = exec?.project?.id || this.selectedProjectId();

    if (!projectId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar el proyecto asociado para registrar el defecto.',
        confirmButtonColor: '#150fbd'
      });
      return;
    }

    const { defect, files } = eventData;
    defect.projectId = projectId;
    if (!defect.testExecutionStepResultId && this.selectedStepIdForDefect()) {
      defect.testExecutionStepResultId = this.selectedStepIdForDefect();
    }

    this.defectsService.create(projectId, defect).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (savedDefect) => {
        if (files && files.length > 0 && savedDefect?.id) {
          const uploads$ = files.map(file => 
            this.defectsService.uploadAttachment(projectId, savedDefect.id, file)
          );
          forkJoin(uploads$).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
              this.showDefectModal.set(false);
              Swal.fire({
                icon: 'success',
                title: 'Defecto Creado',
                text: `El defecto y sus ${files.length} evidencia(s) fueron registrados exitosamente.`,
                confirmButtonColor: '#150fbd'
              });
              this.loadExecutions();
              if (this.showDetailsModal() && this.selectedExecution()) {
                this.openDetailsModal(this.selectedExecution()!);
              }
            },
            error: (err) => {
              console.error('[TestExecutionsComponent] Error subiendo adjuntos del defecto:', err);
              this.showDefectModal.set(false);
              Swal.fire({
                icon: 'success',
                title: 'Defecto Creado',
                text: 'El defecto fue creado exitosamente.',
                confirmButtonColor: '#150fbd'
              });
              this.loadExecutions();
            }
          });
        } else {
          this.showDefectModal.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Defecto Creado',
            text: 'El defecto fue registrado exitosamente.',
            confirmButtonColor: '#150fbd'
          });
          this.loadExecutions();
          if (this.showDetailsModal() && this.selectedExecution()) {
            this.openDetailsModal(this.selectedExecution()!);
          }
        }
      },
      error: (err) => {
        console.error('[TestExecutionsComponent] Error creando defecto:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear el defecto.',
          confirmButtonColor: '#150fbd'
        });
      }
    });
  }
}
