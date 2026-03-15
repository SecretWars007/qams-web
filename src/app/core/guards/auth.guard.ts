import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ⚠ IMPORTANTE: isAuthenticated es una SIGNAL → se llama como función
  const isLoggedIn = authService.isAuthenticated();
  const tokenExpired = authService.isTokenExpired();

  if (isLoggedIn && !tokenExpired) {
    return true;
  }

  // Si no está autenticado o el token expiró
  router.navigate(['/auth/login']);
  return false;
};
