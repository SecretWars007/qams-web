Feature: Autenticación y Control de Acceso
  Como usuario del sistema QAMS
  Quiero que el acceso esté protegido correctamente
  Para garantizar la seguridad del sistema

  Scenario: Login exitoso con credenciales válidas
    Given el usuario navega a la página de login
    When ingresa credenciales válidas con usuario "admin" y contraseña "Admin123!"
    Then es redirigido al dashboard

  Scenario: Login fallido con credenciales inválidas
    Given el usuario navega a la página de login
    When ingresa credenciales inválidas con usuario "admin" y contraseña "ClaveIncorrecta!"
    Then ve un mensaje de error de acceso

  Scenario: Campos vacíos muestran validación
    Given el usuario navega a la página de login
    When hace clic en ingresar sin completar los campos
    Then ve una alerta de campos obligatorios

  Scenario: Cerrar sesión correctamente
    Given el usuario "admin" inicia sesión con la contraseña "Admin123!"
    When cierra sesión desde el menú de usuario
    Then es redirigido a la página de login
