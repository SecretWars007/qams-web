Feature: Sistemas Bajo Prueba (SUT)
  Como QA Manager
  Quiero gestionar los sistemas bajo prueba del proyecto
  Para tener trazabilidad completa del entorno de pruebas

  Background:
    Given el usuario "admin" inicia sesión con la contraseña "Admin123!"
    Then verifica que se muestra el dashboard principal

  Scenario: Visualizar la sección de Sistemas Bajo Prueba
    Given navega a la sección de sistemas bajo prueba
    Then verifica que el encabezado de la página es "Sistemas Bajo Prueba (SUT)"

  Scenario: Crear un nuevo sistema bajo prueba tipo Web
    Given navega a la sección de sistemas bajo prueba
    When abre el formulario de nuevo SUT
    And completa el formulario del SUT con nombre "Sistema E2E QA", versión "2.0.0", tipo "WEB" y descripción "Sistema para pruebas E2E automatizadas"
    And guarda el formulario del SUT
    Then verifica que el SUT "Sistema E2E QA" aparece en la lista

  Scenario: Editar un sistema bajo prueba existente
    Given navega a la sección de sistemas bajo prueba
    When edita el SUT llamado "Sistema E2E QA" cambiando la versión a "2.1.0"
    Then verifica que el SUT "Sistema E2E QA" muestra versión "2.1.0"

  Scenario: Eliminar un sistema bajo prueba
    Given navega a la sección de sistemas bajo prueba
    When elimina el SUT llamado "Sistema E2E QA"
    Then verifica que el SUT "Sistema E2E QA" ya no aparece en la lista
