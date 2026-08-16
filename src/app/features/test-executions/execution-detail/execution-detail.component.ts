import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TestExecutionsService } from '../../../core/services/test-executions.service';
import { DefectsService } from '../../../core/services/defects.service';
import { TestExecution } from '../../../core/models/test-execution.model';
import { DefectModalComponent } from '../../defects/defect-modal/defect-modal.component';
import Swal from 'sweetalert2';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-execution-detail',
  standalone: true,
  imports: [CommonModule, DefectModalComponent],
  templateUrl: './execution-detail.component.html',
  styleUrls: ['./execution-detail.component.scss']
})
export class ExecutionDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly execution = signal<TestExecution | null>(null);
  readonly loading = signal<boolean>(true);

  // Defect Modal State
  readonly showDefectModal = signal<boolean>(false);
  readonly defectModalData = signal<any>(null);
  readonly selectedStepId = signal<string | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly testExecutionsService = inject(TestExecutionsService);
  private readonly defectsService = inject(DefectsService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadExecution(id);
    }
  }

  loadExecution(id: string): void {
    this.loading.set(true);
    this.testExecutionsService.getExecutionById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.execution.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        Swal.fire('Error', 'No se pudo cargar la ejecución', 'error');
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  reportDefectForStep(step: any): void {
    const exec = this.execution();
    if (!exec) return;

    this.selectedStepId.set(step.id);
    this.defectModalData.set({
      title: `Falla en paso #${step.stepOrder || 0}: ${step.action || ''}`,
      description: `Falla detectada en la ejecución #${exec.id.substring(0, 8)}:\nResultado Obtenido: ${step.actualResult || 'Sin resultado'}`,
      expectedResult: step.expectedResult || '',
      actualResult: step.actualResult || '',
      severityId: 2,
      priorityId: 2,
      statusId: 1,
      testCaseId: exec.testCase.id,
      testExecutionId: exec.id,
      testExecutionStepResultId: step.id
    });
    this.showDefectModal.set(true);
  }

  onSaveDefect(eventData: { defect: any; files: File[] }): void {
    const exec = this.execution();
    if (!exec?.project?.id) return;

    const projectId = exec.project.id;
    const { defect, files } = eventData;
    defect.projectId = projectId;
    defect.testExecutionId = exec.id;
    defect.testExecutionStepResultId = this.selectedStepId();

    this.defectsService.create(projectId, defect).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (savedDefect) => {
        if (files && files.length > 0 && savedDefect?.id) {
          const uploads$ = files.map(file => this.defectsService.uploadAttachment(projectId, savedDefect.id, file));
          forkJoin(uploads$).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => this.handleDefectSavedSuccess(savedDefect),
            error: (err) => {
              console.error('[ExecutionDetail] Error subiendo evidencia del defecto:', err);
              this.handleDefectSavedSuccess(savedDefect);
            }
          });
        } else {
          this.handleDefectSavedSuccess(savedDefect);
        }
      },
      error: (err) => {
        console.error('[ExecutionDetail] Error al crear defecto:', err);
        Swal.fire('Error', 'No se pudo registrar el defecto', 'error');
      }
    });
  }

  private handleDefectSavedSuccess(defect: any): void {
    this.showDefectModal.set(false);
    Swal.fire({
      icon: 'success',
      title: 'Defecto Registrado',
      text: `Se ha registrado el defecto "${defect.title}" exitosamente vinculado a este paso.`,
      confirmButtonColor: '#150fbd'
    });
  }

  getStatusBadgeClasses(statusCode: string): string {
    switch (statusCode?.toUpperCase()) {
      case 'PASSED':
      case 'PASS':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'FAILED':
      case 'FAIL':
        return 'bg-rose-100 text-rose-700 border border-rose-200';
      case 'BLOCKED':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'SKIPPED':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      default:
        return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  }

  isImage(fileTypeName: string): boolean {
    if (!fileTypeName) return false;
    const type = fileTypeName.toLowerCase();
    return type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg');
  }
}
