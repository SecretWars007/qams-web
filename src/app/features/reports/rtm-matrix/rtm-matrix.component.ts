import { Component, DestroyRef, inject, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import { RtmService, RtmSummary, RtmItem } from '../../../core/services/rtm.service';
import { ReportsService } from '../../../core/services/reports.service';
import { ProjectContextService } from '../../../core/services/project-context.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rtm-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rtm-matrix.component.html'
})
export class RtmMatrixComponent {
  private readonly rtmService = inject(RtmService);
  private readonly reportsService = inject(ReportsService);
  private readonly projectContext = inject(ProjectContextService);
  private readonly destroyRef = inject(DestroyRef);

  rtmSummary = signal<RtmSummary | null>(null);
  loading = signal<boolean>(false);
  exporting = signal<boolean>(false);
  searchTerm = signal<string>('');


  constructor() {
    toObservable(this.projectContext.activeProjectId)
      .pipe(
        filter((id): id is string => !!id),
        switchMap(id => {
          this.loading.set(true);
          return this.rtmService.getRtmMatrix(id);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: summary => {
          this.rtmSummary.set(summary);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  get filteredItems(): RtmItem[] {
    const summary = this.rtmSummary();
    if (!summary) return [];
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return summary.items;
    return summary.items.filter(item =>
      item.requirementCode.toLowerCase().includes(term) ||
      item.requirementTitle.toLowerCase().includes(term) ||
      (item.testCaseCode?.toLowerCase().includes(term)) ||
      (item.defectTitle?.toLowerCase().includes(term))
    );
  }

  exportRtm(): void {
    const projectId = this.projectContext.activeProjectId();
    if (!projectId) return;

    this.exporting.set(true);
    this.reportsService.generateComplianceReport(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          this.exporting.set(false);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Matriz_Trazabilidad_RTM_${projectId.substring(0,8)}_${new Date().toISOString().slice(0, 10)}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          Swal.fire({
            icon: 'success',
            title: 'Exportación Exitosa',
            text: 'La Matriz de Trazabilidad RTM se ha descargado correctamente.',
            confirmButtonColor: '#10B981'
          });
        },
        error: (err) => {
          this.exporting.set(false);
          console.error('[RtmMatrix] Error al exportar RTM:', err);
          Swal.fire('Error', 'No se pudo generar ni exportar la Matriz de Trazabilidad RTM.', 'error');
        }
      });
  }
}

