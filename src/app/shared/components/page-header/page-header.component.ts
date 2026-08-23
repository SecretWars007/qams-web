import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Breadcrumb {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col gap-3 mb-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <!-- Breadcrumb -->
      <nav *ngIf="breadcrumbs?.length" aria-label="Ruta de navegación"
           class="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <ng-container *ngFor="let crumb of breadcrumbs; let last = last">
          <a *ngIf="crumb.route && !last"
             [routerLink]="crumb.route"
             class="hover:text-emerald-400 transition-colors">
            {{ crumb.label }}
          </a>
          <span *ngIf="!crumb.route || last"
                [class.text-slate-200]="last"
                [class.font-semibold]="last">
            {{ crumb.label }}
          </span>
          <i *ngIf="!last" class="fas fa-chevron-right text-[8px] text-emerald-500/40"></i>
        </ng-container>
      </nav>

      <!-- Title Row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <!-- Optional icon slot -->
          <div *ngIf="iconClass"
               class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 shadow-emerald-500/10"
               [ngStyle]="{'background': iconBg || 'linear-gradient(135deg, #10B981 0%, #059669 100%)'}">
            <i [class]="iconClass + ' text-base'"></i>
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-100 tracking-tight leading-tight"
                style="font-family: 'Plus Jakarta Sans', sans-serif;">
              {{ title }}
            </h1>
            <p *ngIf="subtitle" class="text-sm text-slate-400 mt-0.5 font-medium">{{ subtitle }}</p>
          </div>
        </div>

        <!-- Actions slot -->
        <div *ngIf="actionsTemplate" class="flex items-center gap-2 shrink-0">
          <ng-container [ngTemplateOutlet]="actionsTemplate"></ng-container>
        </div>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() breadcrumbs?: Breadcrumb[];
  @Input() iconClass?: string;
  @Input() iconBg?: string;
  @ContentChild('actions') actionsTemplate?: TemplateRef<unknown>;
}
