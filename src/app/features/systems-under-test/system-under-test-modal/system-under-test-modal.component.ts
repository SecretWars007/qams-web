import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, DestroyRef, inject, signal } from '@angular/core';
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
export class SystemUnderTestModalComponent implements OnInit, OnChanges {
  @Input() sut: SystemUnderTest | null = null;
  @Input() isEdit = false;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveSut = new EventEmitter<any>();

  private readonly fb = inject(FormBuilder);
  private readonly catalogsService = inject(CatalogsService);
  private readonly destroyRef = inject(DestroyRef);
  
  form: FormGroup;
  environments = ['Desarrollo', 'QA', 'Staging', 'Producción'];
  platformTypes = signal<any[]>([
    { id: 1, code: 'WEB', name: 'Aplicación Web' },
    { id: 2, code: 'DESKTOP', name: 'Aplicación de Escritorio' },
    { id: 3, code: 'DATA_PROCESSING', name: 'Procesamiento de Información' }
  ]);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      version: ['1.0.0', Validators.required],
      platformTypeId: [1, Validators.required],
      baseUrl: [''],
      executablePath: [''],
      processName: [''],
      environment: ['QA'],
      isActive: [true]
    });

    this.form.get('platformTypeId')?.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.updatePlatformValidators();
      });
  }

  ngOnInit(): void {
    this.loadPlatformTypes();
    this.populateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sut'] || changes['isEdit']) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (this.isEdit && this.sut) {
      this.form.patchValue({
        name: this.sut.name,
        description: this.sut.description || '',
        version: this.sut.version || '1.0.0',
        platformTypeId: this.sut.platformTypeId || 1,
        baseUrl: this.sut.baseUrl || this.sut.url || '',
        executablePath: this.sut.executablePath || '',
        processName: this.sut.processName || '',
        environment: this.sut.environment || 'QA',
        isActive: this.sut.isActive !== undefined ? this.sut.isActive : true
      });
    } else if (!this.isEdit) {
      this.form.reset({
        name: '',
        description: '',
        version: '1.0.0',
        platformTypeId: 1,
        baseUrl: '',
        executablePath: '',
        processName: '',
        environment: 'QA',
        isActive: true
      });
    }
    this.updatePlatformValidators();
  }

  loadPlatformTypes(): void {
    this.catalogsService.getActive('PlatformType')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (types) => {
          if (types && types.length > 0) {
            this.platformTypes.set(types);
          }
          this.updatePlatformValidators();
        },
        error: () => {
          // Mantener los fallbacks ya definidos
        }
      });
  }

  get selectedPlatformCode(): string {
    const id = Number(this.form.get('platformTypeId')?.value);
    const type = this.platformTypes().find(t => t.id === id);
    return type?.code || 'WEB';
  }

  private updatePlatformValidators(): void {
    const code = this.selectedPlatformCode;
    const baseUrlCtrl = this.form.get('baseUrl');
    const execPathCtrl = this.form.get('executablePath');
    const procNameCtrl = this.form.get('processName');

    if (code === 'WEB') {
      baseUrlCtrl?.setValidators([Validators.required, Validators.pattern(/^https?:\/\/.+/i)]);
      execPathCtrl?.clearValidators();
      procNameCtrl?.clearValidators();
    } else if (code === 'DESKTOP') {
      baseUrlCtrl?.clearValidators();
      execPathCtrl?.setValidators([Validators.required]);
      procNameCtrl?.setValidators([Validators.required]);
    } else if (code === 'DATA_PROCESSING') {
      baseUrlCtrl?.clearValidators();
      execPathCtrl?.clearValidators();
      procNameCtrl?.setValidators([Validators.required]);
    } else {
      baseUrlCtrl?.clearValidators();
      execPathCtrl?.clearValidators();
      procNameCtrl?.clearValidators();
    }

    baseUrlCtrl?.updateValueAndValidity({ emitEvent: false });
    execPathCtrl?.updateValueAndValidity({ emitEvent: false });
    procNameCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const raw = this.form.value;
      const data = {
        name: raw.name?.trim(),
        description: raw.description?.trim() || null,
        version: raw.version?.trim() || '1.0.0',
        platformTypeId: Number(raw.platformTypeId) || 1,
        baseUrl: raw.baseUrl?.trim() || null,
        executablePath: raw.executablePath?.trim() || null,
        processName: raw.processName?.trim() || null,
        environment: raw.environment || 'QA',
        isActive: raw.isActive ?? true
      };
      this.saveSut.emit(data);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
