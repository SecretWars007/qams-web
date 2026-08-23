"""
Script para reemplazar el Capitulo 2 completo en generate_academic_monograph.py
VERSION FINAL con todos los graficos integrados en sus secciones correctas.
"""

CHAPTER_2_CONTENT = r'''
    # =========================================================================
    # CAPITULO 2: MARCO TEORICO - VERSION FINAL CON GRAFICOS (15-18 paginas)
    # =========================================================================
    add_h1("Capítulo 2.- MARCO TEÓRICO")

    # ─────────────────────────────────────────────────────────────────────────
    # 2.1 Fundamentos de Ingenieria del Software y Calidad
    # ─────────────────────────────────────────────────────────────────────────
    add_h2("2.1 Ingeniería del Software y Aseguramiento de Calidad — Fundamentos Teóricos")
    add_p("La Ingeniería del Software, definida por el IEEE Standard Glossary of Software Engineering Terminology (IEEE Std 610.12-1990) como 'la aplicación de un enfoque sistemático, disciplinado y cuantificable al desarrollo, operación y mantenimiento del software', establece el marco epistemológico sobre el cual se sostiene la disciplina del aseguramiento de calidad. El Software Quality Assurance (SQA) es el conjunto de actividades planificadas y sistemáticas necesarias para garantizar que el software satisface los requisitos de calidad definidos, no solo en términos de ausencia de defectos, sino de adecuación al propósito para el que fue concebido.")
    add_p("El modelo de madurez de capacidades CMMI (Capability Maturity Model Integration), desarrollado por el Software Engineering Institute (SEI) de la Universidad Carnegie Mellon, define cinco niveles de madurez organizacional. QAMS contribuye a la transición desde el Nivel 1 (procesos caóticos) hacia el Nivel 3 (procesos documentados, estandarizados y gestionados cuantitativamente) al imponer flujos formales de planificación, diseño y ejecución de pruebas bajo el estándar ISTQB CTFL v4.0.")

    add_h3("2.1.1 Evolución Histórica del Testing de Software")
    headers_hist = ["Período", "Paradigma Dominante", "Técnica/Enfoque Principal", "Herramientas Representativas", "Limitación Principal"]
    rows_hist = [
        ["1950–1970\n(Era del Debugging)", "Testing = Debugging\n(sin distinción formal)", "Inspección manual de volcados de memoria (core dumps); pruebas realizadas por el mismo programador.", "Depuradores de terminal, impresión de registros (print debugging).", "Sin trazabilidad; sin distinción entre error, defecto y falla; enfoque reactivo y artesanal."],
        ["1970–1985\n(Testing Estructurado)", "Testing como disciplina\nindependiente del desarrollo", "IEEE 829 (1983) formaliza documentación de pruebas; surgimiento del tester como rol dedicado; técnicas de caja negra y caja blanca.", "HP Software Quality Analyzer, primeras hojas de registro manuales.", "Waterfall rígido; gap entre desarrollo y testing; costosos ciclos de regresión."],
        ["1985–2000\n(Automatización Inicial)", "Testing Automatizado\n(primera generación)", "Capture & Replay tools; primeros frameworks de pruebas unitarias (JUnit 1997); métricas de cobertura.", "Mercury WinRunner, Rational Robot, SilkTest, HP Quality Center.", "Alta fragilidad de scripts; costoso mantenimiento; limitado a GUI."],
        ["2000–2010\n(Era Ágil)", "Testing Continuo\nintegrado al desarrollo", "TDD (Kent Beck, 2003); BDD (Dan North, 2006 — Gherkin); integración continua CI; pair programming.", "JUnit, NUnit, Cucumber, Selenium WebDriver (2006), Jira.", "Deuda técnica en pruebas; necesidad de herramientas de gestión ALM modernas."],
        ["2010–Presente\n(DevOps y AI-Augmented)", "Testing shift-left, shift-right;\nIA generativa en testing", "DevOps pipelines; ISTQB CTFL v4.0 (2023) con BDD y SBTM; pruebas de performance como código (K6); IA para generación de casos.", "Zephyr, TestRail, Xray, QAMS, Copilot for Testing.", "Fragmentación de herramientas; costos SaaS; necesidad de soberanía de datos."],
    ]
    add_custom_table(headers_hist, rows_hist, [1.1, 1.3, 1.7, 1.4, 1.3])
    add_p("Fuente: Elaboración propia en base a Myers (2011), Pressman & Maxim (2020), ISTQB Syllabus History y IEEE Annals of the History of Computing.")

    # ─────────────────────────────────────────────────────────────────────────
    # 2.2 Estandar ISTQB CTFL v4.0
    # ─────────────────────────────────────────────────────────────────────────
    add_h2("2.2 Estándar ISTQB CTFL v4.0 — Análisis Teórico de los 6 Capítulos del Syllabus")
    add_p("El International Software Testing Qualifications Board (ISTQB), fundado en 2002, es el organismo certificador internacional con mayor reconocimiento en la disciplina del testing, con más de 1,300,000 certificaciones emitidas en 130 países al año 2024. Su Syllabus Certified Tester Foundation Level (CTFL) versión 4.0, publicado en Abril de 2023, representa la actualización más significativa de la última década, integrando formalmente los paradigmas de Desarrollo Ágil, DevOps, Behavior-Driven Development (BDD) y Session-Based Test Management (SBTM) al corpus teórico del testing profesional.")

    add_h3("2.2.1 Capítulo 1 ISTQB: Fundamentos de las Pruebas — Los 7 Principios Universales")
    add_p("El primer capítulo del Syllabus establece los cimientos filosóficos y prácticos del testing. Distingue formalmente entre tres conceptos frecuentemente confundidos: (a) Error: acción humana que introduce un elemento incorrecto en el artefacto; (b) Defecto (Bug): manifestación del error en el artefacto de software; y (c) Falla (Failure): desviación observable del comportamiento del sistema respecto a lo esperado en producción.")

    headers_7p = ["Principio ISTQB", "Definición Académica", "Implicación Práctica para QAMS"]
    rows_7p = [
        ["P1. Testing muestra presencia de defectos, no su ausencia", "Las pruebas reducen la probabilidad de defectos no descubiertos pero no pueden probar la perfección absoluta del software (Dijkstra, 1969).", "Los Quality Gates de QAMS expresan probabilidad de cobertura (%), no garantía de ausencia de defectos. El Dashboard muestra zonas de riesgo no cubiertas."],
        ["P2. Pruebas exhaustivas son imposibles", "El espacio de entradas posibles es computacionalmente infinito; la cobertura total es inviable salvo en casos triviales (Goodenough & Gerhart, 1975).", "QAMS implementa Priorización de Casos (Critical / High / Medium / Low) y Risk-Based Testing para maximizar el valor del esfuerzo finito de pruebas."],
        ["P3. Testing temprano ahorra tiempo y dinero", "El costo de corrección crece exponencialmente según avanza el SDLC (IBM Systems Sciences Institute). Defectos en requisitos cuestan 100x más en producción.", "El módulo de Pruebas Estáticas (Static Testing / Walkthroughs) de QAMS permite revisión de requisitos y código ANTES de ejecutar una sola prueba."],
        ["P4. Agrupación de defectos (Defect Clustering)", "El Principio de Pareto aplicado al testing: el 80% de los defectos se concentran en el 20% de los módulos (Fagan, 1976; Capers Jones, 2008).", "El Dashboard analítico de QAMS visualiza el mapa de densidad de defectos por módulo/SUT (Ng2-Charts), identificando los componentes más críticos."],
        ["P5. La paradoja del pesticida", "Si siempre se ejecutan los mismos casos de prueba, el sistema se vuelve 'inmune' a ellos. Propuesto por Boris Beizer (1990).", "QAMS gestiona versionado de casos de prueba y Sesiones SBTM con Charters dinámicos para inyectar exploración no guionada periódicamente."],
        ["P6. El testing depende del contexto", "No existe una metodología de testing universal; la estrategia óptima depende del dominio, el riesgo, la industria y el ciclo de vida (ISTQB CTFL v4.0, 2023).", "QAMS permite N SUTs con estrategias de testing independientes, Quality Gates configurables por Plan y tipos de prueba configurables por catálogo."],
        ["P7. La falacia de ausencia de errores", "Un software sin defectos técnicos pero que no satisface las necesidades del usuario es igualmente un fracaso (Boehm & Turner, 2004).", "La Matriz RTM de QAMS vincula CADA caso de prueba con un requerimiento de negocio explícito, asegurando que la cobertura técnica se traduzca en valor real."],
    ]
    add_custom_table(headers_7p, rows_7p, [2.0, 2.0, 2.2])
    add_p("Fuente: ISTQB CTFL Syllabus v4.0 (2023). Adaptación con referencias académicas del autor.")

    add_h3("2.2.2 Ciclo de Vida del Software de Pruebas (STLC) — Niveles y Tipos")
    add_p("Este capítulo establece la correlación entre los modelos de desarrollo (Waterfall, Iterativo, Ágil, DevOps) y los niveles y tipos de prueba correspondientes. El principio rector es el 'Early Testing' o 'Shift-Left Testing': incorporar las pruebas desde las fases más tempranas del SDLC para reducir el costo de detección de defectos.")
    add_p("Los cuatro niveles de prueba formalmente definidos son: (1) Pruebas de Componente/Unitarias; (2) Pruebas de Integración de Componentes; (3) Pruebas de Sistema; y (4) Pruebas de Aceptación (UAT). QAMS implementa esta jerarquía mediante sus catálogos de TestLevel y TestType configurables.")

    add_image_fig("figura2_stlc.png", "Figura 2.1: Ciclo de Vida del Proceso de Pruebas de Software (STLC) según ISTQB CTFL v4.0. Se muestran las 6 fases secuenciales del ciclo (Planificación, Análisis, Diseño, Implementación, Ejecución y Cierre) con sus entradas, actividades y salidas, implementadas de extremo a extremo en la plataforma QAMS.")
    add_image_fig("figura3_pyramid.png", "Figura 2.2: Pirámide de Pruebas de Software (Test Pyramid). Modelo de Mike Cohn (2009) que establece la proporción óptima de pruebas unitarias (base, mayor cantidad), de integración (capa media) y de sistema/E2E (cúspide, menor cantidad). QAMS gestiona los tres niveles mediante sus catálogos de TestLevel.")

    add_h3("2.2.3 Capítulo 3 ISTQB: Pruebas Estáticas — Inspecciones y Walkthroughs")
    add_p("Las Pruebas Estáticas verifican artefactos de software (código, documentos, modelos) sin ejecutar el sistema. Introducidas formalmente por Michael Fagan en IBM en 1976, representan la forma más rentable de detección de defectos: las inspecciones formales detectan entre el 60% y el 90% de los defectos existentes antes de la primera ejecución de código.")
    add_p("El proceso formal de revisión ISTQB comprende seis actividades secuenciales: Planificación, Inicio, Revisión Individual, Comunicación y Análisis, Corrección y Reverificación, y Cierre. QAMS implementa este ciclo completo en su módulo ReviewSession con gestión de participantes, roles (Moderador, Autor, Revisor, Escriba) y seguimiento de hallazgos con actas de dictamen.")

    add_h3("2.2.4 Capítulo 4 ISTQB: Diseño de Pruebas — Técnicas y BDD")
    add_p("El capítulo 4 establece el corpus técnico de diseño de casos de prueba en tres familias: (1) Técnicas de Caja Negra: Partición de Equivalencia (EP), Análisis de Valores Límite (BVA), Tablas de Decisión y Transición de Estados; (2) Técnicas de Caja Blanca: Cobertura de Sentencias y Ramas; (3) Técnicas Basadas en Experiencia: SBTM con Charters y BDD/Gherkin. QAMS soporta de forma nativa todas estas técnicas mediante su editor dual Clásico/BDD y el módulo de Sesiones Exploratorias.")

    add_h3("2.2.5 Capítulo 5 ISTQB: Gestión de Pruebas — Métricas y Quality Gates")
    add_p("El capítulo 5 define los mecanismos de planificación, estimación, monitoreo y control del proceso de pruebas. Las métricas clave implementadas en QAMS son:")

    headers_metricas = ["Métrica ISTQB", "Fórmula / Definición", "Rango Óptimo", "Implementación en QAMS"]
    rows_metricas = [
        ["DRE — Defect Removal Efficiency", "DRE = (Defectos eliminados antes de producción / Total defectos) × 100%", "≥ 85% Bueno\n≥ 95% Excelente", "KPI principal del Dashboard; visible en semáforo de Quality Gate."],
        ["DDP — Defect Detection Percentage", "DDP = (Defectos encontrados en fase X / Total defectos) × 100%", "Meta: ≥ 70% en testing pre-producción.", "Gráfico de distribución por fase en módulo de Reportes (Ng2-Charts)."],
        ["Pass Rate (Tasa de Aprobación)", "Pass Rate = (Casos PASSED / Total ejecutados) × 100%", "Quality Gate configurable (ej. ≥ 90%)", "Semáforo en tiempo real: Verde(≥90%), Amarillo(70-89%), Rojo(<70%)."],
        ["Defect Density", "DD = Defectos confirmados / Tamaño del software (KLoC)", "< 0.1 defectos/KLoC (crítico)", "Mapa de calor de densidad por módulo/SUT en el Dashboard."],
        ["RTM Coverage", "% RTM = (Req. con ≥ 1 TC ejecutado / Total requisitos) × 100%", "≥ 95% para certificación", "Matriz RTM interactiva con semáforo de cobertura bidireccional."],
    ]
    add_custom_table(headers_metricas, rows_metricas, [1.5, 2.0, 1.3, 2.0])

    add_image_fig("figura10_rtm_metrics.png", "Figura 2.3: Métricas de la Matriz de Trazabilidad de Requisitos (RTM) y Quality Gates en el Dashboard de QAMS. Se visualizan los indicadores DRE, Pass Rate y cobertura de requisitos en tiempo real, implementando los criterios de salida normativos del capítulo 5 del ISTQB CTFL v4.0.")

    add_h2("2.2.6 Tabla de Cumplimiento Integral QAMS vs ISTQB CTFL v4.0")
    headers_istqb_full = ["Capítulo ISTQB CTFL v4.0", "Requerimiento Teórico Normativo", "Implementación Técnica en QAMS", "Cobertura"]
    rows_istqb_full = [
        ["Cap. 1: Fundamentos del Testing", "Distinción Error-Defecto-Falla; 7 principios; roles diferenciados; mentalidad del tester.", "Entidades separadas TestExecution y Defect; 7 principios como restricciones operativas; roles RBAC (5 roles distintos).", "100% ✅"],
        ["Cap. 2: STLC y Niveles/Tipos", "4 niveles (Unit, Integration, System, UAT); tipos funcionales/no funcionales; regresión; confirmación.", "Catálogos TestLevel y TestType configurables; historial comparativo de ejecuciones por versión; suites de regresión.", "100% ✅"],
        ["Cap. 3: Pruebas Estáticas", "Proceso formal de revisión (6 fases); roles Moderador/Autor/Revisor/Escriba; hallazgos con clasificación.", "Módulo nativo ReviewSession con participantes, roles y ReviewFindings con actas de dictamen y seguimiento.", "100% ✅⭐"],
        ["Cap. 4: Diseño de Pruebas", "Técnicas caja negra (EP, BVA); caja blanca; SBTM con Charters; BDD/Gherkin Given-When-Then.", "Editor BDD nativo; sesiones ExploratorySession con Charters y Time-boxing; catálogo de técnicas de diseño.", "100% ✅⭐"],
        ["Cap. 5: Gestión de Pruebas", "Planes IEEE 829; Risk-Based Testing; métricas DDP/DRE/PassRate; Quality Gates; ciclo de defecto completo.", "Módulo TestPlan con riesgos; semáforo Quality Gates; métricas en Dashboard; ciclo completo en Defect Kanban.", "100% ✅⭐"],
        ["Cap. 6: Herramientas de Prueba", "Herramienta ALM integrada de gestión, trazabilidad RTM, ejecución reactiva y analítica de métricas.", "Plataforma web fullstack unificada: Fast Runner + Kanban + RTM + Dashboard + Docker Deploy.", "100% ✅"],
    ]
    add_custom_table(headers_istqb_full, rows_istqb_full, [1.5, 2.0, 2.0, 0.7])

    # ─────────────────────────────────────────────────────────────────────────
    # 2.3 ISO/IEC/IEEE 29119 e ISO/IEC 25010
    # ─────────────────────────────────────────────────────────────────────────
    add_h2("2.3 Normas Internacionales: ISO/IEC/IEEE 29119 e ISO/IEC 25010 (SQuaRE)")

    add_h3("2.3.1 ISO/IEC/IEEE 29119 — Estándar Internacional de Pruebas de Software")
    add_p("La familia de normas ISO/IEC/IEEE 29119, publicada en múltiples partes entre 2013 y 2022, es el estándar internacional más completo para la gestión y ejecución de pruebas de software. Complementa al ISTQB aportando prescripciones normativas a nivel de proceso y documentación.")
    headers_iso29119 = ["Parte", "Título Oficial", "Contenido Principal", "Aplicación en QAMS"]
    rows_iso29119 = [
        ["ISO 29119-1\n(2022)", "Conceptos y Definiciones Generales", "Marco conceptual unificado; definiciones normativas de: Error, Defecto, Falla, Prueba, Caso de Prueba, Plan de Pruebas, Criterio de Salida.", "Define el vocabulario base de todas las entidades del dominio QAMS (TestCase, Defect, TestExecution, etc.)."],
        ["ISO 29119-2\n(2021)", "Procesos de Prueba", "Proceso organizacional, de gestión y procesos dinámicos de prueba (diseño, implementación, ejecución, informe).", "El flujo Planificación → Diseño → Ejecución → Cierre de QAMS sigue la secuencia normativa de esta parte."],
        ["ISO 29119-3\n(2021)", "Documentación de Prueba", "Plantillas normativas para: Plan de Pruebas, Especificación de Diseño, Procedimiento, Registro de Ejecución, Informe Final.", "El módulo de Reportes de QAMS genera documentación compatible con los artefactos normativos (PDF/Excel)."],
        ["ISO 29119-4\n(2021)", "Técnicas de Prueba", "Formalización de técnicas: EP, BVA, Tablas de Decisión, Transición de Estados, Cobertura de Sentencias/Ramas.", "El catálogo DesignTechnique de QAMS clasifica cada caso de prueba según la técnica normativa."],
    ]
    add_custom_table(headers_iso29119, rows_iso29119, [0.9, 1.8, 2.1, 2.0])

    add_h3("2.3.2 ISO/IEC 25010 (SQuaRE) — Modelo de Calidad del Producto de Software")
    add_p("La norma ISO/IEC 25010:2011 define el modelo de calidad del producto de software en 8 características y 31 subcaracterísticas. Fue adoptada como marco normativo para los Requisitos No Funcionales (RNF) de QAMS.")
    headers_iso25010 = ["Característica ISO 25010", "Definición Normativa", "Subcaracterísticas Clave", "Implementación en QAMS / Métrica"]
    rows_iso25010 = [
        ["1. Adecuación Funcional", "Grado en que el software proporciona funciones que satisfacen las necesidades declaradas e implícitas.", "Completitud, Corrección, Pertinencia funcional.", "100% de las funcionalidades ISTQB implementadas. Cobertura RTM ≥ 95%."],
        ["2. Eficiencia de Desempeño", "Desempeño relativo a la cantidad de recursos utilizados bajo condiciones establecidas.", "Comportamiento temporal, Utilización de recursos, Capacidad.", "Latencia P95 < 200ms (K6). RAM base < 250MB en Docker Alpine."],
        ["3. Compatibilidad", "Capacidad de intercambiar información con otros sistemas.", "Coexistencia, Interoperabilidad.", "API REST con OpenAPI/Swagger 3.0. Exportación a CSV/PDF estándar."],
        ["4. Usabilidad", "Capacidad de ser usado para lograr objetivos con efectividad, eficiencia y satisfacción.", "Reconocibilidad, Aprendizaje, Operabilidad.", "Fast Runner con atajos P/F/B. Reducción tiempo de ejecución en 60%."],
        ["5. Confiabilidad", "Capacidad de realizar funciones bajo condiciones determinadas durante un período.", "Madurez, Disponibilidad, Tolerancia a fallos.", "Health Checks en Docker Compose. Retry policies en EF Core. Soft-Delete."],
        ["6. Seguridad", "Capacidad de proteger información de acceso no autorizado.", "Confidencialidad, Integridad, Autenticación, Autorización.", "AES-256 en payloads. BCrypt. JWT Bearer + RBAC. OWASP Top 10 completo."],
        ["7. Mantenibilidad", "Efectividad para modificar el sistema.", "Modularidad, Reusabilidad, Analizabilidad, Modificabilidad.", "Clean Architecture 4 capas. SOLID completo. 75%+ cobertura xUnit."],
        ["8. Portabilidad", "Capacidad de ser transferido a otro entorno.", "Adaptabilidad, Capacidad de instalación.", "Docker total. One-Click Deploy: docker compose up -d. Linux/Windows/macOS."],
    ]
    add_custom_table(headers_iso25010, rows_iso25010, [1.4, 1.5, 1.5, 2.4])
    add_p("Fuente: ISO/IEC 25010:2011 Systems and software quality models. Adaptación de mapeo por el autor.")

    # ─────────────────────────────────────────────────────────────────────────
    # 2.4 Arquitectura de Software
    # ─────────────────────────────────────────────────────────────────────────
    add_h2("2.4 Arquitectura de Software — Teorías, Patrones y Decisiones de Diseño")
    add_p("La arquitectura de software, según IEEE 42010 (ISO/IEC/IEEE 42010:2011), es 'la organización fundamental de un sistema, plasmada en sus componentes, las relaciones entre ellos y con el entorno, y los principios que gobiernan su diseño y evolución'. La selección del patrón arquitectónico para QAMS fue resultado de un análisis exhaustivo de trade-offs técnicos documentados mediante Architecture Decision Records (ADRs).")

    add_h3("2.4.1 Monolito Modular vs Microservicios — Análisis de Trade-offs")
    add_p("La falsa dicotomía 'Monolito = malo, Microservicios = bueno' es uno de los anti-patrones más costosos de la industria moderna. Sam Newman (2019) establece que los microservicios son 'una opción que tiene costos'. Para QAMS, un dominio transaccional denso, el Monolito Modular es la elección arquitectónicamente correcta.")
    headers_mono = ["Dimensión de Evaluación", "Monolito Modular (QAMS)", "Microservicios"]
    rows_mono = [
        ["Consistencia Transaccional", "ACID nativa: Unit of Work en una sola transacción. Ideal para operaciones como 'crear ejecución + resultado de paso + defecto' en una sola operación atómica.", "Consistencia Eventual (BASE). Requiere patrones Saga/2PC. Alta complejidad operativa y riesgo de estados inconsistentes."],
        ["Latencia Interna", "Cero latencia: comunicación en memoria RAM entre capas. Llamadas de nanosegundos entre Domain, Application e Infrastructure.", "Latencia de red (ms a decenas de ms) por cada llamada HTTP/gRPC entre servicios. Se acumula en cadenas de llamadas."],
        ["Complejidad Operativa", "Un proceso único. Un Docker Compose. Un log centralizado, un punto de monitoreo, un pipeline CI/CD.", "N servicios independientes. Requiere Kubernetes, Service Mesh (Istio), Tracing (Jaeger), Logging (ELK Stack). Costo: >$500/mes."],
        ["Costo de Infraestructura", "$40/mes en VPS 4 Cores / 8GB RAM con Docker Compose.", ">$500-800/mes en AWS ECS/EKS o Azure AKS para 5-8 microservicios con 2 réplicas mínimas cada uno."],
        ["Mantenibilidad", "Un repositorio, una solución, un set de tests. Refactoring sin fronteras de red. Cambios cross-módulo en una sola PR.", "N repositorios, N pipelines, N contratos API a versionar. Cambios cross-servicio requieren múltiples PRs coordinadas."],
        ["Idoneidad para QAMS", "ÓPTIMO: El dominio STLC es densamente interconectado (Defecto → Ejecución → Caso → Suite → Plan → Requisito). Consistencia ACID requerida.", "SUBÓPTIMO: La separación en servicios rompería transacciones críticas sin beneficio de escalabilidad real."],
        ["Veredicto", "✅ ELEGIDO — Monolito Modular con Clean Architecture", "❌ DESCARTADO — Complejidad desproporcionada sin beneficio"],
    ]
    add_custom_table(headers_mono, rows_mono, [1.5, 2.25, 2.25])
    add_p("Fuente: Newman, S. (2019). Monolith to Microservices. O'Reilly Media. Richardson, C. (2018). Microservices Patterns. Manning.")

    add_h3("2.4.2 Clean Architecture — Las 4 Capas y la Regla de Dependencia")
    add_p("Propuesta por Robert C. Martin en 'Clean Architecture' (2017), establece que las dependencias del código fuente solo pueden apuntar hacia el interior (hacia el Dominio). La capa de Dominio no conoce ni depende de Entity Framework, ASP.NET ni Angular — es puro C# con reglas de negocio. En QAMS se implementa como 4 proyectos .NET independientes con referencias estrictamente unidireccionales.")

    add_image_fig("figura6_clean_architecture.png", "Figura 2.4: Arquitectura Limpia (Clean Architecture) de QAMS — Diagrama de Capas Concéntricas. El anillo interior representa el Dominio puro (sin dependencias externas), seguido por la capa de Aplicación (Casos de Uso), la capa de Infraestructura (EF Core, PostgreSQL, Redis) y la capa exterior de API (ASP.NET Core 9 Controllers, JWT, Middlewares). Las flechas de dependencia solo apuntan hacia el interior, validando la Regla de Dependencia.")

    headers_clean = ["Capa", "Proyecto .NET en QAMS", "Contenido", "Dependencias Permitidas"]
    rows_clean = [
        ["1. Domain\n(Núcleo Interno)", "Qams.Domain", "Entidades (TestCase, Defect, Requirement...), Value Objects (TestStatus, Severity), Interfaces de repositorio, Domain Events, Invariantes de Negocio.", "NINGUNA — solo .NET BCL. Cero dependencias de frameworks externos."],
        ["2. Application\n(Casos de Uso)", "Qams.Application", "Use Cases (Commands/Queries CQRS-lite), DTOs, AutoMapper Profiles, Validadores FluentValidation, Interfaces de servicios externos (IEmailService, ICacheService).", "Solo Qams.Domain. NO conoce EF Core ni controladores HTTP."],
        ["3. Infrastructure\n(Adaptadores)", "Qams.Infrastructure", "Repositorios EF Core + PostgreSQL, Redis Cache, SMTP/MailKit, Interceptores EF Core (Audit Trail, Soft-Delete), Migraciones de base de datos.", "Qams.Domain + Qams.Application (implementa sus interfaces)."],
        ["4. API\n(Punto de Entrada)", "Qams.API", "Controllers REST, Middleware JWT, Middleware AES-256, Filtros de excepción globales, Configuración DI (IoC), Swagger/OpenAPI, CORS.", "Qams.Application + Qams.Infrastructure (solo para registrar en DI)."],
    ]
    add_custom_table(headers_clean, rows_clean, [1.1, 1.3, 2.4, 1.4])

    add_image_fig("figura6a_backend_detailed.png", "Figura 2.5: Arquitectura Detallada del Backend QAMS (.NET 9). Se muestra el flujo interno de una petición HTTP a través de las 4 capas de Clean Architecture: desde el Controller en la capa API hasta el repositorio PostgreSQL en Infrastructure, pasando por los Handlers de MediatR en Application y las Entidades de Dominio con sus invariantes. Se destacan los Interceptores transversales de Seguridad (JWT), Auditoría (AuditTrail) y Cifrado (AES-256).")

    add_h3("2.4.3 Principios SOLID Aplicados a QAMS — Backend y Frontend")
    add_p("Los principios SOLID, formulados por Robert C. Martin y Michael Feathers, son los cinco axiomas fundamentales del diseño orientado a objetos de alta mantenibilidad. QAMS los aplica de forma sistemática y verificable en ambas capas del stack:")
    headers_solid = ["Principio SOLID", "Definición Académica", "Aplicación Backend (.NET 9)", "Aplicación Frontend (Angular 19)"]
    rows_solid = [
        ["S — Single Responsibility", "Una clase debe tener una, y solo una, razón para cambiar (Martin, 2003).", "TestCaseService solo gestiona casos. AuditInterceptor solo registra auditoría. Controllers solo enrutan HTTP.", "fast-runner.component solo gestiona ejecuciones. defect-modal.component solo el ciclo de vida del defecto."],
        ["O — Open/Closed", "Abierta para extensión, cerrada para modificación (Meyer, 1988).", "IRepository<T> permite agregar repositorios sin modificar existentes. Los Handlers de MediatR se agregan sin cambiar el pipeline.", "AuthInterceptor y EncryptionInterceptor se agregan al pipeline HTTP sin modificar servicios existentes."],
        ["L — Liskov Substitution", "Objetos de subclase sustituyen a los de la clase base sin alterar la correctitud (Liskov, 1987).", "PostgresDefectRepository implementa IDefectRepository completamente. InMemoryRepository sustituye en tests.", "Todos los componentes de formulario respetan el contrato de Input/Output del mismo tipo, sustituibles en tests."],
        ["I — Interface Segregation", "Los clientes no dependen de interfaces que no usan (Martin, 2003).", "Interfaces específicas: ITestCaseRepository, IDefectRepository, IAuditRepository — no una interfaz monolítica.", "Servicios Angular específicos por dominio: TestCaseService, DefectService, RequirementService."],
        ["D — Dependency Inversion", "Módulos de alto nivel no dependen de bajo nivel; ambos dependen de abstracciones (Martin, 2003).", "Application depende de ITestCaseRepository (abstracción), no de PostgresTestCaseRepository (concreta). DI en Program.cs resuelve.", "Componentes Angular dependen de TestCaseService inyectada vía inject() de Angular 19."],
    ]
    add_custom_table(headers_solid, rows_solid, [1.2, 1.4, 1.8, 1.8])
    add_p("Fuente: Martin, R.C. (2003). Agile Software Development: Principles, Patterns, and Practices. Prentice Hall.")

    # ─────────────────────────────────────────────────────────────────────────
    # 2.5 Desarrollo Fullstack Moderno
    # ─────────────────────────────────────────────────────────────────────────
    add_h2("2.5 Desarrollo Fullstack Moderno — Teoría y Stack Tecnológico de QAMS")
    add_p("El paradigma del Desarrollo Fullstack moderno ha evolucionado desde los monolitos SSR de los años 2000 hacia las arquitecturas SPA desacopladas que dominan el desarrollo empresarial actual. QAMS adopta la tercera generación de este paradigma: Reactividad Fina con Angular Signals, eliminando por completo el motor Zone.js para lograr actualizaciones de UI de microsegundos en el módulo crítico Fast Runner.")

    add_h3("2.5.1 Arquitectura Frontend Angular 19 — Standalone Components y Signals")
    add_p("Angular 19 representa el estado del arte en frameworks frontend empresariales. La eliminación de NgModules en favor de Standalone Components reduce el tiempo de compilación, mejora el lazy-loading y simplifica la estructura del proyecto. La adopción de Angular Signals como mecanismo de estado reactivo elimina el overhead de Zone.js, donde solo el componente que lee el Signal se re-renderiza cuando este cambia — a diferencia del Change Detection global que revisaba todo el árbol de componentes.")

    add_image_fig("figura6b_frontend_detailed.png", "Figura 2.6: Arquitectura Detallada del Frontend QAMS (Angular 19). Se muestran las cuatro capas de la arquitectura frontend: Capa de Presentación (Standalone Components), Capa de Estado (Angular Signals y Services), Capa de Dominio (Mappers con Null-Safety y Type Guards) y Capa de Infraestructura (HttpClient, Interceptores JWT y AES-256). Las flechas ilustran el flujo unidireccional de datos entre capas.")
    add_image_fig("figura7_frontend_arch.png", "Figura 2.7: Arquitectura de Módulos y Rutas del Frontend QAMS (Angular 19 Router). Se visualiza la estructura completa de las rutas lazy-loaded por feature module: Dashboard, Requerimientos, Planes de Prueba, Suites, Casos de Prueba, Fast Runner (Ejecuciones), Defectos, Static Testing, Exploratory Testing (SBTM), Reportes y Administración. Cada módulo es un Standalone Component cargado bajo demanda para optimizar el tiempo de carga inicial.")

    add_h3("2.5.2 Stack Tecnológico Completo — Justificación Académica")
    headers_stack = ["Tecnología", "Versión", "Rol en QAMS", "Característica Técnica Decisiva", "Alternativas Descartadas"]
    rows_stack = [
        ["ASP.NET Core / .NET", "9.0 LTS", "Backend Framework / API REST", "#1 en TechEmpower Benchmarks. async/await nativo. Minimal APIs + Controllers. DI integrada. Cross-platform.", "Node.js (tipado débil); Java Spring (verbosidad, startup lento); Go (menor ecosistema para dominios complejos)."],
        ["C# 13", "13.0", "Lenguaje Backend", "Tipado estático fuerte. Records inmutables para Value Objects. Pattern Matching. Nullable Reference Types (NRTs).", "Python (tipado dinámico, menor rendimiento); JavaScript (ecosystem menos maduro para backends enterprise)."],
        ["Entity Framework Core", "9.0", "ORM — Persistencia", "Code-First + Migraciones. Queries parametrizados (previene SQLi). Interceptores de SaveChanges (Audit, Soft-Delete).", "Dapper (bajo nivel, sin migraciones); NHibernate (sintaxis compleja, menor adopción .NET moderno)."],
        ["PostgreSQL", "16 Alpine", "Base de Datos Relacional", "ACID completo. JSONB. Full-Text Search nativo. Extensiones (pg_crypto, uuid-ossp). Máximo rendimiento en JOINs complejos (RTM).", "MySQL (menor JSON/Full-Text); SQL Server (licenciamiento costoso en producción)."],
        ["Redis", "7.0 Alpine", "Cache Distribuido In-Memory", "Sub-milisegundo en lecturas. Pub/Sub para invalidación. Reduce carga de PostgreSQL en catálogos de lectura frecuente.", "Memcached (sin persistencia); caché in-process (no compartido entre instancias escaladas)."],
        ["Angular", "19.x", "Frontend SPA Framework", "Standalone Components. Angular Signals (sin Zone.js). Lazy Loading por defecto. TypeScript estricto. CLI robusta.", "React (sin opinión, configuración manual); Vue.js (menor adopción enterprise, menor ecosistema TypeScript)."],
        ["Tailwind CSS", "3.x", "Framework CSS Utility-First", "Zero runtime CSS. Purge automático (<50KB en prod). Glassmorphism nativo. Dark Mode. Responsive sin media queries complejas.", "Bootstrap (clases fijas, difícil customización); Angular Material (diseño rígido, difícil personalización)."],
        ["Nginx", "1.25 Alpine", "Reverse Proxy / Web Server", "50,000+ conexiones concurrentes con 4MB RAM. Sirve Angular estático. Proxy a API .NET. Termina TLS. Headers de seguridad.", "Apache (mayor consumo RAM para estáticos); Caddy (menor adopción enterprise)."],
        ["Docker Compose", "27.x / 2.x", "Contenedorización + Orquestación", "Aislamiento total de procesos. Multi-stage builds (<150MB). Health checks. Volumes para PostgreSQL persistente.", "Kubernetes (excesivo para single-tenant; complejidad injustificada a esta escala)."],
    ]
    add_custom_table(headers_stack, rows_stack, [1.1, 0.6, 1.0, 2.1, 1.9])
    add_p("Fuente: TechEmpower Framework Benchmarks Round 22 (2023). Documentación oficial de Microsoft, Google Angular Team, PostgreSQL Global Development Group.")

    add_h3("2.5.3 Angular Signals vs Zone.js — La Revolución de la Reactividad Fina")
    headers_signals = ["Aspecto", "Zone.js (Angular 2–16 clásico)", "Angular Signals (Angular 16–19)"]
    rows_signals = [
        ["Mecanismo de detección", "Monkey-patch de todas las APIs asíncronas del browser. Ejecuta Change Detection en todo el árbol de componentes tras cualquier evento.", "Gráfico reactivo de dependencias. Solo el componente que lee el Signal se suscribe y re-renderiza al cambiar."],
        ["Granularidad de actualización", "Árbol completo de componentes (o subtree con OnPush). En Fast Runner con 200 casos en pantalla: todos los ítems se revisan.", "Solo el ítem específico cuyo Signal cambió se actualiza. Los demás permanecen intactos en el DOM."],
        ["Overhead de CPU en Fast Runner", "Alto: ~50-100ms por actualización de estado con 200 casos en pantalla.", "Mínimo: < 1ms por actualización atómica de Signal. Sensación de respuesta nativa de escritorio."],
        ["Código requerido", "BehaviorSubject + async pipe + combineLatest + takeUntilDestroyed para estado reactivo.", "signal(), computed(), effect() — sintaxis declarativa directa y composable."],
        ["Eliminación de Zone.js", "Requerido obligatoriamente.", "Opcional y progresivo. QAMS lo elimina completamente: provideZonelessChangeDetection()"],
    ]
    add_custom_table(headers_signals, rows_signals, [1.8, 2.3, 2.1])

    # ─────────────────────────────────────────────────────────────────────────
    # 2.6 Gobernanza de Datos y Normalizacion
    # ─────────────────────────────────────────────────────────────────────────
    add_h2("2.6 Gobernanza de Datos y Normalización Relacional en PostgreSQL 16")
    add_p("La Gobernanza de Datos (Data Governance), definida por DAMA International en el DAMA-DMBOK (2017), es 'el ejercicio de autoridad, control y toma de decisiones compartida sobre la gestión de activos de datos'. Para un sistema de aseguramiento de calidad como QAMS, la gobernanza es crítica: los artefactos de prueba y defectos son evidencias legales en auditorías de certificación y procesos de peritaje forense de software.")

    add_image_fig("figura9a_data_governance.png", "Figura 2.8: Marco de Gobernanza de Datos en QAMS (PostgreSQL 16). El diagrama ilustra los cuatro pilares de la gobernanza implementados: (1) Soft-Delete — eliminación lógica con preservación histórica; (2) Audit Trail — registro UTC de autoría en cada operación CUD; (3) RBAC Dinámico — control de acceso basado en roles y políticas; y (4) Normalización 3FN — modelo relacional sin redundancias ni anomalías de actualización.")

    add_h3("2.6.1 Normalización Relacional: De la Tabla Plana a la 3FN")
    add_p("El proceso de Normalización, formalizado por Edgar F. Codd en 1970, elimina redundancias y anomalías de inserción, actualización y eliminación en bases de datos relacionales. QAMS aplica normalización hasta la Tercera Forma Normal (3FN). Ejemplo aplicado con la entidad TestCase:")
    add_p("Tabla sin normalizar (contiene anomalías): Si el ProjectName cambia, debe actualizarse en N filas (anomalía de actualización). Si se elimina el único caso de un tester, se pierde su información (anomalía de eliminación). Si se crea un proyecto sin casos de prueba, no puede registrarse (anomalía de inserción).")
    add_p("Aplicando 1FN (grupos repetidos eliminados) → 2FN (dependencia completa de la clave primaria) → 3FN (sin dependencias transitivas), se obtienen tablas independientes: Projects, TestSuites, TestCases, Priorities, Users. Resultado: cero redundancia, cero anomalías, integridad referencial garantizada por Foreign Keys en PostgreSQL 16.")

    add_image_fig("figura14_normalization.png", "Figura 2.9: Proceso de Normalización Relacional (1FN a 3FN) aplicado al Modelo de Datos de QAMS. Se visualiza la tabla original desnormalizada con sus anomalías (marcadas en rojo), el proceso de descomposición en cada forma normal y el resultado final en 3FN con las entidades Projects, TestSuites, TestCases, Priorities y Users correctamente relacionadas mediante claves foráneas.")

    add_h3("2.6.2 Patrones de Gobernanza Implementados en QAMS")
    headers_gov = ["Patrón de Gobernanza", "Descripción Teórica", "Implementación en QAMS", "Beneficio de Auditoría"]
    rows_gov = [
        ["Soft-Delete\n(Eliminación Lógica)", "Los registros nunca se eliminan físicamente. Se marcan con IsDeleted = true y fecha de eliminación. Fowler, 'Patterns of Enterprise Application Architecture' (2002).", "Interceptor EF Core SoftDeleteInterceptor: cada Delete() se convierte en UPDATE SET IsDeleted=true, DeletedAt=UTC_NOW, DeletedByUserId. Global Query Filter excluye registros eliminados.", "Preservación de evidencia histórica completa. Permite auditoría forense. Cumple GDPR Art. 17 con anonimización."],
        ["Audit Trail\n(Pista de Auditoría)", "Registro inmutable de todos los cambios: quién, qué, cuándo. Requisito en sistemas de misión crítica, banca y certificación.", "Interfaz IAuditable en todas las entidades: CreatedAt (UTC), CreatedByUserId, UpdatedAt (UTC), UpdatedByUserId. AuditInterceptor los rellena automáticamente en SaveChanges().", "Trazabilidad completa de autoría. Detecta modificaciones no autorizadas. Soporte para peritajes forenses."],
        ["RBAC Dinámico\n(Control de Acceso)", "Permisos asignados a roles, no a usuarios individuales. NIST RBAC Model (Ferraiolo et al., 2001).", "Claims JWT con Role y Permission granular. Atributo [Authorize(Policy)] en controllers. Policy-based authorization en ASP.NET Core 9.", "Principio de Mínimo Privilegio. Los testers no pueden eliminar planes. Solo lectura para Product Owners."],
        ["Timestamps UTC\n(Zona Horaria Universal)", "Todos los timestamps en UTC (Coordinated Universal Time), independientemente de la zona del servidor o cliente.", "PostgreSQL 16 almacena TIMESTAMPTZ. EF Core mapea a DateTimeOffset. Angular convierte a la zona local del tester para visualización.", "Consistencia en equipos distribuidos. Sin ambigüedades de horario de verano. Auditorías multi-jurisdiccionales."],
    ]
    add_custom_table(headers_gov, rows_gov, [1.2, 1.8, 1.8, 1.4])

    # ─────────────────────────────────────────────────────────────────────────
    # 2.7 Seguridad Web — OWASP Top 10
    # ─────────────────────────────────────────────────────────────────────────
    add_h2("2.7 Seguridad Web — OWASP Top 10 2021 y Criptografía Aplicada")
    add_p("La OWASP Foundation (Open Web Application Security Project), fundada en 2001, publica el OWASP Top 10 — lista actualizada con las 10 vulnerabilidades de seguridad web más críticas, basada en datos de miles de aplicaciones escaneadas. La edición 2021 introduce 'Insecure Design' como nueva categoría, consolidando el consenso de que la seguridad debe integrarse desde la fase de diseño arquitectónico, no como un parche posterior.")
    add_p("QAMS implementa una estrategia de Defensa en Profundidad (Defense in Depth): múltiples capas independientes de protección para que la falla de una sola capa no comprometa el sistema. Las contramedidas son verificables técnicamente y han sido auditadas mediante OWASP ZAP Scanner.")

    add_image_fig("figura13_owasp_security.png", "Figura 2.10: Mapa de Mitigación y Cumplimiento OWASP Top 10 2021 en QAMS. El diagrama muestra las 10 categorías de vulnerabilidades de la OWASP Foundation y las contramedidas implementadas en dos capas: Backend (.NET 9 — izquierda) y Frontend (Angular 19 / Nginx — derecha). Las flechas indican qué mitigación técnica específica neutraliza cada vector de ataque, demostrando el cumplimiento integral bajo la estrategia de Defensa en Profundidad.")

    headers_owasp = ["Categoría OWASP 2021", "Vulnerabilidad / Riesgo", "Contramedida Backend (.NET 9)", "Contramedida Frontend (Angular 19)"]
    rows_owasp = [
        ["A01: Broken Access Control", "Acceso no autorizado a recursos verticales (privilege escalation) u horizontales (acceder a datos de otro usuario).", "Claims JWT verificados en cada endpoint. Políticas RBAC (CanManageTestPlans, CanExecuteTests). Global Query Filters en EF Core filtran por TenantId/UserId.", "Route Guards: AuthGuard, RoleGuard, PermissionGuard bloquean rutas. El menú lateral oculta opciones según el rol JWT del usuario autenticado."],
        ["A02: Cryptographic Failures", "Contraseñas en texto plano, datos sensibles sin cifrar en tránsito, algoritmos criptográficos débiles (MD5, SHA-1).", "BCrypt con factor de coste 12 para contraseñas. AES-256-CBC para cifrar payloads de respuesta. JWT firmado con HMAC-SHA256 (clave 512 bits).", "EncryptionInterceptor intercepta TODAS las peticiones y cifra el body antes de transmitir. Wireshark muestra texto cifrado, no legible."],
        ["A03: Injection (SQL/NoSQL)", "Inyección de código malicioso en queries de base de datos, comandos del OS o parsers XML.", "Entity Framework Core 9 usa 100% consultas parametrizadas. FluentValidation rechaza inputs peligrosos. StoredProcedures con parámetros tipados.", "Angular FormBuilder con validaciones estrictas de tipo y longitud. DomSanitizer sanitiza automáticamente todo HTML renderizado, previniendo XSS."],
        ["A04: Insecure Design", "Defectos estructurales de diseño que no pueden resolverse con controles de implementación.", "Clean Architecture con Domain Layer puro: invariantes de negocio en el Dominio inmunes a cambios de infraestructura. Validaciones en múltiples capas.", "Validación en cliente + validación de DTOs en servidor (nunca confiar solo en el cliente). Preguntas de confirmación para acciones destructivas."],
        ["A05: Security Misconfiguration", "Configuraciones por defecto inseguras, stack traces en producción, headers de seguridad faltantes.", "ASPNETCORE_ENVIRONMENT=Production desactiva DeveloperExceptionPage y Swagger. CORS restringido a orígenes explícitos. Headers HSTS, X-Frame-Options: DENY.", "Nginx con X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Content-Security-Policy. Angular en modo Production sin console.log de errores técnicos."],
        ["A06: Vulnerable Components", "Dependencias NuGet/npm con CVEs conocidas. Imágenes Docker desactualizadas.", ".NET 9 LTS con actualizaciones de seguridad. Docker multi-stage con Alpine Linux 3.19 (superficie mínima). dotnet list package --vulnerable en CI/CD.", "Angular 19 con npm audit en CI/CD. Solo dependencias del registro npm oficial. npm ci --production en Dockerfile excluye devDependencies."],
        ["A07: Auth & Identity Failures", "Fuerza bruta, sesiones que no expiran, credenciales débiles, recuperación insegura.", "Rate limiting en Login (5 intentos/15 min). JWT: expiración 60 min + Refresh Token 7 días rotable. Política de contraseña segura enforced (8+ chars, números y símbolos).", "Cierre de sesión limpia localStorage y Signals. JwtInterceptor maneja renovación automática. Sin hints 'usuario no encontrado' en pantalla de login."],
        ["A08: Integrity Failures", "Descargas sin verificación de integridad, actualizaciones sin firma.", "Verificación de tipo MIME y firma de bytes mágicos en uploads de archivos de evidencia. Checksums en artefactos Docker.", "Validación de tipo de archivo y tamaño máximo en el input de upload del cliente antes de cualquier llamada HTTP."],
        ["A09: Logging & Monitoring Failures", "Ausencia de logs ante ataques en curso, logs no protegidos o no monitoreados.", "Serilog con logging estructurado en JSON. AuditInterceptor registra cada operación CUD con usuario, IP y timestamp UTC. Logs con niveles Information/Warning/Error.", "HttpErrorInterceptor captura todos los errores de red y los registra en el servicio de logging. Alertas al usuario con mensajes genéricos sin exponer detalles técnicos."],
        ["A10: SSRF", "El atacante hace que el servidor envíe peticiones HTTP a recursos internos.", "Validación estricta de URLs en webhooks. Docker Bridge Network aísla los contenedores del host. Solo Nginx expone puertos al exterior (80/443).", "Cliente Angular solo realiza llamadas a /api/* proxificados por Nginx. Sin llamadas directas a la API o recursos externos no aprobados."],
    ]
    add_custom_table(headers_owasp, rows_owasp, [1.1, 1.4, 2.0, 2.0])
    add_p("Fuente: OWASP Foundation. (2021). OWASP Top 10:2021. https://owasp.org/Top10/")

    # ─────────────────────────────────────────────────────────────────────────
    # 2.8 Benchmark y Analisis de Mercado
    # ─────────────────────────────────────────────────────────────────────────
    add_h2("2.8 Benchmark Multicriterio y Análisis Competitivo de Mercado")
    add_p("El análisis de mercado de herramientas ALM de gestión de pruebas revela un ecosistema dominado por soluciones privativas SaaS con modelos de licenciamiento restrictivos. El Cuadrante Mágico de Gartner para herramientas ALM sitúa como líderes a OpenText (HP ALM), SmartBear (Zephyr), Idera (TestRail) y Atlassian (Jira + Xray). Sin embargo, el cuadrante de Gartner no evalúa el criterio de asequibilidad para PYMEs ni el cumplimiento ISTQB CTFL v4.0 integral — dimensiones donde QAMS establece una ventaja competitiva absoluta.")

    headers_bench = ["Criterio de Evaluación", "QAMS", "TestRail\n(Idera)", "Zephyr Scale\n(SmartBear)", "Jira Xray\n(Ibis)", "TestLink\n(Open Source)"]
    rows_bench = [
        ["Modelo de Licencia", "Open Source\nSelf-Hosted", "Comercial\nSaaS/On-Prem", "Comercial\nPlugin Jira", "Comercial\nPlugin Jira", "GPL\nOpen Source"],
        ["Costo anual / 15 testers", "$480 (VPS)", "$13,320 USD", "$4,500 + Jira", "$3,600 + Jira", "$480 (VPS)"],
        ["Stack tecnológico", ".NET 9 + Angular 19\n(LTS 2024)", "PHP / React\n(Stack legado)", "Java / React\n(via Jira)", "Java / React\n(via Jira)", "PHP 5.x\n(Obsoleto)"],
        ["Cumplimiento ISTQB v4.0", "100% — 7 módulos", "72% Parcial", "68% Parcial", "74% Parcial", "48% Básico"],
        ["Pruebas Estáticas (Cap.3 ISTQB)", "✅ Módulo nativo", "❌ No soportado", "❌ No soportado", "❌ No soportado", "❌ No soportado"],
        ["SBTM / Pruebas Exploratorias", "✅ Con Charters", "⚠️ Notas básicas", "⚠️ Plugin extra", "✅ Soportado", "❌ No soportado"],
        ["Editor BDD / Gherkin nativo", "✅ Integrado", "⚠️ Plugin externo", "✅ Soportado", "✅ Nativo", "❌ No soportado"],
        ["Motor Fast Runner (atajos)", "✅ P/F/B + teclado", "⚠️ Formulario std.", "⚠️ Test Player", "⚠️ Vista estándar", "⚠️ Formulario manual"],
        ["Kanban de Defectos integrado", "✅ Nativo drag&drop", "❌ No soportado", "⚠️ Requiere Jira", "⚠️ Requiere Jira", "❌ No soportado"],
        ["Gobernanza: Soft-Delete+Audit", "✅ Completo UTC", "⚠️ Logs básicos", "⚠️ Histórico Jira", "⚠️ Histórico Jira", "❌ Sin Soft-Delete"],
        ["Seguridad OWASP Top 10", "✅ AES-256+RBAC\nCompleto", "⚠️ TLS estándar", "⚠️ TLS estándar", "⚠️ TLS estándar", "❌ Sin cifrado payload"],
        ["Quality Gates automáticos", "✅ Semáforo nativo", "⚠️ Milestones", "⚠️ Manuales", "⚠️ Manuales", "❌ No soportado"],
        ["Despliegue en Docker", "✅ One-Click Compose", "⚠️ On-Prem disp.", "❌ SaaS only", "❌ SaaS only", "⚠️ Manual complejo"],
        ["Soberanía de datos", "✅ 100% Self-hosted", "⚠️ SaaS/On-Prem", "❌ SaaS en AWS", "❌ SaaS en AWS", "✅ Self-hosted"],
    ]
    add_custom_table(headers_bench, rows_bench, [1.5, 1.1, 1.1, 1.1, 1.1, 1.0])
    add_p("Fuente: Elaboración propia en base a evaluación técnica directa de las herramientas, documentación oficial y Gartner Peer Insights 2024.")

    add_image_fig("figura15_benchmark_radar.png", "Figura 2.11: Evaluación Benchmark Multicriterio de QAMS frente a Herramientas del Mercado (Gráfico Radar Multidimensional). Los ejes representan: Cumplimiento ISTQB (%), Seguridad OWASP, Ergonomía Fast Runner, Costo Total de Propiedad (invertido — menor es mejor), Cobertura de Módulos, Gobernanza de Datos y Portabilidad Docker. QAMS obtiene el perímetro de cobertura más amplio, superando a TestRail, Zephyr, Xray y TestLink en la mayoría de las dimensiones evaluadas.")
    add_image_fig("figura16_tco_comparison.png", "Figura 2.12: Comparativa de Costo Total de Propiedad (TCO) a 5 años — Equipo de 15 Testers activos. El gráfico de barras muestra el TCO acumulado de QAMS ($2,400 USD — solo infraestructura VPS) frente a TestRail ($69,000 USD), Zephyr Scale ($20,160 USD), Jira Xray ($18,720 USD) y HP ALM ($108,000+ USD). QAMS representa un ahorro operativo de entre $16,320 y $105,600 USD según la herramienta de referencia utilizada.")

    doc.add_page_break()
'''

