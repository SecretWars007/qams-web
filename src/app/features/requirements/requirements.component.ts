import { Component, OnInit, signal, inject, forwardRef, DestroyRef } from '@angular/core';
import { NgClass, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RequirementsService } from '../../core/services/requirements.service';
import { ProjectsService } from '../../core/services/projects.service';
import { Requirement } from '../../core/models/requirement.model';
import { Project } from '../../core/models/project.model';
import { RequirementModalComponent } from './requirement-modal/requirement-modal.component';
import Swal from 'sweetalert2';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-requirements',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    TitleCasePipe,
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Siempre cargar la lista de proyectos (para el selector del modal)
    this.loadProjects();

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const pid = params['projectId'];
      if (pid) {
        this.projectId.set(pid);
        this.loadProject(pid);
        this.loadRequirements(pid);
      } else {
        // Sin proyecto específico: cargar requisitos de todos los proyectos
        this.loadAllRequirements();
      }
    });
  }

  loadProjects() {
    this.projectsService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.warn('No se pudieron cargar los proyectos', err)
    });
  }

  loadProject(id: string) {
    this.projectsService.getProjectById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (proj) => this.project.set(proj),
      error: (err) => console.error('Error loading project', err)
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

  loadAllRequirements() {
    this.loading.set(true);
    // Cargar requisitos de todos los proyectos disponibles
    this.projectsService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (projects) => {
        if (projects.length === 0) {
          this.loading.set(false);
          return;
        }
        let allReqs: Requirement[] = [];
        let loaded = 0;
        for (const proj of projects) {
          this.requirementsService.getRequirementsByProject(proj.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (reqs) => {
              allReqs = [...allReqs, ...reqs];
              loaded++;
              if (loaded === projects.length) {
                this.requirements.set(allReqs);
                this.loading.set(false);
              }
            },
            error: () => {
              loaded++;
              if (loaded === projects.length) {
                this.requirements.set(allReqs);
                this.loading.set(false);
              }
            }
          });
        }
      },
      error: () => this.loading.set(false)
    });
  }

  openModal(requirement: Requirement | null = null) {
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
    } else {
      this.loadAllRequirements();
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
            } else {
              this.loadAllRequirements();
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
