import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AvatarItem {
  name: string;
  initials?: string;
  color?: string;
  avatarUrl?: string;
}

@Component({
  selector: 'qams-avatar-group',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .avatar-item {
      transition: transform 0.2s ease;
    }
    .avatar-item:hover {
      transform: translateY(-2px);
      z-index: 10;
    }
  `],
  template: `
    <div class="flex items-center" [title]="tooltipText">
      <!-- Avatars (max visible) -->
      <div class="flex -space-x-2">
        <div
          *ngFor="let avatar of visibleAvatars; let i = index"
          class="avatar-item w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm relative"
          [style.background]="avatar.color || defaultColors[i % defaultColors.length]"
          [title]="avatar.name"
        >
          <img *ngIf="avatar.avatarUrl" [src]="avatar.avatarUrl" [alt]="avatar.name"
               class="w-full h-full rounded-full object-cover">
          <span *ngIf="!avatar.avatarUrl">{{ avatar.initials || avatar.name.substring(0,2).toUpperCase() }}</span>
        </div>
      </div>

      <!-- Overflow count -->
      <div *ngIf="overflowCount > 0"
           class="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[9px] font-black text-slate-600 -ml-2 shadow-sm">
        +{{ overflowCount }}
      </div>

      <!-- Label -->
      <span *ngIf="showLabel && avatars.length > 0" class="ml-2 text-xs font-medium text-slate-500">
        {{ avatars.length }} {{ avatars.length === 1 ? 'tester' : 'testers' }}
      </span>
      <span *ngIf="showLabel && avatars.length === 0" class="text-xs text-slate-400 italic">Sin asignar</span>
    </div>
  `
})
export class AvatarGroupComponent {
  @Input() avatars: AvatarItem[] = [];
  @Input() max: number = 3;
  @Input() showLabel: boolean = true;

  defaultColors = ['#4F46E5', '#10B981', '#F59E0B', '#7C3AED', '#F43F5E', '#0EA5E9'];

  get visibleAvatars(): AvatarItem[] {
    return this.avatars.slice(0, this.max);
  }

  get overflowCount(): number {
    return Math.max(0, this.avatars.length - this.max);
  }

  get tooltipText(): string {
    return this.avatars.map(a => a.name).join(', ');
  }
}
