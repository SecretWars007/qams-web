// src/app/core/services/api-keys.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiKey, ApiKeyCreated, CreateApiKey } from '../models/api-key.model';
import { ApiKeyDto, ApiKeyCreatedDto } from '../dto/api-key.dto';
import { ApiKeyMapper } from '../mappers/api-key.mapper';

@Injectable({ providedIn: 'root' })
export class ApiKeysService {
  private readonly apiUrl = `${environment.apiUrl}/ApiKeys`;
  private readonly http = inject(HttpClient);
  private readonly LOG_TAG = '[ApiKeysService]';

  getByProject(projectId: string): Observable<ApiKey[]> {
    return this.http.get<ApiKeyDto[]>(`${this.apiUrl}/project/${projectId}`).pipe(
      map(dtos => dtos.map(dto => ApiKeyMapper.fromDto(dto))),
      catchError(err => {
        console.error(this.LOG_TAG, `Error fetching API Keys for project ${projectId}`, err);
        return of([]);
      })
    );
  }

  create(apiKey: CreateApiKey): Observable<ApiKeyCreated> {
    return this.http.post<ApiKeyCreatedDto>(this.apiUrl, apiKey).pipe(
      map(dto => ApiKeyMapper.fromCreatedDto(dto))
    );
  }

  revoke(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/revoke`);
  }
}
