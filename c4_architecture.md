# Arquitectura C4 - QAMS (Quality Assurance Management System)

Este documento detalla la arquitectura del sistema QAMS utilizando el modelo C4 para proporcionar diferentes niveles de abstracción.

## Nivel 1: Contexto del Sistema

```mermaid
C4Context
    title Diagrama de Contexto del Sistema QAMS

    Person(qa_analyst, "Analista de QA", "Diseña, ejecuta y reporta pruebas de software.")
    Person(pm, "Project Manager", "Gestiona proyectos, revisa métricas y tableros Kanban.")
    Person(admin, "Administrador", "Gestiona usuarios, roles y configuración global.")

    System(qams, "Sistema QAMS", "Plataforma integral para la gestión del ciclo de vida de QA.")

    System_Ext(gravatar, "Gravatar API", "Provee imágenes de perfil basadas en el email.")
    System_Ext(mail_server, "Servidor SMTP", "Envía notificaciones de bienvenida y alertas.")

    Rel(qa_analyst, qams, "Gestiona casos y ejecuciones", "HTTPS/TLS")
    Rel(pm, qams, "Monitorea reportes y Kanban", "HTTPS/TLS")
    Rel(admin, qams, "Configura sistema y usuarios", "HTTPS/TLS")

    Rel(qams, gravatar, "Obtiene avatars", "HTTPS")
    Rel(qams, mail_server, "Envía emails", "SMTP")
```

## Nivel 2: Contenedores

```mermaid
C4Container
    title Diagrama de Contenedores de QAMS

    Person(user, "Usuario QAMS", "Analista, PM o Administrador")

    System_Boundary(qams_boundary, "QAMS Production") {
        Container(spa, "Single Page App (Angular)", "TypeScript, Angular 19", "Interfaz de usuario reactiva con Split Screen y Glassmorphism.")
        Container(nginx, "Reverse Proxy (Nginx)", "Nginx/Alpine", "Sirve archivos estáticos y gestiona el proxy /api a qams-backend.")
        Container(api, "API Backend (.NET)", "ASP.NET Core 9.0", "Lógica de negocio, seguridad AES-256 y persistencia.")
        ContainerDb(db, "Base de Datos", "PostgreSQL 16", "Almacena proyectos, usuarios, pruebas y auditoría.")
        ContainerDb(redis, "Caché / Background", "Redis 7", "Gestiona colas de mensajes y caché de sesión.")
    }

    Rel(user, nginx, "Accede vía", "HTTPS (Puerto 4200)")
    Rel(nginx, spa, "Sirve", "Static Files")
    Rel(spa, nginx, "Llamadas API (Cifradas)", "JSON/AES-256")
    Rel(nginx, api, "Proxy a", "HTTP (Puerto 8080)")
    Rel(api, db, "Lee/Escribe", "EF Core / Npgsql")
    Rel(api, redis, "Caché/Tareas", "StackExchange.Redis")
```

## Nivel 3: Detalle de Componentes Cross-Cutting (Auditoría y Mensajería)

Este diagrama profundiza en cómo el sistema gestiona la persistencia segura y las notificaciones.

```mermaid
C4Component
    title Detalle: Sistemas de Auditoría y Mensajería

    Container(api, "API Controllers", ".NET Controllers", "Recibe acciones del usuario")

    Container_Boundary(audit_boundary, "Sistema de Auditoría & Soft-Delete") {
        Component(db_ctx, "QamsDbContext", "EF Core", "Intercepta SaveChangesAsync para inyectar metadatos.")
        Component(i_audit, "IAuditable", "Interface", "Define campos CreatedAt, CreatedBy, UpdatedAt, etc.")
        Component(i_soft, "ISoftDelete", "Interface", "Define campos IsDeleted y DeletedAt.")
        Component(user_srv, "CurrentUserService", "Core Service", "Provee el ID del usuario actual desde el JWT.")
    }

    Container_Boundary(msg_boundary, "Sistema de Mensajería & Notificaciones") {
        Component(smtp_srv, "SmtpEmailService", "Infrastructure", "Gestiona la conexión con el servidor de correo.")
        Component(temp_srv, "EmailTemplateService", "Infrastructure", "Transforma objetos en HTML profesional (Welcome, Alerts).")
        Component(redis_queue, "Redis Queue", "Worker", "Procesa envíos en segundo plano para no bloquear al usuario.")
    }

    Rel(api, db_ctx, "Persiste cambios")
    Rel(db_ctx, user_srv, "Obtiene Actor")
    Rel(db_ctx, i_audit, "Aplica Metadatos")
    Rel(db_ctx, i_soft, "Convierte físico a lógico")
    
    Rel(api, redis_queue, "Encola notificación")
    Rel(redis_queue, temp_srv, "Genera contenido")
    Rel(temp_srv, smtp_srv, "Envía vía")
```

## Nivel 3: Componentes (Frontend SPA)

```mermaid
C4Component
    title Diagrama de Componentes - QAMS Frontend SPA

    Container(api, "Backend API", ".NET API", "Recibe datos cifrados")

    Container_Boundary(spa_boundary, "Frontend Component Architecture") {
        Component(router, "Angular Router", "Lazy Loading", "Gestiona la navegación entre Landing, Auth y Main.")
        Component(auth_feats, "Auth Features", "Components", "Login y Registro con diseño Split Screen.")
        Component(qa_feats, "QA Features", "Components", "Kanban, Test Case Management, Reports.")
        Component(enc_int, "Encryption Interceptor", "HttpInterceptor", "Automatiza el cifrado AES-256 de salida.")
        Component(auth_int, "Auth Interceptor", "HttpInterceptor", "Adjunta el JWT Bearer Token.")
        Component(srvs, "Web Services", "Angular Services", "HttpClient communication.")
    }

    Rel(router, auth_feats, "Naviga a")
    Rel(router, qa_feats, "Naviga a")
    Rel(auth_feats, srvs, "Llama")
    Rel(qa_feats, srvs, "Llama")
    Rel(srvs, enc_int, "Petición HTTP")
    Rel(enc_int, auth_int, "Petición Cifrada")
    Rel(auth_int, api, "Llamada Final + JWT", "REST")
```

---
**Desarrollado por:** Antigravity AI para QAMS Project.
**Modelo:** C4 Architecture v1.1 (Detailed Audit & Messaging)
