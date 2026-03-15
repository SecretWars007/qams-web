// src/app/core/services/users.service.ts
// Servicio para gestión de usuarios: CRUD y asignación/remoción de roles.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UpdateUser } from '../models/user.model';
import { UserDto } from '../dto/user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UsersService {
    /** Prefijo para logs de seguimiento */
    private readonly LOG_TAG = '[UsersService]';

    /** URL base del endpoint de usuarios */
    private readonly apiUrl = `${environment.apiUrl}/Users`;

    private http = inject(HttpClient);

    /** Obtiene la lista completa de usuarios */
    getUsers(): Observable<User[]> {
        console.log(this.LOG_TAG, 'Obteniendo lista de usuarios');
        return this.http.get<UserDto[]>(this.apiUrl).pipe(
            map(dtos => dtos.map(dto => UserMapper.fromDto(dto)))
        );
    }

    /**
     * Obtiene un usuario por su ID.
     * @param id - Identificador del usuario
     */
    getUserById(id: string): Observable<User> {
        return this.http.get<UserDto>(`${this.apiUrl}/${id}`).pipe(
            map(dto => UserMapper.fromDto(dto))
        );
    }

    /**
     * Actualiza los datos de un usuario.
     * @param id - ID del usuario
     * @param user - Datos a actualizar
     */
    updateUser(id: string, user: UpdateUser): Observable<User> {
        console.log(this.LOG_TAG, 'Actualizando usuario:', id);
        return this.http.put<UserDto>(`${this.apiUrl}/${id}`, user).pipe(
            map(dto => UserMapper.fromDto(dto))
        );
    }

    /**
     * Elimina un usuario del sistema.
     * @param id - ID del usuario a eliminar
     */
    deleteUser(id: string): Observable<void> {
        console.log(this.LOG_TAG, 'Eliminando usuario:', id);
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /**
     * Asigna un rol a un usuario.
     * @param userId - ID del usuario
     * @param roleId - ID del rol a asignar
     */
    assignRole(userId: string, roleId: string): Observable<void> {
        console.log(this.LOG_TAG, 'Asignando rol', roleId, 'a usuario:', userId);
        return this.http.post<void>(`${this.apiUrl}/${userId}/roles/${roleId}`, {});
    }

    /**
     * Remueve un rol de un usuario.
     * @param userId - ID del usuario
     * @param roleId - ID del rol a remover
     */
    removeRole(userId: string, roleId: string): Observable<void> {
        console.log(this.LOG_TAG, 'Removiendo rol', roleId, 'de usuario:', userId);
        return this.http.delete<void>(`${this.apiUrl}/${userId}/roles/${roleId}`);
    }

    /**
     * Remueve todos los roles de un usuario.
     * @param userId - ID del usuario
     */
    removeAllRoles(userId: string): Observable<void> {
        console.log(this.LOG_TAG, 'Removiendo todos los roles del usuario:', userId);
        return this.http.delete<void>(`${this.apiUrl}/${userId}/roles`);
    }
}
