// src/app/features/reports/quality-gate-widget/quality-gate-widget.component.ts
import { Component, Input, OnChanges, SimpleChanges, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectMetricsService } from '../../../core/services/project-metrics.service';
import { IstqbMetricsDto } from '../../../core/dto/dashboard.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

export interface QualityGateRule {
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  kpi?: string;
}

@Component({
  selector: 'app-quality-gate-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quality-gate-widget.component.html'
})
export class QualityGateWidgetComponent implements OnChanges {
  @Input() projectId: string = '';

  private readonly destroyRef = inject(DestroyRef);
  private readonly projectMetricsService = inject(ProjectMetricsService);

  isPassed = signal<boolean>(false);
  loading = signal<boolean>(false);
  rules = signal<QualityGateRule[]>([]);
  metrics = signal<IstqbMetricsDto | null>(null);

  ddp = signal<number>(0);
  dre = signal<number>(0);
  mttrHours = signal<number>(0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.evaluateQualityGate();
    } else if (!this.projectId) {
      this.rules.set([]);
      this.isPassed.set(false);
      this.metrics.set(null);
    }
  }

  evaluateQualityGate(): void {
    this.loading.set(true);

    this.projectMetricsService.loadMetrics(this.projectId).pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (m) => {
        if (!m) {
          this.rules.set([]);
          this.isPassed.set(false);
          return;
        }

        this.metrics.set(m);
        this.ddp.set(m.ddp);
        this.dre.set(m.dre);
        this.mttrHours.set(m.mttrHours);

        const sutLinked = !m.qualityGateFailures.some(f => f.includes('SUT'));
        const sutActual = m.requireSutLinked ? (sutLinked ? 'Vinculado' : 'Sin vincular') : 'No requerido';

        const rulesList: QualityGateRule[] = [
          {
            name: 'Cobertura de Requisitos por Pruebas',
            kpi: 'REQ-COV',
            expected: `>= ${m.minRequirementCoverage.toFixed(0)}%`,
            actual: `${m.requirementCoverageRate.toFixed(1)}%`,
            passed: m.requirementCoverageRate >= m.minRequirementCoverage
          },
          {
            name: 'Tasa de Casos de Prueba Exitosos (Pass Rate)',
            kpi: 'PASS-RATE',
            expected: `>= ${m.minPassRate.toFixed(0)}%`,
            actual: `${m.passRate.toFixed(1)}%`,
            passed: m.passRate >= m.minPassRate
          },
          {
            name: 'Defectos Abiertos',
            kpi: 'OPEN-DEF',
            expected: `<= ${m.maxOpenDefects} defecto${m.maxOpenDefects !== 1 ? 's' : ''}`,
            actual: `${m.openDefects} defecto${m.openDefects !== 1 ? 's' : ''}`,
            passed: m.openDefects <= m.maxOpenDefects
          },
          {
            name: 'Trazabilidad SUT (Sistema Bajo Prueba)',
            kpi: 'SUT-LINK',
            expected: m.requireSutLinked ? 'Requerido' : 'Opcional',
            actual: sutActual,
            passed: !m.requireSutLinked || sutLinked
          }
        ];

        this.rules.set(rulesList);
        this.isPassed.set(m.qualityGatePassed);
      },
      error: (err) => {
        console.error('Error evaluating Quality Gate (ISTQB metrics)', err);
        this.rules.set([]);
        this.isPassed.set(false);
      }
    });
  }
}
