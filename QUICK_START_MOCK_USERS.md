# 🚀 Guía Rápida - Validar Frontend con Usuarios Mock

## 📋 Resumen

Ahora tienes **5 usuarios de prueba** con permisos diferenciados para validar toda la aplicación sin necesidad de un backend real.

---

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Inicia la aplicación

```bash
cd c:\diplomado\QAMS\qams-web
npm start
```

Espera a que compile (verás "Application bundle generation complete").

### 2️⃣ Abre en el navegador

```
http://localhost:4200/auth/login
```

### 3️⃣ Elige un usuario y haz login

Verás 5 botones con usuarios disponibles. Haz click en uno:

```
👑 admin         (Acceso total)
📊 qa_lead       (QA Lead)
🧪 tester        (Ingeniero de pruebas)
📈 pm            (Project Manager)
💻 developer     (Desarrollador)
```

### 4️⃣ Explora el dashboard

Después de login, verás el dashboard con:
- 📊 Métricas del sistema
- 📈 Gráficos de ejecuciones
- 🎯 Estado de proyectos
- ✅ Tasa de éxito de pruebas

---

## 👥 Usuarios Disponibles

### 👑 ADMIN
```
Usuario:      admin
Contraseña:   Admin123!
Email:        admin@qams.local
Rol:          Admin, QA, Developer
```
✅ **Puede ver:** Dashboard, Proyectos, Casos de Prueba, Ejecuciones, Kanban, Usuarios, Roles, Catálogos

**Prueba esto:**
1. Login como admin
2. Click en "Gestionar Usuarios" en el sidebar
3. Click en "Gestionar Roles"
4. Click en "Catálogos"

---

### 📊 QA LEAD
```
Usuario:      qa_lead
Contraseña:   QaLead123!
Email:        qa.lead@qams.local
Rol:          QA, Lead
```
✅ **Puede ver:** Dashboard, Proyectos, Casos de Prueba, Ejecuciones, Kanban
❌ **NO puede ver:** Usuarios, Roles, Catálogos

**Prueba esto:**
1. Login como qa_lead
2. Notarás que falta "Gestionar Usuarios" en el sidebar
3. Intenta acceder a `/admin/users` directamente en la URL
4. Deberías ser redirigido a dashboard (sin permiso)

---

### 🧪 TESTER
```
Usuario:      tester
Contraseña:   Tester123!
Email:        tester@qams.local
Rol:          QA
```
✅ **Puede ver:** Dashboard, Casos de Prueba, Ejecuciones
❌ **NO puede ver:** Proyectos, Kanban, Admin

**Prueba esto:**
1. Login como tester
2. Solo verás Dashboard, Casos de Prueba y Ejecuciones
3. Los demás items del sidebar estarán deshabilitados

---

### 📈 PROJECT MANAGER (PM)
```
Usuario:      pm
Contraseña:   Pm123!
Email:        pm@qams.local
Rol:          PM
```
✅ **Puede ver:** Dashboard, Proyectos, Kanban
❌ **NO puede ver:** Casos de Prueba, Ejecuciones, Admin

**Prueba esto:**
1. Login como pm
2. Verás solo Proyectos y Kanban
3. Casos de Prueba estará deshabilitado

---

### 💻 DEVELOPER
```
Usuario:      developer
Contraseña:   Dev123!
Email:        developer@qams.local
Rol:          Developer
```
✅ **Puede ver:** Dashboard (solo lectura), Proyectos (solo lectura)
❌ **NO puede ver:** Casos de Prueba, Ejecuciones, Kanban, Admin

**Prueba esto:**
1. Login como developer
2. Solo acceso de lectura al Dashboard y Proyectos
3. Botones de crear/editar estarán deshabilitados

---

## 🧪 Flujos de Testing

### Flujo 1: Validar Permisos

```
1. Login como admin
   → Ver todos los menús ✅
   
2. Logout
   
3. Login como tester
   → Ver solo Dashboard, Pruebas, Ejecuciones ✅
   
4. Intentar acceder a /admin/users
   → Redirigido a /dashboard ✅
```

### Flujo 2: Validar Datos Mock

```
1. Login como admin
   
2. Ir a Proyectos
   → Deberías ver: E-Commerce Platform v2.0, Mobile App - iOS, API Gateway Refactor, Dashboard Analytics
   
3. Ir a Casos de Prueba
   → Deberías ver: 4 casos de prueba con diferentes prioridades
   
4. Ir a Ejecuciones
   → Deberías ver: 6 ejecuciones con diferentes estados (Pass, Fail, Blocked)
```

### Flujo 3: Validar Dashboard

```
1. Login como admin
   
2. Ver métricas:
   - Total Proyectos: 4
   - Total Casos: 4
   - Total Ejecuciones: 6
   - Pass Rate: ~66%
   - Fail Rate: ~17%
   
3. Ver gráficos:
   - Gráfico de estados (Doughnut)
   - Gráfico de tendencias (Line)
   - Gráfico de prioridades (Bar)
```

### Flujo 4: Validar Kanban

```
1. Login como qa_lead (o admin)
   
2. Ir a Kanban
   
3. Ver columnas:
   - Todo: 2 tareas
   - InProgress: 1 tarea
   - InReview: 1 tarea
   - Done: 1 tarea
   
4. Intentar drag-and-drop (si está implementado)
```

---

