import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TestExecutionsService } from '../../core/services/test-executions.service';
import { TestExecution } from '../../core/models/test-execution.model';

import { ActivatedRoute, RouterModule } from '@angular/router';
import { TestCasesService } from '../../core/services/test-cases.service';
import { ProjectsService } from '../../core/services/projects.service';
import { TestSuitesService } from '../../core/services/test-suites.service';
import { Project } from '../../core/models/project.model';
import { TestSuite } from '../../core/models/test-suite.model';
import { TestCase } from '../../core/models/test-case.model';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

/**
 * Componente para visualizar, crear, editar y subir evidencias a Ejecuciones de Prueba.
 */
@Component({
  selector: 'app-test-executions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './test-executions.component.html',
  styleUrls: ['./test-executions.component.scss']
})
export class TestExecutionsComponent implements OnInit {
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
  selectedScenarioId = signal<string>('');
  selectedTestCaseId = signal<string>('');

  projects = signal<Project[]>([]);
  scenarios = signal<TestSuite[]>([]);
  testCases = signal<TestCase[]>([]);

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

  private fb = inject(FormBuilder);
  private executionsService = inject(TestExecutionsService);
  private testCasesService = inject(TestCasesService);
  private projectsService = inject(ProjectsService);
  private scenariosService = inject(TestSuitesService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initForm();
    this.initUploadForm();
    this.loadProjects();
    this.route.queryParams.subscribe(params => {
      const testCaseId = params['testCaseId'];
      const editExecutionId = params['editExecutionId'];

      if (testCaseId) {
        this.selectedTestCaseId.set(testCaseId);
        this.loadTestCaseTitle(testCaseId);
        this.testCasesService.getTestCaseById(testCaseId).subscribe(tc => {
          if (tc) {
            this.selectedProjectId.set(tc.projectId);
            this.loadScenarios(tc.projectId);
            this.selectedScenarioId.set(tc.suite.id);
            this.loadTestCases(tc.suite.id);
          }
        });
      }

      if (editExecutionId) {
        // We handle the auto-edit after executions are loaded or directly if it's a deep link
        this.executionsService.getExecutionById(editExecutionId).subscribe(exec => {
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
      notes: [''],
      statusId: [1, Validators.required], // 1: Passed
      statusCode: ['PASSED'],
      actualTimeHours: [null],
      stepResults: this.fb.array([])
    });

    // Sync statusId and statusCode
    this.executionForm.get('statusId')?.valueChanges.subscribe(val => {
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
    this.executionForm.get('testCaseId')?.valueChanges.subscribe(val => {
      this.stepResults.clear();
      if (val) {
        this.loadTestCaseSteps(val);
        this.loadTestCaseTitle(val);
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
      testStepId: [step?.id || step?.testStepId || ''],
      stepOrder: [step?.stepOrder || 0],
      action: [step?.action || ''],
      statusId: [step?.statusId || 1, Validators.required],
      actualResult: [step?.actualResult || '', Validators.required],
      notes: [step?.notes || '']
    }));
  }

  openModal() {
    this.isEditing.set(false);
    this.editingExecutionId.set(null);
    this.executionForm.reset({
      testCaseId: this.selectedTestCaseId() || '',
      statusId: 1,
      statusCode: 'PASSED',
      notes: ''
    });
    this.showModal.set(true);
  }

  editExecution(execution: TestExecution, event?: Event) {
    if (event) event.stopPropagation();

    this.loading.set(true);
    // Fetch full execution details to ensure we have all steps
    this.executionsService.getExecutionById(execution.id).subscribe({
      next: (fullExecution) => {
        this.isEditing.set(true);
        this.editingExecutionId.set(fullExecution.id);
        this.loadTestCaseTitle(fullExecution.testCase.id);

        this.executionForm.patchValue({
          testCaseId: fullExecution.testCase.id,
          notes: fullExecution.notes,
          actualTimeHours: fullExecution.actualTimeHours,
          statusId: fullExecution.status.id,
          statusCode: fullExecution.status.code
        });

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
    this.testCasesService.getTestSteps(testCaseId).subscribe(steps => {
      steps.forEach(step => this.addStepResult(step));
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

    obs$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showModal.set(false);
        this.toastr.success('Ejecución guardada exitosamente.', 'Éxito');
        this.loadExecutions();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('[TestExecutionsComponent] Error guardando ejecución:', err);
        this.toastr.error('Error al guardar la ejecución.', 'Error');
      }
    });
  }

  loadProjects() {
    this.projectsService.getProjects().subscribe(data => this.projects.set(data));
  }

  loadScenarios(projectId: string) {
    if (!projectId) {
      this.scenarios.set([]);
      this.testCases.set([]);
      return;
    }
    this.scenariosService.getTestSuitesByProjectId(projectId).subscribe(data => this.scenarios.set(data));
  }

  loadTestCases(scenarioId: string) {
    if (!scenarioId) {
      this.testCases.set([]);
      return;
    }
    // We filter local test cases or fetch from service if it supports it
    this.testCasesService.getTestCases(this.selectedProjectId()).subscribe(data => {
      this.testCases.set(data.filter(tc => tc.suite.id === scenarioId));
    });
  }

  onProjectChange(event: Event) {
    const projectId = (event.target as HTMLSelectElement).value;
    this.selectedProjectId.set(projectId);
    this.selectedScenarioId.set('');
    this.selectedTestCaseId.set('');
    this.loadScenarios(projectId);
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

  loadExecutions() {
    this.loading.set(true);
    this.executionsService.getExecutions(
      this.selectedTestCaseId() || undefined,
      this.selectedProjectId() || undefined,
      this.selectedScenarioId() || undefined
    ).subscribe({
      next: (data: TestExecution[]) => {
        this.executions.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadTestCaseTitle(id: string) {
    this.testCasesService.getTestCaseById(id).subscribe(testCase => {
      if (testCase) {
        this.testCaseTitle.set(testCase.title);
      }
    });
  }

  // Details & Evidence Methods
  openDetailsModal(execution: TestExecution) {
    this.loading.set(true);
    this.executionsService.getExecutionById(execution.id).subscribe({
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

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
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
    ).subscribe({
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
    this.executionsService.addObservation(stepResultId, text).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeObservationModal();
        this.toastr.success('Observación agregada.', 'Éxito');
        if (this.selectedExecution()) {
          this.openDetailsModal(this.selectedExecution()!);
        }
      },
      error: (err) => {
        console.error('[TestExecutionsComponent] Error adding observation:', err);
        this.isSubmitting.set(false);
        this.toastr.error('Error al agregar observación.', 'Error');
      }
    });
  }

  onRespondObservation(observationId: string, response: string) {
    if (!response.trim()) return;
    this.executionsService.respondToObservation(observationId, response).subscribe({
      next: () => {
        this.toastr.success('Respuesta guardada.', 'Éxito');
        if (this.selectedExecution()) {
          this.openDetailsModal(this.selectedExecution()!);
        }
      },
      error: (err) => {
        console.error('[TestExecutionsComponent] Error al responder observación:', err);
        this.toastr.error('Error al guardar la respuesta.', 'Error');
      }
    });
  }
}
