# ✅ Validación Completa del Frontend - Checklist

## 📋 Pre-Requisitos

- [ ] Node.js 20+ instalado
- [ ] npm instalado
- [ ] Código fuente en `c:\diplomado\QAMS\qams-web`
- [ ] Dependencies instaladas (`npm install`)

---

## 🚀 Paso 1: Iniciar la Aplicación

```bash
cd c:\diplomado\QAMS\qams-web
npm start
```

Espera hasta ver:
```
✔ Compiled successfully.
✔ Build at: [timestamp]
** NG Live Development Server is listening on localhost:4200 **
```

- [ ] Aplicación compilada sin errores
- [ ] Servidor escuchando en puerto 4200
- [ ] No hay warnings críticos en la consola

---

## 🔐 Paso 2: Validar Login Mock

Abre: `http://localhost:4200/auth/login`

### Verificaciones Visuales:

- [ ] Página carga correctamente
- [ ] Se muestra título "🧪 QAMS QA Testing"
- [ ] Se muestra advertencia de "Modo Desarrollo"
- [ ] Se ven 5 botones con usuarios disponibles
- [ ] Se ve formulario manual (usuario + contraseña)
- [ ] Se ve tabla de permisos por usuario

### Verificar Usuarios Disponibles:

- [ ] Botón "admin" visible
- [ ] Botón "qa_lead" visible
- [ ] Botón "tester" visible
- [ ] Botón "pm" visible
- [ ] Botón "developer" visible

### Verificar Funcionalidad:

- [ ] Click en "admin" rellena automáticamente usuario y contraseña
- [ ] Click en otro usuario cambia los valores
- [ ] Campo de usuario es editable manualmente
- [ ] Campo de contraseña es de tipo "password"
- [ ] Botón "Iniciar Sesión" está disponible

---

## 👤 Paso 3: Login con Admin

### 3.1 Iniciar Sesión

1. Click en botón "👑 admin"
2. Click en "🔓 Iniciar Sesión"

**Verificaciones:**
- [ ] Se deshabilita el botón mientras se carga
- [ ] Aparece spinner de carga
- [ ] Se redirige a `/dashboard` automáticamente
- [ ] No hay errores en la consola

### 3.2 Verificar Token Guardado

Abre DevTools (F12) → Pestaña "Application" → LocalStorage

- [ ] Campo `auth_token` existe
- [ ] Contiene un JWT (comienza con "eyJ")
- [ ] Campo `current_user` existe
- [ ] Contiene el usuario "admin"

### 3.3 Verificar Dashboard

**Estructura Visual:**
- [ ] Se ve sidebar izquierdo
- [ ] Se ve contenido principal
- [ ] Se ve header superior

**Sidebar - Elementos Visibles:**
- [ ] Dashboard (icon de casa)
- [ ] Proyectos (icon de carpeta)
- [ ] Casos de Prueba (icon de checklist)
- [ ] Ejecuciones (icon de play)
- [ ] Kanban (icon de tablero)
- [ ] Gestionar Usuarios (icon de gente)
- [ ] Gestionar Roles (icon de corona)
- [ ] Catálogos (icon de lista)
- [ ] Botón Logout (icon de salida)

**Contenido Dashboard - Métricas:**
- [ ] Tarjeta "Proyectos Totales" mostrando número
- [ ] Tarjeta "Casos de Prueba" mostrando número
- [ ] Tarjeta "Ejecuciones" mostrando número
- [ ] Tarjeta "Tasa de Éxito" con porcentaje

**Contenido Dashboard - Gráficos:**
- [ ] Gráfico de estados (Doughnut/Pie)
- [ ] Gráfico de tendencias (Line)
- [ ] Ambos gráficos cargados sin errores

---

## 🔑 Paso 4: Validar Permisos con Admin

### 4.1 Proyectos

1. Click en "Proyectos" en el sidebar
2. Verifica que carga

**Verificaciones:**
- [ ] Página carga sin errores
- [ ] Se muestra lista de proyectos (mínimo 4)
- [ ] Cada proyecto muestra: nombre, descripción, status, lead
- [ ] Si hay botones: "Crear", "Editar", "Eliminar" están habilitados

**Proyectos Esperados:**
- [ ] E-Commerce Platform v2.0 (Active)
- [ ] Mobile App - iOS (Active)
- [ ] API Gateway Refactor (Active)
- [ ] Dashboard Analytics (Inactive)

### 4.2 Casos de Prueba

1. Click en "Casos de Prueba" en el sidebar
2. Verifica que carga

**Verificaciones:**
- [ ] Página carga sin errores
- [ ] Se muestra lista de casos (mínimo 4)
- [ ] Cada caso muestra: título, prioridad, status, creador

**Casos Esperados:**
- [ ] "Validar flujo de checkout" (Critical)
- [ ] "Validar validación de tarjeta de crédito" (High)
- [ ] "Prueba de login en iOS" (Critical)
- [ ] "Validar latencia de API" (High)

### 4.3 Ejecuciones

1. Click en "Ejecuciones" en el sidebar
2. Verifica que carga

