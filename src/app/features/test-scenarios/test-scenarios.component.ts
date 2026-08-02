import Swal from 'sweetalert2';
// src/app/features/test-scenarios/test-scenarios.component.ts
// Componente para visualizar y gestionar escenarios de prueba (Test Suites).
// Permite listar escenarios por proyecto y crear nuevos.
import { Component, OnInit, signal, inject, DestroyRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TestSuitesService } from '../../core/services/test-suites.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import { TestSuite } from '../../core/models/test-suite.model';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-test-scenarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-scenarios.component.html',
  styleUrls: ['./test-scenarios.component.scss']
})
export class TestScenariosComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
  /** Lista de escenarios (suites) cargados */
  testSuites = signal<TestSuite[]>([]);
  loading = signal<boolean>(false);
  selectedProjectId = signal<string | null>(null);
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingSuiteId = signal<string | null>(null);
  suiteForm!: FormGroup;

  private testSuitesService = inject(TestSuitesService);
  private projectContext = inject(ProjectContextService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    effect(() => {
      const activeId = this.projectContext.activeProjectId();
      if (activeId && activeId !== this.selectedProjectId()) {
        this.selectedProjectId.set(activeId);
        this.loadTestSuites(activeId);
      } else if (!activeId) {
        this.selectedProjectId.set(null);
        this.testSuites.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const projectId = params['projectId'];
      if (projectId) {
        this.selectedProjectId.set(projectId);
        this.loadTestSuites(projectId);
      } else {
        const activeId = this.projectContext.activeProjectId();
        if (activeId) {
          this.selectedProjectId.set(activeId);
          this.loadTestSuites(activeId);
        }
      }
    });
  }

  /** Inicializa el formulario de creación de escenario */
  private initForm() {
    this.suiteForm = this.fb.group({
      projectId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
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

  /** Carga los escenarios de prueba para un proyecto dado */
  loadTestSuites(projectId: string) {
    this.loading.set(true);
    this.testSuitesService.getTestSuitesByProjectId(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.testSuites.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[TestScenarios] Error loading test suites', err);
        this.loading.set(false);
      }
    });
  }

  /** Abre el modal para crear un escenario */
  openModal() {
    this.isEditing.set(false);
    this.editingSuiteId.set(null);
    this.suiteForm.reset({
      projectId: this.selectedProjectId() || ''
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
      name: suite.name,
      description: suite.description
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
        this.testSuitesService.deleteTestSuite(suite.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El escenario ha sido eliminado.', 'success');
            this.loadTestSuites(this.selectedProjectId()!);
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

  /** Envía el formulario para crear o actualizar un escenario de prueba */
  onSubmit() {
    if (this.suiteForm.valid) {
      this.isSubmitting.set(true);
      const payload = this.suiteForm.value;

      if (this.isEditing() && this.editingSuiteId()) {
        console.log('[TestScenarios] Actualizando test suite:', payload.name);
        this.testSuitesService.updateTestSuite(this.editingSuiteId()!, payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            this.loadTestSuites(this.selectedProjectId()!);
            this.closeModal();
            this.isSubmitting.set(false);
            Swal.fire({ icon: 'success', title: 'Éxito', text: 'Escenario actualizado correctamente.', confirmButtonColor: '#150fbd' });
          },
          error: (err) => {
            console.error('[TestScenarios] Error actualizando test suite', err);
            this.isSubmitting.set(false);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al actualizar el escenario.', confirmButtonColor: '#150fbd' });
          }
        });
      } else {
        console.log('[TestScenarios] Creando test suite:', payload.name);
        this.testSuitesService.createTestSuite(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            this.loadTestSuites(this.selectedProjectId()!);
            this.closeModal();
            this.isSubmitting.set(false);
            Swal.fire({ icon: 'success', title: 'Éxito', text: 'Escenario creado correctamente.', confirmButtonColor: '#150fbd' });
          },
          error: (err) => {
            console.error('[TestScenarios] Error creando test suite', err);
            this.isSubmitting.set(false);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al crear el escenario.', confirmButtonColor: '#150fbd' });
          }
        });
      }
    }
  }
}
