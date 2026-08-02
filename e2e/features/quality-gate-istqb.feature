Feature: Quality Gate e ISTQB KPIs — Fase 1
  Como QA Manager certificado ISTQB
  Quiero verificar que el Quality Gate refleja umbrales configurables por proyecto
  Y que las métricas DDP, DRE y MTTR se calculan y muestran correctamente

  Background:
    Given el usuario "admin" inicia sesión con la contraseña "Admin123!"

  Scenario: 1. Dashboard general muestra métricas de cobertura y Pass Rate
    Given navega a "dashboard"
    Then el dashboard contiene una sección de métricas de ejecución

  Scenario: 2. Módulo de Reportes muestra el widget Quality Gate
    Given navega a "reports"
    Then el widget "Quality Gate ISTQB / ISO 29119" es visible en la pantalla

  Scenario: 3. Quality Gate muestra estado PASSED o FAILED con el dictamen
    Given navega a "reports"
    And el widget "Quality Gate ISTQB / ISO 29119" es visible en la pantalla
    Then el dictamen del Quality Gate es visible ("PASSED" o "FAILED")

  Scenario: 4. El widget Quality Gate muestra las 4 reglas ISTQB
    Given navega a "reports"
    And el widget "Quality Gate ISTQB / ISO 29119" es visible en la pantalla
    Then se muestran las reglas del Quality Gate con estado de cada una

  Scenario: 5. El widget muestra los KPIs avanzados DDP, DRE y MTTR
    Given navega a "reports"
    And el widget "Quality Gate ISTQB / ISO 29119" es visible en la pantalla
    Then los indicadores "DDP", "DRE" y "MTTR" son visibles en la sección de KPIs avanzados

  Scenario: 6. Módulo de Requisitos tiene trazabilidad (Req → Test Case)
    Given navega a "requirements"
    Then la pantalla muestra la lista de requisitos
    And cada requisito puede tener casos de prueba vinculados

  Scenario: 7. Módulo de Defectos permite ver defectos abiertos
    Given navega a "defects"
    Then la pantalla muestra la gestión de defectos
    And se puede filtrar por estado de defecto

  Scenario: 8. Módulo RTM (Matriz de Trazabilidad) es accesible
    Given navega a "reports"
    Then la pantalla de reportes permite ver la Matriz de Trazabilidad de Requisitos
