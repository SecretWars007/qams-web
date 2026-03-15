# 🚀 Guía de Despliegue en Render - QAMS

Esta guía explica cómo publicar el frontend de **QAMS** en la plataforma **Render**. 

Hay dos formas principales de hacerlo: mediante **Docker** (Servicio Web) o como **Sitio Estático**. Se recomienda el método Docker ya que utiliza la configuración optimizada de Nginx incluida en el proyecto.

## 📋 Requisitos Previos

1.  Tener una cuenta en [Render.com](https://render.com).
2.  Tener el código del proyecto en un repositorio de **GitHub** o **GitLab**.

---

## 🛠️ Método 1: Despliegue con Docker (Recomendado)

Render detectará automáticamente tu `Dockerfile` y `render.yaml`.

### Pasos:
1.  **Conectar Repositorio**: En el dashboard de Render, haz clic en **New +** y selecciona **Blueprint**.
2.  **Conectar GitHub**: Selecciona tu repositorio de `qams-web`.
3.  **Aprobar Blueprint**: Render leerá el archivo `render.yaml` y configurará el servicio automáticamente.
4.  **Despliegue**: Haz clic en **Apply**. Render construirá la imagen y publicará la aplicación.

### Configuración manual (si no usas Blueprint):
1.  **New +** -> **Web Service**.
2.  **Runtime**: Docker.
3.  **Build Command**: (Se deja vacío, usa el Dockerfile).
4.  **Start Command**: (Se deja vacío, usa el CMD del Dockerfile).

---

## 📄 Método 2: Despliegue como Sitio Estático (Más Simple)

Si prefieres no usar Docker, puedes desplegarlo como un sitio estático puro.

### Pasos:
1.  **New +** -> **Static Site**.
2.  **Build Command**: `npm install && npm run build`
3.  **Publish Directory**: `dist/qams-web/browser`
4.  **Rutas (Redirects/Rewrites)**: 
    - Ve a la pestaña **Redirects/Rewrites**.
    - Añade una regla: `/*` -> `/index.html` (Status: 200). Esto es vital para que las rutas de Angular funcionen.

---

## ⚙️ Variables de Entorno

Si necesitas conectar con un backend real en el futuro, puedes configurar variables de entorno en Render:

1.  Ve a la configuración de tu servicio en Render.
2.  Pestaña **Environment**.
3.  Añade las variables necesarias (ej. `API_URL`).
    > **Nota**: Para que Angular lea estas variables en build-time, deberás ajustar tus archivos `environment.ts`.

---

## 🔍 Verificación

Una vez desplegado, Render te proporcionará una URL del tipo `https://qams-web.onrender.com`. 

- Verifica que la pantalla de Login cargue correctamente.
- Prueba navegar entre secciones para asegurar que el `try_files` de Nginx esté funcionando.

---
*¡Tu sistema QAMS ya está en la nube!* 🌐
