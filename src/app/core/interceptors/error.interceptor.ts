// src/app/core/interceptors/error.interceptor.ts
// Interceptor global para manejo de errores HTTP.
// Maneja refresh de token para 401 y muestra toast para otros errores.
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es 401 y no es una petición de auth, intentar refresh automático
      if (error.status === 401 && !req.url.toLowerCase().includes('/auth/')) {
        console.warn('[ErrorInterceptor] Token expirado (401), intentando refresh...');
        return authService.refreshToken().pipe(
          switchMap((response) => {
            // Reintentar la request original con el nuevo token
            console.log('[ErrorInterceptor] Token refrescado, reintentando petición original');
            const cloned = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`,
              },
            });
            return next(cloned);
          }),
          catchError((refreshError) => {
            // Si falla el refresh, cerrar sesión
            console.error('[ErrorInterceptor] Refresh fallido, cerrando sesión');
            authService.logout();
            toastr.error('Su sesión ha expirado por inactividad. Por favor, inicie sesión nuevamente.', 'Sesión Expirada');
            return throwError(() => refreshError);
          }),
        );
      }

      // Manejar otros códigos de error con notificaciones toast
      switch (error.status) {
        case 400:
          const message = error.error?.error || 'Solicitud inválida.';
          toastr.warning(message, 'Petición Inválida');
          break;
        case 403:
          toastr.error(
            'No cuenta con los privilegios necesarios para realizar esta acción.',
            'Acceso Restringido',
          );
          break;
        case 404:
          toastr.warning(
            'El recurso no está disponible o ha sido eliminado.',
            'Recurso No Encontrado',
          );
          break;
        case 500:
          toastr.error(
            'Se ha producido un error interno. Intente nuevamente más tarde o contacte a soporte.',
            'Error del Sistema',
          );
          break;
        default:
          if (error.status !== 0) {
            console.warn('[ErrorInterceptor] Error HTTP no manejado:', error.status);
          }
          toastr.error('Ha ocurrido un error inesperado de comunicación.', 'Error de Conexión');
      }

      return throwError(() => error);
    }),
  );
};
