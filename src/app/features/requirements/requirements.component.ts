import { Component, OnInit, signal, computed, inject, forwardRef, DestroyRef, effect } from '@angular/core';
import { NgClass, NgIf, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequirementsService } from '../../core/services/requirements.service';
import { ProjectsService } from '../../core/services/projects.service';
import { TestCasesService } from '../../core/services/test-cases.service';
import { TestExecutionsService } from '../../core/services/test-executions.service';
import { DefectsService } from '../../core/services/defects.service';
import { Requirement } from '../../core/models/requirement.model';
import { Project } from '../../core/models/project.model';
import { TestCase } from '../../core/models/test-case.model';
import { TestExecution } from '../../core/models/test-execution.model';
import { Defect } from '../../core/models/defect.model';
import { RequirementModalComponent } from './requirement-modal/requirement-modal.component';
import Swal from 'sweetalert2';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ProjectContextService } from '../../core/services/project-context.service';

export interface RtmRow {
  requirement: Requirement;
  testCases: TestCase[];
  executions: TestExecution[];
  defects: Defect[];
  coverageStatus: 'PASSING' | 'FAILING' | 'PENDING' | 'UNCOVERED';
}

@Component({
  selector: 'app-requirements',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgFor,
    DatePipe,
    TitleCasePipe,
    FormsModule,
    forwardRef(() => RequirementModalComponent)
  ],
  templateUrl: './requirements.component.html',
  styleUrl: './requirements.component.scss'
})
export class RequirementsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  requirements = signal<Requirement[]>([]);
  projects = signal<Project[]>([]);
  project = signal<Project | null>(null);
  loading = signal<boolean>(true);
  projectId = signal<string | null>(null);
  showModal = signal<boolean>(false);
  selectedRequirement = signal<Requirement | null>(null);

  // RTM View Mode & Data Signals
  viewMode = signal<'list' | 'rtm'>('list');
  projectTestCases = signal<TestCase[]>([]);
  projectExecutions = signal<TestExecution[]>([]);
  projectDefects = signal<Defect[]>([]);

  private readonly requirementsService = inject(RequirementsService);
  private readonly projectsService = inject(ProjectsService);
  private readonly testCasesService = inject(TestCasesService);
  private readonly executionsService = inject(TestExecutionsService);
  private readonly defectsService = inject(DefectsService);
  private readonly projectContext = inject(ProjectContextService);
  private readonly router = inject(Router);

  // Computed RTM Matrix
  rtmMatrix = computed<RtmRow[]>(() => {
    const reqs = this.requirements();
    const cases = this.projectTestCases();
    const execs = this.projectExecutions();
    const defects = this.projectDefects();

    return reqs.map(req => {
      // Find test cases linked to this requirement (by requirementId or matching description/reference)
      const linkedCases = cases.filter(c => (c as any).requirementId === req.id || c.title.toLowerCase().includes(req.code.toLowerCase()));
      const caseIds = new Set(linkedCases.map(c => c.id));

      // Find executions for linked test cases
      const linkedExecs = execs.filter(e => caseIds.has(e.testCase.id));

      // Find defects linked to these executions or project
      const linkedDefects = defects.filter(d => 
        (d.testExecutionId && linkedExecs.some(e => e.id === d.testExecutionId)) || 
        d.title.toLowerCase().includes(req.code.toLowerCase())
      );

      let coverageStatus: 'PASSING' | 'FAILING' | 'PENDING' | 'UNCOVERED';
      if (linkedCases.length === 0) {
        coverageStatus = 'UNCOVERED';
      } else if (linkedDefects.length > 0 || linkedExecs.some(e => e.status.code === 'FAILED')) {
        coverageStatus = 'FAILING';
      } else if (linkedExecs.length > 0 && linkedExecs.every(e => e.status.code === 'PASSED')) {
        coverageStatus = 'PASSING';
      } else {
        coverageStatus = 'PENDING';
      }

      return {
        requirement: req,
        testCases: linkedCases,
        executions: linkedExecs,
        defects: linkedDefects,
        coverageStatus
      };
    });
  });

  // Overall Coverage Percentage
  coveragePercent = computed<number>(() => {
    const matrix = this.rtmMatrix();
    if (matrix.length === 0) return 0;
    const covered = matrix.filter(r => r.coverageStatus === 'PASSING').length;
    return Math.round((covered / matrix.length) * 100);
  });

  constructor() {
    effect(() => {
      const pid = this.projectContext.activeProjectId();
      if (pid) {
        this.onProjectSelect(pid);
      }
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    this.projectsService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.projects.set(data);
        const pid = this.projectContext.activeProjectId();
        if (!pid && data.length > 0) {
          // Si no hay proyecto activo en contexto, autoselecciona el primero
          this.onProjectSelect(data[0].id);
        } else if (!pid && data.length === 0) {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.warn('No se pudieron cargar los proyectos', err);
        this.loading.set(false);
      }
    });
  }

  onProjectSelect(projectId: string) {
    if (!projectId) return;
    this.projectId.set(projectId);
    this.projectContext.setActiveProject(projectId);
    
    this.projectsService.getProjectById(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (proj) => {
        this.project.set(proj);
        this.loadRequirements(projectId);
      },
      error: (err) => {
        console.error('Error loading project', err);
        this.loading.set(false);
      }
    });
  }

  loadRequirements(projectId: string) {
    this.loading.set(true);
    this.requirementsService.getRequirementsByProject(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.requirements.set(data);
        this.loadRtmData(projectId);
      },
      error: (err) => {
        console.error('Error loading requirements', err);
        this.loading.set(false);
      }
    });
  }

  loadRtmData(projectId: string) {
    this.testCasesService.getTestCases(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (cases) => this.projectTestCases.set(cases || []),
      error: () => this.projectTestCases.set([])
    });

    this.executionsService.getExecutions(undefined, projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (execs) => this.projectExecutions.set(execs || []),
      error: () => this.projectExecutions.set([])
    });

    this.defectsService.getByProject(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (defects) => {
        this.projectDefects.set(defects || []);
        this.loading.set(false);
      },
      error: () => {
        this.projectDefects.set([]);
        this.loading.set(false);
      }
    });
  }

  exportRtmToCsv(): void {
    const rows = this.rtmMatrix();
    if (rows.length === 0) {
      Swal.fire('Atención', 'No hay datos de matriz RTM para exportar.', 'info');
      return;
    }

    const headers = ['Codigo_Requisito', 'Titulo_Requisito', 'Prioridad', 'Casos_Prueba_Vinculados', 'Ejecuciones', 'Defectos_Abiertos', 'Estado_Cobertura_ISTQB'];
    const data = rows.map(r => [
      `"${r.requirement.code}"`,
      `"${r.requirement.title.replaceAll('"', '""')}"`,
      `"${r.requirement.requirementPriorityName || 'Media'}"`,
      `"${r.testCases.map(c => c.title).join(' | ').replaceAll('"', '""') || 'Sin Casos'}"`,
      `"${r.executions.map(e => e.status.code).join(' | ') || 'Sin Ejecutar'}"`,
      `"${r.defects.map(d => d.title).join(' | ').replaceAll('"', '""') || 'Ninguno'}"`,
      `"${r.coverageStatus}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...data.map(d => d.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Matriz_Trazabilidad_RTM_${this.project()?.name || 'QAMS'}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  openModal(requirement: Requirement | null = null) {
    if (!this.projectId()) {
      Swal.fire('Advertencia', 'Debe seleccionar un proyecto primero', 'warning');
      return;
    }
    this.selectedRequirement.set(requirement);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedRequirement.set(null);
  }

  onSaved() {
    const pid = this.projectId();
    if (pid) {
      this.loadRequirements(pid);
    }
    this.closeModal();
  }

  deleteRequirement(id: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'El requisito se eliminará lógicamente del sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.requirementsService.deleteRequirement(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El requisito ha sido eliminado.', 'success');
            const pid = this.projectId();
            if (pid) {
              this.loadRequirements(pid);
            }
          },
          error: (err) => {
            console.error('Error deleting requirement', err);
            Swal.fire('Error', 'No se pudo eliminar el requisito.', 'error');
          }
        });
      }
    });
  }

  getProjectName(projectId: string): string {
    const p = this.projects().find(proj => proj.id === projectId);
    return p ? p.name : 'Sin proyecto';
  }

  goBack() {
    this.router.navigate(['/projects']);
  }
}
