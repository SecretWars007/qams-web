// src/app/core/services/requirements.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RequirementDto, CreateRequirementDto } from '../dto/requirement.dto';
import { Requirement, CreateRequirement, UpdateRequirement } from '../models/requirement.model';
import { RequirementMapper } from '../mappers/requirement.mapper';

@Injectable({ providedIn: 'root' })
export class RequirementsService {
  private readonly apiUrl = `${environment.apiUrl}/Requirements`;
  private readonly http = inject(HttpClient);

  getRequirementsByProject(projectId: string): Observable<Requirement[]> {
    return this.http.get<RequirementDto[]>(`${this.apiUrl}/project/${projectId}`).pipe(
      map(dtos => dtos.map(dto => RequirementMapper.fromDto(dto)))
    );
  }

  getRequirementById(id: string): Observable<Requirement> {
    return this.http.get<RequirementDto>(`${this.apiUrl}/${id}`).pipe(
      map(dto => RequirementMapper.fromDto(dto))
    );
  }

  createRequirement(projectId: string, requirement: CreateRequirement): Observable<Requirement> {
    const dto: CreateRequirementDto = { ...requirement };
    return this.http.post<RequirementDto>(`${this.apiUrl}/project/${projectId}`, dto).pipe(
      map(dto => RequirementMapper.fromDto(dto))
    );
  }

  updateRequirement(id: string, requirement: UpdateRequirement): Observable<Requirement> {
    return this.http.put<RequirementDto>(`${this.apiUrl}/${id}`, requirement).pipe(
      map(dto => RequirementMapper.fromDto(dto))
    );
  }

  deleteRequirement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