## 🔍 Verificaciones Técnicas

### En DevTools (F12)

#### 1. Verificar Token Guardado
```javascript
// Console → Ejecutar:
localStorage.getItem('auth_token')

// Debería mostrar algo como:
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AcWFtcy5sb2NhbCIsIkZ1bGxOYW1lIjoiQWRtaW5pc3RyYWRvciBkZWwgU2lzdGVtYSIsInBlcm1pc3Npb24iOlsiREFTSEJPQVJEX1ZJRVciLCJQUk9KRUNUU19WSUVXIiwuLi5dLCJyb2xlIjpbIkFkbWluIiwiUUEiLCJEZXZlbG9wZXIiXSwiZXhwIjoxNzA4MDI0ODAwLCJpYXQiOjE3MDc5Mzg0MDB9.ZmFrZS1zaWduYXR1cmUtZm9yLWRldmVsb3BtZW50"
```

#### 2. Verificar Usuario Actual
```javascript
// Console → Ejecutar:
JSON.parse(localStorage.getItem('current_user'))

// Debería mostrar:
{
  id: "1",
  username: "admin",
  email: "admin@qams.local",
  fullName: "Administrador del Sistema",
  role: ["Admin", "QA", "Developer"],
  permissions: ["DASHBOARD_VIEW", "PROJECTS_VIEW", ...]
}
```

#### 3. Verificar Permisos en Tiempo Real
```javascript
// En la consola del navegador:
// El AuthService está disponible, puedes verificar permisos

// En un componente, inyecta AuthService y usa:
this.authService.hasPermission('PROJECTS_VIEW')  // true/false
this.authService.currentUser()  // Usuario actual
```

### En la Pestaña Network

Notarás que:
- ✅ No hay llamadas HTTP a `/api/...` (no hay backend real)
- ✅ Los datos vienen del MockDataService
- ✅ Los tokens son generados localmente

---

## 🧹 Limpiar Sesión

### Opción 1: Desde el Navegador
1. Abre DevTools (F12)
2. Tab "Application"
3. LocalStorage → Selecciona la URL
4. Click derecho en `auth_token` → Delete
5. Recarga la página
6. Serás redirigido a login

### Opción 2: Desde la Consola
```javascript
localStorage.clear();
location.reload();
```

### Opción 3: Desde la App
1. Click en tu usuario (arriba a la derecha, si existe el botón)
2. Click en "Cerrar Sesión"
3. Serás redirigido a login

---

## 📊 Datos Mock Disponibles

| Entidad | Cantidad | Detalles |
|---------|----------|----------|
| Proyectos | 4 | E-Commerce, Mobile App, API Gateway, Dashboard Analytics |
| Casos de Prueba | 4 | Checkout, Tarjeta de Crédito, Login iOS, API Latency |
| Ejecuciones | 6 | 3 Pass, 1 Fail, 1 Blocked, 1 Skip |
| Tareas Kanban | 5 | Distribuidas en Todo, InProgress, InReview, Done |
| Métricas | Dinámicas | Calculadas desde los datos mock |

---

## 🎯 Checklist de Validación

- [ ] Puedes acceder a `/auth/login`
- [ ] Ves los 5 botones de usuarios mock
- [ ] Puedes hacer login con admin
- [ ] El dashboard carga con métricas
- [ ] Puedes ver proyectos, casos y ejecuciones
- [ ] Los gráficos se renderizan correctamente
- [ ] El token se guardó en localStorage
- [ ] Puedes hacer logout
- [ ] Login como qa_lead - ves menos opciones ✅
- [ ] Login como tester - ves aún menos opciones ✅
- [ ] Intentar acceder a rutas sin permiso redirige a dashboard ✅
- [ ] No hay errores en la consola del navegador ✅

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa si borro el token?
Se te redirige a `/auth/login` automáticamente.

### ¿Los cambios que hago (ej: crear proyecto) se guardan?
Sí, pero solo en memoria. Si recargasla página, vuelven a los datos mock originales.

### ¿Puedo cambiar los datos mock?
Sí, edita `src/app/core/services/mock-data.service.ts`.

### ¿Por qué algunos botones están grises?
Porque tu usuario no tiene permisos para esa acción. Intenta con admin.

### ¿Dónde está el backend?
No hay backend real. Todo es mock en el frontend para desarrollo y testing.

---

## 🔗 Archivos Importantes

```
✅ src/app/core/services/auth.mock.service.ts
   └─ Servicio de autenticación con 5 usuarios mock

✅ src/app/core/services/mock-data.service.ts
   └─ Datos mock para proyectos, pruebas, ejecuciones, kanban

✅ src/app/features/auth/login/login/login.mock.component.ts
   └─ Componente de login con selector de usuarios

📖 MOCK_USERS.md
   └─ Documentación detallada de usuarios

📖 SETUP_MOCK_LOGIN.md
   └─ Guía de configuración de login mock
```

---

## 🚀 Próximas Mejoras

1. **Mock Interceptor**: Interceptar llamadas HTTP y retornar datos mock automáticamente
2. **Mock Data Persistencia**: Guardar cambios en localStorage
3. **E2E Testing**: Usar Cypress/Playwright con estos usuarios
4. **Storybook**: Documentar componentes con mock users

---

**Status:** ✅ Listo para usar
**Última actualización:** 14 de febrero, 2026
**Versión:** 1.0
