// src/app/layouts/auth-layout/auth-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- Layout de pantalla completa para login/register -->
    <div
      class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950
                flex items-center justify-center p-4"
    >
      <!-- Logo y nombre del sistema -->
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-16 h-16
                      bg-white/10 backdrop-blur-sm rounded-2xl mb-4"
          >
            <svg
              class="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white">QAMS</h1>
          <p class="text-primary-200 mt-1">
            Quality Assurance Management System
          </p>
        </div>

        <!-- Contenido dinámico (login o register) -->
        <router-outlet />
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
