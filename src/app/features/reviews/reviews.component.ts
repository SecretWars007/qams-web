// src/app/features/reviews/reviews.component.ts
import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { ReviewService } from '../../core/services/review.service';
import { ProjectsService } from '../../core/services/projects.service';
import { Project } from '../../core/models/project.model';
import {
  ReviewSession,
  ReviewFinding,
  CreateReviewSessionDto,
  CreateReviewFindingDto
} from '../../core/models/review.model';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private reviewService = inject(ReviewService);
  private projectsService = inject(ProjectsService);

  // State Signals
  projects = signal<Project[]>([]);
  selectedProjectId = signal<string>('');
  sessions = signal<ReviewSession[]>([]);
  selectedSession = signal<ReviewSession | null>(null);
  loading = signal<boolean>(false);

  // Modals
  showCreateModal = signal<boolean>(false);
  showFindingModal = signal<boolean>(false);
  showCompleteModal = signal<boolean>(false);

  // Form Models
  newSession: CreateReviewSessionDto = {
    projectId: '',
    title: '',
    description: '',
    artifactUnderReview: '',
    reviewTypeId: 2, // Default: Walkthrough
    entryCriteria: 'Especificación de requerimientos aprobada y disponible.',
    exitCriteria: 'Sin hallazgos bloqueantes o mayores abiertos.'
  };

  newFinding: CreateReviewFindingDto = {
    reviewSessionId: '',
    description: '',
    location: '',
    findingTypeId: 1, // Defecto
    severityId: 2     // Mayor
  };

  completeData = {
    conclusions: '',
    exitCriteria: 'Criterios de salida ISTQB satisfechos.'
  };

  // Metrics Computed
  metrics = computed(() => {
    const sList = this.sessions();
    const total = sList.length;
    const completed = sList.filter(s => s.statusCode === 'COMPLETED').length;
    const inProgress = sList.filter(s => s.statusCode === 'IN_PROGRESS').length;
    const totalFindings = sList.reduce((acc, s) => acc + (s.findings?.length || 0), 0);
    return { total, completed, inProgress, totalFindings };
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectsService.getProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.projects.set(data);
          if (data.length > 0) {
            this.selectedProjectId.set(data[0].id);
            this.loadSessions();
          }
        },
        error: (err) => console.error('Error cargando proyectos:', err)
      });
  }

  onProjectChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedProjectId.set(val);
    this.selectedSession.set(null);
    if (val) this.loadSessions();
    else this.sessions.set([]);
  }

  loadSessions(): void {
    const pId = this.selectedProjectId();
    if (!pId) return;

    this.loading.set(true);
    this.reviewService.getByProject(pId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.sessions.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando revisiones:', err);
          this.loading.set(false);
        }
      });
  }

  selectSession(session: ReviewSession): void {
    this.reviewService.getById(session.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (fullSession) => this.selectedSession.set(fullSession),
        error: (err) => console.error('Error obteniendo detalle de revisión:', err)
      });
  }

  openCreateModal(): void {
    this.newSession.projectId = this.selectedProjectId();
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  createSession(): void {
    if (!this.newSession.title || !this.newSession.projectId) {
      Swal.fire('Atención', 'El título de la sesión es obligatorio.', 'warning');
      return;
    }

    this.reviewService.create(this.newSession)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          Swal.fire('Éxito', 'Sesión de revisión programada correctamente.', 'success');
          this.closeCreateModal();
          this.loadSessions();
          this.selectSession(created);
        },
        error: (err) => Swal.fire('Error', 'No se pudo crear la sesión.', 'error')
      });
  }

  startSession(session: ReviewSession): void {
    this.reviewService.startSession(session.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          Swal.fire('Iniciada', 'La sesión de revisión está en progreso.', 'info');
          this.loadSessions();
          this.selectSession(updated);
        },
        error: (err) => Swal.fire('Error', 'No se pudo iniciar la sesión.', 'error')
      });
  }

  openCompleteModal(session: ReviewSession): void {
    this.selectedSession.set(session);
    this.completeData.conclusions = 'Revisión finalizada sin bloqueantes.';
    this.showCompleteModal.set(true);
  }

  closeCompleteModal(): void {
    this.showCompleteModal.set(false);
  }

  completeSession(): void {
    const s = this.selectedSession();
    if (!s) return;

    this.reviewService.completeSession(s.id, this.completeData.conclusions, this.completeData.exitCriteria)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          Swal.fire('Completada', 'Sesión de revisión finalizada con éxito.', 'success');
          this.closeCompleteModal();
          this.loadSessions();
          this.selectSession(updated);
        },
        error: (err) => Swal.fire('Error', 'No se pudo completar la sesión.', 'error')
      });
  }

  openFindingModal(): void {
    const s = this.selectedSession();
    if (!s) return;
    this.newFinding.reviewSessionId = s.id;
    this.newFinding.description = '';
    this.newFinding.location = '';
    this.showFindingModal.set(true);
  }

  closeFindingModal(): void {
    this.showFindingModal.set(false);
  }

  addFinding(): void {
    if (!this.newFinding.description) {
      Swal.fire('Atención', 'La descripción del hallazgo es obligatoria.', 'warning');
      return;
    }

    this.reviewService.addFinding(this.newFinding)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          Swal.fire('Hallazgo Registrado', 'Se ha agregado el hallazgo a la revisión.', 'success');
          this.closeFindingModal();
          const s = this.selectedSession();
          if (s) this.selectSession(s);
        },
        error: (err) => Swal.fire('Error', 'No se pudo registrar el hallazgo.', 'error')
      });
  }

  resolveFinding(finding: ReviewFinding): void {
    this.reviewService.updateFinding(finding.id, { isResolved: true, resolution: 'Corregido en la documentación.' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const s = this.selectedSession();
          if (s) this.selectSession(s);
        }
      });
  }

  getReviewStatusClass(statusCode: string): string {
    switch (statusCode) {
      case 'PLANNED':     return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'COMPLETED':   return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELLED':   return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:            return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  getSeverityClass(severityCode: string): string {
    switch (severityCode) {
      case 'BLOCKER':
      case 'MAJOR':   return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'MINOR':   return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }
}
