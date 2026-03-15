import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReportsService } from '../../core/services/reports.service';
import { ProjectsService } from '../../core/services/projects.service';
import { Project } from '../../core/models/project.model';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

@Component({
    selector: 'app-burndown-report',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, SafeUrlPipe, DatePipe],
    templateUrl: './burndown-report.component.html',
    styleUrls: ['./burndown-report.component.scss']
})
export class BurndownReportComponent implements OnInit {
    today = new Date();
    projects = signal<Project[]>([]);
    loading = signal(false);
    generating = signal(false);
    error = signal<string | null>(null);
    pdfUrl = signal<string | null>(null);
    reportGenerated = signal(false);

    filterForm!: FormGroup;

    private reportsService = inject(ReportsService);
    private projectsService = inject(ProjectsService);
    private fb = inject(FormBuilder);

    ngOnInit(): void {
        this.filterForm = this.fb.group({
            projectId: ['']
        });
        this.loadProjects();
    }

    loadProjects(): void {
        this.loading.set(true);
        this.projectsService.getProjects().subscribe({
            next: (data) => {
                this.projects.set(data);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    get hasProject(): boolean {
        return !!this.filterForm.get('projectId')?.value;
    }

    generateReport(): void {
        const { projectId } = this.filterForm.value;
        if (!projectId) return;

        this.generating.set(true);
        this.error.set(null);
        this.pdfUrl.set(null);
        this.reportGenerated.set(false);

        this.reportsService.generateBurndownReport(projectId).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                this.pdfUrl.set(url);
                this.reportGenerated.set(true);
                this.generating.set(false);
            },
            error: (err) => {
                console.error('Error generando reporte burndown:', err);
                this.error.set('No se pudo generar el reporte burndown. Inténtalo de nuevo.');
                this.generating.set(false);
            }
        });
    }

    downloadReport(): void {
        const url = this.pdfUrl();
        if (!url) return;
        const { projectId } = this.filterForm.value;
        const projectName = this.projects().find(p => p.id === projectId)?.name ?? 'proyecto';
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Burndown_${projectName}_${new Date().toISOString().slice(0, 10)}.pdf`;
        a.click();
    }

    resetReport(): void {
        this.pdfUrl.set(null);
        this.reportGenerated.set(false);
        this.error.set(null);
        this.filterForm.reset();
    }
}