**Verificaciones:**
- [ ] Página carga sin errores
- [ ] Se muestra lista de ejecuciones (mínimo 6)
- [ ] Cada ejecución muestra: status (Pass/Fail/Blocked), fecha, ejecutor

**Ejecuciones Esperadas:**
- [ ] Mínimo 3 con estado "Pass"
- [ ] Mínimo 1 con estado "Fail"
- [ ] Mínimo 1 con estado "Blocked"

### 4.4 Kanban

1. Click en "Kanban" en el sidebar
2. Verifica que carga

**Verificaciones:**
- [ ] Página carga sin errores
- [ ] Se muestra un tablero
- [ ] Se ven columnas (mínimo 3-4)

### 4.5 Administración - Usuarios

1. Click en "Gestionar Usuarios" en el sidebar
2. Verifica que carga

**Verificaciones:**
- [ ] Página carga sin errores
- [ ] Se muestra algún contenido (puede ser placeholder por ahora)
- [ ] Botón de logout está presente

### 4.6 Administración - Roles

1. Click en "Gestionar Roles" en el sidebar
2. Verifica que carga

**Verificaciones:**
- [ ] Página carga sin errores
- [ ] Se muestra algún contenido

### 4.7 Administración - Catálogos

1. Click en "Gestionar Catálogos" en el sidebar
2. Verifica que carga

**Verificaciones:**
- [ ] Página carga sin errores
- [ ] Se muestra algún contenido

---

## 🔒 Paso 5: Validar Permisos Restringidos

### 5.1 Logout

1. Click en botón de logout (bottom del sidebar)
2. Serás redirigido a login

**Verificaciones:**
- [ ] Se redirige a `/auth/login`
- [ ] Token se borró de localStorage
- [ ] Usuario actual se borró de localStorage

### 5.2 Login como qa_lead

1. Click en botón "📊 qa_lead"
2. Click en "Iniciar Sesión"

**Verificaciones:**
- [ ] Dashboard carga correctamente
- [ ] Sidebar visible:
  - [ ] Dashboard ✓
  - [ ] Proyectos ✓
  - [ ] Casos de Prueba ✓
  - [ ] Ejecuciones ✓
  - [ ] Kanban ✓
  - [ ] Gestionar Usuarios ✗ (NO debe estar)
  - [ ] Gestionar Roles ✗ (NO debe estar)
  - [ ] Catálogos ✗ (NO debe estar)

### 5.3 Intentar Acceso No Permitido (qa_lead)

1. Abre DevTools
2. En la consola, navega a: `http://localhost:4200/admin/users`
3. Presiona Enter

**Verificaciones:**
- [ ] Se redirige automáticamente a `/dashboard`
- [ ] NO muestra error, solo redirige silenciosamente

### 5.4 Login como tester

1. Logout
2. Click en botón "🧪 tester"
3. Click en "Iniciar Sesión"

**Verificaciones:**
- [ ] Dashboard carga correctamente
- [ ] Sidebar visible:
  - [ ] Dashboard ✓
  - [ ] Casos de Prueba ✓
  - [ ] Ejecuciones ✓
  - [ ] Proyectos ✗ (NO debe estar o gris)
  - [ ] Kanban ✗ (NO debe estar o gris)
  - [ ] Admin Items ✗ (NO deben estar)

### 5.5 Login como pm

1. Logout
2. Click en botón "📈 pm"
3. Click en "Iniciar Sesión"

**Verificaciones:**
- [ ] Dashboard carga correctamente
- [ ] Sidebar visible:
  - [ ] Dashboard ✓
  - [ ] Proyectos ✓
  - [ ] Kanban ✓
  - [ ] Casos de Prueba ✗ (NO debe estar o gris)
  - [ ] Ejecuciones ✗ (NO debe estar o gris)
  - [ ] Admin Items ✗ (NO deben estar)

### 5.6 Login como developer

1. Logout
2. Click en botón "💻 developer"
3. Click en "Iniciar Sesión"

**Verificaciones:**
- [ ] Dashboard carga correctamente
- [ ] Sidebar visible:
  - [ ] Dashboard ✓
  - [ ] Proyectos ✓
  - [ ] Casos de Prueba ✗ (NO debe estar o gris)
  - [ ] Ejecuciones ✗ (NO debe estar o gris)
  - [ ] Kanban ✗ (NO debe estar o gris)
  - [ ] Admin Items ✗ (NO deben estar)

---

## 🛠️ Paso 6: Verificación Técnica

### 6.1 Consola del Navegador (F12)

- [ ] No hay errores en rojo
- [ ] No hay warnings críticos (amarillos pueden ignorarse)
- [ ] No hay errores de "undefined" o "null reference"

### 6.2 Pestaña Network (F12)

1. Abre DevTools → Tab "Network"
2. Recarga la página
3. Filtra por XHR/Fetch

**Verificaciones:**
- [ ] No hay llamadas a `/api/...` (no debe haber backend)
- [ ] Todos los assets cargan (status 200)
- [ ] main.js carga correctamente

### 6.3 Pestaña Performance (F12)

