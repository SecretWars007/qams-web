import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TestExecutionsService } from '../../../core/services/test-executions.service';
import { DefectsService } from '../../../core/services/defects.service';
import { TestExecution } from '../../../core/models/test-execution.model';
import { DefectModalComponent } from '../../defects/defect-modal/defect-modal.component';
import Swal from 'sweetalert2';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-execution-detail',
  standalone: true,
  imports: [CommonModule, DefectModalComponent],
  templateUrl: './execution-detail.component.html',
  styleUrls: ['./execution-detail.component.scss']
})
export class ExecutionDetailComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  execution = signal<TestExecution | null>(null);
  loading = signal<boolean>(true);

  // Defect Modal State
  showDefectModal = signal<boolean>(false);
  defectModalData = signal<any>(null);
  selectedStepId = signal<string | null>(null);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private testExecutionsService = inject(TestExecutionsService);
  private defectsService = inject(DefectsService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadExecution(id);
    } else {
      this.loading.set(false);
      Swal.fire('Error', 'ID de ejecución no proporcionado', 'error');
    }
  }

  private loadExecution(id: string): void {
    this.loading.set(true);
    this.testExecutionsService.getExecutionById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.execution.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[ExecutionDetail] Error cargando ejecución:', err);
        this.loading.set(false);
        Swal.fire('Error', 'No se pudo cargar el detalle de la ejecución', 'error');
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
      title: `Fallo en paso ${step.stepOrder || ''}: ${step.action || ''}`.trim(),
      description: `Defecto detectado durante la ejecución #${exec.cycleNumber || ''} del caso de prueba "${exec.testCase?.title || ''}".`,
      stepsToReproduce: `1. Acción: ${step.action || '-'}\n2. Resultado Esperado: ${step.expectedResult || '-'}\n3. Resultado Obtenido: ${step.actualResult || '-'}`,
      expectedResult: step.expectedResult || '',
      actualResult: step.actualResult || '',
      priorityId: 2,
      severityId: 2,
      statusId: 1,
      testCaseId: exec.testCase?.id || null,
      testExecutionId: exec.id,
      testExecutionStepResultId: step.id
    });
    this.showDefectModal.set(true);
  }

  onSaveDefect(eventData: { defect: any; file: File | null }): void {
    const exec = this.execution();
    if (!exec || !exec.project?.id) return;

    const projectId = exec.project.id;
    const { defect, file } = eventData;
    defect.projectId = projectId;
    defect.testExecutionId = exec.id;
    defect.testExecutionStepResultId = this.selectedStepId();

    this.defectsService.create(projectId, defect).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (savedDefect) => {
        if (file && savedDefect?.id) {
          this.defectsService.uploadAttachment(projectId, savedDefect.id, file).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
