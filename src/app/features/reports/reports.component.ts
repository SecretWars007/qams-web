// src/app/features/reports/reports.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ReportsService } from '../../core/services/reports.service';
import { ProjectsService } from '../../core/services/projects.service';
import { Project } from '../../core/models/project.model';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

interface ExecutionStatusOption {
    id: number;
    label: string;
    code: string;
    color: string;
}

interface TaskStatusOption {
    name: string;
    label: string;
}

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, SafeUrlPipe, DatePipe],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
    today = new Date();
    projects = signal<Project[]>([]);
    loading = signal(false);
    generating = signal(false);
    error = signal<string | null>(null);
    pdfUrl = signal<string | null>(null);
    reportGenerated = signal<boolean>(false);
    reportType = signal<'general' | 'observations' | 'compliance' | 'burndown'>('general');

    filterForm!: FormGroup;

    executionStatuses: ExecutionStatusOption[] = [
        { id: 1, label: 'Exitoso', code: 'PASSED', color: 'green' },
        { id: 2, label: 'Fallido', code: 'FAILED', color: 'red' },
        { id: 3, label: 'Bloqueado', code: 'BLOCKED', color: 'orange' },
        { id: 4, label: 'En Progreso', code: 'IN_PROGRESS', color: 'blue' },
        { id: 5, label: 'Pendiente', code: 'PENDING', color: 'gray' },
        { id: 6, label: 'Omitido', code: 'SKIPPED', color: 'purple' },
    ];

    taskStatuses: TaskStatusOption[] = [
        { name: 'Por Hacer', label: 'Por Hacer' },
        { name: 'En Progreso', label: 'En Progreso' },
        { name: 'En Revisión', label: 'En Revisión' },
        { name: 'Completado', label: 'Completado' },
    ];

    // Map for selected checkboxes
    selectedExecStatuses = signal<Set<number>>(new Set());
    selectedTaskStatuses = signal<Set<string>>(new Set());

    private reportsService = inject(ReportsService);
    private projectsService = inject(ProjectsService);
    private fb = inject(FormBuilder);

    ngOnInit(): void {
        this.filterForm = this.fb.group({
            projectId: [''],
            startDate: [''],
            endDate: ['']
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

    toggleExecStatus(id: number): void {
        const set = new Set(this.selectedExecStatuses());
        if (set.has(id)) set.delete(id); else set.add(id);
        this.selectedExecStatuses.set(set);
    }

    toggleTaskStatus(name: string): void {
        const set = new Set(this.selectedTaskStatuses());
        if (set.has(name)) set.delete(name); else set.add(name);
        this.selectedTaskStatuses.set(set);
    }

    isExecSelected(id: number): boolean {
        return this.selectedExecStatuses().has(id);
    }

    isTaskSelected(name: string): boolean {
        return this.selectedTaskStatuses().has(name);
    }

    get hasProject(): boolean {
        return !!this.filterForm.get('projectId')?.value;
    }

    generateReport(type: 'general' | 'observations' | 'compliance' | 'burndown' = 'general'): void {
        const { projectId, startDate, endDate } = this.filterForm.value;
        if (!projectId) return;

        this.generating.set(true);
        this.error.set(null);
        this.pdfUrl.set(null);
        this.reportGenerated.set(false);
        this.reportType.set(type);

        let request: Observable<Blob>;

        switch (type) {
            case 'observations':
                request = this.reportsService.generateObservationsReport(projectId);
                break;
            case 'compliance':
                request = this.reportsService.generateComplianceReport(projectId);
                break;
            case 'burndown':
                request = this.reportsService.generateBurndownReport(projectId);
                break;
            default:
                const filter = {
                    projectId,
                    executionStatusIds: Array.from(this.selectedExecStatuses()),
                    taskStatusNames: Array.from(this.selectedTaskStatuses()),
                    startDate: startDate || undefined,
                    endDate: endDate || undefined
                };
                request = this.reportsService.generateProjectReport(filter);
        }

        request.subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                this.pdfUrl.set(url);
                this.reportGenerated.set(true);
                this.generating.set(false);
            },
            error: (err) => {
                console.error('Error generando reporte:', err);
                this.error.set('No se pudo generar el reporte. Verifica los filtros e inténtalo de nuevo.');
                this.generating.set(false);
            }
        });
    }


    downloadReport(): void {
        const url = this.pdfUrl();
        if (!url) return;
        const { projectId } = this.filterForm.value;
        const projectName = this.projects().find(p => p.id === projectId)?.name ?? 'proyecto';
        const typeMap: any = {
            'general': 'General',
            'observations': 'Observaciones',
            'compliance': 'Cumplimiento',
            'burndown': 'Burndown'
        };
        const typeLabel = typeMap[this.reportType()] || 'General';
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_${typeLabel}_${projectName}_${new Date().toISOString().slice(0, 10)}.pdf`;
        a.click();
    }

    resetReport(): void {
        this.pdfUrl.set(null);
        this.reportGenerated.set(false);
        this.error.set(null);
        this.filterForm.reset();
        this.selectedExecStatuses.set(new Set());
        this.selectedTaskStatuses.set(new Set());
    }

    getStatusColor(color: string): string {
        const map: Record<string, string> = {
            green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            red: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
            orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
            blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            gray: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
            purple: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
        };
        return map[color] ?? map['gray'];
    }

    getStatusColorSelected(color: string): string {
        const map: Record<string, string> = {
            green: 'bg-emerald-500 text-white border-emerald-600',
            red: 'bg-rose-500 text-white border-rose-600',
            orange: 'bg-orange-500 text-white border-orange-600',
            blue: 'bg-blue-500 text-white border-blue-600',
            gray: 'bg-gray-500 text-white border-gray-600',
            purple: 'bg-violet-500 text-white border-violet-600',
        };
        return map[color] ?? map['gray'];
    }
}
