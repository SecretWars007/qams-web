# Dockerización de QAMS Web

## Requisitos
- Docker (versión 20+)
- Docker Compose (versión 1.29+)

## Construcción de la imagen Docker

### Opción 1: Usando Docker Compose (Recomendado)

```bash
# Compilar y ejecutar la aplicación
docker-compose up -d

# La aplicación estará disponible en http://localhost
```

### Opción 2: Usando Docker directamente

```bash
# Compilar la imagen
docker build -t qams-web:latest .

# Ejecutar el contenedor
docker run -d -p 80:80 --name qams-web qams-web:latest

# Detener el contenedor
docker stop qams-web
docker rm qams-web
```

## Comandos útiles

### Ver logs
```bash
docker-compose logs -f qams-web
# O si usas Docker directamente:
docker logs -f qams-web
```

### Ver estado del contenedor
```bash
docker-compose ps
# O si usas Docker directamente:
docker ps | grep qams-web
```

### Detener la aplicación
```bash
# Con Docker Compose:
docker-compose down

# O si usas Docker directamente:
docker stop qams-web && docker rm qams-web
```

### Reconstruir la imagen
```bash
docker-compose up -d --build
# O si usas Docker directamente:
docker build -t qams-web:latest . --no-cache
```

## Estructura de la imagen

La imagen utiliza un **multi-stage build**:

1. **Stage 1 - Builder**: Compila la aplicación Angular usando Node.js
2. **Stage 2 - Runtime**: Sirve los archivos compilados usando Nginx Alpine

## Características

✅ **Multi-stage build**: Imagen optimizada y pequeña (~100MB)
✅ **Nginx Alpine**: Servidor web ligero
✅ **Healthcheck**: Verifica que la aplicación esté corriendo
✅ **Compresión Gzip**: Optimización de assets
✅ **Cache-busting**: Archivos estáticos con cache de 30 días
✅ **SPA routing**: Manejo correcto de Angular routing

## Configuración de Nginx

El archivo `nginx.conf` incluye:

- Compresión Gzip para assets
- Cache headers para archivos estáticos
- Fallback a index.html para Angular routing
- Bloqueo de archivos sensibles

## Puertos

- **Puerto 80**: HTTP (predeterminado)

Para cambiar el puerto, edita `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Accesible en http://localhost:8080
```

## Volúmenes

Para desarrollo con hot reload, agrega un volumen a `docker-compose.yml`:

```yaml
volumes:
  - ./src:/app/src
  - /app/node_modules
```

Luego ejecuta:
```bash
docker-compose up
```

## Integración con API backend

Si tienes un backend API, actualiza `docker-compose.yml`:

```yaml
services:
  qams-api:
    image: your-api-image:latest
    ports:
      - "3000:3000"
    
  qams-web:
    # ... configuración existente
    depends_on:
      - qams-api
    environment:
      - API_URL=http://qams-api:3000
```

Luego actualiza tu `environment.ts`:
```typescript
export const environment = {
  apiUrl: process.env['API_URL'] || 'http://localhost:3000'
};
```

## Troubleshooting

### "Failed to build image"
```bash
# Limpia caché de Docker
docker system prune -a

# Reconstruye sin caché
docker-compose build --no-cache
```

### "Port 80 already in use"
```bash
# Cambia el puerto en docker-compose.yml a uno disponible
ports:
  - "8080:80"
```

### "Connection refused to API"
Verifica que:
1. El API está corriendo y accesible
2. La URL en `environment.ts` es correcta
3. CORS está configurado en el backend

## Producción

Para desplegar en producción:

1. Reemplaza las variables de ambiente
2. Usa un reverse proxy (nginx, traefik)
3. Implementa SSL/TLS
4. Configura logs centralizados
5. Usa un registry privado para la imagen

Ejemplo con Let's Encrypt:
```yaml
services:
  qams-web:
    # ... configuración
    ports:
      - "443:443"
    volumes:
      - ./certs:/etc/nginx/certs
```
