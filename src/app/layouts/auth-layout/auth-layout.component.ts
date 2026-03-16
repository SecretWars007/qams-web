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
      <!-- Background Pattern Layer (Forced Visibility) -->
      <div 
        class="absolute inset-0 opacity-[0.35] pointer-events-none mix-blend-overlay"
        style="background-image: url('/images/bg-qa.png?v=4'); background-repeat: repeat; background-size: 800px; z-index: 0;"
      ></div>

      <!-- Abstract Background Details (Stitch Inspired) -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <!-- Contenedor central -->
      <div class="w-full max-w-md z-10">
        <!-- Logo y nombre del sistema -->
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-28 h-28
                       bg-white rounded-[2.5rem] mb-6 border border-white/20
                      shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] overflow-hidden"
          >
            <img src="/images/logo.png" alt="QAMS logo" class="w-full h-full object-cover" />
          </div>
          <h1 class="text-3xl font-black text-slate-100 tracking-tight">QAMS</h1>
          <p class="text-indigo-200/70 mt-1 uppercase text-xs font-bold tracking-widest">
            Quality Assurance Management System
          </p>
        </div>

        <!-- Contenido dinámico (login o register) -->
        <router-outlet />
      </div>

      <!-- Marca Personal Oculta (Easter Egg) -->
      <div class="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center">
        <i class="fas fa-paw text-7xl text-[#f59e0b] opacity-[0.25] drop-shadow-[0_0_35px_rgba(245,158,11,0.5)]
                   filter blur-[0.8px]"></i>
        <div class="h-2 w-20 bg-gradient-to-r from-transparent via-[#f59e0b]/30 to-transparent blur-2xl mt-2"></div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
