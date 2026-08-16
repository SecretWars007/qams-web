import { Component, OnInit, signal, inject, forwardRef, DestroyRef, effect } from '@angular/core';
import { NgClass, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RequirementsService } from '../../core/services/requirements.service';
import { ProjectsService } from '../../core/services/projects.service';
import { Requirement } from '../../core/models/requirement.model';
import { Project } from '../../core/models/project.model';
import { RequirementModalComponent } from './requirement-modal/requirement-modal.component';
import Swal from 'sweetalert2';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ProjectContextService } from '../../core/services/project-context.service';

@Component({
  selector: 'app-requirements',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    TitleCasePipe,
    FormsModule,
    forwardRef(() => RequirementModalComponent)
  ],
  templateUrl: './requirements.component.html',
  styleUrl: './requirements.component.scss'
})
export class RequirementsComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
  requirements = signal<Requirement[]>([]);
  projects = signal<Project[]>([]);
  project = signal<Project | null>(null);
  loading = signal<boolean>(true);
  projectId = signal<string | null>(null);
  showModal = signal<boolean>(false);
  selectedRequirement = signal<Requirement | null>(null);

  private readonly requirementsService = inject(RequirementsService);
  private readonly projectsService = inject(ProjectsService);
  private readonly projectContext = inject(ProjectContextService);
  private readonly router = inject(Router);

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
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading requirements', err);
        this.loading.set(false);
      }
    });
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
      confirmButtonColor: '#150fbd',
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
