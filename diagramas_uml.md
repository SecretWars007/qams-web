# Documentación UML Completa - QAMS Frontend

Este documento proporciona una visión integral de 360 grados de todas las funcionalidades del frontend de QAMS, incluyendo la gestión de pruebas, reportes, tableros ágiles y seguridad cifrada.

## 1. Diagrama de Casos de Uso (Módulos Completos)

Representa las acciones que los diferentes roles pueden realizar en el sistema.

```mermaid
useCaseDiagram
    actor "Administrador" as Admin
    actor "Analista de QA" as QA
    actor "Project Manager" as PM

    package "Autenticación y Perfil" {
        usecase "Login / Registro" as UC1
        usecase "Editar Perfil (Gravatar)" as UC2
        usecase "Gestionar Roles" as UC3
    }

    package "Gestión de Proyectos" {
        usecase "Crear/Editar Proyecto" as UC4
        usecase "Ver Dashboard de Estadísticas" as UC5
        usecase "Visualizar Kanban" as UC6
    }

    package "Gestión de Pruebas (Core QA)" {
        usecase "Gestionar Casos de Prueba" as UC7
        usecase "Diseñar Escenarios de Prueba" as UC8
        usecase "Ejecutar Pruebas" as UC9
        usecase "Ver Reportes Burndown" as UC10
    }

    QA --> UC1
    QA --> UC2
    QA --> UC7
    QA --> UC8
    QA --> UC9

    PM --> UC4
    PM --> UC5
    PM --> UC6
    PM --> UC10

    Admin --> UC3
    Admin --> UC4
```

## 2. Diagrama de Arquitectura de Módulos (Package Diagram)

Mapeo de la estructura de archivos en `src/app/features/` y su relación con el core.

```mermaid
graph TD
    subgraph Core ["Core (Internal)"]
        Services[Services Layer]
        Intercept[Interceptors/Security]
        Guards[Auth Guards]
    end

    subgraph Features ["Features (Funcionalidades)"]
        Auth[Auth: Login/Register]
        Dash[Dashboard: Stats/Charts]
        Proj[Projects: CRUD]
        TestM[Test Management: Cases/Suites]
        Exec[Executions: Runs/Results]
        Kanb[Kanban: Agile Board]
        Repo[Reports: Burndown/PDF]
    end

    Auth --> Services
    Dash --> Services
    Proj --> Services
    TestM --> Services
    Exec --> Services
    Kanb --> Services
    Repo --> Services

    Services --> Intercept
    Intercept --> Backend((API Rest))
```

## 3. Diagrama de Secuencia: Ciclo de Vida de una Prueba (QA Flow)

Muestra la interacción desde la creación de un caso hasta su ejecución.

```mermaid
sequenceDiagram
    participant QA as Analista QA
    participant TC as TestCaseComponent
    participant TS as TestCasesService
    participant INT as EncryptionInterceptor
    participant API as Backend API

    QA->>TC: Crea Nuevo Caso de Prueba
    TC->>TS: createTestCase(data)
    TS->>INT: POST /api/TestCases
    Note over INT: Cifra datos (AES-256)
    INT->>API: { data: encrypted }
    API-->>INT: { data: encrypted_result }
    Note over INT: Descifra respuesta
    INT-->>TS: TestCase Object
    TS-->>TC: Mostrar en Lista

    QA->>TC: Ejecutar Prueba
    TC->>API: POST /api/TestExecutions
    Note right of QA: Inicia flujo de ejecución
```

## 4. Diagrama de Estados: Proyectos y Pruebas

```mermaid
stateDiagram-v2
    [*] --> Nuevo
    Nuevo --> EnProgreso: Asignar Miembros
    EnProgreso --> EnPruebas: Crear Casos
    EnPruebas --> Finalizado: Ejecuciones Exitosas
    EnPruebas --> Bloqueado: Errores Críticos
    Bloqueado --> EnPruebas: Fix Aplicado
    Finalizado --> [*]

    state EnPruebas {
        [*] --> Draft
        Draft --> Active: Revisado
        Active --> Executing: Run
        Executing --> Passed
        Executing --> Failed
    }
```

## 5. Diagrama de Clase: Entidades de Negocio (Modelos)

```mermaid
classDiagram
    class Project {
        +string id
        +string name
        +string description
        +DateTime startDate
        +Status status
    }

    class TestCase {
        +string id
        +string title
        +string steps
        +Priority priority
    }

    class TestExecution {
        +string id
        +string result
        +DateTime executedAt
    }

    Project "1" -- "*" TestCase : contiene
    TestCase "1" -- "*" TestExecution : tiene
    Project "1" -- "*" User : miembros
```

---
**Desarrollado para:** QAMS (Quality Assurance Management System)
**Documento:** Integral UML v2.0
