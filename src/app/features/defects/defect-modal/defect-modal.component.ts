import { Component, EventEmitter, Input, OnInit, Output, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Defect } from '../../../core/models/defect.model';
import { User } from '../../../core/models/user.model';
import { TestCase } from '../../../core/models/test-case.model';
import { UsersService } from '../../../core/services/users.service';
import { TestCasesService } from '../../../core/services/test-cases.service';
import { CatalogsService } from '../../../core/services/catalogs.service';
import { ProjectContextService } from '../../../core/services/project-context.service';

@Component({
  selector: 'app-defect-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './defect-modal.component.html',
  styleUrls: ['./defect-modal.component.scss']
})
export class DefectModalComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly testCasesService = inject(TestCasesService);
  private readonly catalogsService = inject(CatalogsService);
  private readonly projectContextService = inject(ProjectContextService);

  @Input() defect: Defect | null = null;
  @Input() isEdit = false;
  @Input() projectId: string | null = null;
  @Input() testCaseId: string | null = null;
  @Input() testExecutionId: string | null = null;
  @Input() testExecutionStepResultId: string | null = null;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ defect: any; files: File[] }>();

  form: FormGroup;
  users = signal<User[]>([]);
  testCases = signal<TestCase[]>([]);
  
  selectedFiles = signal<File[]>([]);
  previewList = signal<{ name: string; url: string; size: number }[]>([]);
  existingAttachmentUrl = signal<string | null>(null);
  
  statuses = signal<any[]>([
    { id: 1, name: 'NEW', label: 'Nuevo / Abierto' },
    { id: 2, name: 'IN_PROGRESS', label: 'En Progreso' },
    { id: 3, name: 'RESOLVED', label: 'Resuelto' },
    { id: 4, name: 'CLOSED', label: 'Cerrado' }
  ]);
  
  priorities = signal<any[]>([
    { id: 1, name: 'LOW', label: 'Baja' },
    { id: 2, name: 'MEDIUM', label: 'Media' },
    { id: 3, name: 'HIGH', label: 'Alta' },
    { id: 4, name: 'CRITICAL', label: 'Crítica' }
  ]);
  
  severities = signal<any[]>([
    { id: 1, name: 'MINOR', label: 'Menor' },
    { id: 2, name: 'MAJOR', label: 'Mayor' },
    { id: 3, name: 'CRITICAL', label: 'Crítica' },
    { id: 4, name: 'BLOCKER', label: 'Bloqueante' }
  ]);

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      stepsToReproduce: [''],
      expectedResult: [''],
      actualResult: [''],
      statusId: [1, Validators.required],
      priorityId: [2, Validators.required],
      severityId: [2, Validators.required],
      assignedToUserId: [null],
      environmentInfo: [''],
      testCaseId: [null],
      testExecutionId: [null],
      testExecutionStepResultId: [null]
    });
  }

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadUsers();
    const activeProject = this.projectId || this.projectContextService.activeProjectId();
    if (activeProject) {
      this.loadTestCases(activeProject);
    }

    if (this.isEdit && this.defect) {
      this.form.patchValue({
        title: this.defect.title,
        description: this.defect.description,
        stepsToReproduce: this.defect.stepsToReproduce || '',
        expectedResult: this.defect.expectedResult || '',
        actualResult: this.defect.actualResult || '',
        statusId: this.defect.statusId || 1,
        priorityId: this.defect.priorityId || 2,
        severityId: this.defect.severityId || 2,
        assignedToUserId: this.defect.assignedToUserId || null,
        environmentInfo: this.defect.environmentInfo || '',
        testCaseId: this.defect.testCaseId || null,
        testExecutionId: this.defect.testExecutionId || null,
        testExecutionStepResultId: this.defect.testExecutionStepResultId || null
      });

      if (this.defect.attachmentUrl) {
        this.existingAttachmentUrl.set(this.defect.attachmentUrl);
      }
    } else {
      // Pre-set defaults if passed via inputs
      this.form.patchValue({
        testCaseId: this.testCaseId || null,
        testExecutionId: this.testExecutionId || null,
        testExecutionStepResultId: this.testExecutionStepResultId || null
      });
    }
  }

  loadUsers(): void {
    this.usersService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (users) => this.users.set(users),
      error: (err) => console.error('[DefectModal] Error cargando usuarios:', err)
    });
  }

  loadCatalogs(): void {
    this.catalogsService.getActiveByCatalog('DefectStatus').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          this.statuses.set(data.map((d: any) => ({ id: d.id, name: d.code, label: d.name })));
        }
      },
      error: (err: any) => console.error('[DefectModal] Error cargando estados de defecto:', err)
    });

    this.catalogsService.getActiveByCatalog('DefectPriority').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          this.priorities.set(data.map((d: any) => ({ id: d.id, name: d.code, label: d.name })));
        }
      },
      error: (err: any) => console.error('[DefectModal] Error cargando prioridades de defecto:', err)
    });

    this.catalogsService.getActiveByCatalog('FindingSeverity').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          this.severities.set(data.map((d: any) => ({ id: d.id, name: d.code, label: d.name })));
        }
      },
      error: (err: any) => console.error('[DefectModal] Error cargando severidades:', err)
    });
  }

  loadTestCases(projectId: string): void {
    this.testCasesService.getTestCases(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (cases) => this.testCases.set(cases),
      error: (err) => console.error('[DefectModal] Error cargando casos de prueba:', err)
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => this.addFile(file));
      input.value = ''; // Reset input to allow re-selection
    }
  }

  onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.includes('image')) {
        const blob = item.getAsFile();
        if (blob) {
          this.addFile(blob);
        }
      }
    }
  }

  private addFile(file: File): void {
    const currentFiles = [...this.selectedFiles(), file];
    this.selectedFiles.set(currentFiles);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewList.update(list => [
        ...list,
        { name: file.name || 'Captura Pegada.png', url: e.target.result, size: file.size }
      ]);
    };
    reader.readAsDataURL(file);
  }

  removeFile(index: number): void {
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
    this.previewList.update(list => list.filter((_, i) => i !== index));
  }

  clearAllFiles(): void {
    this.selectedFiles.set([]);
    this.previewList.set([]);
    this.existingAttachmentUrl.set(null);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formVal = this.form.value;
      const data = {
        title: formVal.title,
        description: formVal.description,
        stepsToReproduce: formVal.stepsToReproduce,
        expectedResult: formVal.expectedResult,
        actualResult: formVal.actualResult,
        defectStatusId: Number(formVal.statusId),
        statusId: Number(formVal.statusId),
        defectPriorityId: Number(formVal.priorityId),
        priorityId: Number(formVal.priorityId),
        defectSeverityId: Number(formVal.severityId),
        severityId: Number(formVal.severityId),
        assignedToUserId: formVal.assignedToUserId || null,
        environmentInfo: formVal.environmentInfo || '',
        testCaseId: formVal.testCaseId || null,
        testExecutionId: formVal.testExecutionId || null,
        testExecutionStepResultId: formVal.testExecutionStepResultId || null
      };

      this.save.emit({
        defect: data,
        files: this.selectedFiles()
      });
    }
  }
}