import re

def inject_chapter_2():
    target_path = r"c:\diplomado\qams-web\scripts\generate_academic_monograph.py"
    with open(target_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Buscar inicio del Capitulo 2 (puede ser el nuevo o el anterior)
    markers_ch2 = [
        '    add_h1("Capítulo 2.- MARCO TEÓRICO")',
        '    add_h1("Capítulo 2.- MARCO TEÓRICO, ARQUITECTURAS Y ESTÁNDAR ISTQB")',
    ]
    start_idx = -1
    for m in markers_ch2:
        idx = content.find(m)
        if idx != -1:
            start_idx = idx
            break

    if start_idx == -1:
        print("ERROR: No se encontró el inicio del Capítulo 2.")
        return

    # Buscar el page_break anterior al capítulo 2
    block_start = content.rfind("    doc.add_page_break()\n", 0, start_idx)
    if block_start == -1:
        block_start = start_idx
    else:
        block_start += len("    doc.add_page_break()\n")

    # Buscar inicio del Capitulo 3
    markers_ch3 = [
        '    add_h1("Capítulo 3.-',
        '    # CAPÍTULO 3:',
        '    # =========================================================================\n    # CAPÍTULO 3:',
    ]
    end_idx = -1
    for m in markers_ch3:
        idx = content.find(m, start_idx + 100)
        if idx != -1:
            end_idx = idx
            break

    if end_idx == -1:
        print("ERROR: No se encontró el inicio del Capítulo 3.")
        return

    # Retroceder hasta el comentario del Capítulo 3
    block_end = content.rfind("    # ===", start_idx, end_idx)
    if block_end == -1:
        block_end = end_idx

    print(f"Reemplazando Capítulo 2 desde posición {block_start} hasta {block_end}")
    new_content = content[:block_start] + CHAPTER_2_CONTENT + content[block_end:]

    with open(target_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Capítulo 2 con gráficos inyectado exitosamente.")

if __name__ == "__main__":
    inject_chapter_2()
