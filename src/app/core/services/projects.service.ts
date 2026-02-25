// src/app/core/services/projects.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, CreateProject, UpdateProject } from '../models/project.model';
import { TestCase } from '../models/test-case.model';
import { ProjectsMockService } from './projects.mock.service';
import { TestCasesMockService } from './test-cases.mock.service';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
    private readonly apiUrl = `${environment.apiUrl}/Projects`;
    private http = inject(HttpClient);
    private mockService = inject(ProjectsMockService);
    private testCasesMockService = inject(TestCasesMockService);

    getProjects(): Observable<Project[]> {
        if (environment.useMock) {
            return this.mockService.getProjects();
        }
        return this.http.get<Project[]>(this.apiUrl);
    }

    createProject(project: CreateProject): Observable<Project> {
        if (environment.useMock) {
            return this.mockService.createProject(project);
        }
        return this.http.post<Project>(this.apiUrl, project);
    }

    getProjectById(id: string): Observable<Project> {
        if (environment.useMock) {
            return this.mockService.getProjectById(id).pipe(
                map(p => {
                    if (!p) throw new Error('Project not found');
                    return p;
                })
            );
        }
        return this.http.get<Project>(`${this.apiUrl}/${id}`);
    }

    updateProject(id: string, project: UpdateProject): Observable<Project> {
        if (environment.useMock) {
            return this.mockService.updateProject(id, project);
        }
        return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
    }

    deleteProject(id: string): Observable<void> {
        if (environment.useMock) {
            return this.mockService.deleteProject(id);
        }
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getTestCasesByProjectId(projectId: string): Observable<TestCase[]> {
        if (environment.useMock) {
            return this.testCasesMockService.getTestCases(projectId);
        }
        return this.http.get<TestCase[]>(`${this.apiUrl}/${projectId}/testcases`);
    }

    registerDevolution(projectId: string, notes: string): Observable<any> {
        if (environment.useMock) {
            return this.mockService.registerDevolution(projectId, notes);
        }
        return this.http.post(`${this.apiUrl}/${projectId}/devolution`, { notes });
    }

    respondDevolution(devolutionId: string, response: string): Observable<any> {
        if (environment.useMock) {
            return this.mockService.respondDevolution(devolutionId, response);
        }
        return this.http.post(`${this.apiUrl}/devolution/${devolutionId}/response`, { response });
    }
}
