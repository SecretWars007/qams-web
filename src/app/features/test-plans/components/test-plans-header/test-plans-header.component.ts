import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../../../core/models/project.model';
import { SystemUnderTest } from '../../../../core/models/system-under-test.model';

@Component({
  selector: 'app-test-plans-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-plans-header.component.html'
})
export class TestPlansHeaderComponent {
  @Input() projects: Project[] = [];
  @Input() suts: SystemUnderTest[] = [];
  @Input() activeProjectId: string | null = null;
  @Input() activeSutId: string | null = null;
  @Input() activeProject: Project | null = null;
  @Input() searchTerm: string = '';

  @Output() sutSelect = new EventEmitter<string>();
  @Output() projectSelect = new EventEmitter<string>();
  @Output() createPlan = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();

  onSutChange(value: string): void {
    this.sutSelect.emit(value);
  }

  onProjectChange(value: string): void {
    this.projectSelect.emit(value);
  }

  onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  onCreateClick(): void {
    this.createPlan.emit();
  }
}
