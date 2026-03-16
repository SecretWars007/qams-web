// src/app/features/auth/login/login/login.mock.component.ts
// Componente de login con opción de usuarios de prueba
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthMockService } from '../../../../core/services/auth.mock.service';
import { LoginRequest } from '../../../../core/models/auth.model';

interface TestUser {
  username: string;
  password: string;
  description: string;
}

@Component({
  selector: 'app-login-mock',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="card">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 text-center mb-2">
          Iniciar Sesión
        </h2>
        <p class="text-sm text-yellow-600 text-center font-medium">
          🧪 MODO DESARROLLO - Usuarios de Prueba
        </p>
      </div>

      <!-- Selector rápido de usuarios de prueba -->
      <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-sm font-medium text-gray-700 mb-3">
          📋 Usuarios de Prueba Disponibles:
        </p>
        <div class="grid grid-cols-1 gap-2">
          @for (user of testUsers; track user.username) {
            <button
              type="button"
              (click)="selectTestUser(user)"
              class="text-left p-3 bg-white border border-blue-200 rounded-lg
                     hover:bg-blue-50 hover:border-blue-400 transition-colors
                     text-sm"
            >
              <div class="font-medium text-blue-600">{{ user.username }}</div>
              <div class="text-gray-600 text-xs">{{ user.description }}</div>
            </button>
          }
        </div>
      </div>

      <div class="border-t border-gray-200 my-4 flex items-center">
        <span class="text-xs text-gray-500 bg-white px-2">O</span>
      </div>

      <!-- Formulario manual -->
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Username -->
        <div>
          <label class="form-label">Usuario</label>
          <input
            type="text"
            class="form-input"
            [(ngModel)]="form.username"
            name="username"
            placeholder="Ingrese usuario"
            required
            autofocus
          />
          @if (availableUsers.length > 0 && form.username) {
            <div class="mt-2 p-2 bg-gray-50 rounded text-xs">
              <p class="text-gray-600 font-medium mb-1">Usuarios disponibles:</p>
              <ul class="text-gray-700 space-y-1">
                @for (user of availableUsers; track user.username) {
                  <li class="cursor-pointer hover:text-blue-600"
                      (click)="form.username = user.username">
                    • {{ user.username }}
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <!-- Password -->
        <div>
          <div class="flex items-center justify-between">
            <label class="form-label">Contraseña</label>
            <a routerLink="/auth/forgot-password" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <input
            type="password"
            class="form-input"
            [(ngModel)]="form.password"
            name="password"
            placeholder="Contraseña"
            required
          />
        </div>

        <!-- Botón Login -->
        <button
          type="submit"
          class="btn-primary w-full flex items-center justify-center gap-2"
          [disabled]="loading()"
        >
          @if (loading()) {
            <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Ingresando...
          } @else {
            Iniciar Sesión
          }
        </button>
      </form>

      <!-- Link a registro -->
      <p class="mt-4 text-center text-sm text-gray-600">
        ¿No tienes cuenta?
        <a
          routerLink="/auth/register"
          class="text-primary-600 hover:text-primary-700 font-medium"
        >
          Regístrate aquí
        </a>
      </p>

      <!-- Info de desarrollo -->
      <div class="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-700">
        <p class="font-medium mb-2">💡 Modo Desarrollo:</p>
        <ul class="list-disc list-inside space-y-1 text-gray-600">
          <li>Estos usuarios son solo para frontend</li>
          <li>Los tokens no son válidos para un backend real</li>
          <li>Para producción, usar un backend real</li>
          <li>Ver auth.mock.service.ts para cambiar usuarios</li>
        </ul>
      </div>
    </div>
  `,
})
export class LoginMockComponent {
  form: LoginRequest = { username: '', password: '' };
  loading = signal(false);

  testUsers: TestUser[] = [
    {
      username: 'admin',
      password: 'Admin123!',
      description: '👑 Admin - Acceso total al sistema',
    },
    {
      username: 'qa_lead',
      password: 'QaLead123!',
      description: '📊 Lead QA - Control de calidad',
    },
    {
      username: 'tester',
      password: 'Tester123!',
      description: '🧪 Tester - Ingeniero de pruebas',
    },
    {
      username: 'pm',
      password: 'Pm123!',
      description: '📈 PM - Gestor de proyectos',
    },
    {
      username: 'developer',
      password: 'Dev123!',
      description: '💻 Developer - Desarrollador',
    },
    {
      username: 'gusgus',
      password: 'Gus123!',
      description: '🦖 GusGus - Admin de QA (Test grouping fixed)',
    },
  ];

  availableUsers = this.testUsers;

  constructor(
    private authService: AuthMockService,
    private router: Router,
    private toastr: ToastService,
  ) { }

  selectTestUser(user: TestUser): void {
    this.form.username = user.username;
    this.form.password = user.password;
  }

  onSubmit(): void {
    if (!this.form.username || !this.form.password) {
      this.toastr.warning('Complete todos los campos.', 'Atención');
      return;
    }

    // Validar contra mock
    if (
      !this.authService.validatePassword(this.form.username, this.form.password)
    ) {
      this.toastr.error('Usuario o contraseña inválidos.', 'Error');
      return;
    }

    this.loading.set(true);

    this.authService.login(this.form).subscribe({
      next: () => {
        this.toastr.success('¡Bienvenido!', '✓ Sesión iniciada');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.toastr.error(err.message || 'Error al iniciar sesión', 'Error');
        this.loading.set(false);
      },
    });
  }
}
