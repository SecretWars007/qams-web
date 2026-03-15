// src/app/core/guards/permission.guard.ts
// Guard que protege rutas por permiso específico
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  // Obtener el permiso requerido de la data de la ruta
  const requiredPermission = route.data?.['permission'] as string;

  // Si no se especificó permiso, permitir acceso
  if (!requiredPermission) return true;

  const isLoggedIn = authService.isAuthenticated();
  const userPermissions = authService.permissions();
  console.log('PermissionGuard: Access attempt detected');
  console.log('- Path:', route.routeConfig?.path);
  console.log('- Required:', requiredPermission);
  console.log('- Authenticated:', isLoggedIn);
  console.log('- Permissions:', userPermissions);

  // Verificar si el usuario tiene el permiso
  if (authService.hasPermission(requiredPermission)) {
    console.log('PermissionGuard: Access GRANTED');
    return true;
  }

  console.warn('PermissionGuard: ACCESS DENIED for', requiredPermission);
  // Si no tiene permiso, mostrar mensaje y redirigir al login
  toastr.error(
    'No tiene permisos para acceder a esta sección.',
    'Acceso Denegado',
  );
  router.navigate(['/auth/login']);
  return false;
};
