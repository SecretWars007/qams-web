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
             bg-[#F6F6F8] overflow-hidden"
    >
      <!-- Background Pattern Layer (Forced Visibility - Synchronized) -->
      <div 
        class="absolute inset-0 opacity-[0.25] pointer-events-none transition-opacity duration-700"
        style="background-image: url('/images/bg-qa.png?v=5'); background-repeat: repeat; background-size: 800px; z-index: 0;"
      ></div>

      <!-- Abstract Background Details (Stitch Inspired - Adjusted for Light Theme) -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <!-- Contenedor central -->
      <div class="w-full max-w-md z-10 relative">
        <!-- Logo y nombre del sistema -->
        <div class="text-center mb-10">
          <div
            class="inline-flex items-center justify-center w-32 h-32
                       bg-white rounded-[2.5rem] mb-6 border border-slate-200
                      shadow-[0_20px_50px_-10px_rgba(15,23,42,0.1)] overflow-hidden"
          >
            <img src="/images/logo.png" alt="QAMS logo" class="w-full h-full object-cover" />
          </div>
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">QAMS</h1>
          <p class="text-slate-500 mt-2 uppercase text-xs font-bold tracking-widest">
            Quality Assurance Management System
          </p>
        </div>

        <!-- Contenido dinámico (login o register) -->
        <router-outlet />
      </div>

      <!-- Marca Personal Oculta (Easter Egg) -->
      <div class="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center">
        <i class="fas fa-paw text-7xl text-[#f59e0b] opacity-[0.3] drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]
                   filter blur-[0.5px]"></i>
        <div class="h-2 w-20 bg-gradient-to-r from-transparent via-[#f59e0b]/20 to-transparent blur-2xl mt-2"></div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
