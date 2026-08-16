import Swal from 'sweetalert2';
import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { TestExecutionsService } from '../../core/services/test-executions.service';
import { TestExecution } from '../../core/models/test-execution.model';

import { ActivatedRoute, RouterModule } from '@angular/router';
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
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/**
 * Componente para visualizar, crear, editar y subir evidencias a Ejecuciones de Prueba.
 */
@Component({
  selector: 'app-test-executions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, SkeletonLoaderComponent],
  templateUrl: './test-executions.component.html',
  styleUrls: ['./test-executions.component.scss']
})
export class TestExecutionsComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
  executions = signal<TestExecution[]>([]);
  isEditing = signal<boolean>(false);
  editingExecutionId = signal<string | null>(null);
  loading = signal<boolean>(true);
  showSteps = signal<boolean>(true);
  isUploading = signal<boolean>(false);
  screenshotPreview = signal<string | null>(null);
  testCaseTitle = signal<string>('');

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

  executionForm!: FormGroup;
  uploadForm!: FormGroup;
  selectedFile: File | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly executionsService = inject(TestExecutionsService);
  private readonly testCasesService = inject(TestCasesService);
  private readonly projectsService = inject(ProjectsService);
  private readonly scenariosService = inject(TestSuitesService);
  private readonly testPlansService = inject(TestPlansService);
  private readonly usersService = inject(UsersService);
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
      testStepId: [step?.stepId || step?.testStepId || step?.id || ''],
      stepOrder: [step?.stepOrder || 0],
      action: [step?.action || ''],
      statusId: [step?.status?.id || step?.statusId || 1, Validators.required],
      actualResult: [step?.actualResult || '', Validators.required],
      notes: [step?.notes || '']
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
    this.showModal.set(true);
  }

  editExecution(execution: TestExecution, event?: Event) {
    if (event) event.stopPropagation();

    this.loading.set(true);
    this.isEditing.set(true);
    this.editingExecutionId.set(execution.id);

    // Fetch full execution details to ensure we have all steps
    this.executionsService.getExecutionById(execution.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (fullExecution) => {
        this.loadTestCaseTitle(fullExecution.testCase.id);

        this.executionForm.patchValue({
          testCaseId: fullExecution.testCase.id,
          testerId: fullExecution.tester?.id || null,
          notes: fullExecution.notes,
          actualTimeHours: fullExecution.actualTimeHours,
          statusId: fullExecution.status.id,
          statusCode: fullExecution.status.code,
          testPlanId: fullExecution.testPlan?.id || null
        }, { emitEvent: false });

        this.stepResults.clear();
        if (fullExecution.stepResults && fullExecution.stepResults.length > 0) {
          fullExecution.stepResults.forEach(sr => this.addStepResult(sr));
        }

        this.showModal.set(true);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
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
    this.selectedFile = null;
    this.screenshotPreview.set(null);
    this.showUploadModal.set(true);
  }

  onPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.includes('image')) {
        const blob = item.getAsFile();
        if (blob) {
          this.selectedFile = blob;
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.screenshotPreview.set(e.target.result);
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    }
  }

  clearScreenshot() {
    this.selectedFile = null;
    this.screenshotPreview.set(null);
  }

  closeUploadModal() {
    this.showUploadModal.set(false);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.screenshotPreview.set(e.target.result);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onUploadSubmit() {
    if (!this.selectedFile || !this.selectedExecution()) return;

    this.isUploading.set(true);
    const executionId = this.selectedExecution()!.id;
    const { description, stepResultId } = this.uploadForm.value;

    this.executionsService.uploadEvidence(
            executionId,
            this.selectedFile,
            description,
            stepResultId
          ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.showUploadModal.set(false);
        this.loadExecutions(); // Reload main list

        // REFRESH DETAILS: Si estamos en el modal de detalles, refrescar la ejecución seleccionada
        if (this.showDetailsModal() && this.selectedExecution()) {
          this.openDetailsModal(this.selectedExecution()!);
        }
      },
      error: () => this.isUploading.set(false)
    });
  }

  openObservationModal(stepResultId: string, event?: Event) {
    if (event) event.stopPropagation();
    this.selectedStepResultId.set(stepResultId);
    this.observationText = '';
    this.showObservationModal.set(true);
  }

  closeObservationModal() {
    this.showObservationModal.set(false);
    this.selectedStepResultId.set(null);
  }

  onAddObservation() {
    const stepResultId = this.selectedStepResultId();
    const text = this.observationText;
    if (!stepResultId || !text.trim()) return;

    this.isSubmitting.set(true);
    this.executionsService.addObservation(stepResultId, text).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeObservationModal();
        Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Observación agregada exitosamente.',
      confirmButtonColor: '#150fbd'
    });
        if (this.selectedExecution()) {
          this.openDetailsModal(this.selectedExecution()!);
        }
      },
      error: (err: any) => {
        console.error('[TestExecutionsComponent] Error adding observation:', err);
        this.isSubmitting.set(false);
        Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al agregar la observación.',
      confirmButtonColor: '#150fbd'
    });
      }
    });
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
      return execution.status.id === 1 ? 100 : execution.status.id === 5 ? 0 : 50; 
    }
    const total = execution.stepResults.length;
    const completed = execution.stepResults.filter(s => s.status.id === 1 || s.status.id === 2 || s.status.id === 3).length;
    return Math.round((completed / total) * 100);
  }
}
