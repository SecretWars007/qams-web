Feature: Reportes - Matriz RTM y Gestión de Riesgos
  Como QA Manager
  Quiero acceder a los módulos de Reportes (RTM y Riesgos)
  Para visualizar la trazabilidad y los riesgos del proyecto

  Background:
    Given el usuario "admin" inicia sesión con la contraseña "Admin123!"
    Then verifica que se muestra el dashboard principal

  Scenario: Acceder al módulo de Reportes
    Given navega a la sección de reportes
    Then verifica que el encabezado de la página es "Reportes"

  Scenario: Visualizar la pestaña de Matriz RTM
    Given navega a la sección de reportes
    When selecciona la pestaña "RTM"
    Then verifica que la vista de matriz RTM está visible

  Scenario: Visualizar la pestaña de Gestión de Riesgos (RBT)
    Given navega a la sección de reportes
    When selecciona la pestaña "RBT"
    Then verifica que la vista de gestión de riesgos está visible

  Scenario: Visualizar la pestaña de Quality Gate
    Given navega a la sección de reportes
    When selecciona la pestaña "Quality Gate"
    Then verifica que los filtros de reporte están disponibles

  Scenario: Navegar a Reportes desde la ruta rtm-matrix
    Given el usuario navega directamente a la ruta "rtm-matrix"
    Then es redirigido al módulo de reportes

  Scenario: Navegar a Reportes desde la ruta risk-management
    Given el usuario navega directamente a la ruta "risk-management"
    Then es redirigido al módulo de reportes
