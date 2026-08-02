import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de carga esqueleto (Skeleton Loader).
 * Reemplaza el spinner genérico en tablas y listas
 * mientras se cargan datos del backend.
 * 
 * Uso:
 *   <app-skeleton-loader [rows]="5" [columns]="4" />
 */
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-pulse space-y-3 p-4" [attr.aria-label]="'Cargando datos...'">
      <ng-container *ngFor="let row of rowArray">
        <div class="flex gap-3 items-center py-3 border-b border-gray-100/50">
          <!-- Color dot -->
          <div class="w-2.5 h-2.5 rounded-full bg-gray-200 shrink-0"></div>
          <!-- Columns -->
          <ng-container *ngFor="let col of columnArray; let i = index">
            <div
              class="h-3 rounded-full bg-gray-200"
              [style.width]="getWidth(i)"
            ></div>
          </ng-container>
          <!-- Action buttons placeholder -->
          <div class="ml-auto flex gap-2 shrink-0">
            <div class="w-7 h-7 rounded-lg bg-gray-200"></div>
            <div class="w-7 h-7 rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class SkeletonLoaderComponent {
  @Input() rows: number = 5;
  @Input() columns: number = 4;

  get rowArray(): number[] {
    return Array(this.rows).fill(0);
  }

  get columnArray(): number[] {
    return Array(this.columns).fill(0);
  }

  getWidth(index: number): string {
    const widths = ['45%', '20%', '15%', '10%', '12%'];
    return widths[index % widths.length];
  }
}
