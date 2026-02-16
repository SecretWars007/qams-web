// src/app/core/services/auth.mock.service.ts
// Servicio mock de autenticación para desarrollo y pruebas
import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  DecodedToken,
} from '../models/auth.model';

/**
 * USUARIOS DE PRUEBA DISPONIBLES
 *
 * Usuario 1: Admin (Acceso total)
 *   Username: admin
 *   Password: Admin123!
 *   Permisos: TODOS
 *
 * Usuario 2: QA Lead (Acceso parcial)
 *   Username: qa_lead
 *   Password: QaLead123!
 *   Permisos: Dashboard, Projects, Test Cases, Executions
 *
 * Usuario 3: Tester (Acceso limitado)
 *   Username: tester
 *   Password: Tester123!
 *   Permisos: Dashboard, Test Cases, Executions
 *
 * Usuario 4: PM (Project Manager)
 *   Username: pm
 *   Password: Pm123!
 *   Permisos: Dashboard, Projects, Kanban
 */

interface MockUser {
  id: string;
  username: string;
  password: string;
  email: string;
  fullName: string;
  permissions: string[];
  role: string[];
}

// Base de datos mock de usuarios
const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    username: 'admin',
    password: 'Admin123!',
    email: 'admin@qams.local',
    fullName: 'Administrador del Sistema',
    permissions: [
      'DASHBOARD_VIEW',
      'PROJECTS_VIEW',
      'PROJECTS_CREATE',
      'PROJECTS_EDIT',
      'PROJECTS_DELETE',
      'TEST_CASES_VIEW',
      'TEST_CASES_CREATE',
      'TEST_CASES_EDIT',
      'TEST_CASES_DELETE',
      'EXECUTIONS_VIEW',
      'EXECUTIONS_CREATE',
      'EXECUTIONS_EDIT',
      'EXECUTIONS_DELETE',
      'KANBAN_VIEW',
      'KANBAN_EDIT',
      'USERS_VIEW',
      'USERS_CREATE',
      'USERS_EDIT',
      'USERS_DELETE',
      'ROLES_VIEW',
      'ROLES_CREATE',
      'ROLES_EDIT',
      'ROLES_DELETE',
      'CATALOGS_VIEW',
      'CATALOGS_CREATE',
      'CATALOGS_EDIT',
      'CATALOGS_DELETE',
    ],
    role: ['Admin', 'QA', 'Developer'],
  },
  {
    id: '2',
    username: 'qa_lead',
    password: 'QaLead123!',
    email: 'qa.lead@qams.local',
    fullName: 'Lead de Control de Calidad',
    permissions: [
      'DASHBOARD_VIEW',
      'PROJECTS_VIEW',
      'PROJECTS_CREATE',
      'PROJECTS_EDIT',
      'TEST_CASES_VIEW',
      'TEST_CASES_CREATE',
      'TEST_CASES_EDIT',
      'EXECUTIONS_VIEW',
      'EXECUTIONS_CREATE',
      'EXECUTIONS_EDIT',
      'KANBAN_VIEW',
      'KANBAN_EDIT',
    ],
    role: ['QA', 'Lead'],
  },
  {
    id: '3',
    username: 'tester',
    password: 'Tester123!',
    email: 'tester@qams.local',
    fullName: 'Ingeniero de Pruebas',
    permissions: [
      'DASHBOARD_VIEW',
      'TEST_CASES_VIEW',
      'TEST_CASES_CREATE',
      'EXECUTIONS_VIEW',
      'EXECUTIONS_CREATE',
      'EXECUTIONS_EDIT',
    ],
    role: ['QA'],
  },
  {
    id: '4',
    username: 'pm',
    password: 'Pm123!',
    email: 'pm@qams.local',
    fullName: 'Gestor de Proyectos',
    permissions: [
      'DASHBOARD_VIEW',
      'PROJECTS_VIEW',
      'PROJECTS_CREATE',
      'PROJECTS_EDIT',
      'KANBAN_VIEW',
      'KANBAN_EDIT',
    ],
    role: ['PM'],
  },
  {
    id: '5',
    username: 'developer',
    password: 'Dev123!',
    email: 'developer@qams.local',
    fullName: 'Desarrollador',
    permissions: ['DASHBOARD_VIEW', 'PROJECTS_VIEW'],
    role: ['Developer'],
  },
  {
    id: '6',
    username: 'gusgus',
    password: 'Gus123!',
    email: 'gus@qams.local',
    fullName: 'Usuario Especial',
    permissions: [
      'DASHBOARD_VIEW',
      'PROJECTS_VIEW',
      'TEST_CASES_VIEW',
      'EXECUTIONS_VIEW',
      'KANBAN_VIEW',
    ],
    role: ['QA', 'Tester'],
  },
];

/**
 * Genera un JWT fake (válido solo para el frontend)
 * Nota: Este token no será válido para un backend real
 */
