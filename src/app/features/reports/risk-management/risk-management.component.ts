// src/app/features/reports/risk-management/risk-management.component.ts
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import { ProductRisk } from '../../../core/models/risk.model';
import { ProjectContextService } from '../../../core/services/project-context.service';
import { RiskManagementService } from '../../../core/services/risk-management.service';

@Component({
  selector: 'app-risk-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './risk-management.component.html'
})
export class RiskManagementComponent {
  private readonly projectContext = inject(ProjectContextService);
  private readonly riskService = inject(RiskManagementService);
  private readonly destroyRef = inject(DestroyRef);

  risks = signal<ProductRisk[]>([]);

  constructor() {
    toObservable(this.projectContext.activeProjectId)
      .pipe(
        filter((id): id is string => !!id),
        switchMap(id => this.riskService.getRisksByProject(id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: data => this.risks.set(data),
        error: err => console.error('[RiskManagement] Error cargando riesgos:', err)
      });
  }

  getRiskColor(level: string): string {
    switch (level) {
      case 'Crítico': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Alto': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Medio': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  }

  getHeatmapCount(prob: number, imp: number): number {
    return this.risks().filter(r => r.probability === prob && r.impact === imp).length;
  }
}
