// src/app/core/services/projects.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProjectDto, CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { Project } from '../models/project.model';
import { TestCase } from '../models/test-case.model';
import { ProjectMapper } from '../mappers/project.mapper';
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
        return this.http.get<ProjectDto[]>(this.apiUrl).pipe(
            map(dtos => dtos.map(dto => ProjectMapper.fromDto(dto)))
        );
    }

    createProject(project: CreateProjectDto): Observable<Project> {
        if (environment.useMock) {
            return this.mockService.createProject(project as any);
        }
        return this.http.post<ProjectDto>(this.apiUrl, project).pipe(
            map(dto => ProjectMapper.fromDto(dto))
        );
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
        return this.http.get<ProjectDto>(`${this.apiUrl}/${id}`).pipe(
            map(dto => ProjectMapper.fromDto(dto))
        );
    }

    updateProject(id: string, project: UpdateProjectDto): Observable<Project> {
        if (environment.useMock) {
            return this.mockService.updateProject(id, project as any);
        }
        return this.http.put<ProjectDto>(`${this.apiUrl}/${id}`, project).pipe(
            map(dto => ProjectMapper.fromDto(dto))
        );
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
