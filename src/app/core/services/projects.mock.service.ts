// src/app/core/services/projects.mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Project, CreateProject, UpdateProject } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsMockService {
    // Maintain state for the session
    private projects: Project[] = [
        new Project(
            '1',
            'E-Commerce Platform v2.0',
            'New microservices-based architecture for the main store.',
            new Date('2026-01-01'),
            new Date('2026-06-30'),
            ['Jane Doe', 'John Smith'],
            true,
            1,
            { id: 1, name: 'In Progress' },
            new Date('2026-01-10T09:00:00Z'),
            'Admin',
            { suites: 12, kanbanTasks: 2, devolutions: 0 },
            []
        ),
        new Project(
            '2',
            'Mobile App - iOS',
            'Native iOS application for customer loyalty program.',
            new Date('2026-02-01'),
            new Date('2026-08-15'),
            ['Mobile Tester'],
            true,
            2,
            { id: 2, name: 'Planning' },
            new Date('2026-01-15T14:30:00Z'),
            'Admin',
            { suites: 8, kanbanTasks: 1, devolutions: 0 },
            []
        ),
        new Project(
            '3',
            'API Gateway Refactor',
            'Security hardening and performance optimization.',
            new Date('2026-03-01'),
            new Date('2026-05-30'),
            [],
            true,
            3,
            { id: 1, name: 'In Progress' },
            new Date('2026-02-01T10:15:00Z'),
            'Dev Lead',
            { suites: 5, kanbanTasks: 1, devolutions: 0 },
            []
        ),
        new Project(
            '4',
            'Dashboard Analytics',
            'Internal reporting tool for stakeholders.',
            new Date('2025-11-01'),
            new Date('2025-12-31'),
            [],
            false,
            2,
            { id: 3, name: 'Completed' },
            new Date('2025-11-20T11:00:00Z'),
            'Admin',
            { suites: 3, kanbanTasks: 1, devolutions: 1 },
            [
                {
                    id: 'dev1',
                    projectId: '4',
                    date: new Date('2025-12-15T10:00:00Z'),
                    notes: 'Faltan evidencias en la suite de reportes.',
                    responseDate: new Date('2025-12-20T15:00:00Z'),
                    responseNotes: 'Evidencias agregadas y verificado.',
                    createdBy: 'QA Lead',
                    observationsCount: 2
                }
            ]
        ),
        new Project(
            '10',
            'Kanban Integration 141736',
            'Project matching user screenshot for verification.',
            new Date('2026-02-17'),
            new Date('2026-12-31'),
            ['Current User'],
            true,
            1,
            { id: 1, name: 'In Progress' },
            new Date(),
            'Admin',
            { suites: 1, kanbanTasks: 1, devolutions: 0 },
            []
        )
    ];

    constructor() { }

    getProjects(): Observable<Project[]> {
        return of([...this.projects]).pipe(delay(600));
    }

    createProject(project: CreateProject): Observable<Project> {
        const newProject = new Project(
            (this.projects.length + 1).toString(),
            project.name,
            project.description,
            project.startDate ? new Date(project.startDate) : null,
            project.endDate ? new Date(project.endDate) : null,
            [],
            true,
            1,
            { id: 1, name: 'New' },
            new Date(),
            'Current User',
            { suites: 0, kanbanTasks: 0, devolutions: 0 },
            []
        );
        this.projects.unshift(newProject);
        return of(newProject).pipe(delay(400));
    }

    getProjectById(id: string): Observable<Project | undefined> {
        const project = this.projects.find(p => p.id === id);
        return of(project).pipe(delay(300));
    }

    updateProject(id: string, project: UpdateProject): Observable<Project> {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            const existing = this.projects[index];
            const updated = new Project(
                existing.id,
                project.name || existing.name,
                project.description !== undefined ? project.description : existing.description,
                project.startDate ? new Date(project.startDate) : existing.startDate,
                project.endDate ? new Date(project.endDate) : existing.endDate,
                existing.testerNames,
                project.isActive !== undefined ? project.isActive : existing.isActive,
                existing.priority,
                existing.status,
                existing.createdAt,
                existing.createdBy,
                existing.stats,
                existing.historicDevolutions
            );
            this.projects[index] = updated;
            return of(updated).pipe(delay(300));
        }
        throw new Error('Project not found');
    }

    deleteProject(id: string): Observable<void> {
        this.projects = this.projects.filter(p => p.id !== id);
        return of(void 0).pipe(delay(300));
    }

    registerDevolution(projectId: string, notes: string): Observable<any> {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.stats.devolutions = (project.stats.devolutions || 0) + 1;
            project.historicDevolutions = project.historicDevolutions || [];
            project.historicDevolutions.unshift({
                id: Math.random().toString(36).substr(2, 9),
                projectId,
                date: new Date(),
                notes,
                responseDate: null,
                responseNotes: null,
                createdBy: 'Current User',
                observationsCount: 0
            });
        }
        return of({ success: true }).pipe(delay(400));
    }

    respondDevolution(devolutionId: string, response: string): Observable<any> {
        this.projects.forEach(p => {
            const dev = p.historicDevolutions?.find(d => d.id === devolutionId);
            if (dev) {
                dev.responseDate = new Date();
                dev.responseNotes = response;
            }
        });
        return of({ success: true }).pipe(delay(400));
    }
}
