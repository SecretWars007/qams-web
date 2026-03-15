// src/app/core/guards/auth.guard.ts
// Guard funcional que protege rutas que requieren autenticación.
// Redirige al login si el usuario no está autenticado o su token expiró.
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.isAuthenticated();
  const tokenExpired = authService.isTokenExpired();

  if (isLoggedIn && !tokenExpired) {
    return true;
  }

  // Usuario no autenticado o token expirado → redirigir al login
  console.warn('[AuthGuard] Acceso denegado: no autenticado o token expirado');
  router.navigate(['/auth/login']);
  return false;
};