function generateFakeJWT(user: MockUser): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(
    JSON.stringify({
      nameid: user.id,
      unique_name: user.username,
      email: user.email,
      FullName: user.fullName,
      permission: user.permissions,
      role: user.role,
      exp: now + 86400, // 24 horas
      iat: now,
    }),
  );

  // Firma fake (no es válida criptográficamente)
  const signature = btoa('fake-signature-for-development');

  return `${header}.${payload}.${signature}`;
}

@Injectable({ providedIn: 'root' })
export class AuthMockService {
  // Señales reactivas para el estado de autenticación
  private currentUserSignal = signal<DecodedToken | null>(
    this.getStoredUser(),
  );
  private permissionsSignal = signal<string[]>(this.getStoredPermissions());

  // Señales computadas de solo lectura para los componentes
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly permissions = this.permissionsSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly fullName = computed(() => this.currentUserSignal()?.FullName ?? '');

  constructor() {
    this.checkInitialSession();
  }

  /**
   * Verifica la sesión inicial y asegura la consistencia entre token y permisos
   */
  private checkInitialSession(): void {
    const user = this.getStoredUser();
    const permissions = this.getStoredPermissions();

    if (user && permissions.length === 0) {
      console.warn('AuthMockService: Sesión inconsistente detectada (token sin permisos). Limpiando...');
      this.logout();
    } else if (user) {
      console.log('AuthMockService: Sesión inicial cargada con éxito para:', user.unique_name);
    }
  }

  /**
   * Login mock - valida credenciales contra usuarios de prueba
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    console.log('Login attempt for:', request.username, 'Password:', request.password);
    console.log('Available usernames:', MOCK_USERS.map(u => u.username));

    // Buscar usuario
    const user = MOCK_USERS.find(
      (u) =>
        u.username === request.username && u.password === request.password,
    );

    if (!user) {
      console.error('User not found in MOCK_USERS');
      throw new Error('Credenciales inválidas');
    }

    // Generar tokens fake
    const accessToken = generateFakeJWT(user);
    const refreshToken = generateFakeJWT(user);

    // Guardar en localStorage
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('permissions', JSON.stringify(user.permissions));

    // Actualizar señales
    const decoded = jwtDecode<DecodedToken>(accessToken);
    this.currentUserSignal.set(decoded);
    this.permissionsSignal.set(user.permissions);

    // Retornar respuesta válida
    const now = Math.floor(Date.now() / 1000);
    const response: LoginResponse = {
      accessToken,
      refreshToken,
      expiresAt: new Date(now * 1000 + 86400000).toISOString(), // 24 horas
      fullName: user.fullName,
      permissions: user.permissions,
    };

    return of(response).pipe(
      delay(500),
      tap(res => this.setSession(res))
    );
  }

  /**
   * Actualiza el estado de autenticación con una respuesta de login real o mock
   */
  setSession(response: LoginResponse): void {
    console.log('AuthMockService: setSession CALL with response:', response);

    // Actualizar señales PRIMERO para asegurar que los guards vean el cambio inmediatamente
    try {
      const decodedRaw = jwtDecode<any>(response.accessToken);
      const decoded = this.normalizeClaims(decodedRaw);
      console.log('AuthMockService: Decoded token claims:', decoded);

      // Sincronizar permisos
      const resPerms = response.permissions;
      const tokenPerms = decoded.permission;
      console.log('AuthMockService: Response perms:', resPerms);
      console.log('AuthMockService: Token perms:', tokenPerms);

      let permissions = (resPerms && resPerms.length > 0) ? resPerms : (tokenPerms || []);

      if (!Array.isArray(permissions)) {
        permissions = [permissions];
      }

      // Fallback: Si no hay permisos pero hay roles, intentar mapear desde MOCK_USERS
      if (permissions.length === 0 && decoded.role) {
        console.log('AuthMockService: No hay permisos explícitos. Intentando mapear desde roles:', decoded.role);
        const roles = Array.isArray(decoded.role) ? decoded.role : [decoded.role];

        // Buscar el primer usuario mock que coincida con alguno de los roles
        const templateUser = MOCK_USERS.find(u =>
          u.role.some(r => roles.some(userRole => userRole.toLowerCase() === r.toLowerCase()))
        );

        if (templateUser) {
          permissions = templateUser.permissions;
          console.log('AuthMockService: Permisos heredados del template mock:', templateUser.username);
        }
      }

      // Último recurso: si sigue vacío pero está autenticado, dar permisos básicos
      if (permissions.length === 0) {
        console.warn('AuthMockService: Sin permisos ni roles mapeables. Asignando permisos básicos de lectura.');
        permissions = ['DASHBOARD_VIEW', 'PROJECTS_VIEW', 'TEST_CASES_VIEW', 'EXECUTIONS_VIEW', 'KANBAN_VIEW'];
      }

      console.log('AuthMockService: FINAL permissions to set:', permissions);

      this.currentUserSignal.set(decoded);
      this.permissionsSignal.set(permissions);
      console.log('AuthMockService: Signals updated. Authenticated:', this.isAuthenticated());

      // Guardar en localStorage DESPUÉS
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('permissions', JSON.stringify(permissions));
      console.log('AuthMockService: LocalStorage updated');
    } catch (e) {
      console.error('Error in setSession:', e);
      this.logout();
    }
  }

