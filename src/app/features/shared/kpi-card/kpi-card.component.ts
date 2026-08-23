import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type KpiVariant = 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';

@Component({
  selector: 'qams-kpi-card',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .kpi-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(31, 38, 135, 0.12);
    }
    .sparkline {
      height: 32px;
      position: relative;
      overflow: hidden;
    }
    .sparkline::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      border-radius: 2px;
      opacity: 0.4;
    }
  `],
  template: `
    <div class="kpi-card rounded-2xl p-5 shadow-sm cursor-default select-none">
      <div class="flex items-start justify-between mb-4">
        <!-- Icon -->
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
             [ngClass]="iconBgClass">
          <i [class]="icon" [ngClass]="iconColorClass"></i>
        </div>
        <!-- Trend chip -->
        <span *ngIf="trend !== undefined"
              class="text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5"
              [ngClass]="trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
          <i [class]="trend >= 0 ? 'fas fa-arrow-trend-up' : 'fas fa-arrow-trend-down'"></i>
          {{ trend >= 0 ? '+' : '' }}{{ trend }}%
        </span>
      </div>

      <!-- Value -->
      <div class="mb-1">
        <span class="text-3xl font-black tracking-tight font-jakarta" [ngClass]="valueColorClass">
          {{ value }}{{ suffix }}
        </span>
      </div>

      <!-- Label -->
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-widest">{{ label }}</p>

      <!-- Mini sparkline (decorative) -->
      <div class="mt-3 sparkline">
        <svg viewBox="0 0 120 32" class="w-full h-full" preserveAspectRatio="none">
          <polyline
            [attr.points]="sparklinePoints"
            fill="none"
            [attr.stroke]="sparklineColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.5"
          />
        </svg>
      </div>
    </div>
  `
})
export class KpiCardComponent {
  @Input() label: string = 'KPI';
  @Input() value: string | number = 0;
  @Input() suffix: string = '';
  @Input() icon: string = 'fas fa-chart-line';
  @Input() variant: KpiVariant = 'indigo';
  @Input() trend?: number;
  /** Comma-separated x,y pairs, e.g. "0,28 20,20 40,24 60,10 80,16 100,5 120,8" */
  @Input() sparklinePoints: string = '0,28 20,20 40,24 60,10 80,16 100,5 120,8';

  private colorMap: Record<KpiVariant, { bg: string; iconColor: string; valueColor: string; stroke: string }> = {
    indigo:  { bg: 'bg-emerald-500/20',  iconColor: 'text-emerald-400',  valueColor: 'text-emerald-300',  stroke: '#4F46E5' },
    emerald: { bg: 'bg-emerald-100', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700', stroke: '#10B981' },
    amber:   { bg: 'bg-amber-100',   iconColor: 'text-amber-600',   valueColor: 'text-amber-700',   stroke: '#F59E0B' },
    rose:    { bg: 'bg-rose-100',    iconColor: 'text-rose-600',    valueColor: 'text-rose-700',    stroke: '#F43F5E' },
    violet:  { bg: 'bg-violet-100',  iconColor: 'text-violet-600',  valueColor: 'text-violet-700',  stroke: '#7C3AED' },
  };

  get iconBgClass(): string  { return this.colorMap[this.variant].bg; }
  get iconColorClass(): string { return this.colorMap[this.variant].iconColor; }
  get valueColorClass(): string { return this.colorMap[this.variant].valueColor; }
  get sparklineColor(): string  { return this.colorMap[this.variant].stroke; }
}
