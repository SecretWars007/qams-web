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
      class="min-h-screen relative flex items-center justify-center p-4
             bg-gradient-to-br from-[#0a0a1a] via-slate-900 to-indigo-900/40 overflow-hidden"
    >
      <!-- Abstract Background Details (Stitch Inspired) -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <!-- Contenedor central -->
      <div class="w-full max-w-md z-10">
        <!-- Logo y nombre del sistema -->
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-20 h-20
                      bg-white rounded-[2rem] mb-6 border border-white/20
                      shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] overflow-hidden p-3"
          >
            <img src="/images/logo.png" alt="QAMS logo" class="w-full h-full object-contain" />
          </div>
          <h1 class="text-3xl font-black text-slate-100 tracking-tight">QAMS</h1>
          <p class="text-indigo-200/70 mt-1 uppercase text-xs font-bold tracking-widest">
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