1. Click en el ícono de grabación (rojo circle)
2. Interactúa con la app 10 segundos
3. Click en el ícono para detener

**Verificaciones:**
- [ ] No hay grandes picos de CPU
- [ ] No hay memory leaks evidentes
- [ ] Tiempo de interacción < 100ms

### 6.4 Verificar localStorage

```javascript
// Console → Ejecutar:
JSON.stringify({
  token: localStorage.getItem('auth_token'),
  user: localStorage.getItem('current_user'),
  permissions: localStorage.getItem('permissions')
}, null, 2)
```

- [ ] Token existe y es válido JWT
- [ ] Usuario existe con datos correctos
- [ ] Permisos corresponden al usuario

---

## 📱 Paso 7: Validación de Estilos

### 7.1 Responsive Design

1. Abre DevTools (F12)
2. Click en "Toggle Device Toolbar" (Ctrl+Shift+M)

### En Desktop (1920px):
- [ ] Sidebar visible a la izquierda
- [ ] Contenido ocupa todo el espacio disponible
- [ ] Gráficos se ven bien

### En Tablet (768px):
- [ ] Sidebar colapsable
- [ ] Contenido se ajusta
- [ ] Gráficos se ven bien

### En Mobile (375px):
- [ ] Sidebar se oculta o es un drawer
- [ ] Contenido es legible
- [ ] Botones son clickeables

### 7.2 Colores y Tailwind

- [ ] Colores consistentes (azul primario, grises, etc.)
- [ ] Botones tienen hover states
- [ ] Text es legible (contraste adecuado)
- [ ] Espaciado es consistente

---

## 🐛 Paso 8: Manejo de Errores

### 8.1 Credenciales Incorrectas

1. Vuelve a login
2. Ingresa usuario: `admin`
3. Ingresa contraseña: `incorrect`
4. Click "Iniciar Sesión"

**Verificaciones:**
- [ ] Se muestra mensaje de error
- [ ] NO redirige a dashboard
- [ ] Se puede intentar de nuevo

### 8.2 Campos Vacíos

1. En login, deja usuario en blanco
2. Click "Iniciar Sesión"

**Verificaciones:**
- [ ] Se muestra validación
- [ ] NO permite submit
- [ ] Campo se marca como inválido

### 8.3 Rutas Inválidas

1. Accede a: `http://localhost:4200/invalid-route`

**Verificaciones:**
- [ ] Se redirige a login (si no está autenticado) O dashboard (si está autenticado)
- [ ] NO muestra error 404

---

## 📊 Paso 9: Datos Mock Completos

### 9.1 Verificar Cantidad de Datos

1. Login como admin
2. Abre DevTools → Console

```javascript
// Ejecutar para verificar Mock Data Service
console.log('Verificando datos mock...')
```

**Cantidad Esperada:**
- [ ] Proyectos: 4
- [ ] Casos de Prueba: 4
- [ ] Ejecuciones: 6
- [ ] Tareas Kanban: 5

### 9.2 Verificar Gráficos

1. Dashboard debe mostrar:
- [ ] Gráfico de estados (colores: verde, rojo, amarillo, azul)
- [ ] Gráfico de tendencias (línea con 2 series)
- [ ] Ambos con datos reales

---

## ✨ Paso 10: Funcionalidades Avanzadas (Opcionales)

### 10.1 Persistencia de Sesión

1. Login como admin
2. Recarga la página (F5)

**Verificaciones:**
- [ ] NO se redirige a login
- [ ] Sigue logueado como admin
- [ ] Token se recuperó de localStorage

### 10.2 Tiempo de Carga

**Verificaciones:**
- [ ] Página principal carga en < 3 segundos
- [ ] Cambiar entre rutas < 1 segundo
- [ ] Gráficos renderizan < 2 segundos

### 10.3 Accesibilidad

1. Abre DevTools → Lighthouse
2. Run audit

**Verificaciones:**
- [ ] Score > 80
- [ ] No hay critical issues

---

## 📋 Resumen Final

### ✅ Completado Si:

- [ ] Todos los pasos anteriores pasaron
- [ ] Sin errores críticos en consola
- [ ] Todos los 5 usuarios funcionan
- [ ] Permisos se respetan correctamente
- [ ] Datos mock se muestran
- [ ] Gráficos se renderizan
- [ ] Token se guarda/restaura
- [ ] Responsive en mobile/tablet/desktop
- [ ] Manejo de errores funciona

### 🎉 Frontend Validado Exitosamente!

---

## 📞 Troubleshooting

| Problema | Solución |
|----------|----------|
| Página en blanco | Ctrl+Shift+R (recargar sin caché) |
| Login no funciona | Verificar console por errores |
| Permisos no se respetan | Limpiar localStorage, recargador |
| Gráficos no se ven | Verificar que ng2-charts esté instalado |
| Sidebar desaparece | Verificar CSS de Tailwind |
| Token expirado | Hacer logout y login nuevamente |

---

**Versión:** 1.0
**Última actualización:** 14 de febrero, 2026
**Estado:** ✅ Listo para validación
