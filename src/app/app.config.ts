// src/app/app.config.ts
// Configuración raíz de la aplicación Angular standalone
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { encryptionInterceptor } from './core/interceptors/encryption.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Configurar router con lazy loading, preloading y binding de inputs
    provideRouter(
      routes, 
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),

    // Habilitar hidratación para mejorar tiempos de carga inicial y SEO
    provideClientHydration(),

    // Configurar HttpClient con interceptors funcionales
    provideHttpClient(withInterceptors([loadingInterceptor, jwtInterceptor, encryptionInterceptor, errorInterceptor])),

    // Habilitar animaciones para toastr y CDK
    provideAnimations(),


    // Configurar Chart.js para dashboards
    provideCharts(withDefaultRegisterables()),
  ],
};
