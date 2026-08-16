// src/app/core/services/projects.service.ts
// Servicio para gestión de proyectos: CRUD, asignación de testers, devoluciones.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProjectDto, CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { Project } from '../models/project.model';
import { TestCase } from '../models/test-case.model';
import { ProjectMapper } from '../mappers/project.mapper';
import { TestCasesService } from './test-cases.service';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
    /** Prefijo para logs de seguimiento */
    private readonly LOG_TAG = '[ProjectsService]';

    /** URL base del endpoint de proyectos */
    private readonly apiUrl = `${environment.apiUrl}/Projects`;

    private readonly http = inject(HttpClient);
    private readonly testCasesService = inject(TestCasesService);

    /** Obtiene la lista completa de proyectos (opcionalmente filtrada por SUT y tester) */
    getProjects(sutId?: string, testerUserId?: string): Observable<Project[]> {
        const params: any = {};
        if (sutId && sutId !== 'ALL') {
            params.sutId = sutId;
        }
        if (testerUserId && testerUserId !== 'ALL') {
            params.testerUserId = testerUserId;
        }
        return this.http.get<ProjectDto[]>(this.apiUrl, { params }).pipe(
            map(dtos => dtos.map(dto => ProjectMapper.fromDto(dto)))
        );
    }

    /**
     * Crea un nuevo proyecto.
     * @param project - Datos del proyecto a crear
     */
    createProject(project: CreateProjectDto): Observable<Project> {
        console.log(this.LOG_TAG, 'Creando proyecto:', project.name);
        return this.http.post<ProjectDto>(this.apiUrl, project).pipe(
            map(dto => ProjectMapper.fromDto(dto))
        );
    }

    /**
     * Obtiene un proyecto por su ID.
     * @param id - Identificador único del proyecto
     */
    getProjectById(id: string): Observable<Project> {
        return this.http.get<ProjectDto>(`${this.apiUrl}/${id}`).pipe(
            map(dto => ProjectMapper.fromDto(dto))
        );
    }

    /**
     * Actualiza un proyecto existente.
     * @param id - ID del proyecto
     * @param project - Campos a actualizar
     */
    updateProject(id: string, project: UpdateProjectDto): Observable<Project> {
        console.log(this.LOG_TAG, 'Actualizando proyecto:', id);
        return this.http.put<ProjectDto>(`${this.apiUrl}/${id}`, project).pipe(
            map(dto => ProjectMapper.fromDto(dto))
        );
    }

    /**
     * Elimina un proyecto por su ID.
     * @param id - ID del proyecto a eliminar
     */
    deleteProject(id: string): Observable<void> {
        console.log(this.LOG_TAG, 'Eliminando proyecto:', id);
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /**
     * Obtiene los casos de prueba asociados a un proyecto delegando en TestCasesService.
     * @param projectId - ID del proyecto
     */
    getTestCasesByProjectId(projectId: string): Observable<TestCase[]> {
        return this.testCasesService.getTestCases(projectId);
    }

    /**
     * Registra una devolución (observación) sobre un proyecto.
     * @param projectId - ID del proyecto
     * @param notes - Notas de la devolución
     */
    registerDevolution(projectId: string, notes: string): Observable<any> {
        console.log(this.LOG_TAG, 'Registrando devolución para proyecto:', projectId);
        return this.http.post(`${this.apiUrl}/${projectId}/devolution`, { notes });
    }

    /**
     * Responde a una devolución existente.
     * @param devolutionId - ID de la devolución
     * @param response - Texto de respuesta
     */
    respondDevolution(devolutionId: string, response: string): Observable<any> {
        console.log(this.LOG_TAG, 'Respondiendo devolución:', devolutionId);
        return this.http.post(`${this.apiUrl}/devolution/${devolutionId}/response`, { response });
    }
}
