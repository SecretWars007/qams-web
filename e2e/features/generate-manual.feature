Feature: Generador de Imágenes para Manual de Usuario
  Como redactor técnico
  Quiero navegar por la aplicación y tomar capturas de pantalla
  Para generar el manual de usuario

  @manual
  Scenario: Recorrido visual completo (Capturas)
    Given el usuario "admin" navega al login
    And toma una captura de pantalla "01_login"
    When ingresa el usuario "admin" y contraseña "Admin123!"
    And toma una captura de pantalla "02_login_credentials"
    And hace clic en ingresar
    Then verifica que se muestra el dashboard principal
    And toma una captura de pantalla "03_dashboard"

    Given navega a la sección de proyectos
    And toma una captura de pantalla "04_projects_list"
    When abre el formulario de nuevo proyecto y lo llena con nombre "Proyecto Manual" y descripción "Proyecto para capturas"
    And toma una captura de pantalla "05_projects_form"
    And guarda el proyecto
    And toma una captura de pantalla "06_projects_saved"

    Given navega a la sección de requisitos
    And toma una captura de pantalla "07_requirements_list"

    Given navega a la sección de test cases
    And toma una captura de pantalla "08_testcases_list"
    When abre el formulario de nuevo caso y lo llena con título "Validar Login" y descripción "Validar admin"
    And toma una captura de pantalla "09_testcases_form"

    Given navega a la sección de test executions
    And toma una captura de pantalla "10_executions_list"

    Given navega a la sección de defectos
    And toma una captura de pantalla "11_defects_list"

    Given navega a la sección de reportes
    And toma una captura de pantalla "12_reports"
