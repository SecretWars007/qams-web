// src/app/core/models/auth.model.ts
// Modelos para autenticación JWT

/** DTO de solicitud de login */
export interface LoginRequest {
  username: string;
  password: string;
}

/** DTO de solicitud de registro */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

/** DTO de respuesta de login/register */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  fullName: string;
  permissions: string[];
}

/** DTO de solicitud de refresh token */
export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

/** Datos del usuario decodificados del JWT */
export interface DecodedToken {
  nameid?: string; // User ID
  sub?: string;    // User ID (Alternative)
  unique_name?: string; // Username
  email?: string;
  FullName?: string;
  permission?: string[]; // Lista de permisos
  role?: string[]; // Lista de roles
  exp: number; // Expiración
}

/** DTO para solicitar el restablecimiento de contraseña mediante correo electrónico */
export interface ForgotPasswordRequest {
  email: string;
}

/** DTO para restablecer la contraseña usando el token recibido por correo */
export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

/** DTO para que un usuario autenticado cambie su contraseña actual */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
