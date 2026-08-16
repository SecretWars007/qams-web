import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestPlan } from '../../../../core/models/test-plan.model';

@Component({
  selector: 'app-test-plan-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-plan-detail.component.html',
  styleUrls: ['./test-plan-detail.component.scss']
})
export class TestPlanDetailComponent implements OnInit {
  @Input() plan!: TestPlan;
  @Output() closeDetail = new EventEmitter<void>();

  activeTab: 'overview' | 'metrics' | 'milestones' | 'risks' | 'approvals' = 'overview';

  ngOnInit() {
    if (!this.plan) {
      this.closeDetail.emit();
    }
  }

  get entryCriteria() {
    return this.plan.criteria?.filter(c => c.criteriaType === 'ENTRY') || [];
  }

  get exitCriteria() {
    return this.plan.criteria?.filter(c => c.criteriaType === 'EXIT') || [];
  }

  get entryMet() {
    return this.entryCriteria.filter(c => c.isMet).length;
  }

  get exitMet() {
    return this.exitCriteria.filter(c => c.isMet).length;
  }
}
