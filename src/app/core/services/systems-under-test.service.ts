// src/app/core/services/systems-under-test.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SystemUnderTest, CreateSystemUnderTest, UpdateSystemUnderTest, PlatformType } from '../models/system-under-test.model';
import { SystemUnderTestDto } from '../dto/system-under-test.dto';
import { SystemUnderTestMapper } from '../mappers/system-under-test.mapper';

@Injectable({ providedIn: 'root' })
export class SystemsUnderTestService {
  private readonly apiUrl = `${environment.apiUrl}/systems-under-test`;
  private readonly http = inject(HttpClient);
  private readonly LOG_TAG = '[SystemsUnderTestService]';

  getAll(): Observable<SystemUnderTest[]> {
    return this.http.get<SystemUnderTestDto[]>(this.apiUrl).pipe(
      map(dtos => dtos.map(dto => SystemUnderTestMapper.fromDto(dto))),
      catchError(err => {
        console.error(this.LOG_TAG, `Error fetching SUTs`, err);
        return of([]);
      })
    );
  }

  getPlatformTypes(): Observable<PlatformType[]> {
    // Para simplificar mientras no exista en el backend, retornamos un mock en catchError.
    return this.http.get<PlatformType[]>(`${environment.apiUrl}/PlatformTypes`).pipe(
      catchError(err => {
        console.warn(this.LOG_TAG, 'Backend no expone PlatformTypes, retornando mock.');
        return of([
          { id: 1, name: 'Web Application', code: 'WEB', isActive: true },
          { id: 2, name: 'Mobile Android', code: 'ANDROID', isActive: true },
          { id: 3, name: 'Mobile iOS', code: 'IOS', isActive: true },
          { id: 4, name: 'API REST', code: 'API', isActive: true },
          { id: 5, name: 'Desktop App', code: 'DESKTOP', isActive: true }
        ]);
      })
    );
  }

  getById(id: string): Observable<SystemUnderTest> {
    return this.http.get<SystemUnderTestDto>(`${this.apiUrl}/${id}`).pipe(
      map(dto => SystemUnderTestMapper.fromDto(dto))
    );
  }

  create(sut: CreateSystemUnderTest): Observable<SystemUnderTest> {
    return this.http.post<SystemUnderTestDto>(this.apiUrl, sut).pipe(
      map(dto => SystemUnderTestMapper.fromDto(dto))
    );
  }

  update(id: string, sut: UpdateSystemUnderTest): Observable<SystemUnderTest> {
    return this.http.put<SystemUnderTestDto>(`${this.apiUrl}/${id}`, sut).pipe(
      map(dto => SystemUnderTestMapper.fromDto(dto))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
