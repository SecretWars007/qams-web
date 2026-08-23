import { Component, OnInit, inject, signal, DestroyRef, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestPlansService } from '../../core/services/test-plans.service';
import { TestPlan } from '../../core/models/test-plan.model';
import { Project } from '../../core/models/project.model';
import { TestPlanModalComponent } from './test-plan-modal/test-plan-modal.component';
import { TestPlansHeaderComponent } from './components/test-plans-header/test-plans-header.component';
import { TestPlansTableComponent } from './components/test-plans-table/test-plans-table.component';
import { TestPlansEmptyComponent } from './components/test-plans-empty/test-plans-empty.component';
import { TestPlanDetailComponent } from './components/test-plan-detail/test-plan-detail.component';
import { ProjectContextService } from '../../core/services/project-context.service';
import { ProjectsService } from '../../core/services/projects.service';
import { ReportsService } from '../../core/services/reports.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SystemsUnderTestService } from '../../core/services/systems-under-test.service';
import { SystemUnderTest } from '../../core/models/system-under-test.model';

@Component({
  selector: 'app-test-plans',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TestPlanModalComponent,
    TestPlansHeaderComponent,
    TestPlansTableComponent,
    TestPlansEmptyComponent,
    TestPlanDetailComponent
  ],
  templateUrl: './test-plans.component.html',
  styleUrls: ['./test-plans.component.scss']
})
export class TestPlansComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private readonly testPlansService = inject(TestPlansService);
  private readonly projectContextService = inject(ProjectContextService);
  private readonly projectsService = inject(ProjectsService);
  private readonly reportsService = inject(ReportsService);
  private readonly sutsService = inject(SystemsUnderTestService);

  testPlans = signal<TestPlan[]>([]);
  loading = signal<boolean>(false);
  projects = signal<Project[]>([]);
  activeProjectId = signal<string | null>(null);
  activeProject = signal<Project | null>(null);

  suts = signal<SystemUnderTest[]>([]);
  activeSutId = signal<string | null>(null);
  
  searchTerm = signal<string>('');

  filteredProjects = computed(() => {
    const sutId = this.activeSutId();
    const allProjects = this.projects();
    if (!sutId) return allProjects;
    return allProjects.filter(p => p.systemUnderTestId === sutId);
  });

  filteredTestPlans = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.testPlans();
    if (!term) return all;
    return all.filter(p => 
      p.name?.toLowerCase().includes(term) || 
      p.objectives?.toLowerCase().includes(term) ||
      p.scope?.toLowerCase().includes(term)
    );
  });

  showModal = signal<boolean>(false);
  showDetail = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  selectedPlan = signal<TestPlan | null>(null);

  get currentProjectId(): string {
    return this.activeProjectId() || '';
  }

  constructor() {
    effect(() => {
      const pid = this.projectContextService.activeProjectId();
      if (pid) {
        this.onProjectSelect(pid);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.loadSuts();
    this.loadProjects();
  }

  loadSuts(): void {
    this.sutsService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.suts.set(data),
      error: () => console.error('Error al cargar SUTs')
    });
  }

  loadProjects(): void {
    this.projectsService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.projects.set(data);
        const pid = this.projectContextService.activeProjectId();
        if (!pid && data.length > 0) {
          this.onProjectSelect(data[0].id);
        } else if (pid) {
          const found = data.find(p => p.id === pid);
          if (found) this.activeProject.set(found);
        } else {
          this.loading.set(false);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  onSutSelect(sutId: string): void {
    this.activeSutId.set(sutId);
    this.activeProjectId.set(null);
    this.activeProject.set(null);
    this.projectContextService.clearActiveProject();
    
    if (!sutId) {
      this.testPlans.set([]);
      return;
    }

    this.loading.set(true);
    this.testPlansService.getBySut(sutId).pipe(
      finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data: TestPlan[]) => this.testPlans.set(data),
      error: () => Swal.fire('Error', 'Error al cargar los Planes de Prueba por SUT', 'error')
    });
  }

  onProjectSelect(projectId: string): void {
    if (!projectId) return;
    this.activeProjectId.set(projectId);
    this.activeSutId.set(null);
    this.projectContextService.setActiveProject(projectId);
    const found = this.projects().find(p => p.id === projectId);
    if (found) this.activeProject.set(found);
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

  openDetailModal(plan: TestPlan): void {
    this.selectedPlan.set(plan);
    this.showDetail.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }
  
  closeDetail(): void {
    this.showDetail.set(false);
    this.selectedPlan.set(null);
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
          confirmButtonColor: '#10B981'
        });
        this.closeModal();
        this.loadPlans();
      },
      error: (err: any) => {
        let errorMsg = 'Error al guardar el plan de pruebas';
        if (err?.error?.errors) {
          errorMsg = Object.values(err.error.errors).flat().join('\n');
        } else if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (typeof err?.error === 'string') {
          errorMsg = err.error;
        }
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
      confirmButtonColor: '#10B981',
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
    switch ((status || 'Borrador').toUpperCase()) {
      case 'BORRADOR': 
      case 'DRAFT': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'EN REVISIÓN': 
      case 'IN_REVIEW': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'APROBADO': 
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ACTIVO': 
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CERRADO': 
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
