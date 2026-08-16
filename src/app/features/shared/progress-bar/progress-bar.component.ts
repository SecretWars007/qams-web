import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ProgressVariant = 'primary' | 'success' | 'warning' | 'danger' | 'gradient';

@Component({
  selector: 'qams-progress-bar',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .bar-fill {
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `],
  template: `
    <div class="w-full">
      <div *ngIf="showLabel" class="flex justify-between items-center mb-1">
        <span *ngIf="label" class="text-xs font-semibold text-slate-600">{{ label }}</span>
        <span class="text-xs font-bold" [ngClass]="textColorClass">{{ value }}%</span>
      </div>
      <div class="w-full rounded-full overflow-hidden" [ngClass]="trackClass" [style.height]="height">
        <div
          class="bar-fill h-full rounded-full"
          [ngClass]="fillClass"
          [style.width]="value + '%'"
        ></div>
      </div>
    </div>
  `
})
export class ProgressBarComponent {
  @Input() value: number = 0;
  @Input() variant: ProgressVariant = 'gradient';
  @Input() label?: string;
  @Input() showLabel: boolean = true;
  @Input() height: string = '6px';

  get trackClass(): string {
    return 'bg-slate-100';
  }

  get fillClass(): string {
    const variantMap: Record<ProgressVariant, string> = {
      primary:  'bg-indigo-500',
      success:  'bg-emerald-500',
      warning:  'bg-amber-400',
      danger:   'bg-rose-500',
      gradient: 'bg-qams-hero',
    };
    return variantMap[this.variant];
  }

  get textColorClass(): string {
    const colorMap: Record<ProgressVariant, string> = {
      primary:  'text-indigo-600',
      success:  'text-emerald-600',
      warning:  'text-amber-600',
      danger:   'text-rose-600',
      gradient: 'text-indigo-600',
    };
    return colorMap[this.variant];
  }
}