  /**
   * Normaliza los claims de .NET (URIs largas) a nombres de propiedad cortos
   * que espera la interfaz DecodedToken.
   */
  private normalizeClaims(decoded: any): DecodedToken {
    const normalized: any = {};
    const claimMap: { [key: string]: string } = {
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameid': 'nameid',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': 'nameid',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'unique_name',
      'unique_name': 'unique_name',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'email',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'role',
      'role': 'role',
      'roles': 'role',
      'FullName': 'FullName',
      'fullName': 'FullName',
      'permission': 'permission',
      'permissions': 'permission'
    };

    Object.keys(decoded).forEach(key => {
      const shortKey = claimMap[key] || key;
      normalized[shortKey] = decoded[key];

      // Búsqueda proactiva de permisos si no se mapeó directamente
      if (!normalized['permission'] &&
        (key.toLowerCase().includes('permission') || key.toLowerCase().includes('permiso'))) {
        normalized['permission'] = decoded[key];
      }
    });

    return normalized as DecodedToken;
  }

  /**
   * Valida un username contra la base de datos mock
   */
  validateUsername(username: string): boolean {
    return MOCK_USERS.some((u) => u.username === username);
  }

  /**
   * Valida una contraseña para un usuario
   */
  validatePassword(username: string, password: string): boolean {
    const user = MOCK_USERS.find((u) => u.username === username);
    return user ? user.password === password : false;
  }

  /**
   * Mock Register - Simulates successful registration and login
   */
  register(request: RegisterRequest): Observable<LoginResponse> {
    const user: MockUser = {
      id: Math.floor(Math.random() * 1000).toString(),
      username: request.username,
      password: request.password,
      email: request.email,
      fullName: request.fullName,
      permissions: [
        'DASHBOARD_VIEW',
        'PROJECTS_VIEW',
        'TEST_CASES_VIEW',
        'EXECUTIONS_VIEW',
        'KANBAN_VIEW',
      ], // Permissions for new user
      role: ['QA'],
    };

    console.log('AuthMockService: Mock User created with permissions:', user.permissions);

    // Save tokens and permissions to localStorage
    const accessToken = generateFakeJWT(user);
    const refreshToken = generateFakeJWT(user);

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('permissions', JSON.stringify(user.permissions));

    const now = Math.floor(Date.now() / 1000);
    const response: LoginResponse = {
      accessToken,
      refreshToken,
      expiresAt: new Date(now * 1000 + 86400000).toISOString(),
      fullName: user.fullName,
      permissions: user.permissions,
    };

    console.log('AuthMockService: Mock Register successful, returning observable');
    return of(response).pipe(
      delay(800),
      tap(res => {
        console.log('AuthMockService: Register completion tap, calling setSession');
        this.setSession(res);
      })
    );
  }

  /**
   * Mock Refresh Token - Returns new valid tokens
   */
  refreshToken(): Observable<LoginResponse> {
    const user = this.currentUserSignal() ?
      this.getUserByUsername(this.currentUserSignal()?.unique_name || '') : null;

    if (!user) {
      return of({} as LoginResponse).pipe(
        delay(200),
        tap(() => { throw new Error('Invalid session'); })
      );
    }

    const accessToken = generateFakeJWT(user);
    const refreshToken = generateFakeJWT(user);
    const now = Math.floor(Date.now() / 1000);

    const response: LoginResponse = {
      accessToken,
      refreshToken,
      expiresAt: new Date(now * 1000 + 86400000).toISOString(),
      fullName: user.fullName,
      permissions: user.permissions,
    };

    return of(response).pipe(delay(200));
  }

  /**
   * Obtiene todos los usuarios disponibles
   */
  getMockUsers(): MockUser[] {
    return MOCK_USERS;
  }

  /**
   * Obtiene un usuario por username
   */
  getUserByUsername(username: string): MockUser | undefined {
    return MOCK_USERS.find((u) => u.username === username);
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('permissions');
    this.currentUserSignal.set(null);
    this.permissionsSignal.set([]);
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    return this.permissionsSignal().includes(permission);
  }

  /**
   * Obtiene el usuario almacenado en localStorage
   */
  private getStoredUser(): DecodedToken | null {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;

      const decodedRaw = jwtDecode<any>(token);
      return this.normalizeClaims(decodedRaw);
    } catch {
      return null;
    }
  }

  /**
   * Obtiene los permisos almacenados en localStorage
   */
  private getStoredPermissions(): string[] {
    try {
      const permissions = localStorage.getItem('permissions');
      return permissions ? JSON.parse(permissions) : [];
    } catch {
      return [];
    }
  }
}
