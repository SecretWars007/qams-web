import { Component, OnInit, signal, inject, forwardRef } from '@angular/core';
import { NgClass, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RequirementsService } from '../../core/services/requirements.service';
import { ProjectsService } from '../../core/services/projects.service';
import { Requirement } from '../../core/models/requirement.model';
import { Project } from '../../core/models/project.model';
import { RequirementModalComponent } from './requirement-modal/requirement-modal.component';
import Swal from 'sweetalert2';

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
  styles: [`
    :host { display: block; }
  `]
})
export class RequirementsComponent implements OnInit {
  requirements = signal<Requirement[]>([]);
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
    this.route.queryParams.subscribe(params => {
      const pid = params['projectId'];
      if (pid) {
        this.projectId.set(pid);
        this.loadProject(pid);
        this.loadRequirements(pid);
      } else {
        this.loading.set(false);
      }
    });
  }

  loadProject(id: string) {
    this.projectsService.getProjectById(id).subscribe({
      next: (proj) => this.project.set(proj),
      error: (err) => console.error('Error loading project', err)
    });
  }

  loadRequirements(projectId: string) {
    this.loading.set(true);
    this.requirementsService.getRequirementsByProject(projectId).subscribe({
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
        this.requirementsService.deleteRequirement(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El requisito ha sido eliminado.', 'success');
            const pid = this.projectId();
            if (pid) this.loadRequirements(pid);
          },
          error: (err) => {
            console.error('Error deleting requirement', err);
            Swal.fire('Error', 'No se pudo eliminar el requisito.', 'error');
          }
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/projects']);
  }
}
