import { Component, Input, Output, EventEmitter, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequirementsService } from '../../../core/services/requirements.service';
import { CatalogsService } from '../../../core/services/catalogs.service';
import { Requirement, CreateRequirement, UpdateRequirement } from '../../../core/models/requirement.model';
import { Project } from '../../../core/models/project.model';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-requirement-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './requirement-modal.component.html',
  styleUrl: './requirement-modal.component.scss'
})
export class RequirementModalComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
  @Input() projectId: string | null = null;
  @Input() projects: Project[] = [];
  @Input() requirement: Requirement | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  requirementForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  
  // Catálogos
  requirementTypes = signal<any[]>([]);
  priorities = signal<any[]>([]);
  complexities = signal<any[]>([]);
  statuses = signal<any[]>([]);

  // Fallback data when backend catalogs are unavailable
  private readonly fallbackTypes = [
    { id: 1, name: 'Funcional' }, { id: 2, name: 'No Funcional' }, { id: 3, name: 'Técnico' }
  ];
  private readonly fallbackPriorities = [
    { id: 1, name: 'Baja' }, { id: 2, name: 'Media' }, { id: 3, name: 'Alta' }, { id: 4, name: 'Crítica' }
  ];
  private readonly fallbackComplexities = [
    { id: 1, name: 'Baja' }, { id: 2, name: 'Media' }, { id: 3, name: 'Alta' }
  ];
  private readonly fallbackStatuses = [
    { id: 1, name: 'Pendiente' }, { id: 2, name: 'En Progreso' }, { id: 3, name: 'Completado' }
  ];

  private readonly fb = inject(FormBuilder);
  private readonly requirementsService = inject(RequirementsService);
  private readonly catalogsService = inject(CatalogsService);

  get showProjectSelector(): boolean {
    return !this.projectId && this.projects.length > 0;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCatalogs();
    
    if (this.requirement) {
      this.requirementForm.patchValue({
        ...this.requirement
      });
    }
  }

  private initForm() {
    const formConfig: any = {
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      code: ['', [Validators.required]],
      acceptanceCriteria: [''],
      requirementTypeId: [1, Validators.required],
      requirementPriorityId: [1, Validators.required],
      requirementComplexityId: [1, Validators.required],
      requirementStatusId: [1],
      source: ['']
    };

    // Agregar selector de proyecto solo cuando no hay projectId pre-asignado
    if (!this.projectId) {
      formConfig['selectedProjectId'] = ['', Validators.required];
    }

    this.requirementForm = this.fb.group(formConfig);
  }

  private loadCatalogs() {
    this.catalogsService.getActive('RequirementType').pipe(
      catchError(() => of(this.fallbackTypes)), takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => this.requirementTypes.set(data.length ? data : this.fallbackTypes));

    this.catalogsService.getActive('RequirementPriority').pipe(
      catchError(() => of(this.fallbackPriorities)), takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => this.priorities.set(data.length ? data : this.fallbackPriorities));

    this.catalogsService.getActive('RequirementComplexity').pipe(
      catchError(() => of(this.fallbackComplexities)), takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => this.complexities.set(data.length ? data : this.fallbackComplexities));

    this.catalogsService.getActive('RequirementStatus').pipe(
      catchError(() => of(this.fallbackStatuses)), takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => this.statuses.set(data.length ? data : this.fallbackStatuses));
  }

  onSubmit() {
    if (this.requirementForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.requirementForm.value;

    // Determinar el projectId: del input directo o del selector del formulario
    const targetProjectId = this.projectId || formValue.selectedProjectId;

    if (!targetProjectId) {
      Swal.fire('Error', 'Debe seleccionar un proyecto.', 'error');
      this.isSubmitting.set(false);
      return;
    }

    // Remover selectedProjectId del payload antes de enviarlo al backend
    const { selectedProjectId, ...payload } = formValue;

    if (this.requirement) {
      // Update
      const updateDto: UpdateRequirement = { ...payload };
      this.requirementsService.updateRequirement(this.requirement.id, updateDto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Requisito actualizado correctamente.', 'success');
          this.saved.emit();
        },
        error: (err) => {
          console.error('Error updating requirement', err);
          this.isSubmitting.set(false);
          Swal.fire('Error', 'No se pudo actualizar el requisito.', 'error');
        }
      });
    } else {
      // Create
      const createDto: CreateRequirement = { ...payload };
      this.requirementsService.createRequirement(targetProjectId, createDto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Requisito creado correctamente.', 'success');
          this.saved.emit();
        },
        error: (err) => {
          console.error('Error creating requirement', err);
          this.isSubmitting.set(false);
          Swal.fire('Error', 'No se pudo crear el requisito.', 'error');
        }
      });
    }
  }

  close() {
    this.closed.emit();
  }
}
