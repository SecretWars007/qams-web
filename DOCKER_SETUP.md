# QAMS Web - Dockerización Completada ✅

## Archivos Creados

### 1. Archivos de Configuración Docker

- **Dockerfile** - Multi-stage build para producción (Node → Nginx)
- **Dockerfile.dev** - Dockerfile para desarrollo con ng serve
- **docker-compose.yml** - Orquestación para producción
- **docker-compose.dev.yml** - Orquestación para desarrollo
- **nginx.conf** - Configuración de Nginx (gzip, routing, caching)
- **.dockerignore** - Archivos a excluir de la imagen

### 2. Scripts de Gestión

- **docker.sh** - Script bash para gestionar la aplicación (Linux/Mac)
- **docker.bat** - Script batch para gestionar la aplicación (Windows)

Comandos disponibles:
```
./docker.sh start       # Iniciar
./docker.sh stop        # Detener
./docker.sh restart     # Reiniciar
./docker.sh logs        # Ver logs
./docker.sh build       # Compilar imagen
./docker.sh rebuild     # Recompilar sin caché
./docker.sh ps          # Estado
./docker.sh clean       # Limpiar
```

### 3. Documentación

- **README.DOCKER.md** - Guía completa de Docker
- **README.md** - Actualizado con instrucciones Docker

### 4. CI/CD

- **.github/workflows/docker-build.yml** - GitHub Actions (build, test, push)
- **.gitlab-ci.yml** - GitLab CI/CD (build, test, push, deploy)

### 5. Configuración Ambiente

- **.env.docker** - Variables de ambiente para Docker

## 🚀 Uso Rápido

### Producción (Nginx)

```bash
# Opción 1: Docker Compose (Recomendado)
docker-compose up -d

# Opción 2: Script (Windows)
docker.bat start

# Opción 3: Script (Linux/Mac)
./docker.sh start

# Acceder a: http://localhost
```

### Desarrollo (ng serve)

```bash
# Opción 1: Docker Compose Dev
docker-compose -f docker-compose.dev.yml up

# Opción 2: Script
./docker.sh start  # Nota: ejecuta docker-compose.yml por defecto
```

## 📊 Arquitectura Docker

### Producción
```
Node 20 (Builder)
    ↓
Compila Angular
    ↓
Genera dist/
    ↓
Nginx Alpine (Runtime)
    ↓
Sirve archivos estáticos
```

### Desarrollo
```
Node 20
    ↓
npm install
    ↓
npm start (ng serve)
    ↓
Puerto 4200 con hot reload
```

## 🔧 Características Incluidas

✅ **Multi-stage build** - Imagen optimizada (~100MB)
✅ **Nginx Alpine** - Servidor web ligero
✅ **Compresión Gzip** - Para assets
✅ **Cache-busting** - 30 días para archivos estáticos
✅ **Healthcheck** - Verifica estado de la aplicación
✅ **SPA Routing** - Fallback a index.html
✅ **Hot reload** - En desarrollo
✅ **CI/CD preparado** - GitHub Actions + GitLab CI

## 📦 Tamaño de Imagen

- **Imagen final**: ~100-120MB
- **Builder stage**: ~800MB (descartado)
- **Runtime stage**: 100-120MB (Nginx Alpine + dist)

## 🔐 Seguridad

- Archivos sensibles bloqueados (`.git`, `node_modules`)
- Sin permisos de root en runtime
- Alpine base para surface de ataque mínima
- Cache headers seguros

## 🌐 Puertos

- **Producción**: Puerto 80 (configurable)
- **Desarrollo**: Puerto 4200 (ng serve)

## 📝 Próximos Pasos Opcionales

1. **Integrar con API Backend**
   ```yaml
   # Agregar en docker-compose.yml
   qams-api:
     image: tu-api:latest
     ports:
       - "3000:3000"
   ```

2. **SSL/TLS**
   ```yaml
   ports:
     - "443:443"
   volumes:
     - ./certs:/etc/nginx/certs
   ```

3. **Logs Centralizados**
   - ElasticSearch + Kibana
   - Datadog
   - Splunk

4. **Registro Privado**
   - Docker Hub
   - ECR (AWS)
   - GCR (Google Cloud)

5. **Orquestación**
   - Kubernetes
   - Docker Swarm
   - AWS ECS

## ✅ Checklist de Verificación

- [x] Dockerfile para producción
- [x] Dockerfile para desarrollo
- [x] docker-compose.yml
- [x] docker-compose.dev.yml
- [x] nginx.conf con optimizaciones
- [x] Scripts de gestión (bash + batch)
- [x] Documentación completa
- [x] CI/CD workflows
- [x] .dockerignore
- [x] .env.docker

## 🎓 Recursos

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Angular Docker Guide](https://angular.io/guide/docker)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)

---

**Creado**: 14 de Febrero, 2026
**Versión**: 1.0
**Estado**: ✅ Listo para Producción
