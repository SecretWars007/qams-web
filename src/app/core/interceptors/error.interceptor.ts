// src/app/core/interceptors/error.interceptor.ts
// Interceptor global para manejo de errores HTTP.
// Maneja refresh de token para 401 y muestra toast para otros errores.
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
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
            toastr.error('Su sesión ha expirado. Inicie sesión nuevamente.');
            return throwError(() => refreshError);
          }),
        );
      }

      // Manejar otros códigos de error con notificaciones toast
      switch (error.status) {
        case 400:
          const message = error.error?.error || 'Solicitud inválida.';
          toastr.warning(message, 'Atención');
          break;
        case 403:
          toastr.error(
            'No tiene permisos para realizar esta acción.',
            'Acceso Denegado',
          );
          break;
        case 404:
          toastr.warning(
            'El recurso solicitado no fue encontrado.',
            'No Encontrado',
          );
          break;
        case 500:
          toastr.error(
            'Error interno del servidor. Contacte al administrador.',
            'Error',
          );
          break;
        default:
          if (error.status !== 0) {
            console.warn('[ErrorInterceptor] Error HTTP no manejado:', error.status);
          }
          toastr.error('Ocurrió un error inesperado.', 'Error');
      }

      return throwError(() => error);
    }),
  );
};
