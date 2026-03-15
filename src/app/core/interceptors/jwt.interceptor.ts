// src/app/core/interceptors/jwt.interceptor.ts
// Interceptor que agrega el JWT a cada petición HTTP saliente
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectar AuthService en interceptor funcional
  const authService = inject(AuthService);

  // Obtener el access token actual
  const token = authService.getAccessToken();

  // Si existe token, clonar la request y agregar header Authorization
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  // Si no hay token, enviar la request original
  return next(req);
};
