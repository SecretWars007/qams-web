import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DefectsService } from '../../core/services/defects.service';
import { Defect } from '../../core/models/defect.model';
import { DefectModalComponent } from './defect-modal/defect-modal.component';
import { ProjectContextService } from '../../core/services/project-context.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader/skeleton-loader.component';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-defects',
  standalone: true,
  imports: [CommonModule, FormsModule, DefectModalComponent, SkeletonLoaderComponent],
  templateUrl: './defects.component.html',
  styleUrls: ['./defects.component.scss']
})
export class DefectsComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
  private readonly defectsService = inject(DefectsService);
  private readonly projectContextService = inject(ProjectContextService);

  defects = signal<Defect[]>([]);
  loading = signal<boolean>(false);
  
  showModal = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  selectedDefect = signal<Defect | null>(null);

  get currentProjectId(): string | null {
    return this.projectContextService.activeProjectId();
  }

  // Available filters
  statusFilter = signal<string>('ALL');

  filterChips = [
    { label: 'Todos', value: 'ALL' },
    { label: 'Nuevos', value: 'NEW' },
    { label: 'En Progreso', value: 'IN_PROGRESS' },
    { label: 'Resueltos', value: 'RESOLVED' },
    { label: 'Cerrados', value: 'CLOSED' }
  ];

  ngOnInit(): void {
    this.loadDefects();
  }

  loadDefects(): void {
    const projectId = this.currentProjectId;
    if (!projectId) return;

    this.loading.set(true);
    this.defectsService.getByProject(projectId).pipe(
      finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data: any[]) => {
        const filter = this.statusFilter();
        if (filter !== 'ALL') {
          this.defects.set(data.filter((d: any) => d.statusName === filter));
        } else {
          this.defects.set(data);
        }
      },
      error: () => {
        Swal.fire('Error', 'Error al cargar los defectos', 'error');
      }
    });
  }

  onFilterChange(status: string): void {
    this.statusFilter.set(status);
    this.loadDefects();
  }

  openCreateModal(): void {
    this.isEdit.set(false);
    this.selectedDefect.set(null);
    this.showModal.set(true);
  }

  openEditModal(defect: Defect): void {
    this.isEdit.set(true);
    this.selectedDefect.set(defect);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSave(eventData: { defect: any; file: File | null }): void {
    const projectId = this.currentProjectId;
    if (!projectId) return;

    const { defect, file } = eventData;
    defect.projectId = projectId;

    const request$ = this.isEdit() && this.selectedDefect()
      ? this.defectsService.update(projectId, this.selectedDefect()!.id, defect)
      : this.defectsService.create(projectId, defect);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (savedDefect) => {
        if (file && savedDefect?.id) {
          this.defectsService.uploadAttachment(projectId, savedDefect.id, file).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => this.handleSaveSuccess(),
            error: (err) => {
              console.error('[DefectsComponent] Error subiendo evidencia de defecto:', err);
              this.handleSaveSuccess();
            }
          });
        } else {
          this.handleSaveSuccess();
        }
      },
      error: () => {
        Swal.fire('Error', 'Error al guardar el defecto', 'error');
      }
    });
  }

  private handleSaveSuccess(): void {
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: `Defecto ${this.isEdit() ? 'actualizado' : 'creado'} correctamente`,
      confirmButtonColor: '#150fbd'
    });
    this.closeModal();
    this.loadDefects();
  }

  deleteDefect(defect: Defect): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el defecto "${defect.title}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#a0aec0',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        const projectId = this.currentProjectId;
        if (!projectId) return;

        this.defectsService.delete(projectId, defect.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Defecto eliminado', 'success');
            this.loadDefects();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el defecto', 'error');
          }
        });
      }
    });
  }

  getPriorityColor(priority: string): string {
    switch(priority.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getStatusColor(status: string): string {
    switch(status.toUpperCase()) {
      case 'NEW': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'IN_PROGRESS': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-100';
      case 'CLOSED': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getDaysOpen(createdAt: string | Date | undefined): number {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  copyToClipboard(text: string, event: Event): void {
    event.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'ID copiado al portapapeles',
        showConfirmButton: false,
        timer: 2000
      });
    });
  }
}
