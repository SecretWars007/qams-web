Feature: QAMS - Flujo Completo QA (ISTQB)
  Como administrador del sistema QAMS
  Quiero realizar el flujo completo de QA
  Para asegurar la calidad del proyecto

  Background:
    Given el usuario "admin" inicia sesión con la contraseña "Admin123!"
    Then verifica que se muestra el dashboard principal

  Scenario: 1. Crear Proyecto QA y Establecer Contexto
    Given navega a la sección de proyectos
    When crea un nuevo proyecto llamado "Proyecto E2E Playwright" con la descripción "Proyecto generado automáticamente"
    Then verifica que el proyecto "Proyecto E2E Playwright" existe en la tabla
    And establece el proyecto "Proyecto E2E Playwright" como activo

  Scenario: 2. Crear Plan de Pruebas (Test Plan)
    Given navega a la sección de test plans
    When crea un nuevo plan de pruebas con título "Plan de Pruebas E2E", descripción "Plan para validación automatizada" y estado "DRAFT"
    Then verifica que el plan "Plan de Pruebas E2E" existe en la tabla

  Scenario: 3. Crear Requisito
    Given navega a la sección de requisitos
    When crea un requisito con título "REQ-001 Inicio de sesión seguro", descripción "El sistema debe permitir login seguro.", tipo "SECURITY" y prioridad "HIGH"
    Then verifica que el requisito "REQ-001 Inicio de sesión seguro" existe en la tabla

  Scenario: 4. Crear Caso de Prueba con Pasos
    Given navega a la sección de test cases
    When crea un caso de prueba "CP-01 Validar Login Exitoso", descripción "Validar credenciales correctas.", prioridad "HIGH", acción del paso "Ingresar credenciales válidas" y resultado esperado "Redirección al dashboard"
    Then verifica que el caso "CP-01 Validar Login Exitoso" existe en la tabla

  Scenario: 5. Registrar Ejecución Exitosa
    Given navega a la sección de test executions
    When registra una ejecución para el caso "CP-01 Validar Login Exitoso" con estado "1" y "1" hora
    Then verifica que la ejecución muestra estado "PASSED"

  Scenario: 6. Reportar Defecto de Prueba
    Given navega a la sección de defectos
    When reporta un defecto "BUG-01 El botón de login está desalineado", severidad "2", prioridad "2" y pasos "1. Ir a login\n2. Ver botón"
    Then verifica que el defecto "BUG-01" existe en la tabla

  Scenario: 7. Validar Métricas en Dashboard
    Given navega al dashboard
    Then verifica que el dashboard está cargado
    And verifica que las métricas de proyectos están visibles
