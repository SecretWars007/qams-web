// src/app/features/reports/rtm-matrix/rtm-matrix.component.ts
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import { RtmService, RtmSummary, RtmItem } from '../../../core/services/rtm.service';
import { ProjectContextService } from '../../../core/services/project-context.service';

@Component({
  selector: 'app-rtm-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rtm-matrix.component.html'
})
export class RtmMatrixComponent {
  private readonly rtmService = inject(RtmService);
  private readonly projectContext = inject(ProjectContextService);
  private readonly destroyRef = inject(DestroyRef);

  rtmSummary = signal<RtmSummary | null>(null);
  loading = signal<boolean>(false);
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
}
