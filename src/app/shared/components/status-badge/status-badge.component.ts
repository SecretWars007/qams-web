import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeType = 'success' | 'danger' | 'warning' | 'info' | 'gray' | 'primary' | 'violet';

const BADGE_CLASSES: Record<BadgeType, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  danger:  'bg-rose-500/15 text-rose-400 border-rose-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  info:    'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  gray:    'bg-slate-800 text-slate-400 border-slate-700',
  primary: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
  violet:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase border shadow-sm"
      [class]="badgeClasses"
    >
      <span *ngIf="dot" class="w-1.5 h-1.5 rounded-full" [class]="dotClass"></span>
      {{ label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) type!: BadgeType;
  @Input({ required: true }) label!: string;
  /** Mostrar punto de estado a la izquierda */
  @Input() dot = false;

  get badgeClasses(): string {
    return BADGE_CLASSES[this.type] ?? BADGE_CLASSES['gray'];
  }

  get dotClass(): string {
    const dotColors: Record<BadgeType, string> = {
      success: 'bg-emerald-400',
      danger:  'bg-rose-400',
      warning: 'bg-amber-400',
      info:    'bg-emerald-400',
      gray:    'bg-slate-400',
      primary: 'bg-emerald-400',
      violet:  'bg-emerald-400',
    };
    return dotColors[this.type] ?? 'bg-slate-400';
  }
}
