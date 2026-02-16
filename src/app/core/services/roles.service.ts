import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}
