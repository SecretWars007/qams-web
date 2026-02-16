import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UpdateUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
    private readonly apiUrl = `${environment.apiUrl}/Users`;
    private http = inject(HttpClient);

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getUserById(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    updateUser(id: string, user: UpdateUser): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user);
    }

    deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    assignRole(userId: string, roleId: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${userId}/roles/${roleId}`, {});
    }

    removeRole(userId: string, roleId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${userId}/roles/${roleId}`);
    }

    removeAllRoles(userId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${userId}/roles`);
    }
}
