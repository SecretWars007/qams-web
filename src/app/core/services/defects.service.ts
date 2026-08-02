// src/app/core/services/defects.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Defect, CreateDefect, UpdateDefect } from '../models/defect.model';
import { DefectDto } from '../dto/defect.dto';
import { DefectMapper } from '../mappers/defect.mapper';

@Injectable({ providedIn: 'root' })
export class DefectsService {
  private readonly apiUrl = `${environment.apiUrl}/Projects`;
  private readonly http = inject(HttpClient);
  private readonly LOG_TAG = '[DefectsService]';

  getByProject(projectId: string): Observable<Defect[]> {
    return this.http.get<DefectDto[]>(`${this.apiUrl}/${projectId}/defects`).pipe(
      map(dtos => dtos.map(dto => DefectMapper.fromDto(dto))),
      catchError(err => {
        console.error(this.LOG_TAG, `Error fetching defects for project ${projectId}`, err);
        return of([]);
      })
    );
  }

  getById(projectId: string, id: string): Observable<Defect> {
    return this.http.get<DefectDto>(`${this.apiUrl}/${projectId}/defects/${id}`).pipe(
      map(dto => DefectMapper.fromDto(dto))
    );
  }

  create(projectId: string, defect: CreateDefect): Observable<Defect> {
    return this.http.post<DefectDto>(`${this.apiUrl}/${projectId}/defects`, defect).pipe(
      map(dto => DefectMapper.fromDto(dto))
    );
  }

  update(projectId: string, id: string, defect: UpdateDefect): Observable<Defect> {
    return this.http.put<DefectDto>(`${this.apiUrl}/${projectId}/defects/${id}`, defect).pipe(
      map(dto => DefectMapper.fromDto(dto))
    );
  }

  delete(projectId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/defects/${id}`);
  }
}
