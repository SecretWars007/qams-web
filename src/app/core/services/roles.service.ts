import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, CreateRole } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
    private readonly apiUrl = `${environment.apiUrl}/Roles`;
    private http = inject(HttpClient);

    getRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(this.apiUrl);
    }

    getRoleById(id: string): Observable<Role> {
        return this.http.get<Role>(`${this.apiUrl}/${id}`);
    }

    createRole(role: CreateRole): Observable<Role> {
        return this.http.post<Role>(this.apiUrl, role);
    }

    updateRole(id: string, role: CreateRole): Observable<Role> {
        return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
    }

    deleteRole(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getAllPermissions(): Observable<any[]> {
        if (environment.useMock) {
            return of([
                { id: '1', name: 'DASHBOARD_VIEW' },
                { id: '2', name: 'PROJECTS_VIEW' },
                { id: '3', name: 'TEST_CASES_VIEW' },
                { id: '4', name: 'EXECUTIONS_VIEW' },
                { id: '5', name: 'KANBAN_VIEW' },
                { id: '6', name: 'USERS_VIEW' },
                { id: '7', name: 'ROLES_VIEW' },
                { id: '8', name: 'CATALOGS_VIEW' }
            ]);
        }
        return this.http.get<any[]>(`${this.apiUrl}/permissions`);
    }

    assignPermissions(roleId: string, permissionIds: string[]): Observable<void> {
        if (environment.useMock) return of(undefined);
        return this.http.post<void>(`${this.apiUrl}/${roleId}/permissions`, {
            permissionIds
        });
    }
}
