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
    return this.http.get<PlatformType[]>(`${environment.apiUrl}/PlatformTypes`);
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
