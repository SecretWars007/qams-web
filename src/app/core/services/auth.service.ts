// src/app/core/services/auth.service.ts
// Servicio principal de autenticación: gestiona login, tokens y estado del usuario.
import { Injectable, inject, signal, computed } from '@angular/core';
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
import { EncryptionService } from './encryption.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Prefijo para logs de seguimiento */
  private readonly LOG_TAG = '[AuthService]';

  /** URL base para endpoints de autenticación */
  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly encryptionService = inject(EncryptionService);

  // Señales reactivas para el estado de autenticación
  private readonly currentUserSignal = signal<DecodedToken | null>(this.getStoredUser());
  private readonly permissionsSignal = signal<string[]>(this.getStoredPermissions());

  // Señales públicas de solo lectura
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly permissions = this.permissionsSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly fullName = computed(() => this.currentUserSignal()?.FullName ?? '');

  constructor() {
    this.checkInitialSession();
  }

  /**
   * Verifica la sesión inicial y asegura la consistencia
   */
  private checkInitialSession(): void {
    const user = this.getStoredUser();
    const permissions = this.getStoredPermissions();

    if (user && permissions.length === 0) {
      console.warn(this.LOG_TAG, 'Sesión inconsistente detectada. Limpiando...');
      this.logout();
    } else if (user) {
      console.log(this.LOG_TAG, 'Sesión cargada para:', user.unique_name);
    }
  }

  /**
   * Inicia sesión con credenciales de usuario.
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    console.log(this.LOG_TAG, 'Login request →', `${this.apiUrl}/login`);
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      username: request.username,
      password: request.password,
    }).pipe(
      tap((res) => {
        console.log(this.LOG_TAG, 'Login exitoso, estableciendo sesión');
        this.setSession(res);
      }),
      catchError((error) => {
        console.error(this.LOG_TAG, 'Error en login:', error.status, error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Establece la sesión del usuario (tokens, signals, localStorage)
   */
  setSession(response: LoginResponse): void {
    try {
      if (!response?.accessToken) {
        console.error(this.LOG_TAG, 'Falta accessToken en la respuesta');
        return;
      }

      const decodedRaw = jwtDecode<any>(response.accessToken);
      const decoded = this.normalizeClaims(decodedRaw);
      
      const permissions = response.permissions || decoded.permission || [];
      const permsArray = Array.isArray(permissions) ? permissions : [permissions];

      // Actualizar señales
      this.currentUserSignal.set(decoded);
      this.permissionsSignal.set(permsArray);

      // Guardar en localStorage (ENCRIPTADO)
      localStorage.setItem('access_token', this.encryptionService.encrypt(response.accessToken));
      localStorage.setItem('refresh_token', this.encryptionService.encrypt(response.refreshToken));
      localStorage.setItem('permissions', this.encryptionService.encrypt(JSON.stringify(permsArray)));
      
      console.log(this.LOG_TAG, 'Sesión establecida correctamente (Datos cifrados)');
    } catch (e) {
      console.error(this.LOG_TAG, 'Error al establecer sesión:', e);
      this.logout();
    }
  }

  /**
   * Registra un nuevo usuario.
   */
  register(request: RegisterRequest): Observable<LoginResponse> {
    console.log(this.LOG_TAG, 'Registro de usuario →', request.username);
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(res => this.setSession(res)),
      catchError((error) => {
        console.error(this.LOG_TAG, 'Error en registro:', error.status, error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Renueva los tokens.
   */
  refreshToken(): Observable<LoginResponse> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      this.logout();
      return throwError(() => new Error('No hay tokens disponibles'));
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, {
      accessToken,
      refreshToken
    }).pipe(
      tap(res => this.setSession(res)),
      catchError((error) => {
        console.error(this.LOG_TAG, 'Error al refrescar token:', error.status);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Cierra la sesión.
   */
  logout(): void {
    console.log(this.LOG_TAG, 'Cerrando sesión');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('permissions');
    this.currentUserSignal.set(null);
    this.permissionsSignal.set([]);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Normaliza los claims del token JWT.
   */
  private normalizeClaims(decoded: any): DecodedToken {
    const normalized: any = {};
    const claimMap: { [key: string]: string } = {
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameid': 'nameid',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'unique_name',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'email',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'role',
      'FullName': 'FullName',
      'permission': 'permission',
    };

    Object.keys(decoded).forEach(key => {
      const shortKey = claimMap[key] || key;
      normalized[shortKey] = decoded[key];
    });

    return normalized as DecodedToken;
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/forgot-password`, request, { responseType: 'text' }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, request).pipe(
      catchError(err => throwError(() => err))
    );
  }

  changePassword(userId: string, request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, request).pipe(
      catchError(err => throwError(() => err))
    );
  }

  hasPermission(permissionCode: string): boolean {
    return this.permissions().includes(permissionCode);
  }

  /**
   * Verifica si el usuario actual tiene un rol específico.
   */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    if (!user?.role) return false;
    const roleList = Array.isArray(user.role) ? user.role : [user.role];
    return roleList.some(r => r.trim().toLowerCase() === role.trim().toLowerCase());
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    if (!user?.role) return false;
    const roleList = Array.isArray(user.role) ? user.role : [user.role];
    const adminKeywords = ['admin', 'administrador', 'superadmin'];
    return roleList.some(r => {
      const roleLower = r.toLowerCase().trim();
      return adminKeywords.some(keyword => roleLower.includes(keyword));
    });
  }

  /**
   * Obtiene el ID del usuario actual desde los claims.
   */
  getUserId(): string | null {
    const user = this.currentUser();
    if (!user) return null;
    return user.nameid as string || user.sub as string || (user.unique_name?.includes('-') ? user.unique_name : null) || null;
  }

  /**
   * Actualiza localmente los claims del usuario (útil tras editar perfil).
   */
  updateUserClaims(fullName: string, email: string): void {
    const current = this.currentUserSignal();
    if (current) {
      this.currentUserSignal.set({
        ...current,
        FullName: fullName,
        email: email
      } as DecodedToken);
    }
  }

  getAccessToken(): string | null {
    const encrypted = localStorage.getItem('access_token');
    if (!encrypted) return null;
    return this.encryptionService.decrypt(encrypted) || null;
  }

  getRefreshToken(): string | null {
    const encrypted = localStorage.getItem('refresh_token');
    if (!encrypted) return null;
    return this.encryptionService.decrypt(encrypted) || null;
  }

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

  private getStoredUser(): DecodedToken | null {
    try {
      const token = this.getAccessToken();
      if (!token) return null;
      return this.normalizeClaims(jwtDecode<any>(token));
    } catch {
      return null;
    }
  }

  private getStoredPermissions(): string[] {
    try {
      const encrypted = localStorage.getItem('permissions');
      if (!encrypted) return [];
      const decrypted = this.encryptionService.decrypt(encrypted);
      return decrypted ? JSON.parse(decrypted) : [];
    } catch {
      return [];
    }
  }
}
