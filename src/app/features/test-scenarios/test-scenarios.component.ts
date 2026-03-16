// src/app/features/test-scenarios/test-scenarios.component.ts
// Componente para visualizar y gestionar escenarios de prueba (Test Suites).
// Permite listar escenarios por proyecto y crear nuevos.
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { TestSuitesService } from '../../core/services/test-suites.service';
import { ProjectsService } from '../../core/services/projects.service';
import { TestSuite } from '../../core/models/test-suite.model';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-test-scenarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-scenarios.component.html',
  styleUrls: ['./test-scenarios.component.scss']
})
export class TestScenariosComponent implements OnInit {
  /** Lista de proyectos para el selector */
  projects = signal<Project[]>([]);
  /** Lista de escenarios (suites) cargados */
  testSuites = signal<TestSuite[]>([]);
  loading = signal<boolean>(false);
  selectedProjectId = signal<string | null>(null);
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  suiteForm!: FormGroup;

  private testSuitesService = inject(TestSuitesService);
  private projectsService = inject(ProjectsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastService);

  ngOnInit(): void {
    this.initForm();
    this.loadProjects();
    this.route.queryParams.subscribe(params => {
      const projectId = params['projectId'];
      if (projectId) {
        this.selectedProjectId.set(projectId);
        this.loadTestSuites(projectId);
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

  /** Carga la lista de proyectos disponibles */
  loadProjects() {
    this.projectsService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('[TestScenarios] Error loading projects', err)
    });
  }

  /** Maneja el cambio de proyecto en el filtro */
  onProjectChange(event: any) {
    const projectId = event.target.value;
    this.selectedProjectId.set(projectId || null);
    if (projectId) {
      this.loadTestSuites(projectId);
    } else {
      this.testSuites.set([]);
    }
  }

  /** Carga los escenarios de prueba para un proyecto dado */
  loadTestSuites(projectId: string) {
    this.loading.set(true);
    this.testSuitesService.getTestSuitesByProjectId(projectId).subscribe({
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
    this.suiteForm.reset({
      projectId: this.selectedProjectId() || ''
    });
    this.showModal.set(true);
  }

  /** Cierra el modal de creación */
  closeModal() {
    this.showModal.set(false);
  }

  /** Envía el formulario para crear un nuevo escenario de prueba */
  onSubmit() {
    if (this.suiteForm.valid) {
      this.isSubmitting.set(true);
      console.log('[TestScenarios] Creando test suite:', this.suiteForm.value.name);
      
      this.testSuitesService.createTestSuite(this.suiteForm.value).subscribe({
        next: () => {
          this.loadTestSuites(this.selectedProjectId()!);
          this.closeModal();
          this.isSubmitting.set(false);
          this.toastr.success('Escenario creado correctamente.', 'Éxito');
        },
        error: (err) => {
          console.error('[TestScenarios] Error creating test suite', err);
          this.isSubmitting.set(false);
          this.toastr.error('Error al crear el escenario.', 'Error');
        }
      });
    }
  }
}
