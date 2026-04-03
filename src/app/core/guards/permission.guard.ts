import Swal from 'sweetalert2';
// src/app/core/guards/permission.guard.ts
// Guard funcional que protege rutas por permiso específico.
// Verifica que el usuario tenga el permiso declarado en route.data['permission'].
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener el permiso requerido de la data de la ruta
  const requiredPermission = route.data?.['permission'] as string;

  // Si no se especificó permiso, permitir acceso
  if (!requiredPermission) return true;

  // Log consolidado de verificación de acceso
  console.log(
    '[PermissionGuard]',
    `Ruta: ${route.routeConfig?.path}`,
    `| Permiso requerido: ${requiredPermission}`,
    `| Autenticado: ${authService.isAuthenticated()}`
  );

  // Verificar si el usuario tiene el permiso
  if (authService.hasPermission(requiredPermission)) {
    console.log('[PermissionGuard] Acceso CONCEDIDO');
    return true;
  }

  // Sin permiso → notificar y redirigir al login
  console.warn('[PermissionGuard] Acceso DENEGADO para:', requiredPermission);
  Swal.fire({
      icon: 'error',
      title: 'Acceso Restringido',
      text: 'No cuenta con los permisos necesarios para acceder a esta sección.',
      confirmButtonColor: '#150fbd'
    });
  router.navigate(['/auth/login']);
  return false;
};
