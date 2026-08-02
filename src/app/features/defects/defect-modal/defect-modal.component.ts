import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Defect } from '../../../core/models/defect.model';

@Component({
  selector: 'app-defect-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './defect-modal.component.html',
  styleUrls: ['./defect-modal.component.scss']
})
export class DefectModalComponent implements OnInit {
  @Input() defect: Defect | null = null;
  @Input() isEdit = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  private readonly fb = inject(FormBuilder);
  
  form: FormGroup;
  
  statuses = [
    { id: 1, name: 'NEW' }, { id: 2, name: 'IN_PROGRESS' }, { id: 3, name: 'RESOLVED' }, { id: 4, name: 'CLOSED' }
  ];
  priorities = [
    { id: 1, name: 'LOW' }, { id: 2, name: 'MEDIUM' }, { id: 3, name: 'HIGH' }, { id: 4, name: 'CRITICAL' }
  ];
  severities = [
    { id: 1, name: 'MINOR' }, { id: 2, name: 'MAJOR' }, { id: 3, name: 'CRITICAL' }, { id: 4, name: 'BLOCKER' }
  ];

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      statusId: [1, Validators.required],
      priorityId: [2, Validators.required],
      severityId: [2, Validators.required],
      testCaseId: [null],
      stepsToReproduce: ['']
    });
  }

  ngOnInit(): void {
    if (this.isEdit && this.defect) {
      this.form.patchValue({
        title: this.defect.title,
        description: this.defect.description,
        statusId: this.defect.statusId || 1,
        priorityId: this.defect.priorityId || 2,
        severityId: this.defect.severityId || 2,
        testCaseId: this.defect.testCaseId,
        stepsToReproduce: this.defect.stepsToReproduce || ''
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const data = { 
        ...this.form.value 
      };
      this.save.emit(data);
    }
  }
}
