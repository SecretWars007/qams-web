import {
  Component, EventEmitter, Input, Output, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <!-- Backdrop -->
      <div
        class="modal-backdrop"
        (click)="onCancel()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title"
      >
        <div
          class="bg-white rounded-2xl shadow-[0_25px_70px_-10px_rgba(0,0,0,0.3)] w-full max-w-md mx-4 p-7 animate-in fade-in zoom-in-95 duration-200"
          (click)="$event.stopPropagation()"
        >
          <!-- Icon -->
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                 [class]="iconBgClass">
              <i [class]="iconClass + ' text-xl'"></i>
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-900" style="font-family: 'Outfit', sans-serif;">
                {{ title }}
              </h2>
              <p *ngIf="message" class="text-sm text-slate-500 mt-0.5">{{ message }}</p>
            </div>
          </div>

          <!-- Warning detail -->
          <div *ngIf="detail"
               class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-xs text-amber-700 font-medium flex items-start gap-2">
            <i class="fas fa-exclamation-triangle mt-0.5 shrink-0"></i>
            <span>{{ detail }}</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="onCancel()"
              class="btn-secondary px-5 py-2"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              (click)="onConfirm()"
              [class]="confirmBtnClass"
            >
              <i *ngIf="confirmIcon" [class]="confirmIcon"></i>
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() title = '¿Estás seguro?';
  @Input() message?: string;
  @Input() detail?: string;
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';
  @Input() confirmIcon?: string;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isOpen = signal(false);

  open() { this.isOpen.set(true); }
  close() { this.isOpen.set(false); }

  onConfirm() {
    this.confirmed.emit();
    this.close();
  }

  onCancel() {
    this.cancelled.emit();
    this.close();
  }

  get iconClass(): string {
    const icons = { danger: 'fas fa-trash-alt text-rose-500', warning: 'fas fa-exclamation-triangle text-amber-500', info: 'fas fa-info-circle text-sky-500' };
    return icons[this.type];
  }

  get iconBgClass(): string {
    const bgs = { danger: 'bg-rose-100', warning: 'bg-amber-100', info: 'bg-sky-100' };
    return bgs[this.type];
  }

  get confirmBtnClass(): string {
    const classes = { danger: 'btn-danger px-5 py-2', warning: 'btn-warning px-5 py-2', info: 'btn-info px-5 py-2' };
    return classes[this.type];
  }
}
