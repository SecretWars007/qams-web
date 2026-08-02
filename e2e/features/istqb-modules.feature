Feature: Módulos ISTQB
  Validación de acceso a los diferentes módulos

  Background:
    Given el usuario "admin" inicia sesión con la contraseña "Admin123!"

  Scenario: 1. Módulo SUT
    Given navega a "systems-under-test"
    Then verifica que el encabezado es "Sistemas Bajo Prueba (SUT)"

  Scenario: 2. Módulo de Reportes
    Given navega a "reports"
    Then verifica que el encabezado es "Reportes"

  Scenario: 3. Módulo de Requisitos
    Given navega a "requirements"
    Then verifica que el encabezado es "Requisitos"

  Scenario: 4. Módulo de Casos de Prueba
    Given navega a "test-cases"
    Then verifica que el encabezado es "Casos de prueba"

  Scenario: 5. Módulo de Defectos
    Given navega a "defects"
    Then verifica que el encabezado es "Gestión de Defectos"

  Scenario: 6. Módulo Dashboard
    Given navega a "dashboard"
    Then verifica que el encabezado es "Tablero de Control QA"
