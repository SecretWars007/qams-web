# ⚙️ Configuración de Login Mock

## 🎯 Objetivo

Reemplazar el LoginComponent regular con LoginMockComponent para desarrollo y testing del frontend sin necesidad de un backend real.

---

## ✅ Opción 1: Cambiar Ruta Permanente (Recomendado para Desarrollo)

### Paso 1: Editar `app.routes.ts`

Ubicación: `src/app/app.routes.ts` (línea ~20)

**Cambiar:**
```typescript
{
  path: 'login',
  loadComponent: () =>
    import('./features/auth/login/login/login.component').then(
      (m) => m.LoginComponent,
    ),
},
```

**Por:**
```typescript
{
  path: 'login',
  loadComponent: () =>
    import('./features/auth/login/login/login.mock.component').then(
      (m) => m.LoginMockComponent,
    ),
},
```

### Paso 2: Recargar la aplicación

```bash
# El servidor de desarrollo debería recargarse automáticamente
# Si no, presiona Ctrl+Shift+R para recargar sin caché
```

### Paso 3: Probar

1. Accede a `http://localhost:4200/auth/login`
2. Deberías ver los usuarios de prueba
3. Haz click en uno de los botones para seleccionar un usuario
4. Click en "Iniciar Sesión"

---

## 🔄 Opción 2: Cambiar Dinámicamente con Environment (Mejor Práctica)

### Paso 1: Actualizar Environment Files

**archivo: `src/environments/environment.ts`**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useMockLogin: true,  // ← Agregar
};
```

**archivo: `src/environments/environment.prod.ts`**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.qams.com/api',
  useMockLogin: false,  // ← Agregar
};
```

### Paso 2: Actualizar Routes Dinámicamente

**archivo: `src/app/app.config.ts`**

```typescript
import { ApplicationConfig, importProxyZoneChangeDetectionStrategy } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ... otros providers
  ],
};
```

**archivo: `src/app/app.routes.ts`**

```typescript
import { Routes } from '@angular/router';
import { environment } from '../environments/environment';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(
        (m) => m.AuthLayoutComponent,
      ),
    children: [
      {
        path: 'login',
        loadComponent: () => {
          // Elegir componente según environment
          if (environment.useMockLogin) {
            return import('./features/auth/login/login/login.mock.component').then(
              (m) => m.LoginMockComponent,
            );
          } else {
            return import('./features/auth/login/login/login.component').then(
              (m) => m.LoginComponent,
            );
          }
        },
      },
      // ... resto de rutas
    ],
  },
  // ...
];
```

### Paso 3: Compilar para Producción

```bash
# Desarrollo (usa mock)
ng serve

# Producción (usa login real)
ng build --configuration production
```

---

## 📱 Opción 3: Toggle Manual en Componente

Si quieres permitir cambiar entre login real y mock en tiempo de ejecución:

### Actualizar LoginComponent

```typescript
import { Component, signal } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { LoginMockComponent } from './login/login.mock.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-router',
  standalone: true,
  imports: [CommonModule, LoginComponent, LoginMockComponent],
  template: `
    @if (useMock(); track $event) {
      <app-login-mock />
    } @else {
      <app-login />
    }

    <!-- Toggle Button (solo en desarrollo) -->
    @if (!production()) {
      <button
        (click)="toggleMock()"
        class="fixed bottom-4 right-4 px-3 py-2 bg-gray-800 text-white rounded text-xs"
      >
        {{ useMock() ? '🧪 Mock' : '📡 Real' }}
      </button>
    }
  `,
})
export class LoginRouterComponent {
  useMock = signal(true);
  production = signal(false);

  toggleMock() {
    this.useMock.set(!this.useMock());
  }
}
```

---

## 🔐 Cambiar AuthService Inyectado

Si prefieres mantener la misma UI pero cambiar el servicio que se usa:

### En `app.config.ts`

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthMockService } from './core/services/auth.mock.service';
import { AuthService } from './core/services/auth.service.service';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Proporcionar el servicio correcto según environment
    {
      provide: AuthService,
      useClass: environment.useMockLogin ? AuthMockService : AuthService,
    },
    // ... otros providers
  ],
};
```

---

## 🧪 Verificar que Todo Funciona

### Checklist:

- [ ] Puedes acceder a `http://localhost:4200/auth/login`
- [ ] Ves los 5 usuarios de prueba disponibles
- [ ] Puedes hacer click en un usuario y se rellena el formulario
- [ ] Puedes cambiar usuario/contraseña manualmente
- [ ] Después de iniciar sesión, se redirige a `/dashboard`
- [ ] El token se guardó en localStorage (abre DevTools → Application → LocalStorage)
- [ ] Puedes navegar por todas las rutas protegidas
- [ ] Los permisos del usuario se respetan (ej: admin ve todo, tester ve poco)

### Verificar en DevTools

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver token guardado
console.log(localStorage.getItem('auth_token'));

// Ver usuario actual
console.log(localStorage.getItem('current_user'));

// Limpiar sesión (para volver a login)
localStorage.clear();
location.reload();
```

---

## 🔧 Troubleshooting

### Problema: El componente no cambia después de editar routes

**Solución:**
1. Presiona Ctrl+Shift+R para recargar sin caché
2. Reinicia el servidor: Ctrl+C y `ng serve` de nuevo
3. Borra la carpeta `.angular` en la raíz del proyecto

### Problema: Los usuarios no aparecen

**Verificar:**
1. ¿El AuthMockService está creado? Debe existir en `src/app/core/services/auth.mock.service.ts`
2. ¿Tiene el array MOCK_USERS? Debe tener 5 usuarios
3. Abre DevTools → Console para ver si hay errores

### Problema: Botones de usuario no funcionan

**Verificar:**
1. El método `selectTestUser()` está en el componente
2. El `[(ngModel)]` está vinculado correctamente a `form.username` y `form.password`
3. No hay errores de tipo en la consola

---

## 📚 Archivos Relacionados

```
✅ src/app/core/services/auth.mock.service.ts
   └─ Define MOCK_USERS y lógica de autenticación mock

✅ src/app/features/auth/login/login/login.mock.component.ts
   └─ Componente con UI mejorada para selector de usuarios

✅ src/app/app.routes.ts
   └─ Archivo a editar para cambiar ruta de login

✅ src/environments/environment.ts
   └─ Configuración por environment

✅ MOCK_USERS.md
   └─ Documentación de usuarios disponibles
```

---

## ✨ Próximas Mejoras

1. **Mock Data Services:** Crear servicios mock para proyectos, pruebas, ejecuciones
2. **Mock API Interceptor:** Interceptar HTTP calls y retornar datos mock
3. **E2E Testing:** Usar estos usuarios mock para testing end-to-end
4. **Storybook Integration:** Documentar componentes con usuarios mock

---

**Status:** ✅ Listo para usar
**Última actualización:** 14 de febrero, 2026
**Versión:** 1.0
