import { Component, EventEmitter, Input, OnInit, Output, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SystemUnderTest } from '../../../core/models/system-under-test.model';
import { CatalogsService } from '../../../core/services/catalogs.service';

@Component({
  selector: 'app-system-under-test-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './system-under-test-modal.component.html',
  styleUrls: ['./system-under-test-modal.component.scss']
})
export class SystemUnderTestModalComponent implements OnInit {
  @Input() sut: SystemUnderTest | null = null;
  @Input() isEdit = false;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveSut = new EventEmitter<any>();

  private readonly fb = inject(FormBuilder);
  private readonly catalogsService = inject(CatalogsService);
  
  form: FormGroup;
  
  environments = ['Desarrollo', 'QA', 'Staging', 'Producción'];
  platformTypes = signal<any[]>([]);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      version: ['1.0.0', Validators.required],
      platformTypeId: [1, Validators.required],
      baseUrl: ['', Validators.pattern(/^https?:\/\/.*/)],
      executablePath: [''],
      processName: [''],
      environment: ['QA'],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadPlatformTypes();
    if (this.isEdit && this.sut) {
      this.form.patchValue({
        name: this.sut.name,
        description: this.sut.description,
        version: this.sut.version,
        platformTypeId: this.sut.platformTypeId,
        baseUrl: this.sut.baseUrl || this.sut.url,
        executablePath: this.sut.executablePath,
        processName: this.sut.processName,
        environment: this.sut.environment,
        isActive: this.sut.isActive
      });
    }
  }

  // ML-01: DestroyRef para limpiar subscripción cuando el modal se cierra
  private readonly destroyRef = inject(DestroyRef);

  loadPlatformTypes(): void {
    this.catalogsService.getActive('PlatformType')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (types) => {
        this.platformTypes.set(types);
        if (types.length === 0) {
          this.setFallbackPlatformTypes();
        }
      },
      error: () => {
        this.setFallbackPlatformTypes();
      }
    });
  }

  private setFallbackPlatformTypes(): void {
    this.platformTypes.set([
      { id: 1, code: 'WEB', name: 'Aplicación Web' },
      { id: 2, code: 'DESKTOP', name: 'Aplicación de Escritorio' },
      { id: 3, code: 'DATA_PROCESSING', name: 'Procesamiento de Información' }
    ]);
  }

  get selectedPlatformCode(): string {
    const id = this.form.get('platformTypeId')?.value;
    const type = this.platformTypes().find(t => t.id === Number(id));
    return type?.code || 'WEB';
  }

  onSubmit(): void {
    if (this.form.valid) {
      const data = { 
        ...this.form.value
      };
      this.saveSut.emit(data);
    }
  }
}
