#!/bin/bash
# docker.sh - Script para gestionar Docker
# Uso: ./docker.sh [comando]

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función de ayuda
show_help() {
    cat << EOF
${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}
${BLUE}║  QAMS Web - Docker Management Script                           ║${NC}
${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}

${GREEN}COMANDOS:${NC}

  ${YELLOW}./docker.sh build${NC}
    Construir imagen Docker para producción

  ${YELLOW}./docker.sh build-dev${NC}
    Construir imagen Docker para desarrollo

  ${YELLOW}./docker.sh run${NC}
    Ejecutar contenedor en producción

  ${YELLOW}./docker.sh run-dev${NC}
    Ejecutar contenedor en desarrollo (con hot reload)

  ${YELLOW}./docker.sh compose-up${NC}
    Levantar contenedor con docker-compose

  ${YELLOW}./docker.sh compose-down${NC}
    Detener contenedor con docker-compose

  ${YELLOW}./docker.sh logs${NC}
    Ver logs del contenedor

  ${YELLOW}./docker.sh shell${NC}
    Abrir shell dentro del contenedor

  ${YELLOW}./docker.sh stop${NC}
    Detener todos los contenedores

  ${YELLOW}./docker.sh clean${NC}
    Limpiar imágenes y contenedores

  ${YELLOW}./docker.sh help${NC}
    Mostrar esta ayuda

${GREEN}EJEMPLOS:${NC}

  # Construir e iniciar en producción
  ./docker.sh build
  ./docker.sh run

  # Iniciar en desarrollo
  ./docker.sh build-dev
  ./docker.sh run-dev

  # Usar docker-compose
  ./docker.sh compose-up
  # ... hacer cambios ...
  ./docker.sh compose-down

EOF
}

# Función para imprimir mensajes
print_msg() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Comandos
case "${1:-help}" in
    build)
        print_info "Construyendo imagen Docker para producción..."
        docker build -t qams-web:latest -f Dockerfile .
        print_msg "Imagen construida: qams-web:latest"
        docker images | grep qams-web
        ;;

    build-dev)
        print_info "Construyendo imagen Docker para desarrollo..."
        docker build -t qams-web:dev -f Dockerfile.dev .
        print_msg "Imagen construida: qams-web:dev"
        docker images | grep qams-web
        ;;

    run)
        print_info "Iniciando contenedor en producción..."
        docker run -d \
            -p 80:80 \
            --name qams-web-prod \
            --restart unless-stopped \
            qams-web:latest
        print_msg "Contenedor iniciado"
        echo ""
        print_info "Accede a: http://localhost"
        docker ps | grep qams-web
        ;;

    run-dev)
        print_info "Iniciando contenedor en desarrollo..."
        docker run -it \
            -p 4200:4200 \
            -v "$(pwd)/src:/app/src" \
            --name qams-web-dev \
            qams-web:dev
        ;;

    compose-up)
        print_info "Levantando contenedor con docker-compose..."
        docker-compose up -d
        print_msg "Contenedor levantado"
        echo ""
        print_info "Accede a: http://localhost"
        docker-compose ps
        ;;

    compose-down)
        print_info "Deteniendo contenedor..."
        docker-compose down
        print_msg "Contenedor detenido"
        ;;

    logs)
        print_info "Mostrando logs..."
        docker logs -f qams-web-prod 2>/dev/null || docker-compose logs -f
        ;;

    shell)
        print_info "Abriendo shell en el contenedor..."
        docker exec -it qams-web-prod /bin/sh 2>/dev/null || \
        docker exec -it qams-web-dev /bin/bash
        ;;

    stop)
        print_info "Deteniendo todos los contenedores..."
        docker stop $(docker ps -a -q --filter "name=qams") 2>/dev/null || true
        print_msg "Contenedores detenidos"
        ;;

    clean)
        print_info "Limpiando imágenes y contenedores..."
        docker stop $(docker ps -a -q --filter "name=qams") 2>/dev/null || true
        docker rm $(docker ps -a -q --filter "name=qams") 2>/dev/null || true
        docker rmi qams-web:latest qams-web:dev 2>/dev/null || true
        print_msg "Limpieza completada"
        ;;

    help|--help|-h)
        show_help
        ;;

    *)
        print_error "Comando no reconocido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

EOF

# docker.bat script equivalente para Windows

cat > docker.bat << 'EOF'
@echo off
REM docker.bat - Script para gestionar Docker en Windows
REM Uso: docker.bat [comando]

setlocal enabledelayedexpansion

if "%1"=="" (
    call :show_help
    exit /b 0
)

if "%1"=="build" (
    echo [*] Construyendo imagen Docker para produccion...
    docker build -t qams-web:latest -f Dockerfile .
    if errorlevel 1 (
        echo [X] Error en la compilacion
        exit /b 1
    )
    echo [OK] Imagen construida: qams-web:latest
    docker images | find "qams-web"
    exit /b 0
)

if "%1"=="run" (
    echo [*] Iniciando contenedor en produccion...
    docker run -d -p 80:80 --name qams-web-prod --restart unless-stopped qams-web:latest
    if errorlevel 1 (
        echo [X] Error al iniciar contenedor
        exit /b 1
    )
    echo [OK] Contenedor iniciado
    echo [*] Accede a: http://localhost
    docker ps | find "qams-web"
    exit /b 0
)

if "%1"=="compose-up" (
    echo [*] Levantando contenedor con docker-compose...
    docker-compose up -d
    if errorlevel 1 (
        echo [X] Error en docker-compose
        exit /b 1
    )
    echo [OK] Contenedor levantado
    docker-compose ps
    exit /b 0
)

if "%1"=="compose-down" (
    echo [*] Deteniendo contenedor...
    docker-compose down
    echo [OK] Contenedor detenido
    exit /b 0
)

if "%1"=="stop" (
    echo [*] Deteniendo contenedores...
    for /f %%i in ('docker ps -a -q --filter name=qams') do docker stop %%i
    echo [OK] Contenedores detenidos
    exit /b 0
)

if "%1"=="clean" (
    echo [*] Limpiando imagenes y contenedores...
    for /f %%i in ('docker ps -a -q --filter name=qams') do docker stop %%i 2>nul
    for /f %%i in ('docker ps -a -q --filter name=qams') do docker rm %%i 2>nul
    docker rmi qams-web:latest 2>nul
    echo [OK] Limpieza completada
    exit /b 0
)

if "%1"=="help" (
    call :show_help
    exit /b 0
)

echo [X] Comando no reconocido: %1
call :show_help
exit /b 1

:show_help
echo.
echo ========================================
echo QAMS Web - Docker Management
echo ========================================
echo.
echo Comandos:
echo   docker.bat build       - Construir imagen
echo   docker.bat run         - Ejecutar contenedor
echo   docker.bat compose-up  - Levantar con docker-compose
echo   docker.bat compose-down- Detener docker-compose
echo   docker.bat stop        - Detener contenedores
echo   docker.bat clean       - Limpiar todo
echo   docker.bat help        - Mostrar ayuda
echo.
exit /b 0
EOF

print_msg "Scripts de Docker creados:"
print_msg "  - docker.sh (para Linux/Mac)"
print_msg "  - docker.bat (para Windows)"
print_info "Usa: ./docker.sh help  (o  docker.bat help)"
