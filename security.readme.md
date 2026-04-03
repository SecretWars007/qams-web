# Guía de Seguridad y Cifrado - QAMS Frontend

Este documento detalla los mecanismos de seguridad implementados en el frontend de QAMS para garantizar la integridad y confidencialidad de los datos durante la comunicación con el API.

## 1. Cifrado de Extremo a Extremo (E2EE)

QAMS implementa una capa de cifrado simétrico a nivel de aplicación utilizando el estándar **AES-256-CBC** con relleno **PKCS7**.

- **Algoritmo:** AES (Advanced Encryption Standard).
- **Modo:** CBC (Cipher Block Chaining).
- **Longitud de Clave:** 256 bits (32 caracteres).
- **Padding:** PKCS7.

### Flujo de Datos
1. **Peticiones (Outbound):** El `EncryptionInterceptor` captura cualquier petición `POST`, `PUT` o `PATCH`. El cuerpo JSON se convierte a string, se cifra y se envía dentro de un objeto envoltorio: `{ "data": "BASE64_ENCRYPTED_STRING" }`.
2. **Respuestas (Inbound):** El interceptor captura la respuesta del servidor, extrae el campo `data`, lo descifra y vuelve a parsear el JSON original para que el resto de la aplicación lo use de forma transparente.

## 2. Interceptores de Seguridad

Ubicación: `src/app/core/interceptors/`

- **`EncryptionInterceptor`**: Encargado del cifrado/descifrado automático de todas las comunicaciones con `/api/`.
- **`AuthInterceptor`**: Adjunta automáticamente el token JWT en las cabeceras `Authorization: Bearer <token>` para todas las peticiones autenticadas.
- **`ErrorInterceptor`**: Maneja de forma centralizada los errores de conexión y de seguridad (como 401 Unauthorized), destruyendo la sesión local si el token expira.

## 3. Almacenamiento Seguro

- **JWT (JSON Web Token)**: Se almacena en `sessionStorage`. Esto asegura que el token se destruya automáticamente al cerrar la pestaña del navegador, mitigando riesgos de persistencia no deseada.
- **Sanitización de Datos**: Se utiliza el `DomSanitizer` de Angular para prevenir ataques XSS (Cross-Site Scripting) al renderizar contenido dinámico.

## 4. Endurecimiento en Nginx (Reverse Proxy)

El servidor Nginx que sirve el frontend incluye cabeceras de seguridad para proteger al cliente:

- **Strict-Transport-Security (HSTS)**: Fuerza el uso de HTTPS.
- **X-Content-Type-Options**: `nosniff` para prevenir que el navegador adivine tipos MIME.
- **X-Frame-Options**: `DENY` para prevenir ataques de Clickjacking.
- **Content-Security-Policy (CSP)**: Configurada para permitir solo scripts y estilos de fuentes confiables.

## 5. Recomendación para Producción

> [!WARNING]
> Las claves de cifrado actuales están hardcoded en `encryption.service.ts` para propósitos de desarrollo. En un entorno de producción real, estas claves deben ser inyectadas mediante variables de entorno durante el proceso de build o recuperadas mediante un intercambio de claves seguro (como Diffie-Hellman) durante el apretón de manos inicial.

---
**Desarrollado por:** Antigravity AI para QAMS Project.
