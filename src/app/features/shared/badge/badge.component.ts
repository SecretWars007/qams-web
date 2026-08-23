import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'violet' | 'gray' | 'primary';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'qams-badge',
  standalone: true,
  imports: [CommonModule],
  styles: [],
  template: `
    <span [ngClass]="classes" class="inline-flex items-center gap-1 font-bold tracking-wide uppercase rounded-full">
      <i *ngIf="icon" [class]="icon"></i>
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'gray';
  @Input() size: BadgeSize = 'md';
  @Input() icon?: string;

  get classes(): string[] {
    const sizeMap: Record<BadgeSize, string> = {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    };
    const variantMap: Record<BadgeVariant, string> = {
      success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      danger:  'bg-rose-100 text-rose-700 border border-rose-200',
      warning: 'bg-amber-100 text-amber-700 border border-amber-200',
      info:    'bg-sky-100 text-sky-700 border border-sky-200',
      violet:  'bg-violet-100 text-violet-700 border border-violet-200',
      gray:    'bg-slate-100 text-slate-600 border border-slate-200',
      primary: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    };
    return [sizeMap[this.size], variantMap[this.variant]];
  }
}
