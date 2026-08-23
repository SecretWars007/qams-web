// src/app/features/exploratory/exploratory.component.ts
import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { ExploratoryService } from '../../core/services/exploratory.service';
import { ProjectsService } from '../../core/services/projects.service';
import { Project } from '../../core/models/project.model';
import {
  ExploratorySession,
  ExploratoryFinding,
  CreateExploratorySessionDto,
  CreateExploratoryFindingDto,
  UpdateExploratorySessionDto
} from '../../core/models/exploratory.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-exploratory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exploratory.component.html',
  styleUrls: ['./exploratory.component.scss']
})
export class ExploratoryComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private exploratoryService = inject(ExploratoryService);
  private projectsService = inject(ProjectsService);
  private authService = inject(AuthService);

  // State Signals
  projects = signal<Project[]>([]);
  selectedProjectId = signal<string>('');
  sessions = signal<ExploratorySession[]>([]);
  selectedSession = signal<ExploratorySession | null>(null);
  loading = signal<boolean>(false);

  // Modals
  showCreateModal = signal<boolean>(false);
  showFindingModal = signal<boolean>(false);
  showCompleteModal = signal<boolean>(false);

  // Form Models
  newSession: CreateExploratorySessionDto = {
    projectId: '',
    testerId: '',
    charter: '',
    notes: ''
  };

  newFinding: CreateExploratoryFindingDto = {
    sessionId: '',
    typeId: 1, // 1: Bug, 2: Nota, 3: Pregunta
    description: ''
  };

  completeData: UpdateExploratorySessionDto = {
    notes: '',
    durationMinutes: 60
  };

  // Metrics Computed
  metrics = computed(() => {
    const sList = this.sessions();
    const total = sList.length;
    const completed = sList.filter(s => s.statusId === 3).length;
    const inProgress = sList.filter(s => s.statusId === 2).length;
    const planned = sList.filter(s => s.statusId === 1).length;
    const totalFindings = sList.reduce((acc, s) => acc + (s.findings?.length || 0), 0);
    return { total, completed, inProgress, planned, totalFindings };
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
            this.loadSessions();
          }
        },
        error: (err) => console.error('Error cargando proyectos:', err)
      });
  }

  onProjectChange(projectId: string): void {
    this.selectedProjectId.set(projectId);
    this.selectedSession.set(null);
    this.loadSessions();
  }

  loadSessions(): void {
    const pid = this.selectedProjectId();
    if (!pid) return;

    this.loading.set(true);
    this.exploratoryService.getByProject(pid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.sessions.set(data);
          this.loading.set(false);
          if (this.selectedSession()) {
            const updated = data.find(s => s.id === this.selectedSession()!.id);
            if (updated) this.viewSessionDetail(updated);
          }
        },
        error: (err) => {
          console.error('Error cargando sesiones exploratorias:', err);
          this.loading.set(false);
        }
      });
  }

  viewSessionDetail(session: ExploratorySession): void {
    this.exploratoryService.getById(session.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (full) => this.selectedSession.set(full),
        error: () => this.selectedSession.set(session)
      });
  }

  openCreateModal(): void {
    const currentUser = this.authService.currentUser();
    this.newSession = {
      projectId: this.selectedProjectId(),
      testerId: currentUser?.nameid || currentUser?.sub || '',
      charter: '',
      notes: ''
    };
    this.showCreateModal.set(true);
  }

  createSession(): void {
    if (!this.newSession.charter.trim()) {
      Swal.fire('Validación', 'El Charter (misión de prueba) es obligatorio según ISTQB.', 'warning');
      return;
    }

    this.newSession.projectId = this.selectedProjectId();
    this.exploratoryService.create(this.newSession)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showCreateModal.set(false);
          Swal.fire('Éxito', 'Sesión exploratoria creada correctamente.', 'success');
          this.loadSessions();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.message || 'Error al crear la sesión.', 'error');
        }
      });
  }

  startSession(session: ExploratorySession): void {
    Swal.fire({
      title: '¿Iniciar Sesión?',
      text: `Se iniciará el time-box para: "${session.charter}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, iniciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10B981'
    }).then((result) => {
      if (result.isConfirmed) {
        this.exploratoryService.startSession(session.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              Swal.fire('Iniciada', 'La sesión ha comenzado. Registra tus hallazgos.', 'success');
              this.loadSessions();
            },
            error: (err) => Swal.fire('Error', err.error?.message || 'No se pudo iniciar.', 'error')
          });
      }
    });
  }

  openCompleteModal(session: ExploratorySession): void {
    this.selectedSession.set(session);
    this.completeData = {
      notes: session.notes || '',
      durationMinutes: session.durationMinutes || 60
    };
    this.showCompleteModal.set(true);
  }

  completeSession(): void {
    const session = this.selectedSession();
    if (!session) return;

    this.exploratoryService.completeSession(session.id, this.completeData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showCompleteModal.set(false);
          Swal.fire('Completada', 'Sesión exploratoria cerrada con éxito.', 'success');
          this.loadSessions();
        },
        error: (err) => Swal.fire('Error', err.error?.message || 'Error al completar la sesión.', 'error')
      });
  }

  openFindingModal(session: ExploratorySession): void {
    this.selectedSession.set(session);
    this.newFinding = {
      sessionId: session.id,
      typeId: 1,
      description: ''
    };
    this.showFindingModal.set(true);
  }

  addFinding(): void {
    if (!this.newFinding.description.trim()) {
      Swal.fire('Validación', 'La descripción del hallazgo es obligatoria.', 'warning');
      return;
    }

    this.exploratoryService.addFinding(this.newFinding)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showFindingModal.set(false);
          Swal.fire('Registrado', 'Hallazgo agregado a la sesión.', 'success');
          if (this.selectedSession()) {
            this.viewSessionDetail(this.selectedSession()!);
          }
          this.loadSessions();
        },
        error: (err) => Swal.fire('Error', err.error?.message || 'Error al registrar hallazgo.', 'error')
      });
  }

  deleteFinding(findingId: string): void {
    this.exploratoryService.deleteFinding(findingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.selectedSession()) {
            this.viewSessionDetail(this.selectedSession()!);
          }
          this.loadSessions();
        }
      });
  }

  deleteSession(session: ExploratorySession): void {
    Swal.fire({
      title: '¿Eliminar sesión?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        this.exploratoryService.delete(session.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              Swal.fire('Eliminada', 'Sesión eliminada.', 'success');
              if (this.selectedSession()?.id === session.id) {
                this.selectedSession.set(null);
              }
              this.loadSessions();
            }
          });
      }
    });
  }

  getStatusBadgeClass(statusId: number): string {
    switch (statusId) {
      case 1: return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 2: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse';
      case 3: return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  }

  getFindingTypeBadgeClass(typeId: number): string {
    switch (typeId) {
      case 1: return 'bg-rose-500/10 text-rose-400 border border-rose-500/20'; // Bug
      case 2: return 'bg-sky-500/10 text-sky-400 border border-sky-500/20'; // Nota
      case 3: return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'; // Pregunta
      default: return 'bg-slate-500/10 text-slate-400';
    }
  }
}
