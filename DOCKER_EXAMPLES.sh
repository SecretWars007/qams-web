#!/bin/bash

# ============================================
# QAMS Web - Docker Examples
# ============================================

echo "🐳 QAMS Web - Docker Examples"
echo "=============================="
echo ""

# ============================================
# EJEMPLO 1: Iniciar aplicación en producción
# ============================================

echo "📌 EJEMPLO 1: Iniciar en Producción"
echo "─────────────────────────────────────"
echo ""
echo "# Opción A: Usando Docker Compose"
echo "$ docker-compose up -d"
echo ""
echo "# Opción B: Usando script bash (Linux/Mac)"
echo "$ ./docker.sh start"
echo ""
echo "# Opción C: Usando script batch (Windows)"
echo "$ docker.bat start"
echo ""
echo "Resultado: Aplicación disponible en http://localhost"
echo ""
echo ""

# ============================================
# EJEMPLO 2: Desarrollo con hot reload
# ============================================

echo "📌 EJEMPLO 2: Desarrollo con Hot Reload"
echo "─────────────────────────────────────"
echo ""
echo "$ docker-compose -f docker-compose.dev.yml up"
echo ""
echo "Resultado: ng serve corriendo en http://localhost:4200"
echo "           Los cambios en ./src se reflejan automáticamente"
echo ""
echo ""

# ============================================
# EJEMPLO 3: Ver logs en tiempo real
# ============================================

echo "📌 EJEMPLO 3: Ver Logs"
echo "─────────────────────────────────────"
echo ""
echo "# Opción A: Docker Compose"
echo "$ docker-compose logs -f qams-web"
echo ""
echo "# Opción B: Script bash"
echo "$ ./docker.sh logs"
echo ""
echo "# Opción C: Script batch"
echo "$ docker.bat logs"
echo ""
echo "# Ver logs de todos los servicios"
echo "$ docker-compose logs -f"
echo ""
echo ""

# ============================================
# EJEMPLO 4: Ejecutar comandos en contenedor
# ============================================

echo "📌 EJEMPLO 4: Ejecutar Comandos en Contenedor"
echo "─────────────────────────────────────"
echo ""
echo "# Abrir shell bash"
echo "$ docker-compose exec qams-web sh"
echo ""
echo "# Ejecutar comando específico"
echo "$ docker-compose exec qams-web ng generate component nuevo-componente"
echo ""
echo "# Instalar dependencia"
echo "$ docker-compose exec qams-web npm install nombre-paquete"
echo ""
echo ""

# ============================================
# EJEMPLO 5: Reconstruir imagen
# ============================================

echo "📌 EJEMPLO 5: Reconstruir Imagen"
echo "─────────────────────────────────────"
echo ""
echo "# Opción A: Con caché (rápido)"
echo "$ docker-compose build"
echo ""
echo "# Opción B: Sin caché (limpio)"
echo "$ docker-compose build --no-cache"
echo ""
echo "# Opción C: Script"
echo "$ ./docker.sh rebuild"
echo ""
echo ""

# ============================================
# EJEMPLO 6: Ver estado
# ============================================

echo "📌 EJEMPLO 6: Ver Estado de Contenedores"
echo "─────────────────────────────────────"
echo ""
echo "# Opción A: Docker Compose"
echo "$ docker-compose ps"
echo ""
echo "# Opción B: Docker directo"
echo "$ docker ps"
echo ""
echo "# Opción C: Script"
echo "$ ./docker.sh ps"
echo ""
echo ""

# ============================================
# EJEMPLO 7: Detener contenedores
# ============================================

echo "📌 EJEMPLO 7: Detener Aplicación"
echo "─────────────────────────────────────"
echo ""
echo "# Opción A: Docker Compose"
echo "$ docker-compose down"
echo ""
echo "# Opción B: Script"
echo "$ ./docker.sh stop"
echo ""
echo "# Mantener volúmenes (datos persistentes)"
echo "$ docker-compose down"
echo ""
echo "# Limpiar todo (incluyendo volúmenes)"
echo "$ docker-compose down -v"
echo ""
echo ""

# ============================================
# EJEMPLO 8: Producción con API Backend
# ============================================

