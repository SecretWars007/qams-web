import { Component, OnInit, signal, computed, inject } from '@angular/core';
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
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-test-cases',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-cases.component.html',
  styleUrls: ['./test-cases.component.scss']
})
export class TestCasesComponent implements OnInit {
  projects = signal<Project[]>([]);
  testCases = signal<TestCase[]>([]);
  loading = signal<boolean>(true);
  projectId = signal<string | null>(null);
  testSuiteId = signal<string | null>(null);
  projectTitle = signal<string>('');
  projectStatus = signal<string>('');
  users = signal<User[]>([]);
  testSuites = signal<TestSuite[]>([]);
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  showStepsModal = signal<boolean>(false);
  selectedTestCaseSteps = signal<any[]>([]);
  selectedTestCaseTitle = signal<string>('');
  editingTestCaseId = signal<string | null>(null);
  testCaseForm!: FormGroup;

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

  private testCasesService = inject(TestCasesService);
  private testSuitesService = inject(TestSuitesService);
  private projectsService = inject(ProjectsService);
  private usersService = inject(UsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.projectId.set(params['projectId'] || null);
      this.testSuiteId.set(params['testSuiteId'] || null);

      // Initialize form AFTER projectId is set
      this.initForm();

      this.loadProjects();
      this.loadUsers();
      if (this.projectId()) {
        this.loadProjectDetails(this.projectId()!);
        this.loadTestSuites(this.projectId()!);
        this.loadTestCases();
      } else {
        // If no project selected, we might want to load all or nothing. 
        // For now, let's load all to maintain previous behavior if any.
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
      priorityId: [3, Validators.required], // 3: High
      testTypeId: [1, Validators.required],  // 1: Functional Manual
      estimatedTimeHours: [0, [Validators.required, Validators.min(0)]],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      endDate: [new Date().toISOString().split('T')[0], Validators.required],
      certifierUserIds: [[]],
      steps: this.fb.array([this.createStepFormGroup(1)])
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
      // Reorder remaining steps
      this.steps.controls.forEach((control, idx) => {
        control.patchValue({ stepOrder: idx + 1 });
      });
    }
  }

  loadProjectDetails(id: string) {
    this.projectsService.getProjectById(id).subscribe(project => {
      if (project) {
        this.projectTitle.set(project.name);
        this.projectStatus.set(project.isActive ? 'Activo' : 'Inactivo');
      }
    });
  }

