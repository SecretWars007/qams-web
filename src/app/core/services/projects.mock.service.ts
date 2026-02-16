// src/app/core/services/projects.mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Project, CreateProject, UpdateProject } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsMockService {
    // Maintain state for the session
    private projects: Project[] = [
        {
            id: '1',
            name: 'E-Commerce Platform v2.0',
            description: 'New microservices-based architecture for the main store.',
            startDate: '2026-01-01',
            endDate: '2026-06-30',
            testerIds: [],
            testerNames: ['Jane Doe', 'John Smith'],
            isActive: true,
            priority: 1,
            projectStatusId: 1,
            projectStatusName: 'In Progress',
            createdByUserName: 'Admin',
            createdAt: '2026-01-10T09:00:00Z',
            testSuiteCount: 12,
            kanbanBoardCount: 2
        },
        {
            id: '2',
            name: 'Mobile App - iOS',
            description: 'Native iOS application for customer loyalty program.',
            startDate: '2026-02-01',
            endDate: '2026-08-15',
            testerIds: [],
            testerNames: ['Mobile Tester'],
            isActive: true,
            priority: 2,
            projectStatusId: 2,
            projectStatusName: 'Planning',
            createdByUserName: 'Admin',
            createdAt: '2026-01-15T14:30:00Z',
            testSuiteCount: 8,
            kanbanBoardCount: 1
        },
        {
            id: '3',
            name: 'API Gateway Refactor',
            description: 'Security hardening and performance optimization.',
            startDate: '2026-03-01',
            endDate: '2026-05-30',
            testerIds: [],
            testerNames: [],
            isActive: true,
            priority: 3,
            projectStatusId: 1,
            projectStatusName: 'In Progress',
            createdByUserName: 'Dev Lead',
            createdAt: '2026-02-01T10:15:00Z',
            testSuiteCount: 5,
            kanbanBoardCount: 1
        },
        {
            id: '4',
            name: 'Dashboard Analytics',
            description: 'Internal reporting tool for stakeholders.',
            startDate: '2025-11-01',
            endDate: '2025-12-31',
            testerIds: [],
            testerNames: [],
            isActive: false,
            priority: 2,
            projectStatusId: 3,
            projectStatusName: 'Completed',
            createdByUserName: 'Admin',
            createdAt: '2025-11-20T11:00:00Z',
            testSuiteCount: 3,
            kanbanBoardCount: 1
        }
    ];

    constructor() { }

    getProjects(): Observable<Project[]> {
        return of([...this.projects]).pipe(delay(600));
    }

    createProject(project: CreateProject): Observable<Project> {
        const newProject: Project = {
            id: (this.projects.length + 1).toString(),
            name: project.name,
            description: project.description,
            startDate: project.startDate,
            endDate: project.endDate,
            testerIds: project.testerIds,
            testerNames: [],
            isActive: true,
            priority: 1,
            projectStatusId: 1,
            projectStatusName: 'New',
            createdByUserName: 'Current User',
            createdAt: new Date().toISOString(),
            testSuiteCount: 0,
            kanbanBoardCount: 0
        };
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
            this.projects[index] = { ...this.projects[index], ...project };
            return of(this.projects[index]).pipe(delay(300));
        }
        throw new Error('Project not found');
    }

    deleteProject(id: string): Observable<void> {
        this.projects = this.projects.filter(p => p.id !== id);
        return of(void 0).pipe(delay(300));
    }
}
