import {
  Component, Input, Output, EventEmitter,
  signal, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

export interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: { value: any; label: string }[];
  placeholder?: string;
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="glass-card p-4 mb-5 animate-in fade-in duration-300"
         [class.hidden]="!isOpen()">
      <!-- Panel header -->
      <div class="flex items-center justify-between mb-4">
        <p class="text-[10px] font-black tracking-widest text-emerald-400/80 uppercase flex items-center gap-2">
          <i class="fas fa-sliders-h text-emerald-400"></i>
          Filtros Avanzados
        </p>
        <div class="flex items-center gap-2">
          <button type="button" *ngIf="hasActiveFilters()"
                  (click)="clearAll()"
                  class="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors flex items-center gap-1">
            <i class="fas fa-times"></i> Limpiar todo
          </button>
        </div>
      </div>

      <!-- Filter fields grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div *ngFor="let field of fields; trackBy: trackField" class="flex flex-col gap-1.5">
          <label [for]="'filter-' + field.key" class="form-label">{{ field.label }}</label>

          <!-- Select -->
          <select *ngIf="field.type === 'select'"
                  [id]="'filter-' + field.key"
                  [ngModel]="values[field.key]"
                  (ngModelChange)="onValueChange(field.key, $event)"
                  class="form-input text-sm">
            <option [value]="null">{{ field.placeholder || 'Todos' }}</option>
            <option *ngFor="let opt of field.options" [value]="opt.value">{{ opt.label }}</option>
          </select>

          <!-- Text -->
          <input *ngIf="field.type === 'text'"
                 type="text"
                 [id]="'filter-' + field.key"
                 [placeholder]="field.placeholder || 'Buscar...'"
                 [ngModel]="values[field.key]"
                 (ngModelChange)="onValueChange(field.key, $event)"
                 class="form-input text-sm" />

          <!-- Date -->
          <input *ngIf="field.type === 'date'"
                 type="date"
                 [id]="'filter-' + field.key"
                 [ngModel]="values[field.key]"
                 (ngModelChange)="onValueChange(field.key, $event)"
                 class="form-input text-sm" />
        </div>
      </div>

      <!-- Active filter chips -->
      <div *ngIf="hasActiveFilters()" class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-emerald-500/10">
        <ng-container *ngFor="let field of fields; trackBy: trackField">
          <span *ngIf="values[field.key] !== null && values[field.key] !== undefined && values[field.key] !== ''"
                class="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full">
            <span class="text-emerald-400/80">{{ field.label }}:</span>
            {{ getDisplayValue(field) }}
            <button type="button" (click)="clearField(field.key)"
                    class="hover:text-emerald-100 transition-colors ml-0.5"
                    [attr.aria-label]="'Eliminar filtro ' + field.label">
              <i class="fas fa-times text-[10px]"></i>
            </button>
          </span>
        </ng-container>
      </div>
    </div>

    <!-- Toggle button -->
    <button
      type="button"
      (click)="toggle()"
      class="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors mb-3 group"
    >
      <div class="w-7 h-7 rounded-lg flex items-center justify-center border border-emerald-500/20 bg-slate-900/60 group-hover:bg-emerald-500/15 group-hover:border-emerald-500/40 transition-all">
        <i class="fas fa-sliders-h text-xs" [class.text-emerald-400]="isOpen()"></i>
      </div>
      {{ isOpen() ? 'Ocultar filtros' : 'Mostrar filtros' }}
      <span *ngIf="hasActiveFilters()"
            class="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
        {{ activeCount() }}
      </span>
    </button>
  `,
})
export class FilterPanelComponent {
  @Input({ required: true }) fields: FilterField[] = [];
  @Input() values: Record<string, any> = {};
  @Output() valuesChange = new EventEmitter<Record<string, any>>();
  @Output() filterChange = new EventEmitter<Record<string, any>>();

  isOpen = signal(false);

  toggle() { this.isOpen.update(v => !v); }

  onValueChange(key: string, value: any) {
    const updated = { ...this.values, [key]: value };
    this.valuesChange.emit(updated);
    this.filterChange.emit(updated);
  }

  clearField(key: string) {
    const updated = { ...this.values, [key]: null };
    this.valuesChange.emit(updated);
    this.filterChange.emit(updated);
  }

  clearAll() {
    const cleared: Record<string, any> = {};
    this.fields.forEach(f => cleared[f.key] = null);
    this.valuesChange.emit(cleared);
    this.filterChange.emit(cleared);
  }

  hasActiveFilters(): boolean {
    return this.fields.some(f =>
      this.values[f.key] !== null && this.values[f.key] !== undefined && this.values[f.key] !== ''
    );
  }

  activeCount(): number {
    return this.fields.filter(f =>
      this.values[f.key] !== null && this.values[f.key] !== undefined && this.values[f.key] !== ''
    ).length;
  }

  getDisplayValue(field: FilterField): string {
    const val = this.values[field.key];
    if (field.type === 'select' && field.options) {
      return field.options.find(o => o.value === val)?.label ?? String(val);
    }
    return String(val);
  }

  trackField(_: number, f: FilterField) { return f.key; }
}