  loadUsers() {
    this.usersService.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadProjects() {
    this.projectsService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Error loading projects:', err)
    });
  }

  onProjectChange(event: any) {
    const projectId = event.target.value;
    this.projectId.set(projectId || null);
    this.testSuiteId.set(null); // Reset suite when project changes

    if (projectId) {
      this.loadProjectDetails(projectId);
      this.loadTestSuites(projectId);
    } else {
      this.projectTitle.set('');
      this.projectStatus.set('');
      this.testSuites.set([]);
    }
    this.loadTestCases();
  }

  onSuiteChange(event: any) {
    const suiteId = event.target.value;
    this.testSuiteId.set(suiteId || null);
    this.loadTestCases();
  }

  loadTestSuites(projectId: string) {
    this.testSuitesService.getTestSuitesByProjectId(projectId).subscribe({
      next: (suites) => this.testSuites.set(suites),
      error: (err) => console.error('Error loading test suites:', err)
    });
  }

  loadTestCases() {
    this.loading.set(true);
    const projectId = this.projectId();
    const testSuiteId = this.testSuiteId();

    const request$ = projectId
      ? this.projectsService.getTestCasesByProjectId(projectId)
      : this.testCasesService.getTestCases();

    request$.subscribe({
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

  viewExecutions(testCaseId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/test-executions'], { queryParams: { testCaseId } });
  }

  viewSteps(testCaseId: string, title: string, event: Event) {
    event.stopPropagation();
    this.selectedTestCaseTitle.set(title);
    this.testCasesService.getTestSteps(testCaseId).subscribe({
      next: (steps) => {
        this.selectedTestCaseSteps.set(steps);
        this.showStepsModal.set(true);
      },
      error: (err) => {
        console.error('Error fetching test steps:', err);
        this.toastr.error('Error al cargar los pasos del caso de prueba', 'Error');
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

    this.testCasesService.getTestCaseById(testCase.id).subscribe({
      next: (fullTestCase) => {
        if (!fullTestCase) {
          this.isSubmitting.set(false);
          return;
        }

        this.editingTestCaseId.set(testCase.id);

        this.testCasesService.getTestSteps(testCase.id).subscribe({
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

            const formatDate = (dateStr?: string) => {
              if (!dateStr) return new Date().toISOString().split('T')[0];
              try {
                return new Date(dateStr).toISOString().split('T')[0];
              } catch {
                return new Date().toISOString().split('T')[0];
              }
            };

            this.testCaseForm.patchValue({
              projectId: fullTestCase.projectId || this.projectId(),
              testSuiteId: fullTestCase.suite.id || '',
              title: fullTestCase.title || '',
              description: fullTestCase.description || '',
              preconditions: fullTestCase.preconditions || '',
              expectedResult: fullTestCase.expectedResult || '',
              priorityId: fullTestCase.priority.id || 3,
              testTypeId: (fullTestCase as any).testTypeId || 1,
              estimatedTimeHours: (fullTestCase as any).estimatedTimeHours || 0,
              startDate: formatDate((fullTestCase as any).startDate || fullTestCase.createdAt),
              endDate: formatDate((fullTestCase as any).endDate || fullTestCase.createdAt),
              certifierUserIds: (fullTestCase as any).certifierUserIds || []
            });
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
    this.testCaseForm.patchValue({
      projectId: this.projectId() || ''
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingTestCaseId.set(null);
    this.testCaseForm.reset();
    this.steps.clear();
    this.steps.push(this.createStepFormGroup(1));
    this.testCaseForm.patchValue({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      estimatedTimeHours: 0,
      priorityId: 3,
      testTypeId: 1
    });
  }

  onSubmit() {
    if (this.testCaseForm.valid) {
      this.isSubmitting.set(true);
      const formValue = this.testCaseForm.value;

      const payload = {
        ...formValue,
        priorityId: Number(formValue.priorityId),
        testTypeId: Number(formValue.testTypeId),
        estimatedTimeHours: Number(formValue.estimatedTimeHours),
        startDate: new Date(formValue.startDate).toISOString(),
        endDate: new Date(formValue.endDate).toISOString(),
        // Map steps to include stepOrder
        steps: (formValue.steps || []).map((step: any, index: number) => ({
          ...step,
          stepOrder: index + 1
        }))
      };

      if (this.editingTestCaseId()) {
        console.log('TestCasesComponent: Updating test case with payload:', payload);
        this.testCasesService.updateTestCase(this.editingTestCaseId()!, payload).subscribe({
          next: () => {
            console.log('TestCasesComponent: Test case updated successfully');
            this.loadTestCases();
            this.closeModal();
            this.isSubmitting.set(false);
          },
          error: (err) => {
            console.error('TestCasesComponent: Error updating test case:', err);
            this.isSubmitting.set(false);
            this.toastr.error('Error al actualizar el caso de prueba. Verifica los datos.', 'Error');
          }
        });
      } else {
        console.log('TestCasesComponent: Creating test case with payload:', payload);

        this.testCasesService.createTestCase(payload).subscribe({
          next: (newTestCase) => {
            console.log('TestCasesComponent: Test case created successfully:', newTestCase);
            this.loadTestCases();
            this.closeModal();
            this.isSubmitting.set(false);
          },
          error: (err) => {
            console.error('TestCasesComponent: Error creating test case:', err);
            this.isSubmitting.set(false);
            this.toastr.error('Error al crear el caso de prueba. Verifica los datos.', 'Error');
          }
        });
      }
    }
  }
}
