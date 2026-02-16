// src/app/features/test-scenarios/test-scenarios.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TestSuitesService } from '../../core/services/test-suites.service';
import { ProjectsService } from '../../core/services/projects.service';
import { TestSuite } from '../../core/models/test-suite.model';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-test-scenarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-scenarios.component.html',
  styleUrls: ['./test-scenarios.component.scss']
})
export class TestScenariosComponent implements OnInit {
  projects = signal<Project[]>([]);
  testSuites = signal<TestSuite[]>([]);
  loading = signal<boolean>(false);
  selectedProjectId = signal<string | null>(null);
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  suiteForm!: FormGroup;

  private testSuitesService = inject(TestSuitesService);
  private projectsService = inject(ProjectsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initForm();
    this.loadProjects();
    this.route.queryParams.subscribe(params => {
      const projectId = params['projectId'];
      if (projectId) {
        this.selectedProjectId.set(projectId);
        this.loadTestSuites(projectId);
      }
    });
  }

  private initForm() {
    this.suiteForm = this.fb.group({
      projectId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  openScenario(suiteId: string) {
    this.router.navigate(['/test-cases'], {
      queryParams: {
        projectId: this.selectedProjectId(),
        testSuiteId: suiteId
      }
    });
  }

  loadProjects() {
    this.projectsService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Error loading projects', err)
    });
  }

  onProjectChange(event: any) {
    const projectId = event.target.value;
    this.selectedProjectId.set(projectId || null);
    if (projectId) {
      this.loadTestSuites(projectId);
    } else {
      this.testSuites.set([]);
    }
  }

  loadTestSuites(projectId: string) {
    this.loading.set(true);
    this.testSuitesService.getTestSuitesByProjectId(projectId).subscribe({
      next: (data) => {
        this.testSuites.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading test suites', err);
        this.loading.set(false);
      }
    });
  }

  openModal() {
    this.suiteForm.reset({
      projectId: this.selectedProjectId() || ''
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onSubmit() {
    if (this.suiteForm.valid) {
      this.isSubmitting.set(true);
      this.testSuitesService.createTestSuite(this.suiteForm.value).subscribe({
        next: () => {
          this.loadTestSuites(this.selectedProjectId()!);
          this.closeModal();
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error('Error creating test suite', err);
          this.isSubmitting.set(false);
          alert('Error al crear el escenario.');
        }
      });
    }
  }
}
