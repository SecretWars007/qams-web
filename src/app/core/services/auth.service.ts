// src/app/core/services/auth.service.ts
// Servicio principal de autenticación: login, register, tokens, permisos.
// Delega la gestión de sesión al AuthMockService para compatibilidad mock/real.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  DecodedToken,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { AuthMockService } from './auth.mock.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Prefijo para logs de seguimiento */
  private readonly LOG_TAG = '[AuthService]';

  /** URL base para endpoints de autenticación */
  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  private http = inject(HttpClient);
  private router = inject(Router);
  private authMockService = inject(AuthMockService);

  /** Señales reactivas delegadas al Mock Service */
  readonly currentUser = this.authMockService.currentUser;
  readonly permissions = this.authMockService.permissions;
  readonly isAuthenticated = this.authMockService.isAuthenticated;
  readonly fullName = this.authMockService.fullName;

  /**
   * Inicia sesión con credenciales de usuario.
   * @param request - Credenciales (username, password)
   * @returns Observable con la respuesta de login (tokens + claims)
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    console.log(this.LOG_TAG, 'Login request →', `${this.apiUrl}/login`);
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      username: request.username,
      password: request.password,
    }).pipe(
      tap((res) => {
        console.log(this.LOG_TAG, 'Login exitoso, estableciendo sesión');
        this.authMockService.setSession(res);
      }),
      catchError((error) => {
        console.error(this.LOG_TAG, 'Error en login:', error.status, error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * @param request - Datos de registro (username, email, password, fullName)
   * @returns Observable con la respuesta de login automática
   */
  register(request: RegisterRequest): Observable<LoginResponse> {
    console.log(this.LOG_TAG, 'Registro de usuario →', request.username);
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((res) => {
        console.log(this.LOG_TAG, 'Registro exitoso, estableciendo sesión');
        this.authMockService.setSession(res);
      }),
      catchError((error) => {
        console.error(this.LOG_TAG, 'Error en registro:', error.status, error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Renueva el access token usando el refresh token almacenado.
   * Si usa mock, delega al AuthMockService.
   * @returns Observable con nuevos tokens
   */
  refreshToken(): Observable<LoginResponse> {
    if (environment.useMock) {
      return this.authMockService.refreshToken().pipe(
        tap(res => this.authMockService.setSession(res))
      );
    }

    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      console.warn(this.LOG_TAG, 'No hay tokens disponibles para refresh, cerrando sesión');
      this.logout();
      return throwError(() => new Error('No tokens available for refresh'));
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, {
      accessToken,
      refreshToken
    }).pipe(
      tap(() => console.log(this.LOG_TAG, 'Token refrescado exitosamente')),
      tap(res => this.authMockService.setSession(res)),
      catchError((error) => {
        console.error(this.LOG_TAG, 'Error al refrescar token:', error.status);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Solicita el restablecimiento de contraseña por email.
   * @param request - Email del usuario
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    if (environment.useMock) {
      return this.authMockService.forgotPassword(request);
    }
    return this.http.post(`${this.apiUrl}/forgot-password`, request, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error(this.LOG_TAG, 'Error en forgotPassword:', error.status);
        return throwError(() => error);
      })
    );
  }

  /**
   * Restablece la contraseña usando el token de recuperación.
   * @param request - Token de reset + nueva contraseña
   */
  resetPassword(request: ResetPasswordRequest): Observable<void> {
    if (environment.useMock) {
      return this.authMockService.resetPassword(request);
    }
    return this.http.post<void>(`${this.apiUrl}/reset-password`, request).pipe(
      catchError((error) => {
        console.error(this.LOG_TAG, 'Error en resetPassword:', error.status);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * @param userId - ID del usuario
   * @param request - Contraseña actual y nueva
   */
  changePassword(userId: string, request: ChangePasswordRequest): Observable<void> {
    if (environment.useMock) {
      return this.authMockService.changePassword(request);
    }
    return this.http.post<void>(`${this.apiUrl}/change-password`, request).pipe(
      catchError((error) => {
        console.error(this.LOG_TAG, 'Error en changePassword:', error.status);
        return throwError(() => error);
      })
    );
  }

  /** Cierra la sesión y redirige al login */
  logout(): void {
    console.log(this.LOG_TAG, 'Cerrando sesión');
    this.authMockService.logout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica si el usuario tiene un permiso específico.
   * @param permissionCode - Código del permiso (e.g., 'DASHBOARD_VIEW')
   */
  hasPermission(permissionCode: string): boolean {
    return this.authMockService.hasPermission(permissionCode);
  }

  /**
   * Verifica si el usuario tiene al menos uno de los permisos dados.
   * @param permissionCodes - Lista de códigos de permiso
   */
  hasAnyPermission(...permissionCodes: string[]): boolean {
    const currentPermissions = this.authMockService.permissions();
    return permissionCodes.some((code) => currentPermissions.includes(code));
  }

  /**
   * Verifica si el usuario actual tiene el rol de Administrador.
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    if (!user) {
      console.warn(this.LOG_TAG, 'isAdmin: No current user found');
      return false;
    }

    const roles = user.role;
    if (!roles) {
      console.warn(this.LOG_TAG, 'isAdmin: No roles found in user claims');
      return false;
    }

    // Normalizar a array si viene como string
    const roleList = Array.isArray(roles) ? roles : [roles];
    
    // Lista de nombres de rol permitidos para administración
    const adminRoles = ['admin', 'administrador', 'administrator', 'superadmin'];
    
    const isUserAdmin = roleList.some(r => 
      typeof r === 'string' && adminRoles.includes(r.toLowerCase().trim())
    );



    return isUserAdmin;
  }

  /** Obtiene el access token almacenado en localStorage */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /** Obtiene el refresh token almacenado en localStorage */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /** Verifica si el token actual ha expirado */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Obtiene el ID del usuario desde los claims del token decodificado.
   * Busca en los claims: nameid, sub, o unique_name (si es GUID).
   */
  getUserId(): string | null {
    const user = this.currentUser();
    const id = user?.nameid || user?.sub || (user?.unique_name?.includes('-') ? user.unique_name : null);
    if (!id) {
      console.warn(this.LOG_TAG, 'No se encontró un ID de usuario válido en los claims');
    }
    return id ?? null;
  }
}
