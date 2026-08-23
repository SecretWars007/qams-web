import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TestExecutionsService } from '../../core/services/test-executions.service';
import { ProjectsService } from '../../core/services/projects.service';
import { TestExecution, Evidence } from '../../core/models/test-execution.model';
import { Project } from '../../core/models/project.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';

interface EvidenceRow {
  evidence: Evidence;
  execution: TestExecution;
  stepOrder?: number;
  stepAction?: string;
  isStep: boolean;
}

@Component({
  selector: 'app-evidences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './evidences.component.html',
  styleUrls: ['./evidences.component.scss']
})
export class EvidencesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private executionsService = inject(TestExecutionsService);
  private projectsService = inject(ProjectsService);
  private fb = inject(FormBuilder);

  // State signals
  loading = signal<boolean>(true);
  isUploading = signal<boolean>(false);
  showUploadModal = signal<boolean>(false);
  screenshotPreview = signal<string | null>(null);
  isDragging = signal<boolean>(false);

  // Data signals
  executions = signal<TestExecution[]>([]);
  projects = signal<Project[]>([]);
  evidenceRows = signal<EvidenceRow[]>([]);

  // Filter signals
  selectedProjectId = signal<string>('');
  selectedExecutionId = signal<string>('');
  filterType = signal<string>('all'); // 'all' | 'step' | 'global'
  searchQuery = signal<string>('');

  // Upload state
  selectedFile: File | null = null;
  selectedExecutionForUpload: string = '';
  selectedStepIdForUpload: string = '';
  uploadForm!: FormGroup;

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      executionId: ['', Validators.required],
      stepResultId: [''],
      description: ['']
    });

    this.loadProjects();

    // Reset stepResultId list when executionId changes in upload modal
    this.uploadForm.get('executionId')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(execId => {
      this.uploadForm.patchValue({ stepResultId: '' }, { emitEvent: false });
    });
  }

  private loadProjects(): void {
    this.projectsService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.projects.set(data);
        if (data.length > 0) {
          this.selectedProjectId.set(data[0].id);
        }
        this.loadExecutions();
      },
      error: () => this.loading.set(false)
    });
  }

  loadExecutions(): void {
    this.loading.set(true);
    this.executionsService.getExecutions(
      undefined,
      this.selectedProjectId() || undefined
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (execs) => {
        this.executions.set(execs);
        this.buildEvidenceRows(execs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private buildEvidenceRows(executions: TestExecution[]): void {
    const rows: EvidenceRow[] = [];
    for (const exec of executions) {
      // Global evidences
      for (const ev of (exec.evidences ?? [])) {
        rows.push({ evidence: ev, execution: exec, isStep: false });
      }
      // Step evidences
      for (const step of (exec.stepResults ?? [])) {
        for (const ev of (step.evidences ?? [])) {
          rows.push({
            evidence: ev,
            execution: exec,
            isStep: true,
            stepOrder: step.stepOrder,
            stepAction: step.action
          });
        }
      }
    }
    // Sort by uploadedAt desc
    rows.sort((a, b) => new Date(b.evidence.uploadedAt).getTime() - new Date(a.evidence.uploadedAt).getTime());
    this.evidenceRows.set(rows);
  }

  get filteredRows(): EvidenceRow[] {
    let rows = this.evidenceRows();
    if (this.selectedExecutionId()) {
      rows = rows.filter(r => r.execution.id === this.selectedExecutionId());
    }
    if (this.filterType() === 'step') {
      rows = rows.filter(r => r.isStep);
    } else if (this.filterType() === 'global') {
      rows = rows.filter(r => !r.isStep);
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      rows = rows.filter(r =>
        r.evidence.fileName?.toLowerCase().includes(q) ||
        (r.evidence.description && r.evidence.description.toLowerCase().includes(q)) ||
        r.execution.testCase.title?.toLowerCase().includes(q) ||
        (r.stepAction && r.stepAction.toLowerCase().includes(q))
      );
    }
    return rows;
  }

  get imageCount(): number {
    return this.filteredRows.filter(r => this.isImage(r.evidence.fileTypeName)).length;
  }

  get totalCount(): number {
    return this.filteredRows.length;
  }


  onProjectChange(event: Event): void {
    const pId = (event.target as HTMLSelectElement).value;
    this.selectedProjectId.set(pId);
    this.selectedExecutionId.set('');
    this.loadExecutions();
  }

  onExecutionFilterChange(event: Event): void {
    this.selectedExecutionId.set((event.target as HTMLSelectElement).value);
  }

  openUploadModal(): void {
    const execs = this.executions();
    const defaultExecId = execs.length > 0 ? execs[0].id : '';
    this.uploadForm.reset({
      executionId: defaultExecId,
      stepResultId: '',
      description: ''
    });
    this.selectedFile = null;
    this.screenshotPreview.set(null);
    this.showUploadModal.set(true);
  }

  closeUploadModal(): void {
    this.showUploadModal.set(false);
    this.selectedFile = null;
    this.screenshotPreview.set(null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.includes('image')) {
        const blob = item.getAsFile();
        if (blob) {
          this.processFile(blob);
          break;
        }
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File): void {
    this.selectedFile = file;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.screenshotPreview.set(e.target.result);
      reader.readAsDataURL(file);
    } else {
      this.screenshotPreview.set(null);
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.screenshotPreview.set(null);
  }

  getSelectedExecutionSteps(): any[] {
    const execId = this.uploadForm.get('executionId')?.value;
    if (!execId) return [];
    const exec = this.executions().find(e => e.id === execId);
    return exec?.stepResults ?? [];
  }

  onUploadSubmit(): void {
    if (!this.selectedFile) {
      Swal.fire('Atención', 'Selecciona o pega un archivo antes de subir.', 'warning');
      return;
    }
    if (this.uploadForm.invalid) {
      Swal.fire('Atención', 'Selecciona la ejecución de prueba destino.', 'warning');
      return;
    }

    const { executionId, description, stepResultId } = this.uploadForm.value;
    this.isUploading.set(true);

    this.executionsService.uploadEvidence(
      executionId,
      this.selectedFile,
      description,
      stepResultId || undefined
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.showUploadModal.set(false);
        this.selectedFile = null;
        this.screenshotPreview.set(null);
        Swal.fire({
          icon: 'success',
          title: 'Evidencia Subida',
          text: 'La evidencia se ha cargado correctamente y está vinculada a la ejecución.',
          confirmButtonColor: '#10B981'
        });
        this.loadExecutions();
      },
      error: (err) => {
        this.isUploading.set(false);
        console.error('[Evidences] Error subiendo evidencia:', err);
        Swal.fire('Error', 'No se pudo subir la evidencia. Intenta de nuevo.', 'error');
      }
    });
  }

  isImage(fileTypeName: string): boolean {
    if (!fileTypeName) return false;
    const t = fileTypeName.toLowerCase();
    return t.includes('image') || t.includes('png') || t.includes('jpg') || t.includes('jpeg') || t.includes('gif') || t.includes('webp');
  }

  formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  viewEvidence(row: EvidenceRow): void {
    window.open(row.evidence.fileUrl, '_blank');
  }
}
