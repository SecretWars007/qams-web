# 🧪 Usuarios de Prueba - QAMS Web

## 📋 Tabla de Usuarios Disponibles

| # | Usuario | Contraseña | Email | Rol | Descripción |
|---|---------|-----------|-------|-----|-------------|
| 1 | `admin` | `Admin123!` | admin@qams.local | Admin, QA, Dev | Acceso completo al sistema |
| 2 | `qa_lead` | `QaLead123!` | qa.lead@qams.local | QA, Lead | Lead de control de calidad |
| 3 | `tester` | `Tester123!` | tester@qams.local | QA | Ingeniero de pruebas |
| 4 | `pm` | `Pm123!` | pm@qams.local | PM | Gestor de proyectos |
| 5 | `developer` | `Dev123!` | developer@qams.local | Developer | Desarrollador |

## 👑 Usuario 1: ADMIN

**Credenciales:**
```
Usuario: admin
Contraseña: Admin123!
```

**Permisos:**
- ✅ Dashboard (Ver)
- ✅ Proyectos (Ver, Crear, Editar, Eliminar)
- ✅ Casos de Prueba (Ver, Crear, Editar, Eliminar)
- ✅ Ejecuciones (Ver, Crear, Editar, Eliminar)
- ✅ Kanban (Ver, Editar)
- ✅ Usuarios (Ver, Crear, Editar, Eliminar)
- ✅ Roles (Ver, Crear, Editar, Eliminar)
- ✅ Catálogos (Ver, Crear, Editar, Eliminar)

**Uso:** Probar toda la funcionalidad del sistema

---

## 📊 Usuario 2: QA LEAD

**Credenciales:**
```
Usuario: qa_lead
Contraseña: QaLead123!
```

**Permisos:**
- ✅ Dashboard (Ver)
- ✅ Proyectos (Ver, Crear, Editar)
- ✅ Casos de Prueba (Ver, Crear, Editar)
- ✅ Ejecuciones (Ver, Crear, Editar)
- ✅ Kanban (Ver, Editar)
- ❌ Usuarios (Bloqueado)
- ❌ Roles (Bloqueado)
- ❌ Catálogos (Bloqueado)

**Uso:** Probar flujo de trabajo de QA (sin permisos de admin)

---

## 🧪 Usuario 3: TESTER

**Credenciales:**
```
Usuario: tester
Contraseña: Tester123!
```

**Permisos:**
- ✅ Dashboard (Ver)
- ❌ Proyectos (Bloqueado)
- ✅ Casos de Prueba (Ver, Crear)
- ✅ Ejecuciones (Ver, Crear, Editar)
- ❌ Kanban (Bloqueado)
- ❌ Usuarios (Bloqueado)
- ❌ Roles (Bloqueado)
- ❌ Catálogos (Bloqueado)

**Uso:** Probar funcionalidad limitada (solo pruebas)

---

## 📈 Usuario 4: PROJECT MANAGER

**Credenciales:**
```
Usuario: pm
Contraseña: Pm123!
```

**Permisos:**
- ✅ Dashboard (Ver)
- ✅ Proyectos (Ver, Crear, Editar)
- ❌ Casos de Prueba (Bloqueado)
- ❌ Ejecuciones (Bloqueado)
- ✅ Kanban (Ver, Editar)
- ❌ Usuarios (Bloqueado)
- ❌ Roles (Bloqueado)
- ❌ Catálogos (Bloqueado)

**Uso:** Probar funcionalidad de gestión de proyectos

---

## 💻 Usuario 5: DEVELOPER

**Credenciales:**
```
Usuario: developer
Contraseña: Dev123!
```

**Permisos:**
- ✅ Dashboard (Ver)
- ✅ Proyectos (Ver)
- ❌ Casos de Prueba (Bloqueado)
- ❌ Ejecuciones (Bloqueado)
- ❌ Kanban (Bloqueado)
- ❌ Usuarios (Bloqueado)
- ❌ Roles (Bloqueado)
- ❌ Catálogos (Bloqueado)

**Uso:** Probar vista limitada para desarrolladores

---

## 🚀 Cómo Usar

### Opción 1: Selector Rápido (Recomendado)
1. Ir a `http://localhost:4200/auth/login`
2. Ver sección "Usuarios de Prueba Disponibles"
3. Click en el usuario deseado
4. Click en "Iniciar Sesión"

### Opción 2: Ingreso Manual
1. Ir a `http://localhost:4200/auth/login`
2. Copiar username de la tabla anterior
3. Copiar contraseña correspondiente
4. Click en "Iniciar Sesión"

### Opción 3: Autocomplete
1. Empezar a escribir en el campo de usuario
2. Se mostrará una lista de usuarios disponibles
3. Click en uno para completar el campo
4. Completar contraseña manualmente

