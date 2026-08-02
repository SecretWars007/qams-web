import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TestPlan, TestPlanCriteria } from '../../../core/models/test-plan.model';

@Component({
  selector: 'app-test-plan-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './test-plan-modal.component.html',
  styleUrls: ['./test-plan-modal.component.scss']
})
export class TestPlanModalComponent implements OnInit {
  @Input() plan: TestPlan | null = null;
  @Input() isEdit = false;
  @Input() projectId: string = '';

  @Output() closeModal = new EventEmitter<void>();
  @Output() savePlan = new EventEmitter<any>();

  private readonly fb = inject(FormBuilder);

  activeTab: 'general' | 'strategy' | 'criteria' = 'general';
  form: FormGroup;

  criteriaList: TestPlanCriteria[] = [];

  // Criteria input fields for adding new items
  newEntryDescription = '';
  newExitDescription = '';

  statuses = [
    { id: 1, name: 'DRAFT' },
    { id: 2, name: 'IN_REVIEW' },
    { id: 3, name: 'APPROVED' },
    { id: 4, name: 'ACTIVE' },
    { id: 5, name: 'CLOSED' }
  ];

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      statusId: [1, Validators.required],
      objectives: [''],
      scope: [''],
      outOfScope: [''],
      testStrategy: [''],
      riskAnalysis: [''],
      environmentRequirements: [''],
      testSchedule: [''],
      estimatedEffortHours: [0, [Validators.min(0)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.isEdit && this.plan) {
      this.form.patchValue({
        name: this.plan.name,
        statusId: this.plan.statusId || 1,
        objectives: this.plan.objectives || '',
        scope: this.plan.scope || '',
        outOfScope: this.plan.outOfScope || '',
        testStrategy: this.plan.testStrategy || '',
        riskAnalysis: this.plan.riskAnalysis || '',
        environmentRequirements: this.plan.environmentRequirements || '',
        testSchedule: this.plan.testSchedule || '',
        estimatedEffortHours: this.plan.estimatedEffortHours || 0,
        startDate: this.formatDateForInput(this.plan.startDate),
        endDate: this.formatDateForInput(this.plan.endDate)
      });

      if (this.plan.criteria && this.plan.criteria.length > 0) {
        this.criteriaList = this.plan.criteria.map(c => ({ ...c }));
      }
    } else {
      // Default initial ISTQB template criteria if creating a new plan
      this.criteriaList = [
        { criteriaType: 'ENTRY', description: 'Ambiente de pruebas QA configurado y desplegado con versión candidata', isMet: false },
        { criteriaType: 'ENTRY', description: 'Requisitos aprobados y casos de prueba vinculados', isMet: false },
        { criteriaType: 'EXIT', description: '100% de casos de prueba ejecutados', isMet: false },
        { criteriaType: 'EXIT', description: '0 Defectos Críticos/Altos abiertos', isMet: false }
      ];
    }
  }

  get entryCriteria(): TestPlanCriteria[] {
    return this.criteriaList.filter(c => c.criteriaType === 'ENTRY');
  }

  get exitCriteria(): TestPlanCriteria[] {
    return this.criteriaList.filter(c => c.criteriaType === 'EXIT');
  }

  addEntryCriteria(): void {
    if (!this.newEntryDescription.trim()) return;
    this.criteriaList.push({
      criteriaType: 'ENTRY',
      description: this.newEntryDescription.trim(),
      isMet: false
    });
    this.newEntryDescription = '';
  }

  addExitCriteria(): void {
    if (!this.newExitDescription.trim()) return;
    this.criteriaList.push({
      criteriaType: 'EXIT',
      description: this.newExitDescription.trim(),
      isMet: false
    });
    this.newExitDescription = '';
  }

  removeCriteria(item: TestPlanCriteria): void {
    this.criteriaList = this.criteriaList.filter(c => c !== item);
  }

  toggleCriteriaMet(item: TestPlanCriteria): void {
    item.isMet = !item.isMet;
  }

  private formatDateForInput(dateValue: any): string | null {
    if (!dateValue) return null;
    try {
      const d = new Date(dateValue);
      return d.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;

      const data: any = {
        ...formValue,
        projectId: this.projectId || this.plan?.projectId,
        criteria: this.criteriaList
      };

      if (!data.startDate) delete data.startDate;
      if (!data.endDate) delete data.endDate;

      this.savePlan.emit(data);
    }
  }
}