echo "📌 EJEMPLO 8: Producción Completa"
echo "─────────────────────────────────────"
echo ""
echo "# Configurar variables de ambiente"
echo "$ export JWT_SECRET=tu-secreto-super-seguro"
echo "$ export DATABASE_URL=postgresql://user:pass@db:5432/qams"
echo ""
echo "# Iniciar servicios (Web, API, BD, Redis)"
echo "$ docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "# Ver estado"
echo "$ docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "# Ver logs del API"
echo "$ docker-compose -f docker-compose.prod.yml logs -f qams-api"
echo ""
echo "Servicios disponibles:"
echo "  - Web:  http://localhost"
echo "  - API:  http://localhost:3000"
echo "  - DB:   localhost:5432"
echo "  - Cache (Redis): localhost:6379"
echo ""
echo ""

# ============================================
# EJEMPLO 9: Cambiar puerto
# ============================================

echo "📌 EJEMPLO 9: Cambiar Puerto"
echo "─────────────────────────────────────"
echo ""
echo "# Editar docker-compose.yml"
echo "services:"
echo "  qams-web:"
echo "    ports:"
echo "      - \"8080:80\"  # ← Cambiar aquí (8080:80)"
echo ""
echo "# Iniciar"
echo "$ docker-compose up -d"
echo ""
echo "# Acceso: http://localhost:8080"
echo ""
echo ""

# ============================================
# EJEMPLO 10: Volúmenes persistentes
# ============================================

echo "📌 EJEMPLO 10: Volúmenes Persistentes"
echo "─────────────────────────────────────"
echo ""
echo "# Ver volúmenes"
echo "$ docker volume ls"
echo ""
echo "# Inspeccionar volumen"
echo "$ docker volume inspect qams-web_db-data"
echo ""
echo "# Eliminar volúmenes (cuidado!)"
echo "$ docker-compose down -v"
echo ""
echo "# Hacer backup de datos"
echo "$ docker run --rm -v qams-web_db-data:/data -v \$(pwd):/backup \\"
echo "  alpine tar czf /backup/db-backup.tar.gz -C /data ."
echo ""
echo ""

# ============================================
# EJEMPLO 11: Monitoreo
# ============================================

echo "📌 EJEMPLO 11: Monitoreo"
echo "─────────────────────────────────────"
echo ""
echo "# Ver consumo de recursos en tiempo real"
echo "$ docker stats qams-web"
echo ""
echo "# Ver tamaño de imagen"
echo "$ docker images | grep qams-web"
echo ""
echo "# Ver historia de cambios"
echo "$ docker history qams-web:latest"
echo ""
echo "# Inspeccionar contenedor"
echo "$ docker inspect qams-web"
echo ""
echo ""

# ============================================
# EJEMPLO 12: Limpieza
# ============================================

echo "📌 EJEMPLO 12: Limpieza"
echo "─────────────────────────────────────"
echo ""
echo "# Limpiar todo (contenedores + imágenes)"
echo "$ docker-compose down"
echo "$ docker rmi qams-web:latest"
echo ""
echo "# Eliminar recursos no utilizados"
echo "$ docker system prune -a"
echo ""
echo "# Opción script"
echo "$ ./docker.sh clean"
echo ""
echo ""

# ============================================
# TIPS Y TROUBLESHOOTING
# ============================================

echo "📌 TIPS Y TROUBLESHOOTING"
echo "─────────────────────────────────────"
echo ""
echo "❓ Puerto 80 ya está en uso:"
echo "   → Cambia a otro puerto en docker-compose.yml"
echo ""
echo "❓ Contenedor falla al iniciar:"
echo "   → Ver logs: docker-compose logs qams-web"
echo ""
echo "❓ Cambios en código no se ven:"
echo "   → Usa docker-compose.dev.yml para desarrollo"
echo ""
echo "❓ Limpiar caché de Docker:"
echo "   → docker system prune -a"
echo ""
echo "❓ Acceder a shell del contenedor:"
echo "   → docker-compose exec qams-web sh"
echo ""
echo "❓ Reconstruir desde cero:"
echo "   → docker-compose build --no-cache"
echo ""
echo ""

# ============================================
# MÁS INFORMACIÓN
# ============================================

echo "📚 DOCUMENTACIÓN"
echo "─────────────────────────────────────"
echo ""
echo "📖 Guía completa:  cat README.DOCKER.md"
echo "📖 Quick start:    cat DOCKER_QUICKSTART.txt"
echo "📖 Setup:          cat DOCKER_SETUP.md"
echo ""
echo "🌐 Enlaces útiles:"
echo "   https://docs.docker.com"
echo "   https://docs.docker.com/compose"
echo "   https://nginx.org/en/docs/"
echo ""
echo ""

echo "✅ Para más ayuda, consulta la documentación"
echo ""
