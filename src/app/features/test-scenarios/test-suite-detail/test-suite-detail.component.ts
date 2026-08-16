import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TestSuitesService } from '../../../core/services/test-suites.service';
import { TestSuite } from '../../../core/models/test-suite.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-test-suite-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './test-suite-detail.component.html'
})
export class TestSuiteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testSuitesService = inject(TestSuitesService);
  private destroyRef = inject(DestroyRef);

  suite = signal<TestSuite | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSuite(id);
    } else {
      this.error.set('No se proporcionó un ID válido.');
      this.loading.set(false);
    }
  }

  private loadSuite(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.testSuitesService.getTestSuiteById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (data: TestSuite | undefined) => this.suite.set(data || null),
        error: (err: any) => {
          console.error('[TestSuiteDetail] Error loading suite:', err);
          this.error.set('No se pudo cargar la información del escenario.');
        }
      });
  }

  goBack() {
    this.router.navigate(['/test-scenarios']);
  }
}
