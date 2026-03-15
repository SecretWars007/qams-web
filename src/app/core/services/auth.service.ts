// src/app/core/services/auth.service.ts
// Servicio de autenticación
import { Injectable, computed, inject } from '@angular/core';
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
  // URL base para endpoints de autenticación
  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  // Inyección de dependencias con inject() para evitar problemas de inicialización
  private http = inject(HttpClient);
  private router = inject(Router);
  private authMockService = inject(AuthMockService);

  // Señales reactivas delegadas al Mock Service
  readonly currentUser = this.authMockService.currentUser;
  readonly permissions = this.authMockService.permissions;
  readonly isAuthenticated = this.authMockService.isAuthenticated;
  readonly fullName = this.authMockService.fullName;

  constructor() { }

  /**
   * Inicia sesión usando el API real
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    console.log('Enviando login request a:', `${this.apiUrl}/login`, request);
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      username: request.username,
      password: request.password,
    }).pipe(
      tap((res) => {
        console.log('AuthService: Login response recibida en tap, llamando a setSession', res);
        this.authMockService.setSession(res);
        console.log('AuthService: setSession completado en tap');
      }),
      catchError((error) => {
        console.error('Login error detallado:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra un nuevo usuario usando el API real
   */
  register(request: RegisterRequest): Observable<LoginResponse> {
    console.log('AuthService: register CALL with:', request);
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((res) => {
        console.log('AuthService: register SUCCESS, calling setSession with:', res);
        this.authMockService.setSession(res);
      }),
      catchError((error) => {
        console.error('AuthService: Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Renueva el access token usando el API real
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
      this.logout();
      return throwError(() => new Error('No tokens available for refresh'));
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, {
      accessToken,
      refreshToken
    }).pipe(
      tap(res => {
        console.log('AuthService: Token refrescado con éxito');
        this.authMockService.setSession(res);
      }),
      catchError((error) => {
        console.error('AuthService: Error al refrescar token:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Solicita el restablecimiento de contraseña
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    if (environment.useMock) {
      return this.authMockService.forgotPassword(request);
    }
    return this.http.post(`${this.apiUrl}/forgot-password`, request, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('AuthService: forgotPassword error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Restablece la contraseña usando el token de recuperación
   */
  resetPassword(request: ResetPasswordRequest): Observable<void> {
    if (environment.useMock) {
      return this.authMockService.resetPassword(request);
    }
    return this.http.post<void>(`${this.apiUrl}/reset-password`, request).pipe(
      catchError((error) => {
        console.error('AuthService: resetPassword error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cambia la contraseña del usuario actualmente autenticado
   */
  changePassword(userId: string, request: ChangePasswordRequest): Observable<void> {
    if (environment.useMock) {
      return this.authMockService.changePassword(request);
    }
    return this.http.post<void>(`${this.apiUrl}/change-password`, request).pipe(
      catchError((error) => {
        console.error('AuthService: changePassword error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    this.authMockService.logout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica si el usuario tiene un permiso específico.
   */
  hasPermission(permissionCode: string): boolean {
    return this.authMockService.hasPermission(permissionCode);
  }

  /**
   * Verifica si el usuario tiene al menos uno de los permisos.
   */
  hasAnyPermission(...permissionCodes: string[]): boolean {
    const currentPermissions = this.authMockService.permissions();
    return permissionCodes.some((code) => currentPermissions.includes(code));
  }

  /** Obtiene el access token del localStorage */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /** Obtiene el refresh token del localStorage */
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

  /** Obtiene el ID del usuario desde el token */
  getUserId(): string | null {
    const user = this.currentUser();
    // Probar varios posibles nombres de claim para el ID (nameid, sub, unique_name si es GUID)
    const id = user?.nameid || user?.sub || (user?.unique_name?.includes('-') ? user.unique_name : null);
    if (!id) {
      console.warn('AuthService: No se pudo encontrar un ID de usuario válido en los claims:', user);
    }
    return id ?? null;
  }
}
