import Swal from 'sweetalert2';
import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProjectsService } from '../../../core/services/projects.service';
import { UsersService } from '../../../core/services/users.service';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);
  users = signal<User[]>([]);
  loading = signal<boolean>(true);
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  showDevolutionModal = signal<boolean>(false);
  selectedProjectForDevolution = signal<Project | null>(null);
  devolutionNotes: string = '';
  projectForm!: FormGroup;

  private projectsService = inject(ProjectsService);
  private usersService = inject(UsersService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initForm();
    this.loadProjects();
    this.loadUsers();
  }

  private initForm() {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      endDate: ['', Validators.required],
      testerIds: [[], Validators.required]
    });
  }

  loadUsers() {
    this.usersService.getUsers().subscribe({
      next: (data) => {
        // Filtrar solo usuarios con rol 'Tester'
        const testers = data.filter(u => u.roles && u.roles.includes('Tester'));
        console.log('ProjectsComponent: Usuarios cargados (filtrados por Tester):', testers);
        this.users.set(testers);
      },
      error: (err) => console.error('Error loading users', err)
    });
  }

  openProject(projectId: string) {
    this.router.navigate(['/test-scenarios'], { queryParams: { projectId } });
  }

  viewKanban(projectId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/kanban'], { queryParams: { projectId } });
  }

  viewRequirements(projectId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/requirements'], { queryParams: { projectId } });
  }

  loadProjects() {
    console.log('ProjectsComponent: Iniciando carga de proyectos...');
    this.loading.set(true);
    this.projectsService.getProjects().subscribe({
      next: (data: Project[]) => {
        console.log('ProjectsComponent: Proyectos recibidos del backend:', data);
        this.projects.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('ProjectsComponent: Error al cargar proyectos:', err);
        this.loading.set(false);
      }
    });
  }

  openModal() {
    this.projectForm.reset({
      startDate: new Date().toISOString().split('T')[0],
      testerIds: []
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onSubmit() {
    if (this.projectForm.valid) {
      this.isSubmitting.set(true);
      const formValue = this.projectForm.value;

      // Asegurar formato de fecha ISO 8601 completo para el backend
      const payload = {
        ...formValue,
        startDate: new Date(formValue.startDate).toISOString(),
        endDate: new Date(formValue.endDate).toISOString()
      };

      console.log('ProjectsComponent: Creando proyecto con payload:', payload);

      this.projectsService.createProject(payload as any).subscribe({
        next: (newProj) => {
          console.log('ProjectsComponent: Proyecto creado correctamente:', newProj);
          this.loadProjects();
          this.closeModal();
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error('ProjectsComponent: Error al crear proyecto:', err);
          this.isSubmitting.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Error de creación',
            text: 'No se pudo crear el proyecto. Verifique sus datos e intente nuevamente.',
            confirmButtonColor: '#150fbd'
          });
        }
      });
    }
  }

  onDeleteProject(projectId: string, event: Event) {
    event.stopPropagation();
    console.log('ProjectsComponent: Intentando eliminar proyecto ID:', projectId);
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminará este proyecto y todos sus datos relacionados de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Optimistic update: eliminar inmediatamente de la lista local
        const currentProjects = this.projects();
        this.projects.set(currentProjects.filter(p => p.id !== projectId));

        this.loading.set(true);
        this.projectsService.deleteProject(projectId).subscribe({
          next: () => {
            console.log('ProjectsComponent: Eliminación exitosa en backend para ID:', projectId);
            this.loadProjects(); // Recargar para sincronizar estado final
          },
          error: (err) => {
            console.error('ProjectsComponent: Error al eliminar proyecto en backend:', err);
            // Revertir cambio local si falló
            this.projects.set(currentProjects);
            this.loading.set(false);
            Swal.fire({
              icon: 'error',
              title: 'Error de eliminación',
              text: 'No se pudo eliminar el proyecto. Verifique sus permisos e intente nuevamente.',
              confirmButtonColor: '#150fbd'
            });
          }
        });
      }
    });
  }

  onToggleStatus(project: Project, event: Event) {
    event.stopPropagation();
    const newStatus = !project.isActive;
    console.log(`ProjectsComponent: Cambiando estado de proyecto ${project.id} a: ${newStatus ? 'Activo' : 'Inactivo'}`);
    this.projectsService.updateProject(project.id, { isActive: newStatus }).subscribe({
      next: (updatedProj) => {
        console.log('ProjectsComponent: Estado actualizado en backend:', updatedProj);
        this.loadProjects();
      },
      error: (err) => {
        console.error('ProjectsComponent: Error al actualizar estado:', err);
      }
    });
  }

  openDevolutionModal(project: Project, event: Event) {
    event.stopPropagation();
    this.selectedProjectForDevolution.set(project);
    this.devolutionNotes = '';
    this.showDevolutionModal.set(true);
  }

  closeDevolutionModal() {
    this.showDevolutionModal.set(false);
    this.selectedProjectForDevolution.set(null);
  }

  onRegisterDevolution() {
    const project = this.selectedProjectForDevolution();
    const notes = this.devolutionNotes;
    if (!project || !notes.trim()) return;

    this.isSubmitting.set(true);
    this.projectsService.registerDevolution(project.id, notes).subscribe({
      next: () => {
        console.log('ProjectsComponent: Devolución registrada con éxito');
        this.loadProjects();
        this.closeDevolutionModal();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('ProjectsComponent: Error al registrar devolución:', err);
        this.isSubmitting.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Error de registro',
          text: 'No se pudo registrar la devolución.',
          confirmButtonColor: '#150fbd'
        });
      }
    });
  }
}
