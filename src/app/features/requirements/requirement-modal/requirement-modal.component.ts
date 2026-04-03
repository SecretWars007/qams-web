import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequirementsService } from '../../../core/services/requirements.service';
import { CatalogsService } from '../../../core/services/catalogs.service';
import { Requirement, CreateRequirement, UpdateRequirement } from '../../../core/models/requirement.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-requirement-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './requirement-modal.component.html',
  styles: [`
    :host { display: block; }
  `]
})
export class RequirementModalComponent implements OnInit {
  @Input({ required: true }) projectId!: string;
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

  private readonly fb = inject(FormBuilder);
  private readonly requirementsService = inject(RequirementsService);
  private readonly catalogsService = inject(CatalogsService);

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
    this.requirementForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      code: ['', [Validators.required]],
      acceptanceCriteria: [''],
      requirementTypeId: [1, Validators.required],
      requirementPriorityId: [1, Validators.required],
      requirementComplexityId: [1, Validators.required],
      requirementStatusId: [1],
      source: ['']
    });
  }

  private loadCatalogs() {
    this.catalogsService.getActive('RequirementType').subscribe(data => this.requirementTypes.set(data));
    this.catalogsService.getActive('RequirementPriority').subscribe(data => this.priorities.set(data));
    this.catalogsService.getActive('RequirementComplexity').subscribe(data => this.complexities.set(data));
    this.catalogsService.getActive('RequirementStatus').subscribe(data => this.statuses.set(data));
  }

  onSubmit() {
    if (this.requirementForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.requirementForm.value;

    if (this.requirement) {
      // Update
      const updateDto: UpdateRequirement = { ...formValue };
      this.requirementsService.updateRequirement(this.requirement.id, updateDto).subscribe({
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
      const createDto: CreateRequirement = { ...formValue };
      this.requirementsService.createRequirement(this.projectId, createDto).subscribe({
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
