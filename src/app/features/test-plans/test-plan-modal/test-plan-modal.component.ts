import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TestPlan, TestPlanCriteria } from '../../../core/models/test-plan.model';
import { CatalogsService } from '../../../core/services/catalogs.service';
import { UsersService } from '../../../core/services/users.service';

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
  @Input() projects: any[] = []; // Add projects input

  @Output() closeModal = new EventEmitter<void>();
  @Output() savePlan = new EventEmitter<any>();

  private readonly fb = inject(FormBuilder);
  private readonly catalogsService = inject(CatalogsService);
  private readonly usersService = inject(UsersService);

  activeTab: 'general' | 'strategy' | 'criteria' = 'general';
  form: FormGroup;

  criteriaList: TestPlanCriteria[] = [];
  milestoneList: any[] = [];
  riskList: any[] = [];

  testStrategies: any[] = [];
  riskLevels: any[] = [];
  environments: any[] = [];
  testPlanTypes: any[] = [];
  testLevels: any[] = [];
  testManagers: any[] = [];

  // Criteria input fields for adding new items
  newEntryDescription = '';
  newExitDescription = '';
  newEntryPriority = 'MEDIUM';
  newExitPriority = 'MEDIUM';
  newEntryCategory = 'GENERAL';
  newExitCategory = 'GENERAL';

  // Milestone input fields
  newMilestoneName = '';
  newMilestoneTargetDate = '';
  newMilestoneDescription = '';

  // Risk input fields
  newRiskDescription = '';
  newRiskLikelihood = 'MEDIUM';
  newRiskImpact = 'MEDIUM';
  newRiskMitigation = '';

  statuses = [
    { id: 1, name: 'Borrador' },
    { id: 2, name: 'En Revisión' },
    { id: 3, name: 'Aprobado' },
    { id: 4, name: 'Activo' },
    { id: 5, name: 'Cerrado' }
  ];

  constructor() {
    this.form = this.fb.group({
      projectId: [this.projectId || '', Validators.required],
      name: ['', [Validators.required, Validators.minLength(5)]],
      statusId: [1, Validators.required],
      objectives: [''],
      scope: [''],
      outOfScope: [''],
      testStrategyId: [null],
      testPlanTypeId: [null],
      testLevelId: [null],
      testManagerId: [null],
      riskLevelId: [null],
      testEnvironmentId: [null],
      testSchedule: [''],
      estimatedEffortHours: [0, [Validators.min(0)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCatalogs();

    if (this.isEdit && this.plan) {
      this.form.patchValue({
        projectId: this.plan.projectId || '',
        name: this.plan.name,
        statusId: this.plan.statusId || 1,
        objectives: this.plan.objectives || '',
        scope: this.plan.scope || '',
        outOfScope: this.plan.outOfScope || '',
        testStrategyId: this.plan.testStrategyId || null,
        testPlanTypeId: this.plan.testPlanTypeId || null,
        testLevelId: this.plan.testLevelId || null,
        testManagerId: this.plan.testManagerId || null,
        riskLevelId: this.plan.riskLevelId || null,
        testEnvironmentId: this.plan.testEnvironmentId || null,
        testSchedule: this.plan.testSchedule || '',
        estimatedEffortHours: this.plan.estimatedEffortHours || 0,
        startDate: this.formatDateForInput(this.plan.startDate),
        endDate: this.formatDateForInput(this.plan.endDate)
      });

      if (this.plan.criteria && this.plan.criteria.length > 0) {
        this.criteriaList = this.plan.criteria.map(c => ({ ...c }));
      }
      if (this.plan.milestones && this.plan.milestones.length > 0) {
        this.milestoneList = this.plan.milestones.map((m: any) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          // Backend devuelve 'dueDate', frontend usa 'targetDate'
          targetDate: this.formatDateForInput(m.dueDate || m.targetDate),
          isCompleted: m.isCompleted || false
        }));
      }
      if (this.plan.risks && this.plan.risks.length > 0) {
        this.riskList = this.plan.risks.map((r: any) => ({
          id: r.id,
          description: r.description,
          // Backend devuelve probability/impact como int, frontend los usa como string
          likelihood: this.mapIntToLikelihood(r.probability ?? r.likelihood),
          impact: this.mapIntToLikelihood(r.impact),
          mitigationStrategy: r.mitigation || r.mitigationStrategy || ''
        }));
      }
    } else {
      if (this.projectId) {
        this.form.patchValue({ projectId: this.projectId });
      }
      // Default initial ISTQB template criteria if creating a new plan
      this.criteriaList = [
        { criteriaType: 'ENTRY', description: 'Ambiente de pruebas QA configurado y desplegado con versión candidata', isMet: false, priority: 'HIGH', category: 'ENVIRONMENT' },
        { criteriaType: 'ENTRY', description: 'Requisitos aprobados y casos de prueba vinculados', isMet: false, priority: 'HIGH', category: 'REQUIREMENTS' },
        { criteriaType: 'EXIT', description: '100% de casos de prueba ejecutados', isMet: false, priority: 'HIGH', category: 'COMPLETION' },
        { criteriaType: 'EXIT', description: '0 Defectos Críticos/Altos abiertos', isMet: false, priority: 'CRITICAL', category: 'DEFECTS' }
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
      isMet: false,
      priority: this.newEntryPriority,
      category: this.newEntryCategory
    });
    this.newEntryDescription = '';
  }

  addExitCriteria(): void {
    if (!this.newExitDescription.trim()) return;
    this.criteriaList.push({
      criteriaType: 'EXIT',
      description: this.newExitDescription.trim(),
      isMet: false,
      priority: this.newExitPriority,
      category: this.newExitCategory
    });
    this.newExitDescription = '';
  }

  removeCriteria(item: TestPlanCriteria): void {
    this.criteriaList = this.criteriaList.filter(c => c !== item);
  }

  toggleCriteriaMet(item: TestPlanCriteria): void {
    item.isMet = !item.isMet;
  }

  addMilestone(): void {
    if (!this.newMilestoneName.trim() || !this.newMilestoneTargetDate) return;
    this.milestoneList.push({
      name: this.newMilestoneName.trim(),
      description: this.newMilestoneDescription.trim(),
      targetDate: this.newMilestoneTargetDate,
      isCompleted: false
    });
    this.newMilestoneName = '';
    this.newMilestoneDescription = '';
    this.newMilestoneTargetDate = '';
  }

  removeMilestone(item: any): void {
    this.milestoneList = this.milestoneList.filter(m => m !== item);
  }

  toggleMilestoneCompleted(item: any): void {
    item.isCompleted = !item.isCompleted;
  }

  addRisk(): void {
    if (!this.newRiskDescription.trim()) return;
    this.riskList.push({
      description: this.newRiskDescription.trim(),
      likelihood: this.newRiskLikelihood,
      impact: this.newRiskImpact,
      mitigationStrategy: this.newRiskMitigation.trim()
    });
    this.newRiskDescription = '';
    this.newRiskLikelihood = 'MEDIUM';
    this.newRiskImpact = 'MEDIUM';
    this.newRiskMitigation = '';
  }

  removeRisk(item: any): void {
    this.riskList = this.riskList.filter(r => r !== item);
  }

  loadCatalogs(): void {
    this.catalogsService.getActive('TestStrategy').subscribe({
      next: (data) => this.testStrategies = data,
      error: (err) => console.error('Error fetching test strategies', err)
    });
    this.catalogsService.getActive('TestPlanType').subscribe({
      next: (data) => this.testPlanTypes = data,
      error: (err) => console.error('Error fetching test plan types', err)
    });
    this.catalogsService.getActive('TestLevel').subscribe({
      next: (data) => this.testLevels = data,
      error: (err) => console.error('Error fetching test levels', err)
    });
    this.catalogsService.getActive('RiskLevel').subscribe({
      next: (data) => this.riskLevels = data,
      error: (err) => console.error('Error fetching risk levels', err)
    });
    this.catalogsService.getActive('TestEnvironment').subscribe({
      next: (data) => this.environments = data,
      error: (err) => console.error('Error fetching environments', err)
    });
    this.usersService.getUsers().subscribe({
      next: (data) => this.testManagers = data,
      error: (err) => console.error('Error cargando test managers', err)
    });
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

  /** Convierte strings de nivel (HIGH/MEDIUM/LOW) a valores numéricos 1-5 para el backend */
  private mapLikelihoodToInt(value: string): number {
    const map: Record<string, number> = { 'HIGH': 5, 'MEDIUM': 3, 'LOW': 1 };
    return map[value] ?? 3;
  }

  /** Convierte valores numéricos 1-5 del backend de vuelta a strings HIGH/MEDIUM/LOW para el frontend */
  private mapIntToLikelihood(value: number | string): string {
    if (typeof value === 'string' && ['HIGH', 'MEDIUM', 'LOW'].includes(value)) return value;
    const n = Number(value);
    if (n >= 4) return 'HIGH';
    if (n >= 2) return 'MEDIUM';
    return 'LOW';
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;

      // Mapear Risks: el backend espera { probability: int, impact: int, mitigation: string }
      const mappedRisks = this.riskList.map(r => ({
        id: (r as any).id ?? undefined,
        description: r.description,
        probability: this.mapLikelihoodToInt(r.likelihood || 'MEDIUM'),
        impact: this.mapLikelihoodToInt(r.impact || 'MEDIUM'),
        mitigation: r.mitigationStrategy || ''
      }));

      // Función para convertir a UTC
      const formatToUTC = (dateStr: string | null | undefined): string | undefined => {
        if (!dateStr) return undefined;
        return dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00Z`;
      };

      // Mapear Milestones: el backend espera { dueDate } en vez de { targetDate }
      const mappedMilestones = this.milestoneList.map(m => ({
        id: (m as any).id ?? undefined,
        name: m.name,
        description: m.description || '',
        dueDate: formatToUTC(m.targetDate) || new Date().toISOString(),
        isCompleted: m.isCompleted || false
      }));

      const data: any = {
        ...formValue,
        startDate: formatToUTC(formValue.startDate),
        endDate: formatToUTC(formValue.endDate),
        criteria: this.criteriaList,
        milestones: mappedMilestones,
        risks: mappedRisks
      };

      if (!data.startDate) delete data.startDate;
      if (!data.endDate) delete data.endDate;

      this.savePlan.emit(data);
    }
  }
}