---

## 🧬 Estructura de Datos Mock

Los usuarios mock están definidos en:
```
src/app/core/services/auth.mock.service.ts
```

### Agregar Nuevo Usuario Mock

1. Abre `auth.mock.service.ts`
2. Edita el array `MOCK_USERS`:

```typescript
const MOCK_USERS: MockUser[] = [
  // ... usuarios existentes
  {
    id: '6',
    username: 'nuevo_usuario',
    password: 'Pass123!',
    email: 'nuevo@qams.local',
    fullName: 'Nombre Completo',
    permissions: [
      'DASHBOARD_VIEW',
      'PROJECTS_VIEW',
    ],
    role: ['CustomRole'],
  },
];
```

3. Recarga la página

---

## 🔐 Tokens Mock

**IMPORTANTE:** Los tokens generados son **SOLO para desarrollo**:

```typescript
// Estructura del token fake generado
{
  alg: 'HS256',
  typ: 'JWT'
}
.
{
  nameid: '1',
  unique_name: 'admin',
  email: 'admin@qams.local',
  FullName: 'Administrador del Sistema',
  permission: ['DASHBOARD_VIEW', ...],
  role: ['Admin', 'QA', 'Developer'],
  exp: 1708024800,
  iat: 1707938400
}
.
fake-signature-for-development
```

### ⚠️ Limitaciones:

- ❌ **No funcionan con un backend real** - La firma es fake
- ❌ **No son criptográficamente seguros** - Solo para desarrollo
- ✅ Son válidos localmente en el frontend
- ✅ Se almacenan en localStorage como tokens reales

---

## 🧪 Casos de Uso

### Caso 1: Validar Permisos por Rol

```bash
# Login como Admin
Usuario: admin
Contraseña: Admin123!
→ Ver todas las opciones de menú

# Login como Tester
Usuario: tester
Contraseña: Tester123!
→ Ver solo Dashboard y Pruebas
```

### Caso 2: Probar Directiva hasPermission

La directiva `*hasPermission` mostrará/ocultará elementos según permisos:

```html
<!-- Solo visible para Admin -->
<button *hasPermission="'USERS_VIEW'">
  Gestionar Usuarios
</button>

<!-- Solo visible para QA Lead o Admin -->
<button *hasPermission="'PROJECTS_CREATE'">
  Crear Proyecto
</button>
```

### Caso 3: Probar Guards de Ruta

Los guards verifican permisos antes de navegar:

```typescript
// En app.routes.ts
{
  path: 'admin/users',
  component: UsersComponent,
  data: { permission: 'USERS_VIEW' },
  canActivate: [permissionGuard]
}
```

---

## 🔄 Flujo de Autenticación Mock

```
1. Usuario ingresa credentials
       ↓
2. AuthMockService valida contra MOCK_USERS
       ↓
3. Si son válidas:
   - Genera JWT fake
   - Guarda en localStorage
   - Decodifica token
   - Actualiza señales reactivas
       ↓
4. NavegaComponent se actualiza automáticamente
       ↓
5. Directivas y guards leen permisos
```

---

## 🛠️ Modificar Permisos

Para cambiar permisos de un usuario:

```typescript
// auth.mock.service.ts
{
  id: '2',
  username: 'qa_lead',
  password: 'QaLead123!',
  email: 'qa.lead@qams.local',
  fullName: 'Lead de Control de Calidad',
  permissions: [
    'DASHBOARD_VIEW',
    'PROJECTS_VIEW',
    'USERS_VIEW',  // ← Agregar permiso
    // ...
  ],
}
```

Luego recarga la página.

---

## 🧽 Limpiar Sesión

### Desde el navegador:
```javascript
// Abre consola (F12)
localStorage.clear();
location.reload();
```

### Desde el código:
```typescript
authMockService.logout();
```

---

## 📝 Notas Importantes

1. **Desarrollo solo:** Estos usuarios son SOLO para desarrollo/testing
2. **Frontend únicamente:** Los tokens no son válidos para backend
3. **Fácil de cambiar:** Edita `auth.mock.service.ts` para nuevos usuarios
4. **Persistent:** La sesión se guarda en localStorage
5. **Sin validación backend:** No hay comunicación con servidor

---

## 🎯 Próximos Pasos

1. ✅ Usar estos usuarios para probar UI
2. ✅ Validar directivas `*hasPermission`
3. ✅ Probar navegación por roles
4. ✅ Verificar guards de ruta
5. ⏭️ Conectar a backend real cuando esté listo

---

**Versión:** 1.0
**Fecha:** 14 de Febrero, 2026
**Estado:** Listo para usar
