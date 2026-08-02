import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestPlansService } from '../../core/services/test-plans.service';
import { TestPlan } from '../../core/models/test-plan.model';
import { TestPlanModalComponent } from './test-plan-modal/test-plan-modal.component';
import { ProjectContextService } from '../../core/services/project-context.service';
import { ReportsService } from '../../core/services/reports.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-test-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, TestPlanModalComponent],
  templateUrl: './test-plans.component.html',
  styleUrls: ['./test-plans.component.scss']
})
export class TestPlansComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private readonly testPlansService = inject(TestPlansService);
  private readonly projectContextService = inject(ProjectContextService);
  private readonly reportsService = inject(ReportsService);

  testPlans = signal<TestPlan[]>([]);
  loading = signal<boolean>(false);

  showModal = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  selectedPlan = signal<TestPlan | null>(null);

  get currentProjectId(): string {
    return this.projectContextService.activeProjectId() || '';
  }

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    const projectId = this.currentProjectId;
    if (!projectId) return;

    this.loading.set(true);
    this.testPlansService.getByProject(projectId).pipe(
      finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data: TestPlan[]) => this.testPlans.set(data),
      error: () => {
        Swal.fire('Error', 'Error al cargar los Planes de Prueba', 'error');
      }
    });
  }

  openCreateModal(): void {
    this.isEdit.set(false);
    this.selectedPlan.set(null);
    this.showModal.set(true);
  }

  openEditModal(plan: TestPlan): void {
    this.isEdit.set(true);
    this.selectedPlan.set(plan);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSave(planData: any): void {
    if (!planData.projectId && this.currentProjectId) {
      planData.projectId = this.currentProjectId;
    }

    const request = this.isEdit() && this.selectedPlan()
      ? this.testPlansService.update(this.selectedPlan()!.id, planData)
      : this.testPlansService.create(planData);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: `Plan de pruebas ${this.isEdit() ? 'actualizado' : 'creado'} correctamente`,
          confirmButtonColor: '#150fbd'
        });
        this.closeModal();
        this.loadPlans();
      },
      error: (err: any) => {
        const errorMsg = err?.error?.message || err?.error || 'Error al guardar el plan de pruebas';
        Swal.fire('Error de Validación ISTQB', errorMsg, 'error');
      }
    });
  }

  deletePlan(plan: TestPlan): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el plan "${plan.name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#a0aec0',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.testPlansService.delete(plan.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El plan ha sido eliminado', 'success');
            this.loadPlans();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el plan', 'error');
          }
        });
      }
    });
  }

  downloadReport(plan: TestPlan): void {
    this.reportsService.generateTestSummaryReport(plan.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TestSummaryReport_${plan.name.replace(/\s+/g, '_')}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo generar el reporte', 'error');
      }
    });
  }

  approvePlan(plan: TestPlan): void {
    Swal.fire({
      title: 'Aprobación / Cierre de Plan',
      html: `
        <p class="text-sm text-gray-300 mb-4" style="color: #6b7280;">Ingrese su veredicto y comentarios para el registro de auditoría.</p>
        <select id="swal-verdict" class="swal2-select" style="display: flex;">
          <option value="APPROVED">Aprobado (Cerrar Plan)</option>
          <option value="REJECTED">Rechazado (No Cumple Criterios)</option>
        </select>
        <textarea id="swal-comments" class="swal2-textarea" placeholder="Comentarios adicionales..."></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Firmar Digitalmente',
      confirmButtonColor: '#150fbd',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const verdict = (document.getElementById('swal-verdict') as HTMLSelectElement).value;
        const comments = (document.getElementById('swal-comments') as HTMLTextAreaElement).value;
        return { verdict, comments };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.testPlansService.approve(plan.id, {
          verdict: result.value.verdict,
          comments: result.value.comments
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            Swal.fire('Firmado', 'El plan ha sido procesado y el log de auditoría se ha guardado.', 'success');
            this.loadPlans();
          },
          error: (err) => {
            const errorMsg = err?.error?.message || err?.error || 'Error al aprobar el plan';
            Swal.fire('Error', errorMsg, 'error');
          }
        });
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch ((status || 'DRAFT').toUpperCase()) {
      case 'DRAFT': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'IN_REVIEW': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'APPROVED': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CLOSED': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  getCriteriaSummary(plan: TestPlan, type: 'ENTRY' | 'EXIT'): { met: number, total: number } {
    if (!plan.criteria || plan.criteria.length === 0) return { met: 0, total: 0 };
    const filtered = plan.criteria.filter(c => c.criteriaType === type);
    const met = filtered.filter(c => c.isMet).length;
    return { met, total: filtered.length };
  }
}
