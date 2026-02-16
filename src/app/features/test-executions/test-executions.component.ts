import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestExecutionsService } from '../../core/services/test-executions.service';
import { TestExecution } from '../../core/models/test-execution.model';

import { ActivatedRoute } from '@angular/router';
import { TestCasesService } from '../../core/services/test-cases.service';

@Component({
  selector: 'app-test-executions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-executions.component.html',
  styleUrls: ['./test-executions.component.scss']
})
export class TestExecutionsComponent implements OnInit {
  executions = signal<TestExecution[]>([]);
  loading = signal<boolean>(true);
  testCaseTitle = signal<string>('');

  private executionsService = inject(TestExecutionsService);
  private testCasesService = inject(TestCasesService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const testCaseId = params['testCaseId'];
      this.loadExecutions(testCaseId);

      if (testCaseId) {
        this.loadTestCaseTitle(testCaseId);
      }
    });
  }

  loadExecutions(testCaseId?: string) {
    this.loading.set(true);
    this.executionsService.getExecutions(testCaseId).subscribe({
      next: (data: TestExecution[]) => {
        this.executions.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadTestCaseTitle(id: string) {
    this.testCasesService.getTestCaseById(id).subscribe(testCase => {
      if (testCase) {
        this.testCaseTitle.set(testCase.title);
      }
    });
  }
}
