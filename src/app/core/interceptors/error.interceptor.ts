import Swal from 'sweetalert2';
// src/app/core/interceptors/error.interceptor.ts
// Interceptor global para manejo de errores HTTP.
// Maneja refresh de token para 401 y muestra toast para otros errores.
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
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
            Swal.fire({
              icon: 'error',
              title: 'Sesión Expirada',
              text: 'Su sesión ha expirado por inactividad. Por favor, inicie sesión nuevamente.',
              confirmButtonColor: '#150fbd'
            });
            return throwError(() => refreshError);
          }),
        );
      }

      // Manejar otros códigos de error con notificaciones toast
      switch (error.status) {
        case 400: {
          const message = error.error?.error || 'Solicitud inválida.';
          Swal.fire({
            icon: 'warning',
            title: 'Petición Inválida',
            text: message,
            confirmButtonColor: '#150fbd'
          });
          break;
        }
        case 403:
          Swal.fire({
            icon: 'error',
            title: 'Acceso Restringido',
            text: 'No cuenta con los privilegios necesarios para realizar esta acción.',
            confirmButtonColor: '#150fbd'
          });
          break;
        case 404:
          Swal.fire({
            icon: 'warning',
            title: 'Recurso No Encontrado',
            text: 'El recurso no está disponible o ha sido eliminado.',
            confirmButtonColor: '#150fbd'
          });
          break;
        case 500:
          Swal.fire({
            icon: 'error',
            title: 'Error del Sistema',
            text: 'Se ha producido un error interno. Intente nuevamente más tarde o contacte a soporte.',
            confirmButtonColor: '#150fbd'
          });
          break;
        default:
          if (error.status !== 0) {
            console.warn('[ErrorInterceptor] Error HTTP no manejado:', error.status);
          }
          Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'Ha ocurrido un error inesperado de comunicación.',
            confirmButtonColor: '#150fbd'
          });
      }

      return throwError(() => error);
    }),
  );
};
