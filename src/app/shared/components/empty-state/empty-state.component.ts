import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-500">
      <!-- Illustration -->
      <div class="mb-6 relative">
        <div class="w-28 h-28 rounded-3xl flex items-center justify-center mx-auto shadow-inner"
             [ngStyle]="{'background': iconBg || 'linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)'}">
          <i [class]="icon + ' text-4xl'" [style.color]="iconColor || '#6366f1'"></i>
        </div>
        <!-- Decorative dots -->
        <div class="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-indigo-200 opacity-60"></div>
        <div class="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-emerald-200 opacity-60"></div>
      </div>

      <!-- Text -->
      <h3 class="text-lg font-bold text-slate-700 mb-2" style="font-family: 'Outfit', sans-serif;">
        {{ title }}
      </h3>
      <p class="text-sm text-slate-400 max-w-xs leading-relaxed">{{ message }}</p>

      <!-- Action button -->
      <button
        *ngIf="actionLabel"
        (click)="onAction()"
        class="mt-6 btn-primary px-6 py-2.5 text-sm"
      >
        <i *ngIf="actionIcon" [class]="actionIcon"></i>
        {{ actionLabel }}
      </button>
    </div>
  `,
})
export class EmptyStateComponent {
  /** Ícono FontAwesome, e.g. "fas fa-vials" */
  @Input() icon = 'fas fa-inbox';
  @Input() iconColor?: string;
  @Input() iconBg?: string;
  @Input() title = 'Nada por aquí';
  @Input() message = 'Cuando agregues elementos aparecerán aquí.';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;
  @Input() onAction: () => void = () => {};
}
