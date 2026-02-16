// src/app/core/services/projects.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, CreateProject, UpdateProject } from '../models/project.model';
import { TestCase } from '../models/test-case.model';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
    private readonly apiUrl = `${environment.apiUrl}/Projects`;
    private http = inject(HttpClient);

    getProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(this.apiUrl);
    }

    createProject(project: CreateProject): Observable<Project> {
        return this.http.post<Project>(this.apiUrl, project);
    }

    getProjectById(id: string): Observable<Project> {
        return this.http.get<Project>(`${this.apiUrl}/${id}`);
    }

    updateProject(id: string, project: UpdateProject): Observable<Project> {
        return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
    }

    deleteProject(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getTestCasesByProjectId(projectId: string): Observable<TestCase[]> {
        return this.http.get<TestCase[]>(`${this.apiUrl}/${projectId}/testcases`);
    }
}
