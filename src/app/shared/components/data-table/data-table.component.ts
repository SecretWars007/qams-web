import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal, computed, OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'avatar' | 'date' | 'custom';
  sortable?: boolean;
  minWidth?: string;
  format?: (value: any, row: T) => string;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.component.html',
})
export class DataTableComponent implements OnChanges {
  readonly Math = Math;

  @Input({ required: true }) columns: TableColumn[] = [];
  @Input({ required: true }) data: any[] = [];
  @Input() loading = false;
  @Input() selectable = false;
  @Input() showToolbar = true;
  @Input() searchPlaceholder = 'Buscar...';
  @Input() searchFields: string[] = [];
  @Input() pageSizeOptions = [10, 20, 50];
  @Input() initialPageSize = 10;
  @Input() rowKey = 'id';
  /** Empty state props */
  @Input() emptyIcon = 'fas fa-inbox';
  @Input() emptyTitle = 'Sin resultados';
  @Input() emptyMessage = 'No se encontraron elementos con los filtros actuales.';
  @Input() emptyActionLabel?: string;
  @Input() emptyAction: () => void = () => {};

  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() pageChange = new EventEmitter<number>();

  searchTerm = signal('');
  sortColumn = signal('');
  sortDir = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  pageSize = signal(10);
  selectedKeys = signal<Set<unknown>>(new Set());

  skeletonRows = [1, 2, 3, 4, 5];

  ngOnChanges() {
    this.pageSize.set(this.initialPageSize);
    this.currentPage.set(1);
  }

  // ─── Computed ───────────────────────────────────────────────
  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    let result = this.data;

    if (term && this.searchFields.length) {
      result = result.filter(row =>
        this.searchFields.some(f =>
          String(row[f] ?? '').toLowerCase().includes(term)
        )
      );
    }

    const col = this.sortColumn();
    if (col) {
      result = [...result].sort((a, b) => {
        const aVal = a[col] ?? '';
        const bVal = b[col] ?? '';
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return this.sortDir() === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  });

  get totalCount(): number {
    return this.filteredData().length;
  }

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredData().length / this.pageSize())));

  pagedData = computed<any[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredData().slice(start, start + this.pageSize());
  });

  selectedCount = computed(() => this.selectedKeys().size);

  allSelected = computed(() =>
    this.pagedData().length > 0 &&
    this.pagedData().every(r => this.isSelected(r))
  );

  // ─── Handlers ───────────────────────────────────────────────
  onSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onColumnHeaderClick(col: TableColumn) {
    if (col.sortable) {
      this.sort(col.key);
    }
  }

  sort(col: string) {
    if (this.sortColumn() === col) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(col);
      this.sortDir.set('asc');
    }
    this.sortChange.emit({ column: col, direction: this.sortDir() });
  }

  goToPage(page: number) {
    const p = Math.max(1, Math.min(page, this.totalPages()));
    this.currentPage.set(p);
    this.pageChange.emit(p);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  toggleAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const keys = new Set(this.selectedKeys());
    this.pagedData().forEach(row => {
      checked ? keys.add(row[this.rowKey]) : keys.delete(row[this.rowKey]);
    });
    this.selectedKeys.set(keys);
    this.selectionChange.emit(this.data.filter(r => keys.has(r[this.rowKey])));
  }

  toggleRow(row: any) {
    const keys = new Set(this.selectedKeys());
    keys.has(row[this.rowKey]) ? keys.delete(row[this.rowKey]) : keys.add(row[this.rowKey]);
    this.selectedKeys.set(keys);
    this.selectionChange.emit(this.data.filter(r => keys.has(r[this.rowKey])));
  }

  isSelected(row: any): boolean {
    return this.selectedKeys().has(row[this.rowKey]);
  }

  clearSelection() {
    this.selectedKeys.set(new Set());
    this.selectionChange.emit([]);
  }

  getCellValue(row: any, col: TableColumn): any {
    return col.key.split('.').reduce((obj, k) => obj?.[k], row as any);
  }

  getDisplayValue(row: any, col: TableColumn): string {
    const val = this.getCellValue(row, col);
    if (col.format) return col.format(val, row);
    return val != null ? String(val) : '';
  }

  renderCellValue(row: any, col: TableColumn): string {
    return this.getDisplayValue(row, col);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = String(name).trim().split(/\s+/);
    return parts.length === 1
      ? parts[0].substring(0, 2).toUpperCase()
      : (parts[0][0] + parts.at(-1)![0]).toUpperCase();
  }
}
