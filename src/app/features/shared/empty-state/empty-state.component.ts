import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'qams-empty-state',
  standalone: true,
  imports: [CommonModule],
  styles: [],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in duration-500">
      <!-- Illustration container -->
      <div class="relative mb-6">
        <div class="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-sm"
             [ngClass]="iconBgClass">
          <i [class]="icon"></i>
        </div>
        <!-- Decorative dots -->
        <div class="absolute -top-2 -right-2 w-5 h-5 rounded-full opacity-40" [ngClass]="dotClass"></div>
        <div class="absolute -bottom-1 -left-2 w-3 h-3 rounded-full opacity-30" [ngClass]="dotClass"></div>
      </div>

      <h3 class="text-lg font-bold text-slate-800 mb-2 font-jakarta">{{ title }}</h3>
      <p class="text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">{{ description }}</p>

      <ng-content></ng-content>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon: string = 'fas fa-inbox';
  @Input() title: string = 'Sin resultados';
  @Input() description: string = 'No hay elementos para mostrar.';
  @Input() variant: 'indigo' | 'emerald' | 'amber' | 'rose' = 'indigo';

  get iconBgClass(): string {
    const map: Record<string, string> = {
      indigo:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      emerald: 'bg-emerald-50 text-emerald-400 border border-emerald-100',
      amber:   'bg-amber-50 text-amber-400 border border-amber-100',
      rose:    'bg-rose-50 text-rose-400 border border-rose-100',
    };
    return map[this.variant];
  }

  get dotClass(): string {
    const map: Record<string, string> = {
      indigo:  'bg-indigo-300',
      emerald: 'bg-emerald-300',
      amber:   'bg-amber-300',
      rose:    'bg-rose-300',
    };
    return map[this.variant];
  }
}
