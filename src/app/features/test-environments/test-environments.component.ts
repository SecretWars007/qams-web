// src/app/features/test-environments/test-environments.component.ts
import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { TestEnvironmentsService } from '../../core/services/test-environments.service';
import { ProjectsService } from '../../core/services/projects.service';
import { Project } from '../../core/models/project.model';
import {
  TestEnvironment,
  CreateTestEnvironmentDto,
  UpdateTestEnvironmentDto
} from '../../core/models/test-environment.model';

@Component({
  selector: 'app-test-environments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-environments.component.html',
  styleUrls: ['./test-environments.component.scss']
})
export class TestEnvironmentsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private envService = inject(TestEnvironmentsService);
  private projectsService = inject(ProjectsService);

  // State Signals
  projects = signal<Project[]>([]);
  selectedProjectId = signal<string>('');
  environments = signal<TestEnvironment[]>([]);
  loading = signal<boolean>(false);

  // Modals
  showCreateModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  editingEnv = signal<TestEnvironment | null>(null);

  // Form Models
  newEnv: CreateTestEnvironmentDto = {
    projectId: '',
    name: '',
    description: '',
    baseUrl: '',
    operatingSystem: 'Ubuntu 22.04 LTS / Windows 11',
    browser: 'Chrome 120+ / Firefox 121+',
    environmentType: 'QA',
    softwareVersion: 'v1.0.0',
    additionalConfig: ''
  };

  editForm: UpdateTestEnvironmentDto = {
    name: '',
    description: '',
    baseUrl: '',
    operatingSystem: '',
    browser: '',
    environmentType: 'QA',
    softwareVersion: '',
    additionalConfig: '',
    isActive: true
  };

  // Metrics Computed
  metrics = computed(() => {
    const list = this.environments();
    const total = list.length;
    const active = list.filter(e => e.isActive).length;
    const types = new Set(list.map(e => e.environmentType)).size;
    return { total, active, types };
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectsService.getProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (projs) => {
          this.projects.set(projs);
          if (projs.length > 0 && !this.selectedProjectId()) {
            this.selectedProjectId.set(projs[0].id);
            this.loadEnvironments();
          }
        },
        error: (err) => console.error('Error cargando proyectos:', err)
      });
  }

  onProjectChange(projectId: string): void {
    this.selectedProjectId.set(projectId);
    this.loadEnvironments();
  }

  loadEnvironments(): void {
    const pid = this.selectedProjectId();
    if (!pid) return;

    this.loading.set(true);
    this.envService.getByProject(pid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.environments.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando entornos de prueba:', err);
          this.loading.set(false);
        }
      });
  }

  openCreateModal(): void {
    this.newEnv = {
      projectId: this.selectedProjectId(),
      name: '',
      description: '',
      baseUrl: '',
      operatingSystem: 'Ubuntu 22.04 LTS / Windows 11',
      browser: 'Chrome 120+ / Firefox 121+',
      environmentType: 'QA',
      softwareVersion: 'v1.0.0',
      additionalConfig: ''
    };
    this.showCreateModal.set(true);
  }

  createEnvironment(): void {
    if (!this.newEnv.name.trim()) {
      Swal.fire('Validación', 'El nombre del entorno es obligatorio.', 'warning');
      return;
    }

    this.newEnv.projectId = this.selectedProjectId();
    this.envService.create(this.newEnv)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showCreateModal.set(false);
          Swal.fire('Creado', 'Entorno de prueba registrado.', 'success');
          this.loadEnvironments();
        },
        error: (err) => Swal.fire('Error', err.error?.message || 'Error al crear entorno.', 'error')
      });
  }

  openEditModal(env: TestEnvironment): void {
    this.editingEnv.set(env);
    this.editForm = {
      name: env.name,
      description: env.description || '',
      baseUrl: env.baseUrl || '',
      operatingSystem: env.operatingSystem || '',
      browser: env.browser || '',
      environmentType: env.environmentType || 'QA',
      softwareVersion: env.softwareVersion || '',
      additionalConfig: env.additionalConfig || '',
      isActive: env.isActive
    };
    this.showEditModal.set(true);
  }

  updateEnvironment(): void {
    const env = this.editingEnv();
    if (!env) return;

    if (!this.editForm.name.trim()) {
      Swal.fire('Validación', 'El nombre del entorno es obligatorio.', 'warning');
      return;
    }

    this.envService.update(env.id, this.editForm)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showEditModal.set(false);
          Swal.fire('Actualizado', 'Entorno de prueba actualizado.', 'success');
          this.loadEnvironments();
        },
        error: (err) => Swal.fire('Error', err.error?.message || 'Error al actualizar.', 'error')
      });
  }

  deleteEnvironment(env: TestEnvironment): void {
    Swal.fire({
      title: `¿Eliminar '${env.name}'?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        this.envService.delete(env.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              Swal.fire('Eliminado', 'Entorno de prueba eliminado.', 'success');
              this.loadEnvironments();
            }
          });
      }
    });
  }

  getEnvTypeBadgeClass(type: string): string {
    switch (type?.toUpperCase()) {
      case 'PRODUCTION': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'STAGING': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'UAT': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'QA': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  }
}
