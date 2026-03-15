// src/app/core/services/roles.service.ts
// Servicio para gestión de roles y permisos del sistema.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, CreateRole } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
    /** Prefijo para logs de seguimiento */
    private readonly LOG_TAG = '[RolesService]';

    /** URL base del endpoint de roles */
    private readonly apiUrl = `${environment.apiUrl}/Roles`;

    private http = inject(HttpClient);

    /** Obtiene la lista completa de roles */
    getRoles(): Observable<Role[]> {
        console.log(this.LOG_TAG, 'Obteniendo lista de roles');
        return this.http.get<Role[]>(this.apiUrl);
    }

    /**
     * Obtiene un rol por su ID.
     * @param id - Identificador del rol
     */
    getRoleById(id: string): Observable<Role> {
        return this.http.get<Role>(`${this.apiUrl}/${id}`);
    }

    /**
     * Crea un nuevo rol.
     * @param role - Datos del rol a crear
     */
    createRole(role: CreateRole): Observable<Role> {
        console.log(this.LOG_TAG, 'Creando rol:', role.name);
        return this.http.post<Role>(this.apiUrl, role);
    }

    /**
     * Actualiza un rol existente.
     * @param id - ID del rol
     * @param role - Datos actualizados
     */
    updateRole(id: string, role: CreateRole): Observable<Role> {
        console.log(this.LOG_TAG, 'Actualizando rol:', id);
        return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
    }

    /**
     * Elimina un rol del sistema.
     * @param id - ID del rol a eliminar
     */
    deleteRole(id: string): Observable<void> {
        console.log(this.LOG_TAG, 'Eliminando rol:', id);
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /**
     * Alterna el estado (Activo/Inactivo) de un rol.
     * @param id - ID del rol
     */
    toggleRoleStatus(id: string): Observable<void> {
        console.log(this.LOG_TAG, 'Cambiando estado del rol:', id);
        return this.http.post<void>(`${this.apiUrl}/${id}/toggle-status`, {});
    }

    /**
     * Duplica un rol existente junto con sus permisos.
     * @param id - ID del rol a duplicar
     */
    duplicateRole(id: string): Observable<Role> {
        console.log(this.LOG_TAG, 'Duplicando rol:', id);
        return this.http.post<Role>(`${this.apiUrl}/${id}/duplicate`, {});
    }

    /**
     * Obtiene todos los permisos disponibles del sistema.
     * En modo mock, retorna una lista estática.
     */
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
        console.log(this.LOG_TAG, 'Obteniendo permisos del sistema');
        return this.http.get<any[]>(`${this.apiUrl}/permissions`);
    }

    /**
     * Asigna una lista de permisos a un rol.
     * @param roleId - ID del rol
     * @param permissionIds - Lista de IDs de permisos a asignar
     */
    assignPermissions(roleId: string, permissionIds: string[]): Observable<void> {
        if (environment.useMock) return of(undefined);
        console.log(this.LOG_TAG, 'Asignando', permissionIds.length, 'permisos al rol:', roleId);
        return this.http.post<void>(`${this.apiUrl}/${roleId}/permissions`, {
            permissionIds
        });
    }

    /**
     * Añade un permiso específico a un rol.
     * @param roleId - ID del rol
     * @param permissionId - ID del permiso a añadir
     */
    addPermission(roleId: string, permissionId: string): Observable<void> {
        if (environment.useMock) return of(undefined);
        console.log(this.LOG_TAG, `Añadiendo permiso ${permissionId} al rol ${roleId}`);
        return this.http.post<void>(`${this.apiUrl}/${roleId}/permissions/add`, { permissionId });
    }

    /**
     * Remueve un permiso específico de un rol.
     * @param roleId - ID del rol
     * @param permissionId - ID del permiso a remover
     */
    removePermission(roleId: string, permissionId: string): Observable<void> {
        if (environment.useMock) return of(undefined);
        console.log(this.LOG_TAG, `Removiendo permiso ${permissionId} del rol ${roleId}`);
        return this.http.post<void>(`${this.apiUrl}/${roleId}/permissions/remove`, { permissionId });
    }
}
