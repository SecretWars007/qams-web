import Swal from 'sweetalert2';
// src/app/features/test-scenarios/test-scenarios.component.ts
// Componente para visualizar y gestionar escenarios de prueba (Test Suites).
// Permite listar escenarios por proyecto y crear nuevos.
import { Component, OnInit, signal, inject, DestroyRef, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TestSuitesService } from '../../core/services/test-suites.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import { TestPlansService } from '../../core/services/test-plans.service';
import { CatalogsService } from '../../core/services/catalogs.service';
import { UsersService } from '../../core/services/users.service';
import { TestSuite } from '../../core/models/test-suite.model';
import { TestPlan } from '../../core/models/test-plan.model';
import { User } from '../../core/models/user.model';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { forkJoin } from 'rxjs';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-test-scenarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './test-scenarios.component.html',
  styleUrls: ['./test-scenarios.component.scss']
})
export class TestScenariosComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
  /** Lista de escenarios (suites) cargados */
  testSuites = signal<TestSuite[]>([]);
  testPlans = signal<TestPlan[]>([]);
  loading = signal<boolean>(false);
  selectedProjectId = signal<string | null>(null);
  selectedTestPlanId = signal<string | null>(null);
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingSuiteId = signal<string | null>(null);
  suiteForm!: FormGroup;

  // Catalogs
  priorities = signal<any[]>([]);
  levels = signal<any[]>([]);
  types = signal<any[]>([]);
  automationStatuses = signal<any[]>([]);
  tags = signal<any[]>([]);
  users = signal<User[]>([]);
  testDesignTechniques = signal<any[]>([]);
  reviewStatuses = signal<any[]>([]);
  testEnvironments = signal<any[]>([]);

  // Filter signals
  searchQuery = signal<string>('');
  statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Computed filtered list
  filteredSuites = computed(() => {
    let suites = this.testSuites();
    const q = this.searchQuery().toLowerCase().trim();
    const s = this.statusFilter();

    if (q) {
      suites = suites.filter(suite =>
        suite.name?.toLowerCase().includes(q) ||
        suite.description?.toLowerCase().includes(q)
      );
    }
    if (s === 'ACTIVE') suites = suites.filter(suite => suite.statusId === 1);
    if (s === 'INACTIVE') suites = suites.filter(suite => suite.statusId !== 1);

    return suites;
  });

  private readonly testSuitesService = inject(TestSuitesService);
  private readonly testPlansService = inject(TestPlansService);
  private readonly catalogsService = inject(CatalogsService);
  private readonly usersService = inject(UsersService);
  private readonly projectContext = inject(ProjectContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  constructor() {
    effect(() => {
      const activeId = this.projectContext.activeProjectId();
      if (activeId && activeId !== this.selectedProjectId()) {
        this.selectedProjectId.set(activeId);
        this.loadTestPlans(activeId);
      } else if (!activeId) {
        this.selectedProjectId.set(null);
        this.testPlans.set([]);
        this.selectedTestPlanId.set(null);
        this.testSuites.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCatalogs();
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const projectId = params['projectId'];
      const testPlanId = params['testPlanId'];
      if (projectId) {
        this.selectedProjectId.set(projectId);
        this.loadTestPlans(projectId, testPlanId);
      } else {
        const activeId = this.projectContext.activeProjectId();
        if (activeId) {
          this.selectedProjectId.set(activeId);
          this.loadTestPlans(activeId, testPlanId);
        }
      }
    });
  }

  private loadCatalogs() {
    forkJoin({
      priorities: this.catalogsService.getActive('TestCasePriority'),
      levels: this.catalogsService.getActive('TestLevel'),
      types: this.catalogsService.getActive('TestType'),
      statuses: this.catalogsService.getActive('SuiteAutomationStatus'),
      tags: this.catalogsService.getActive('Tag'),
      techniques: this.catalogsService.getActive('TestDesignTechnique'),
      reviews: this.catalogsService.getActive('ReviewStatus'),
      envs: this.catalogsService.getActive('TestEnvironment'),
      users: this.usersService.getUsers()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.priorities.set(res.priorities);
        this.levels.set(res.levels);
        this.types.set(res.types);
        this.automationStatuses.set(res.statuses);
        this.tags.set(res.tags);
        this.testDesignTechniques.set(res.techniques);
        this.reviewStatuses.set(res.reviews);
        this.testEnvironments.set(res.envs);
        this.users.set(res.users);
      },
      error: (err) => console.error('[TestScenarios] Error loading catalogs:', err)
    });
  }

  private initForm() {
    this.suiteForm = this.fb.group({
      projectId: ['', Validators.required],
      testPlanId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      executionPriorityId: [null],
      testLevelId: [null],
      testTypeId: [null],
      automationStatusId: [null],
      testDesignTechniqueId: [null],
      reviewStatusId: [null],
      testEnvironmentId: [null],
      ownerUserId: [null],
      preconditions: [''],
      coverageObjective: [''],
      estimatedDurationHours: [0, [Validators.min(0)]],
      tagIds: [[]]
    });
  }

  /**
   * Navega a la vista de casos de prueba filtrada por este escenario.
   * @param suiteId - ID de la suite seleccionada
   */
  openScenario(suiteId: string) {
    this.router.navigate(['/test-cases'], {
      queryParams: {
        projectId: this.selectedProjectId(),
        testSuiteId: suiteId
      }
    });
  }

  /** Carga los planes de pruebas y luego las suites */
  loadTestPlans(projectId: string, defaultPlanId?: string) {
    this.loading.set(true);
    this.testPlansService.getByProject(projectId).subscribe({
      next: (plans) => {
        this.testPlans.set(plans);
        if (plans.length > 0) {
          const targetPlanId = defaultPlanId && plans.some(p => p.id === defaultPlanId)
            ? defaultPlanId
            : plans[0].id;
          this.selectedTestPlanId.set(targetPlanId);
          this.loadTestSuitesByPlan(targetPlanId);
        } else {
          this.selectedTestPlanId.set(null);
          this.testSuites.set([]);
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('[TestScenarios] Error loading test plans', err);
        this.testPlans.set([]);
        this.selectedTestPlanId.set(null);
        this.testSuites.set([]);
        this.loading.set(false);
      }
    });
  }

  /** Carga las suites vinculadas a un plan de pruebas */
  loadTestSuitesByPlan(planId: string) {
    this.loading.set(true);
    this.testSuitesService.getTestSuitesByPlanId(planId).subscribe({
      next: (data) => {
        this.testSuites.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[TestScenarios] Error loading suites by plan', err);
        this.testSuites.set([]);
        this.loading.set(false);
      }
    });
  }

  onTestPlanChange(planId: string) {
    this.selectedTestPlanId.set(planId);
    this.loadTestSuitesByPlan(planId);
  }

  /** Abre el modal para crear un escenario */
  openModal() {
    this.isEditing.set(false);
    this.editingSuiteId.set(null);

    // Obtener el plan de pruebas seleccionado para heredar datos
    let currentPlanId = this.selectedTestPlanId();
    if (!currentPlanId && this.testPlans().length > 0) {
      currentPlanId = this.testPlans()[0].id;
    }
    const currentPlan = this.testPlans().find(p => p.id === currentPlanId);

    this.suiteForm.reset({
      projectId: this.selectedProjectId() || '',
      testPlanId: (currentPlanId && currentPlanId !== '00000000-0000-0000-0000-000000000000') ? currentPlanId : '',
      testLevelId: currentPlan?.testLevelId || null,
      testTypeId: currentPlan?.testPlanTypeId || null,
      testEnvironmentId: currentPlan?.testEnvironmentId || null,
      ownerUserId: currentPlan?.testManagerId || null,
      estimatedDurationHours: 0,
      tagIds: []
    });
    this.showModal.set(true);
  }

  /** Abre el modal para editar un escenario existente */
  editSuite(suite: TestSuite, event: Event) {
    event.stopPropagation();
    this.isEditing.set(true);
    this.editingSuiteId.set(suite.id);
    this.suiteForm.patchValue({
      projectId: suite.projectId,
      testPlanId: (suite.testPlanId && suite.testPlanId !== '00000000-0000-0000-0000-000000000000') ? suite.testPlanId : '',
      name: suite.name,
      description: suite.description,
      executionPriorityId: suite.executionPriorityId,
      testLevelId: suite.testLevelId,
      testTypeId: suite.testTypeId,
      automationStatusId: suite.automationStatusId,
      testDesignTechniqueId: suite.testDesignTechniqueId,
      reviewStatusId: suite.reviewStatusId,
      testEnvironmentId: suite.testEnvironmentId,
      ownerUserId: suite.ownerUserId,
      preconditions: suite.preconditions,
      coverageObjective: suite.coverageObjective,
      estimatedDurationHours: suite.estimatedDurationHours || 0,
      tagIds: suite.tags
    });
    this.showModal.set(true);
  }

  /** Elimina un escenario */
  deleteSuite(suite: TestSuite, event: Event) {
    event.stopPropagation();
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el escenario "${suite.name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading.set(true);
        this.testSuitesService.deleteTestSuite(suite.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El escenario ha sido eliminado.', 'success');
            if (this.selectedTestPlanId()) {
              this.loadTestSuitesByPlan(this.selectedTestPlanId()!);
            } else {
              this.loading.set(false);
            }
          },
          error: (err) => {
            console.error('[TestScenarios] Error eliminando test suite', err);
            this.loading.set(false);
            Swal.fire('Error', 'No se pudo eliminar el escenario.', 'error');
          }
        });
      }
    });
  }

  /** Cierra el modal de creación/edición */
  closeModal() {
    this.showModal.set(false);
    this.isEditing.set(false);
    this.editingSuiteId.set(null);
  }

  /** Alterna el estado activo/inactivo del escenario */
  toggleStatus(suite: TestSuite, event: Event) {
    event.stopPropagation();
    this.testSuitesService.toggleStatus(suite.id).subscribe({
      next: (updated) => {
        // Update the suite in the local signal
        this.testSuites.update(suites =>
          suites.map(s => s.id === updated.id ? updated : s)
        );
      },
      error: (err) => {
        console.error('[TestScenarios] Error toggling status', err);
        Swal.fire('Error', 'No se pudo cambiar el estado del escenario.', 'error');
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onStatusFilterChange(status: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.statusFilter.set(status);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('ALL');
  }

  goToTestPlans(): void {
    if (this.selectedProjectId()) {
      this.router.navigate(['/test-plans'], {
        queryParams: { projectId: this.selectedProjectId() }
      });
    }
  }

  /** Envía el formulario para crear o actualizar un escenario de prueba */
  onSubmit() {
    if (this.suiteForm.valid) {
      this.isSubmitting.set(true);
      const payload = {
        ...this.suiteForm.value
      };

      const targetPlanId = payload.testPlanId;

      if (this.isEditing() && this.editingSuiteId()) {
        console.log('[TestScenarios] Actualizando test suite:', payload.name);
        this.testSuitesService.updateTestSuite(this.editingSuiteId()!, payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            if (targetPlanId) {
              this.selectedTestPlanId.set(targetPlanId);
              this.loadTestSuitesByPlan(targetPlanId);
            }
            this.closeModal();
            this.isSubmitting.set(false);
            Swal.fire({ icon: 'success', title: 'Éxito', text: 'Escenario actualizado correctamente.', confirmButtonColor: '#150fbd' });
          },
          error: (err) => {
            console.error('[TestScenarios] Error actualizando test suite', err);
            this.isSubmitting.set(false);
            const errorMsg = err.error?.error || err.error?.message || err.message || 'Error al actualizar el escenario.';
            Swal.fire({ icon: 'error', title: 'Error', text: errorMsg, confirmButtonColor: '#150fbd' });
          }
        });
      } else {
        console.log('[TestScenarios] Creando test suite:', payload.name);
        this.testSuitesService.createTestSuite(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            if (targetPlanId) {
              this.selectedTestPlanId.set(targetPlanId);
              this.loadTestSuitesByPlan(targetPlanId);
            }
            this.closeModal();
            this.isSubmitting.set(false);
            Swal.fire({ icon: 'success', title: 'Éxito', text: 'Escenario creado correctamente.', confirmButtonColor: '#150fbd' });
          },
          error: (err) => {
            console.error('[TestScenarios] Error creando test suite', err);
            this.isSubmitting.set(false);
            const errorMsg = err.error?.error || err.error?.message || err.message || 'Error al crear el escenario.';
            Swal.fire({ icon: 'error', title: 'Error', text: errorMsg, confirmButtonColor: '#150fbd' });
          }
        });
      }
    }
  }
}
