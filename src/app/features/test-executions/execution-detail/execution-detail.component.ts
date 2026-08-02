import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TestExecutionsService } from '../../../core/services/test-executions.service';
import { DefectsService } from '../../../core/services/defects.service';
import { TestExecution } from '../../../core/models/test-execution.model';
import Swal from 'sweetalert2';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-execution-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './execution-detail.component.html',
  styleUrls: ['./execution-detail.component.scss']
})
export class ExecutionDetailComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  execution = signal<TestExecution | null>(null);
  loading = signal<boolean>(true);

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

  async reportDefectForStep(step: any): Promise<void> {
    const exec = this.execution();
    if (!exec) return;

    const { value: formValues } = await Swal.fire({
      title: 'Reportar Defecto de Paso Fallido',
      html: `
        <div class="text-left space-y-3">
          <div>
            <label class="text-xs font-bold text-slate-600 block mb-1">Título del Defecto</label>
            <input id="swal-defect-title" class="w-full border border-slate-200 rounded-lg p-2 text-sm" value="Fallo en paso: ${step.action ? step.action.replace(/"/g, '&quot;') : 'Sin acción'}" />
          </div>
          <div>
            <label class="text-xs font-bold text-slate-600 block mb-1">Descripción / Resultado Obtenido</label>
            <textarea id="swal-defect-desc" class="w-full border border-slate-200 rounded-lg p-2 text-sm" rows="3">${step.actualResult || ''}</textarea>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-600 block mb-1">Prioridad del Defecto</label>
            <select id="swal-defect-priority" class="w-full border border-slate-200 rounded-lg p-2 text-sm">
              <option value="1">Alta / Crítica</option>
              <option value="2" selected>Media / Normal</option>
              <option value="3">Baja</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear y Vincular Defecto',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#150fbd',
      preConfirm: () => {
        return {
          title: (document.getElementById('swal-defect-title') as HTMLInputElement).value,
          description: (document.getElementById('swal-defect-desc') as HTMLTextAreaElement).value,
          defectPriorityId: parseInt((document.getElementById('swal-defect-priority') as HTMLSelectElement).value, 10)
        };
      }
    });

    if (formValues && formValues.title) {
      const projectId = exec.project?.id || '';
      const testCaseId = exec.testCase?.id || '';

      this.defectsService.create(projectId, {
        projectId: projectId,
        title: formValues.title,
        description: formValues.description,
        defectPriorityId: formValues.defectPriorityId,
        priorityId: formValues.defectPriorityId,
        testCaseId: testCaseId,
        testExecutionId: exec.id,
        testExecutionStepResultId: step.id,
        stepsToReproduce: `Acción: ${step.action || ''}\nResultado Esperado: ${step.expectedResult || ''}\nResultado Obtenido: ${step.actualResult || ''}`
      }).subscribe({
        next: (defect) => {
          Swal.fire({
            icon: 'success',
            title: 'Defecto Creado y Vinculado',
            text: `Se ha registrado el defecto "${defect.title}" vinculado a esta ejecución.`,
            confirmButtonColor: '#150fbd'
          });
        },
        error: (err) => {
          console.error('[ExecutionDetail] Error al crear defecto:', err);
          Swal.fire('Error', 'No se pudo vincular el defecto', 'error');
        }
      });
    }
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
