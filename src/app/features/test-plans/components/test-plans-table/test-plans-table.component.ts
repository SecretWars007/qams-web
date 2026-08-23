import { Component, EventEmitter, Input, Output, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestPlan } from '../../../../core/models/test-plan.model';

export type SortColumn = 'name' | 'startDate' | 'status' | 'effort';
export type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-test-plans-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-plans-table.component.html'
})
export class TestPlansTableComponent {
  @Input() set testPlans(value: TestPlan[]) {
    this._testPlans.set(value);
  }
  @Input() loading = false;

  @Output() editPlan = new EventEmitter<TestPlan>();
  @Output() approvePlan = new EventEmitter<TestPlan>();
  @Output() downloadReport = new EventEmitter<TestPlan>();
  @Output() deletePlan = new EventEmitter<TestPlan>();
  @Output() viewPlan = new EventEmitter<TestPlan>();

  private _testPlans = signal<TestPlan[]>([]);
  
  // Sorting state
  sortColumn = signal<SortColumn>('startDate');
  sortDirection = signal<SortDirection>('desc');

  // Pagination state
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Reset pagination when data changes
  constructor() {
    effect(() => {
      // Accessing _testPlans inside effect triggers it when data changes
      this._testPlans(); 
      this.currentPage.set(1);
    }, { allowSignalWrites: true });
  }

  // Sorted and Paginated data
  processedPlans = computed(() => {
    let plans = [...this._testPlans()];
    
    // 1. Sort
    const col = this.sortColumn();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    
    plans.sort((a, b) => {
      let valA: any, valB: any;
      switch (col) {
        case 'name': 
          valA = a.name?.toLowerCase() || ''; 
          valB = b.name?.toLowerCase() || ''; 
          break;
        case 'startDate': 
          valA = a.startDate ? new Date(a.startDate).getTime() : 0;
          valB = b.startDate ? new Date(b.startDate).getTime() : 0;
          break;
        case 'status':
          valA = a.statusName?.toLowerCase() || '';
          valB = b.statusName?.toLowerCase() || '';
          break;
        case 'effort':
          valA = a.estimatedEffortHours || 0;
          valB = b.estimatedEffortHours || 0;
          break;
      }
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });

    // 2. Paginate
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return plans.slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this._testPlans().length / this.pageSize());
  });

  onSortChange(column: string): void {
    this.sortColumn.set(column as SortColumn);
  }

  toggleSortDirection(): void {
    this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
  }

  sortBy(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getCriteriaSummary(plan: TestPlan, type: 'ENTRY' | 'EXIT'): { met: number, total: number } {
    if (!plan.criteria || plan.criteria.length === 0) return { met: 0, total: 0 };
    const filtered = plan.criteria.filter(c => c.criteriaType === type);
    const met = filtered.filter(c => c.isMet).length;
    return { met, total: filtered.length };
  }

  getStatusBadgeClass(status: string): string {
    switch ((status || 'Borrador').toUpperCase()) {
      case 'BORRADOR': 
      case 'DRAFT': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'EN REVISIÓN': 
      case 'IN_REVIEW': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'APROBADO': 
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ACTIVO': 
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CERRADO': 
      case 'CLOSED': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }
}
