# 📖 Manual de Usuario — QAMS
### Quality Assurance Management System

> **Versión:** 2.0 | **Fecha:** Agosto 2026  
> **Público objetivo:** Administradores, QA Leads, Testers, Desarrolladores, Stakeholders

---

## 📌 Índice

1. [Introducción al Sistema](#1-introducción-al-sistema)
2. [Roles del Sistema y Permisos](#2-roles-del-sistema-y-permisos)
3. [Autenticación — Acceso al Sistema](#3-autenticación--acceso-al-sistema)
4. [Dashboard — Panel Principal](#4-dashboard--panel-principal)
5. [Proyectos](#5-proyectos)
6. [Sistemas Bajo Prueba (SUT)](#6-sistemas-bajo-prueba-sut)
7. [Requisitos](#7-requisitos)
8. [Casos de Prueba](#8-casos-de-prueba)
9. [Escenarios (Test Suites)](#9-escenarios-test-suites)
10. [Planes de Prueba](#10-planes-de-prueba)
11. [Ejecuciones de Prueba](#11-ejecuciones-de-prueba)
12. [Defectos](#12-defectos)
13. [Revisiones Estáticas](#13-revisiones-estáticas)
14. [Tablero Kanban](#14-tablero-kanban)
15. [Reportes y Reportes PDF](#15-reportes-y-reportes-pdf)
16. [Administración del Sistema](#16-administración-del-sistema)
17. [Perfil de Usuario](#17-perfil-de-usuario)
18. [Flujos de Trabajo Completos por Rol](#18-flujos-de-trabajo-completos-por-rol)
19. [Preguntas Frecuentes](#19-preguntas-frecuentes)

---

## 1. Introducción al Sistema

**QAMS** (Quality Assurance Management System) es una plataforma web para gestionar el ciclo completo de pruebas de software según el estándar **ISTQB Foundation Level**. Permite a equipos de QA planificar, diseñar, ejecutar y reportar sus actividades de testing de manera estructurada, trazable y conforme a estándares internacionales.

### ¿Qué puede hacer con QAMS?

- ✅ Gestionar proyectos de prueba con fechas, presupuesto y Quality Gate
- ✅ Crear y organizar requisitos con trazabilidad a casos de prueba
- ✅ Diseñar casos de prueba con técnicas ISTQB (BDD, EP, BVA, etc.)
- ✅ Ejecutar pruebas paso a paso con evidencias y observaciones
- ✅ Registrar y gestionar defectos con trazabilidad completa
- ✅ Realizar revisiones estáticas (Walkthrough, Inspección, etc.)
- ✅ Visualizar métricas en tiempo real en el dashboard
- ✅ Generar 7 tipos de reportes PDF oficiales
- ✅ Gestionar el equipo con Kanban integrado

### Tecnología
- **Frontend:** Angular 19 (SPA)
- **Backend:** .NET 9 (API REST)
- **Base de Datos:** SQL Server
- **Seguridad:** JWT + RBAC (Control de Acceso Basado en Roles)

---

## 2. Roles del Sistema y Permisos

QAMS implementa un sistema **RBAC (Role-Based Access Control)** con roles y permisos configurables desde el módulo de Administración.

### 2.1 Roles Predefinidos

| Rol | Código | Descripción |
|---|---|---|
| 🔴 **Administrador** | `ADMIN` | Control total del sistema. Gestiona usuarios, roles, catálogos y configuraciones globales |
| 🟠 **QA Lead** | `QA_LEAD` | Lidera el proceso de QA. Crea proyectos, planes, asigna testers, aprueba resultados |
| 🟡 **Tester** | `TESTER` | Ejecuta pruebas, registra defectos y evidencias |
| 🟢 **Desarrollador** | `DEVELOPER` | Visualiza defectos asignados y sus detalles para resolución |
| 🔵 **Stakeholder** | `STAKEHOLDER` | Solo lectura: Dashboard, Reportes y estado general del proyecto |

### 2.2 Tabla de Permisos por Módulo

| Módulo / Acción | Admin | QA Lead | Tester | Developer | Stakeholder |
|---|:---:|:---:|:---:|:---:|:---:|
| **Dashboard** Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Proyectos** Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Proyectos** Crear/Editar | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Proyectos** Eliminar | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Requisitos** Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Requisitos** Crear/Editar | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Casos de Prueba** Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Casos de Prueba** Crear/Editar | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Ejecuciones** Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Ejecuciones** Crear/Ejecutar | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Defectos** Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Defectos** Crear | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Defectos** Resolver | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Revisiones** Ver | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Revisiones** Crear/Editar | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Kanban** Ver | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Reportes** Ver/Generar | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Admin** Usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Admin** Roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Admin** Catálogos | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Admin** API Keys | ✅ | ❌ | ❌ | ❌ | ❌ |

> [!NOTE]
> Los permisos son completamente configurables desde **Admin → Roles**. Los roles mostrados son los predefinidos del sistema.

---

## 3. Autenticación — Acceso al Sistema

### 3.1 Pantalla de Login

**URL:** `/auth/login`

#### Pasos para ingresar al sistema:
1. Abra el navegador y navegue a la URL del sistema
2. En el campo **"Usuario o Email"**, ingrese su email o nombre de usuario
3. En el campo **"Contraseña"**, ingrese su contraseña
4. Haga clic en **"Iniciar Sesión"**
5. Si las credenciales son correctas, será redirigido al **Dashboard**

#### Campos de la pantalla:
| Campo | Descripción | Requerido |
|---|---|---|
| Email / Usuario | Su dirección de correo o nombre de usuario | ✅ |
| Contraseña | Contraseña de acceso | ✅ |
| Recordarme | Mantiene la sesión activa (token extendido) | ❌ |

> [!WARNING]
> Después de **5 intentos fallidos**, su cuenta será bloqueada temporalmente por seguridad. Contacte al Administrador para desbloquearla.

### 3.2 Recuperar Contraseña

**URL:** `/auth/forgot-password`

1. Haga clic en **"¿Olvidó su contraseña?"** en la pantalla de login
2. Ingrese su **email registrado**
3. Recibirá un correo con un enlace de restablecimiento (válido por 1 hora)
4. Haga clic en el enlace del correo
5. Ingrese y confirme su **nueva contraseña**
6. Regrese al login con sus nuevas credenciales

### 3.3 Registro de Nuevo Usuario

**URL:** `/auth/register`

> [!IMPORTANT]
> El registro libre solo está disponible si el Administrador lo habilita. En la mayoría de los casos, los usuarios son creados por el Administrador desde **Admin → Usuarios**.

Campos requeridos:
- Nombre completo
- Email
- Documento de identidad
- Fecha de nacimiento
- Teléfono (opcional)
- Contraseña (mínimo 8 caracteres, debe incluir mayúsculas, números y símbolos)

### 3.4 Cambiar Contraseña

**URL:** `/change-password`

Disponible para **cualquier usuario autenticado**:
1. En el menú lateral, haga clic en su **nombre de usuario** (parte inferior)
2. Seleccione **"Cambiar Contraseña"**
3. Ingrese su contraseña actual
4. Ingrese y confirme la nueva contraseña
5. Haga clic en **"Guardar"**

---

## 4. Dashboard — Panel Principal

**URL:** `/dashboard`  
**Roles con acceso:** Todos los roles

El Dashboard es la pantalla de inicio que muestra un resumen en tiempo real del estado de todos los proyectos a los que el usuario tiene acceso.

### 4.1 Secciones del Dashboard

#### KPIs Superiores (Tarjetas de Resumen)
| Tarjeta | Descripción |
|---|---|
| 📁 **Total Proyectos** | Cantidad de proyectos activos donde el usuario participa |
| 🧪 **Total Casos de Prueba** | Suma de todos los casos de prueba en los proyectos del usuario |
| ▶️ **Total Ejecuciones** | Número total de ejecuciones registradas |
| ⏳ **Casos Pendientes** | Casos que aún no tienen una ejecución exitosa (PASSED) |

#### Gráfico Doughnut — Ejecuciones por Estado
Muestra la distribución de ejecuciones por estado:
- 🟢 **Aprobado (PASSED)**: Ejecuciones exitosas
- 🔴 **Fallido (FAILED)**: Ejecuciones fallidas
- 🟡 **En Progreso (IN_PROGRESS)**: Ejecuciones activas
- ⬜ **Pendiente (PENDING)**: Sin ejecutar

#### Gráfico de Barras — Cobertura por Proyecto
Muestra el porcentaje de cobertura de requisitos y la tasa de aprobación por proyecto.

#### Quality Gate por Proyecto
Para cada proyecto, muestra tres semáforos:
- 🟢 **Cobertura de Requisitos** ≥ umbral configurado
- 🟢 **Tasa de Aprobación** ≥ umbral configurado  
- 🟢 **Defectos Abiertos** ≤ máximo configurado

> [!TIP]
> El umbral de Quality Gate se configura por proyecto en **Proyectos → Editar Proyecto** (campos: Min. Cobertura, Min. Pass Rate, Max. Defectos Abiertos)

### 4.2 Filtros del Dashboard
- **Selector de Proyecto:** Filtra todas las métricas por un proyecto específico
- **Rango de Fechas:** Filtra ejecuciones y defectos por período

---

## 5. Proyectos

**URL:** `/projects`  
**Roles:** Admin, QA Lead (Crear/Editar) | Todos (Ver)

Los proyectos son el contenedor principal que agrupa todos los artefactos de testing (suites, casos, planes, defectos, etc.).

### 5.1 Listado de Proyectos

La pantalla muestra una tabla/cards con:
- Nombre del proyecto
- Estado (Activo, En Espera, Cerrado, etc.)
- Prioridad (Alta, Media, Baja)
- Fechas de inicio y fin
- Progreso general (barra de avance)
- QA Lead asignado
- Botones de acción: Ver / Editar / Eliminar

#### Filtros disponibles:
- Buscar por nombre
- Filtrar por estado
- Filtrar por prioridad

### 5.2 Crear Proyecto

Haga clic en **"+ Nuevo Proyecto"** y complete el formulario:

| Campo | Descripción | Requerido |
|---|---|---|
| Nombre | Nombre descriptivo del proyecto | ✅ |
| Descripción | Objetivo y alcance general | ❌ |
| Fecha de Inicio | Inicio del ciclo de pruebas | ✅ |
| Fecha de Fin | Fecha límite del ciclo | ✅ |
| Prioridad | Alta / Media / Baja | ✅ |
| Estado | Planificación / En Progreso / Completado / etc. | ✅ |
| Versión | Versión del software bajo prueba | ❌ |
| Presupuesto | Presupuesto asignado al proyecto QA | ❌ |
| Horas por día | Horas laborables por día (para cálculo de esfuerzo) | ✅ |
| Riesgos | Riesgos identificados del proyecto | ❌ |
| QA Lead | Usuario responsable del proyecto | ❌ |
| Sistema Bajo Prueba | SUT vinculado al proyecto | ❌ |
| **Quality Gate** | | |
| Min. Cobertura de Requisitos | % mínimo de cobertura para cerrar (default 90%) | ✅ |
| Min. Tasa de Aprobación | % mínimo de pass rate (default 85%) | ✅ |
| Max. Defectos Abiertos | Cantidad máxima de defectos sin resolver (default 0) | ✅ |

**Pasos:**
1. Complete todos los campos requeridos
2. Configure los umbrales de Quality Gate
3. Haga clic en **"Crear Proyecto"**
4. El sistema lo redirigirá al detalle del proyecto

### 5.3 Detalle del Proyecto

Al hacer clic en un proyecto, accede a su vista de detalle que incluye:
- **Métricas del proyecto:** Cobertura, Pass Rate, Defectos abiertos
- **Quality Gate en tiempo real:** Estado actual vs. umbrales configurados
- **Horas:** Estimadas / Ejecutadas / Restantes
- **Equipo:** Testers asignados
- **Historial de Devoluciones:** Número de ciclos de corrección
- **Observaciones:** Notas y observaciones del proyecto
- **Botones de acción:** Descargar reportes PDF

### 5.4 Asignar Testers a un Proyecto

1. Abra el detalle del proyecto
2. En la sección **"Equipo"**, haga clic en **"Agregar Tester"**
3. Seleccione el usuario de la lista
4. Haga clic en **"Confirmar"**

### 5.5 Devoluciones del Proyecto

Cuando el cliente devuelve el proyecto para correcciones:
1. En el detalle del proyecto, haga clic en **"Registrar Devolución"**
2. Ingrese el motivo y descripción de la devolución
3. El contador de devoluciones se incrementa en el historial

### 5.6 Observaciones del Proyecto

1. En el detalle, haga clic en **"Agregar Observación"**
2. Ingrese el texto de la observación
3. Puede marcar observaciones como **respondidas**

---

## 6. Sistemas Bajo Prueba (SUT)

**URL:** `/systems-under-test`  
**Roles:** Admin, QA Lead (Crear/Editar) | Todos con permiso SUT_VIEW (Ver)

El SUT (System Under Test) describe la aplicación o sistema que se está probando.

### 6.1 Crear un Sistema Bajo Prueba

| Campo | Descripción | Requerido |
|---|---|---|
| Nombre | Nombre del sistema (ej: "Portal Web Clientes") | ✅ |
| Descripción | Descripción general del sistema | ❌ |
| URL Base | URL del sistema en ambiente de pruebas | ❌ |
| Tipo de Plataforma | Web / Móvil / Desktop / API / Híbrido | ✅ |
| Versión | Versión actual del sistema | ❌ |
| Entorno | Desarrollo / Staging / Producción | ❌ |

**Pasos:**
1. Haga clic en **"+ Nuevo Sistema"**
2. Complete los campos
3. Haga clic en **"Guardar"**
4. Vincule el SUT a un Proyecto desde **Proyectos → Editar**

---

## 7. Requisitos

**URL:** `/requirements`  
**Roles:** Admin, QA Lead (Crear/Editar) | Todos (Ver)

Los requisitos son la base de la trazabilidad ISTQB. Cada caso de prueba debe vincularse a al menos un requisito.

### 7.1 Listado de Requisitos

La tabla muestra:
- Código del requisito (ej: REQ-001)
- Título
- Tipo (Funcional / No-funcional / de Negocio)
- Prioridad (Alta / Media / Baja)
- Complejidad (Alta / Media / Baja)
- Estado (Pendiente / Aprobado / Rechazado / En Revisión)
- Casos de prueba vinculados (contador)

#### Filtros:
- Buscar por código o título
- Filtrar por tipo, prioridad o estado

### 7.2 Crear Requisito

| Campo | Descripción | Requerido |
|---|---|---|
| Proyecto | Proyecto al que pertenece | ✅ |
| Código | Identificador único (ej: REQ-001) | ✅ |
| Título | Nombre descriptivo del requisito | ✅ |
| Descripción | Detalle del requisito | ❌ |
| Criterios de Aceptación | Condiciones para validar el cumplimiento | ❌ |
| Tipo | Funcional / No-funcional / de Negocio / Seguridad | ✅ |
| Prioridad | Alta / Media / Baja / Crítica | ✅ |
| Complejidad | Alta / Media / Baja | ✅ |
| Estado | Pendiente / Aprobado / Rechazado / En Revisión | ✅ |
| Fuente | Origen del requisito (documento, stakeholder, etc.) | ❌ |

**Pasos:**
1. Seleccione el **Proyecto** en el selector superior
2. Haga clic en **"+ Nuevo Requisito"**
3. Complete el formulario
4. Haga clic en **"Guardar"**

### 7.3 Vincular Casos de Prueba a Requisitos

La trazabilidad Requisito ↔ Caso de Prueba es muchos a muchos (M:N):

**Desde el Requisito:**
1. Abra el detalle del requisito
2. En la sección **"Casos de Prueba"**, haga clic en **"Vincular Caso"**
3. Seleccione el caso de prueba existente
4. Haga clic en **"Vincular"**

**Desde el Caso de Prueba:**
1. Al crear/editar un caso, seleccione los requisitos en el campo **"Requisitos Cubiertos"**

### 7.4 Matriz RTM (desde Reportes)

La Matriz de Trazabilidad de Requisitos se visualiza en **Reportes → RTM Matrix**:
- Muestra todos los requisitos con sus casos de prueba vinculados
- Estado de ejecución por caso
- Porcentaje de cobertura global

---

## 8. Casos de Prueba

**URL:** `/test-cases`  
**Roles:** Admin, QA Lead, Tester (Crear/Editar) | Developer, Stakeholder (Ver)

Los casos de prueba son el corazón del sistema. Cada caso describe una condición específica a verificar.

### 8.1 Listado de Casos de Prueba

Tabla con:
- ID del caso
- Título
- Suite/Escenario al que pertenece
- Prioridad
- Tipo de prueba
- Técnica de diseño
- Risk Score (ImpactLevel × LikelihoodLevel)
- Estado (Activo / Inactivo)
- Versión
- Acciones: Ver / Editar / Ejecutar / Eliminar

#### Filtros:
- Por proyecto y suite
- Por tipo de prueba
- Por prioridad
- Por Risk Score

### 8.2 Crear Caso de Prueba

#### Pestaña: Información General

| Campo | Descripción | Requerido |
|---|---|---|
| Proyecto | Proyecto al que pertenece | ✅ |
| Suite/Escenario | Suite donde se agrupará | ✅ |
| Título | Nombre descriptivo del caso | ✅ |
| Descripción | Detalle del qué se va a probar | ❌ |
| Precondiciones | Estado previo necesario antes de ejecutar | ✅ |
| Resultado Esperado | Qué debe ocurrir si la prueba es exitosa | ✅ |
| Prioridad | Crítica / Alta / Media / Baja | ✅ |
| Tipo de Prueba | Funcional / No-funcional / Integración / Regresión / etc. | ✅ |
| Técnica de Diseño | EP / BVA / Decision Table / State Transition / BDD / etc. | ❌ |
| Tiempo Estimado (horas) | Horas necesarias para ejecutar el caso | ❌ |
| Fecha Inicio / Fin | Ventana temporal de ejecución | ❌ |

#### Pestaña: Pasos del Caso de Prueba

Agregue cada paso de la prueba:
1. Haga clic en **"+ Agregar Paso"**
2. Para cada paso complete:
   - **Acción:** Qué debe hacer el tester
   - **Resultado Esperado:** Qué debería suceder tras la acción
3. Arrastre los pasos para reordenarlos
4. Use el ícono de papelera para eliminar un paso

#### Pestaña: Risk-Based Testing (RBT)

| Campo | Descripción | Rango |
|---|---|---|
| Nivel de Impacto | Impacto en el negocio si falla | 1 (Muy Bajo) – 5 (Crítico) |
| Nivel de Probabilidad | Probabilidad de que falle | 1 (Muy Baja) – 5 (Muy Alta) |
| **Risk Score** | Calculado automáticamente: Impacto × Probabilidad | 1 – 25 |

Los casos con **Risk Score ≥ 15** aparecen en el Heatmap como alta prioridad.

#### Pestaña: BDD (opcional)

Si el caso usa metodología BDD (Behavior-Driven Development):
1. Active el switch **"Es BDD"**
2. Ingrese el escenario en formato Gherkin:
```gherkin
Given [contexto inicial]
When [acción del usuario]
Then [resultado esperado]
```

#### Pestaña: Requisitos

Vincule los requisitos que este caso cubre:
1. Haga clic en **"+ Vincular Requisito"**
2. Seleccione el requisito de la lista
3. Repita para todos los requisitos cubiertos

**Pasos para guardar:**
1. Complete todas las pestañas requeridas
2. Haga clic en **"Guardar Caso de Prueba"**
3. El caso quedará disponible para ejecución

### 8.3 Versionado de Casos

Cuando edite un caso existente:
- El sistema crea automáticamente una **nueva versión** del caso
- El historial de versiones se conserva (`ParentTestCaseId`)
- La versión anterior se marca como `IsLatestVersion = false`

### 8.4 Certificadores del Caso

Un caso puede ser certificado (revisado y aprobado) por múltiples usuarios:
1. En el detalle del caso, vaya a la sección **"Certificadores"**
2. Haga clic en **"Agregar Certificador"**
3. Seleccione el usuario que certificará el caso

---

## 9. Escenarios (Test Suites)

**URL:** `/test-scenarios`  
**Roles:** Admin, QA Lead (Crear/Editar) | Todos (Ver)

Los escenarios o suites agrupan casos de prueba relacionados dentro de un proyecto.

### 9.1 Crear Suite/Escenario

| Campo | Descripción | Requerido |
|---|---|---|
| Proyecto | Proyecto al que pertenece | ✅ |
| Nombre | Nombre del módulo o funcionalidad (ej: "Módulo de Login") | ✅ |
| Descripción | Qué funcionalidad agrupa | ❌ |
| Estado | Activo / Inactivo / En Revisión | ✅ |

**Pasos:**
1. Seleccione el proyecto
2. Haga clic en **"+ Nueva Suite"**
3. Complete el formulario
4. Guarde — la suite aparecerá disponible al crear casos de prueba

### 9.2 Vista de Suite

Al abrir una suite, verá:
- Lista de todos sus casos de prueba
- Estado de ejecución de cada caso
- Progreso general de la suite (% completado)
- Acciones rápidas: Ejecutar todos, Ver historial

---

## 10. Planes de Prueba

**URL:** `/test-plans`  
**Roles:** Admin, QA Lead (Crear/Editar) | Todos con permiso (Ver)

El Plan de Prueba es el documento ISTQB que formaliza la estrategia, alcance y planificación del ciclo de pruebas. Sigue el estándar **IEEE 829**.

### 10.1 Crear Plan de Prueba

#### Pestaña: Información General

| Campo | Descripción | Requerido |
|---|---|---|
| Proyecto | Proyecto al que pertenece | ✅ |
| Nombre del Plan | Ej: "Plan de Pruebas Sprint 3" | ✅ |
| Objetivos | Qué se pretende lograr con este ciclo de pruebas | ✅ |
| Alcance (Scope) | Qué módulos/funciones SE van a probar | ✅ |
| Fuera de Alcance | Qué NO se va a probar y por qué | ❌ |
| Estrategia de Prueba | Enfoque (Regresión + Funcional + Smoke, etc.) | ✅ |
| Análisis de Riesgo | Riesgos del ciclo y mitigaciones | ❌ |
| Requerimientos de Entorno | Hardware, software, datos de prueba necesarios | ❌ |
| Cronograma | Fechas clave del plan | ❌ |
| Esfuerzo Estimado (horas) | Total de horas planificadas | ❌ |
| Fecha Inicio | Inicio del ciclo | ✅ |
| Fecha Fin | Cierre planificado | ✅ |
| Estado | Borrador / En Revisión / Aprobado / Cerrado | ✅ |

#### Pestaña: Suites del Plan

Seleccione qué suites de casos de prueba están incluidas en este plan:
1. Haga clic en **"+ Agregar Suite"**
2. Seleccione la suite de la lista
3. Repita para todas las suites del plan

#### Pestaña: Criterios de Entrada y Salida

Los criterios ISTQB que deben cumplirse para iniciar/finalizar el plan:

**Criterios de Entrada (Entry Criteria):**
- Ambiente de pruebas configurado
- Casos de prueba revisados y aprobados
- Datos de prueba disponibles

**Criterios de Salida (Exit Criteria):**
- Pass Rate ≥ 85%
- Cobertura de Requisitos ≥ 90%
- 0 defectos críticos abiertos
- Test Summary Report generado

**Pasos:**
1. Haga clic en **"+ Agregar Criterio"**
2. Seleccione el tipo: **Entrada** o **Salida**
3. Ingrese la descripción del criterio
4. Marque si está cumplido o no

### 10.2 Aprobar y Cerrar un Plan

1. Cuando el plan esté listo, cambie el estado a **"En Revisión"**
2. El QA Lead o Admin puede cambiar el estado a **"Aprobado"**
3. Al cerrar el ciclo, cambie a **"Cerrado"** — esto registra automáticamente el `ApprovalLog`

### 10.3 Generar Test Summary Report

Desde el detalle del plan:
1. Haga clic en **"Generar Test Summary Report"**
2. El sistema genera un PDF con:
   - Métricas de ejecución del plan
   - Tasa de aprobación
   - Defectos encontrados
   - Conclusiones y recomendaciones

---

## 11. Ejecuciones de Prueba

**URL:** `/test-executions`  
**Roles:** Admin, QA Lead, Tester (Crear/Ejecutar) | Developer, Stakeholder (Ver)

Este módulo es donde el tester realiza la ejecución paso a paso de los casos de prueba y registra los resultados.

### 11.1 Listado de Ejecuciones

Tabla con:
- Caso de prueba ejecutado
- Fecha de ejecución
- Tester que ejecutó
- Estado: Pendiente / En Progreso / Aprobado / Fallido / Bloqueado
- Tiempo real (horas)
- Defectos vinculados

#### Filtros:
- Por proyecto
- Por estado
- Por tester
- Por fecha

### 11.2 Crear Nueva Ejecución

1. En el listado, haga clic en **"+ Nueva Ejecución"**
2. Seleccione el **Proyecto** y el **Caso de Prueba** a ejecutar
3. Haga clic en **"Iniciar Ejecución"**
4. El sistema crea la ejecución en estado **"En Progreso"** y genera automáticamente los resultados por cada paso del caso

### 11.3 Ejecutar un Caso Paso a Paso (Pantalla de Detalle)

**URL:** `/test-executions/:id`

Esta es la pantalla más importante del sistema. Permite al tester documentar la ejecución de forma estructurada.

#### Sección: Información del Caso
- Título y descripción del caso
- Precondiciones (condiciones iniciales)
- Resultado global esperado

#### Sección: Pasos de Ejecución

Para cada paso del caso de prueba:

| Campo | Descripción |
|---|---|
| **Acción** | Lo que debe hacer el tester (predefinido en el caso) |
| **Resultado Esperado** | Lo que debería suceder (predefinido) |
| **Resultado Real** | ✏️ Lo que realmente ocurrió (el tester lo completa) |
| **Estado** | ✅ Aprobado / ❌ Fallido / ⏭️ Saltado / ⏳ Pendiente |
| **Observación** | Notas adicionales sobre el paso |
| **Evidencias del Paso** | Subir screenshots/videos del paso específico |

**Pasos para ejecutar:**
1. Para cada paso, lea la **Acción** y ejecute en el sistema bajo prueba
2. Compare el resultado real con el **Resultado Esperado**
3. Ingrese el **Resultado Real** en el campo de texto
4. Seleccione el **Estado** del paso
5. Si el paso falla, suba una **evidencia** (screenshot)
6. Agregue una **observación** si es necesario
7. Repita para todos los pasos

#### Sección: Evidencias Globales

Suba evidencias que apliquen a toda la ejecución (no a un paso específico):
1. Haga clic en **"+ Agregar Evidencia"**
2. Seleccione el tipo: Screenshot / Video / Log / Documento
3. Suba el archivo
4. Agregue una descripción

#### Sección: Notas Generales

Ingrese observaciones generales sobre la ejecución completa.

#### Completar la Ejecución

Cuando haya documentado todos los pasos:
1. Revise que todos los pasos tengan estado y resultado real
2. En la parte superior, haga clic en **"Completar Ejecución"**
3. El sistema cambiará el estado según los resultados:
   - Si todos los pasos están **Aprobados** → Estado: **PASSED**
   - Si algún paso está **Fallido** → Estado: **FAILED**
4. Si la ejecución falla, se le preguntará si desea **Registrar un Defecto**

### 11.4 Registrar Defecto desde una Ejecución

Cuando una ejecución falla:
1. Haga clic en **"Registrar Defecto"**
2. El sistema pre-llenará automáticamente:
   - Proyecto
   - Caso de prueba vinculado
   - Ejecución vinculada
   - Paso fallido vinculado (si aplica)
3. Complete los campos adicionales del defecto
4. Haga clic en **"Guardar Defecto"**

---

## 12. Defectos

**URL:** `/defects`  
**Roles:** Admin, QA Lead, Tester (Crear) | Developer (Resolver) | Todos (Ver)

### 12.1 Listado de Defectos

Tabla con:
- ID del defecto
- Título
- Prioridad/Severidad: Crítico / Alto / Medio / Bajo
- Estado: Abierto / En Análisis / En Progreso / Resuelto / Cerrado / Rechazado
- Reportado por
- Asignado a
- Fecha de reporte
- Vinculado a (caso de prueba, ejecución)

#### Filtros:
- Por proyecto
- Por prioridad
- Por estado
- Por asignado a
- Por fecha

### 12.2 Crear Defecto (Manual)

Puede reportar un defecto manualmente (sin ejecución):
1. Haga clic en **"+ Nuevo Defecto"**
2. Complete el formulario:

| Campo | Descripción | Requerido |
|---|---|---|
| Proyecto | Proyecto donde se encontró | ✅ |
| Título | Resumen claro del problema | ✅ |
| Descripción | Descripción detallada | ❌ |
| Pasos para Reproducir | 1. Hacer X... 2. Hacer Y... | ✅ |
| Resultado Actual | Lo que ocurre actualmente | ✅ |
| Resultado Esperado | Lo que debería ocurrir | ✅ |
| Prioridad | Crítica / Alta / Media / Baja | ✅ |
| Caso de Prueba | Caso donde se detectó (si aplica) | ❌ |
| Ejecución | Ejecución específica (si aplica) | ❌ |
| Asignado a | Usuario responsable de resolverlo | ❌ |

### 12.3 Ciclo de Vida del Defecto

```
Abierto → En Análisis → En Progreso → Resuelto → Cerrado
                    ↓
                Rechazado (si no es válido)
```

**Flujo para Desarrollador:**
1. El defecto llega en estado **"Abierto"**
2. Cámbielo a **"En Análisis"** para confirmar su validez
3. Si es válido, cámbielo a **"En Progreso"** y empiece a resolverlo
4. Una vez resuelto, cámbielo a **"Resuelto"** e ingrese las **Notas de Resolución**

**Flujo para Tester (verificación):**
1. Cuando el defecto está en **"Resuelto"**, el tester debe verificar la corrección
2. Ejecute nuevamente el caso de prueba (re-test)
3. Si está corregido: cierre el defecto → **"Cerrado"**
4. Si persiste: reábralo → **"Abierto"**

---

## 13. Revisiones Estáticas

**URL:** `/reviews`  
**Roles:** Admin, QA Lead, Tester (Crear/Gestionar) | Todos (Ver)

Las revisiones estáticas permiten revisar documentos, código o artefactos **sin ejecutarlos** (ISTQB Cap. 3).

### 13.1 Tipos de Revisión Disponibles

| Tipo | Descripción ISTQB | Formalidad |
|---|---|---|
| **Informal** | Revisión rápida sin proceso formal | Muy baja |
| **Walkthrough** | El autor guía al equipo por el artefacto | Media |
| **Revisión Técnica** | Expertos técnicos evalúan el artefacto | Alta |
| **Inspección** | Proceso formal con métricas y roles definidos | Muy alta |

### 13.2 Crear Sesión de Revisión

1. Haga clic en **"+ Nueva Revisión"**
2. Complete el formulario:

| Campo | Descripción | Requerido |
|---|---|---|
| Proyecto | Proyecto al que pertenece | ✅ |
| Título | Nombre de la sesión | ✅ |
| Descripción | Objetivos de la revisión | ❌ |
| Artefacto bajo Revisión | Qué se revisa (documento, módulo, URL) | ✅ |
| Tipo de Revisión | Informal / Walkthrough / Técnica / Inspección | ✅ |
| Fecha Programada | Cuándo se realizará | ❌ |
| Moderador | Usuario que facilitará la sesión | ❌ |
| Autor del Artefacto | Quién creó lo que se revisa | ❌ |
| Criterios de Entrada | Condiciones para iniciar la revisión | ❌ |
| Criterios de Salida | Condiciones para cerrar la revisión | ❌ |

3. En la sección **"Participantes"**, agregue los revisores:
   - Haga clic en **"+ Agregar Participante"**
   - Seleccione el usuario
   - Asigne su rol (Revisor / Observador / Registrador)

4. Haga clic en **"Crear Sesión"**

### 13.3 Registrar Hallazgos (Findings)

Durante o después de la sesión, registre los hallazgos:

1. Abra la sesión de revisión
2. En la sección **"Hallazgos"**, haga clic en **"+ Nuevo Hallazgo"**
3. Complete:

| Campo | Descripción |
|---|---|
| Descripción | Descripción del problema encontrado |
| Tipo | Defecto / Mejora / Pregunta / Observación |
| Severidad | Crítico / Mayor / Menor / Observación |
| Referencia | Ubicación exacta en el artefacto (línea, sección) |

4. Guarde el hallazgo

### 13.4 Completar la Sesión

1. En el detalle de la sesión, complete el campo **"Conclusiones"**
2. Cambie el estado a **"Completada"**
3. El sistema registra la fecha de cierre automáticamente

---

## 14. Tablero Kanban

**URL:** `/kanban`  
**Roles:** Admin, QA Lead, Tester, Developer (Ver y Gestionar tareas)

El Kanban ayuda al equipo QA a gestionar sus tareas de manera visual y ágil.

### 14.1 Vista del Tablero

El tablero muestra columnas configurables (Por defecto: **Por Hacer → En Progreso → Revisión → Hecho**).

Cada tarjeta (tarea) muestra:
- Título de la tarea
- Prioridad (indicador de color)
- Usuario responsable (avatar)
- Fecha límite
- Proyecto vinculado

### 14.2 Crear una Tarea Kanban

1. Haga clic en **"+"** en la columna correspondiente (ej: "Por Hacer")
2. Complete:

| Campo | Descripción |
|---|---|
| Título | Qué hay que hacer |
| Descripción | Detalle de la tarea |
| Prioridad | Crítica / Alta / Media / Baja |
| Responsable | Usuario asignado |
| Fecha límite | Cuándo debe estar lista |
| Columna inicial | Columna donde aparecerá |

3. Haga clic en **"Crear"**

### 14.3 Mover Tareas

- **Arrastre** (drag & drop) una tarjeta de una columna a otra
- O haga clic en la tarjeta y use el botón **"Mover a →"**

### 14.4 Gestionar Columnas

El tablero Kanban se puede personalizar:
1. Haga clic en **"Configurar Columnas"**
2. Agregue, renombre o elimine columnas
3. Defina el orden de las columnas

---

## 15. Reportes y Reportes PDF

**URL:** `/reports`  
**Roles:** Admin, QA Lead, Tester, Stakeholder

El módulo de reportes ofrece visualizaciones interactivas y exportaciones en PDF.

### 15.1 Pantalla Principal de Reportes

La pantalla está organizada en tabs/secciones:

#### Tab 1: Quality Gate Dashboard
Muestra el estado del Quality Gate por proyecto:
- Semáforo visual de cada criterio
- Progreso hacia el umbral
- Recomendaciones de acción

#### Tab 2: Matriz RTM (Trazabilidad)
Tabla interactiva que muestra:
- Todos los requisitos del proyecto
- Casos de prueba vinculados a cada requisito
- Estado de ejecución de cada caso
- % de cobertura por requisito
- Requisitos sin casos de prueba (brecha de cobertura)

**Cómo usar:**
1. Seleccione el proyecto en el selector superior
2. La matriz se carga automáticamente
3. Haga clic en **"Exportar RTM"** para descargar en PDF

#### Tab 3: Risk Heatmap (RBT)
Mapa de calor 5×5 que muestra todos los casos de prueba posicionados según:
- Eje X: Nivel de Probabilidad (1-5)
- Eje Y: Nivel de Impacto (1-5)
- Color: Verde (bajo) → Amarillo (medio) → Rojo (crítico)

Los casos en la zona roja (Risk Score ≥ 15) deben priorizarse en la ejecución.

### 15.2 Reportes PDF Disponibles

Desde el detalle de cada Proyecto y Plan de Prueba, puede generar:

| Reporte | Descripción | Cuándo usarlo |
|---|---|---|
| **Reporte General del Proyecto** | Métricas completas, pass rate, cobertura, defectos | Revisiones de progreso |
| **Burndown Chart** | Curva de ejecución de casos a lo largo del tiempo | Seguimiento de sprint |
| **Reporte de Observaciones** | Lista completa de observaciones del proyecto | Seguimiento de calidad |
| **Certificado de Cumplimiento** | Verifica si el proyecto cumple el Quality Gate | Cierre del proyecto |
| **Reporte de Certificación QA** | Informe completo del proceso de certificación | Entrega formal al cliente |
| **Resumen Ejecutivo** | Informe ejecutivo de aceptación (Go/No-Go) | Presentación a stakeholders |
| **Test Summary Report** | Resumen por Plan de Prueba (ISTQB IEEE 829) | Cierre de cada ciclo |

**Cómo generar un reporte PDF:**
1. Vaya al módulo **Reportes** o al detalle del proyecto/plan
2. Haga clic en el botón del reporte deseado
3. El archivo se descarga automáticamente en formato PDF
4. El nombre del archivo incluye la fecha: `Reporte_Proyecto_YYYYMMDDHHММ.pdf`

---

## 16. Administración del Sistema

**URL:** `/admin/users`, `/admin/roles`, `/admin/catalogs`, `/admin/api-keys`  
**Roles:** Solo Administrador

### 16.1 Gestión de Usuarios (`/admin/users`)

#### Ver Usuarios
Lista todos los usuarios con:
- Nombre completo
- Email
- Roles asignados
- Estado (Activo/Inactivo)
- Fecha de creación
- Último acceso

#### Crear Usuario
1. Haga clic en **"+ Nuevo Usuario"**
2. Complete:

| Campo | Descripción | Requerido |
|---|---|---|
| Nombre completo | Nombre del usuario | ✅ |
| Email | Correo electrónico único | ✅ |
| Username | Nombre de usuario único | ✅ |
| Documento de Identidad | Cédula o pasaporte | ✅ |
| Fecha de Nacimiento | Fecha de nacimiento | ✅ |
| Teléfono | Teléfono de contacto | ❌ |
| Contraseña Temporal | El usuario debe cambiarla al primer login | ✅ |
| Roles | Uno o más roles del sistema | ✅ |

#### Editar Usuario
1. Haga clic en **"Editar"** junto al usuario
2. Modifique los campos necesarios
3. Para cambiar roles: en la sección **"Roles"**, agregue o quite roles
4. Guarde los cambios

#### Activar/Desactivar Usuario
- En la fila del usuario, use el switch **"Activo"**
- Un usuario desactivado no puede ingresar al sistema

#### Desbloquear Usuario
Si un usuario fue bloqueado por intentos fallidos:
1. Haga clic en **"Desbloquear"** en la fila del usuario
2. El contador de intentos fallidos se reinicia

#### Eliminar Usuario (Soft Delete)
- El usuario queda en la base de datos pero no puede acceder
- Sus registros (ejecuciones, defectos) se conservan para trazabilidad

### 16.2 Gestión de Roles (`/admin/roles`)

#### Ver Roles
Lista todos los roles con sus permisos asignados.

#### Crear Rol Personalizado
1. Haga clic en **"+ Nuevo Rol"**
2. Ingrese el nombre y descripción del rol
3. En la sección **"Permisos"**, active los permisos que este rol tendrá
4. Guarde el rol

#### Permisos disponibles en el sistema:

| Código de Permiso | Descripción |
|---|---|
| `DASHBOARD_VIEW` | Ver el dashboard y generar reportes |
| `PROJECTS_VIEW` | Ver proyectos |
| `PROJECTS_CREATE` | Crear proyectos |
| `PROJECTS_EDIT` | Editar proyectos |
| `PROJECTS_DELETE` | Eliminar proyectos |
| `TEST_CASES_VIEW` | Ver casos de prueba, suites y planes |
| `TEST_CASES_CREATE` | Crear casos de prueba |
| `TEST_CASES_EDIT` | Editar casos de prueba |
| `TEST_CASES_DELETE` | Eliminar casos de prueba |
| `EXECUTIONS_VIEW` | Ver ejecuciones |
| `EXECUTIONS_CREATE` | Crear y ejecutar pruebas |
| `DEFECTS_VIEW` | Ver defectos |
| `DEFECTS_CREATE` | Crear defectos |
| `DEFECTS_EDIT` | Editar/resolver defectos |
| `REVIEWS_VIEW` | Ver revisiones estáticas |
| `REVIEWS_CREATE` | Crear revisiones |
| `REQUIREMENTS_VIEW` | Ver requisitos |
| `REQUIREMENTS_CREATE` | Crear requisitos |
| `KANBAN_VIEW` | Ver tablero Kanban |
| `SUT_VIEW` | Ver sistemas bajo prueba |
| `SUT_CREATE` | Crear SUT |
| `USERS_VIEW` | Ver usuarios (Admin) |
| `USERS_CREATE` | Crear usuarios (Admin) |
| `ROLES_VIEW` | Ver roles (Admin) |
| `ROLES_CREATE` | Crear roles (Admin) |
| `CATALOGS_VIEW` | Ver catálogos (Admin) |
| `CATALOGS_EDIT` | Editar catálogos (Admin) |

### 16.3 Gestión de Catálogos (`/admin/catalogs`)

Los catálogos son listas de valores configurables que se usan en todo el sistema. El Administrador puede personalizarlos sin tocar código.

#### Catálogos disponibles:

| Catálogo | Descripción |
|---|---|
| **Prioridades de Proyecto** | Alta / Media / Baja |
| **Estados de Proyecto** | Planificación / En Progreso / Completado / etc. |
| **Prioridades de Caso de Prueba** | Crítica / Alta / Media / Baja |
| **Tipos de Prueba** | Funcional / Integración / Regresión / Smoke / etc. |
| **Técnicas de Diseño** | EP / BVA / Decision Table / Exploratory / BDD / etc. |
| **Estados de Ejecución** | Pendiente / En Progreso / Aprobado / Fallido / Bloqueado |
| **Estados de Paso de Ejecución** | Aprobado / Fallido / Saltado / Pendiente |
| **Prioridades de Defecto** | Crítica / Alta / Media / Baja |
| **Estados de Defecto** | Abierto / En Análisis / En Progreso / Resuelto / Cerrado |
| **Tipos de Revisión** | Informal / Walkthrough / Técnica / Inspección |
| **Estados de Revisión** | Planificada / En Progreso / Completada / Cancelada |
| **Tipos de Hallazgo** | Defecto / Mejora / Pregunta / Observación |
| **Severidades de Hallazgo** | Crítico / Mayor / Menor / Observación |
| **Tipos de Evidencia** | Screenshot / Video / Log / Documento |
| **Tipos de Plataforma** | Web / Móvil / Desktop / API |
| **Estados de Suite** | Activo / En Revisión / Archivado |
| **Tipos de Requisito** | Funcional / No-funcional / de Negocio / Seguridad |
| **Prioridades de Requisito** | Alta / Media / Baja / Crítica |
| **Estados de Requisito** | Pendiente / Aprobado / Rechazado / En Revisión |
| **Complejidades de Requisito** | Alta / Media / Baja |

**Cómo editar un catálogo:**
1. Seleccione el catálogo de la lista
2. Para agregar un valor: haga clic en **"+ Agregar Valor"**
3. Ingrese el nombre y código del valor
4. Guarde

> [!CAUTION]
> No elimine valores de catálogo que ya están en uso por registros existentes. Use la opción **"Desactivar"** en su lugar.

### 16.4 Gestión de API Keys (`/admin/api-keys`)

Las API Keys permiten que sistemas externos (pipelines CI/CD, scripts de automatización) interactúen con QAMS via API REST.

#### Crear una API Key
1. Haga clic en **"+ Nueva API Key"**
2. Complete:
   - **Nombre:** Descripción del uso (ej: "Pipeline Jenkins Proyecto Alpha")
   - **Proyecto:** Proyecto al que tendrá acceso
   - **Fecha de Expiración:** Cuándo expira la key (opcional)
3. Haga clic en **"Generar"**
4. **¡IMPORTANTE!** Copie la API Key generada — solo se muestra una vez

#### Usar la API Key
En las llamadas API, incluya el header:
```
X-Api-Key: tu-api-key-aquí
```

#### Revocar una API Key
1. En la lista de API Keys, haga clic en **"Revocar"** junto a la key
2. Confirme la acción — la key deja de funcionar inmediatamente

---

## 17. Perfil de Usuario

**URL:** `/profile`  
**Roles:** Todos los usuarios

Cada usuario puede gestionar su propio perfil:
1. Haga clic en su nombre en la esquina inferior del sidebar
2. Seleccione **"Mi Perfil"**

Campos editables:
- Nombre completo
- Teléfono
- Avatar/Foto de perfil

Información no editable (solo Admin puede cambiar):
- Email
- Username
- Roles

---

## 18. Flujos de Trabajo Completos por Rol

### 18.1 Flujo del QA Lead — Ciclo Completo de Pruebas

```
1. CONFIGURACIÓN
   ├─ Crear Proyecto (con Quality Gate)
   ├─ Vincular Sistema Bajo Prueba (SUT)
   ├─ Registrar Requisitos
   └─ Asignar Testers al proyecto

2. PLANIFICACIÓN
   ├─ Crear Suites/Escenarios (por módulo)
   ├─ Crear Casos de Prueba (con pasos y técnica ISTQB)
   │   ├─ Vincular Requisitos a los casos
   │   └─ Definir Risk Score (ImpactLevel × LikelihoodLevel)
   └─ Crear Plan de Prueba
       ├─ Definir Scope / Strategy / RiskAnalysis
       ├─ Vincular Suites al Plan
       └─ Definir Criterios Entrada/Salida

3. EJECUCIÓN
   ├─ Asignar ejecuciones a Testers
   ├─ Monitorear progreso en Dashboard
   └─ Revisar defectos reportados

4. CIERRE
   ├─ Verificar Quality Gate (Reportes)
   ├─ Generar Test Summary Report (PDF)
   ├─ Generar Certificado de Cumplimiento
   ├─ Generar Resumen Ejecutivo
   └─ Cerrar Plan de Prueba
```

### 18.2 Flujo del Tester — Ejecución de Pruebas

```
1. PREPARACIÓN
   ├─ Ver casos asignados en Dashboard o Ejecuciones
   └─ Revisar precondiciones del caso

2. EJECUCIÓN
   ├─ Crear Nueva Ejecución (seleccionar caso)
   ├─ Ejecutar paso a paso:
   │   ├─ Registrar Resultado Real por paso
   │   ├─ Marcar estado (Aprobado/Fallido/Saltado)
   │   └─ Subir evidencias (screenshots)
   ├─ Agregar notas generales
   └─ Completar Ejecución

3. SI HAY FALLO
   ├─ Registrar Defecto (se pre-llena automáticamente)
   │   ├─ Describir pasos para reproducir
   │   └─ Asignar al desarrollador responsable
   └─ Actualizar estado en Kanban

4. VERIFICACIÓN (Re-test)
   ├─ Cuando defecto esté en "Resuelto"
   ├─ Crear nueva ejecución del mismo caso
   └─ Si pasa → Cerrar defecto
```

### 18.3 Flujo del Desarrollador — Gestión de Defectos

```
1. RECIBIR DEFECTO
   └─ Notificación de nuevo defecto asignado

2. ANALIZAR
   ├─ Leer descripción y pasos para reproducir
   ├─ Cambiar estado a "En Análisis"
   └─ Confirmar si es válido (si no: Rechazar con nota)

3. RESOLVER
   ├─ Cambiar estado a "En Progreso"
   ├─ Implementar la corrección
   └─ Cambiar estado a "Resuelto" + ingresar notas de resolución

4. ESPERAR VERIFICACIÓN
   └─ El Tester verificará y cerrará el defecto
```

### 18.4 Flujo del Administrador — Configuración Inicial del Sistema

```
1. CONFIGURACIÓN BASE
   ├─ Personalizar catálogos (tipos, estados, prioridades)
   ├─ Crear roles personalizados si son necesarios
   └─ Configurar permisos por rol

2. GESTIÓN DE USUARIOS
   ├─ Crear usuarios para cada miembro del equipo
   ├─ Asignar roles correspondientes
   └─ Comunicar credenciales temporales

3. CONFIGURACIÓN DE INTEGRACIÓN (opcional)
   ├─ Crear API Keys para pipelines CI/CD
   └─ Documentar el uso de la API REST

4. MANTENIMIENTO
   ├─ Monitorear logs del sistema
   ├─ Gestionar bloqueos de cuentas
   └─ Actualizar catálogos según necesidades
```

### 18.5 Flujo del Stakeholder — Seguimiento del Proyecto

```
1. ACCESO
   └─ Login con credenciales de solo lectura

2. SEGUIMIENTO
   ├─ Ver Dashboard (métricas generales)
   ├─ Verificar Quality Gate de sus proyectos
   └─ Ver estado de defectos abiertos

3. REPORTES
   ├─ Descargar Resumen Ejecutivo (PDF)
   ├─ Descargar Certificado de Cumplimiento
   └─ Revisar Matriz RTM
```

---

## 19. Preguntas Frecuentes

**¿Por qué no puedo ver el botón "Crear Proyecto"?**  
Solo los roles con permiso `PROJECTS_CREATE` pueden ver ese botón. Contacte a su Administrador para ajustar sus permisos.

**¿Qué pasa si elimino un caso de prueba que ya tiene ejecuciones?**  
El sistema usa "borrado suave" (Soft Delete). El caso se marca como eliminado pero sus ejecuciones y defectos históricos se conservan para trazabilidad.

**¿Cómo sé si el proyecto está listo para cerrar?**  
Revise el **Quality Gate** en el Dashboard o en Reportes. Los tres indicadores deben estar en verde (cobertura ≥ mínimo, pass rate ≥ mínimo, defectos abiertos ≤ máximo).

**¿Puedo ejecutar el mismo caso de prueba múltiples veces?**  
Sí. Cada ejecución es un registro independiente. El historial completo de ejecuciones por caso está disponible en el detalle de la ejecución. Esto es fundamental para las pruebas de re-test y regresión.

**¿Cómo se calcula el Risk Score?**  
`Risk Score = Nivel de Impacto (1-5) × Nivel de Probabilidad (1-5)`. Un score de 25 es el máximo riesgo. Los casos con score ≥ 15 se consideran de alto riesgo y aparecen en rojo en el Heatmap.

**¿Qué es el ShareToken del proyecto?**  
Es un token que permite compartir el dashboard de un proyecto con personas externas (clientes) sin que necesiten login. El Administrador puede habilitarlo desde la configuración del proyecto.

**¿Los reportes PDF incluyen el logo de mi empresa?**  
Los reportes usan el nombre del sistema "QAMS" por defecto. El Administrador puede personalizar las plantillas PDF contactando al equipo de desarrollo.

**¿Puedo importar casos de prueba desde Excel?**  
Actualmente no existe una importación masiva por interfaz. Sin embargo, puede usar la **API REST** con una API Key para importar casos de forma programática.

---

## 📞 Soporte Técnico

Para problemas técnicos o solicitudes de nuevas funcionalidades:
1. Contacte al **Administrador del sistema** de su organización
2. O abra un ticket en el repositorio del proyecto

---

*QAMS — Quality Assurance Management System | Manual de Usuario v2.0 | Cumplimiento ISTQB CTFL v4.0*
