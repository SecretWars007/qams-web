import { Component, EventEmitter, Input, OnInit, Output, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Defect } from '../../../core/models/defect.model';
import { User } from '../../../core/models/user.model';
import { TestCase } from '../../../core/models/test-case.model';
import { UsersService } from '../../../core/services/users.service';
import { TestCasesService } from '../../../core/services/test-cases.service';
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
  private readonly projectContextService = inject(ProjectContextService);

  @Input() defect: Defect | null = null;
  @Input() isEdit = false;
  @Input() projectId: string | null = null;
  @Input() testCaseId: string | null = null;
  @Input() testExecutionId: string | null = null;
  @Input() testExecutionStepResultId: string | null = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ defect: any; file: File | null }>();

  form: FormGroup;
  users = signal<User[]>([]);
  testCases = signal<TestCase[]>([]);
  
  selectedFile: File | null = null;
  previewUrl = signal<string | null>(null);
  existingAttachmentUrl = signal<string | null>(null);
  
  statuses = [
    { id: 1, name: 'NEW', label: 'Nuevo / Abierto' },
    { id: 2, name: 'IN_PROGRESS', label: 'En Progreso' },
    { id: 3, name: 'RESOLVED', label: 'Resuelto' },
    { id: 4, name: 'CLOSED', label: 'Cerrado' }
  ];
  
  priorities = [
    { id: 1, name: 'LOW', label: 'Baja' },
    { id: 2, name: 'MEDIUM', label: 'Media' },
    { id: 3, name: 'HIGH', label: 'Alta' },
    { id: 4, name: 'CRITICAL', label: 'Crítica' }
  ];
  
  severities = [
    { id: 1, name: 'MINOR', label: 'Menor' },
    { id: 2, name: 'MAJOR', label: 'Mayor' },
    { id: 3, name: 'CRITICAL', label: 'Crítica' },
    { id: 4, name: 'BLOCKER', label: 'Bloqueante' }
  ];

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

  loadTestCases(projectId: string): void {
    this.testCasesService.getTestCases(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (cases) => this.testCases.set(cases),
      error: (err) => console.error('[DefectModal] Error cargando casos de prueba:', err)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.setFile(input.files[0]);
    }
  }

  onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.includes('image')) {
        const blob = item.getAsFile();
        if (blob) {
          this.setFile(blob);
          break;
        }
      }
    }
  }

  private setFile(file: File): void {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl.set(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  clearAttachment(): void {
    this.selectedFile = null;
    this.previewUrl.set(null);
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
        file: this.selectedFile
      });
    }
  }
}
