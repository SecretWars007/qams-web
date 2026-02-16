#!/bin/bash

# Script para gestionar la aplicación Docker

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir headers
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Función para imprimir mensajes de éxito
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Función para imprimir errores
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Función para imprimir warnings
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Mostrar ayuda
show_help() {
    cat << EOF
QAMS Web - Docker Management Script

Uso: ./docker.sh [comando]

Comandos disponibles:
  start       - Inicia la aplicación (docker-compose up -d)
  stop        - Detiene la aplicación
  restart     - Reinicia la aplicación
  logs        - Muestra logs en tiempo real
  build       - Compila la imagen Docker
  rebuild     - Reconstruye la imagen (sin caché)
  ps          - Muestra estado de los contenedores
  shell       - Abre shell en el contenedor
  clean       - Limpia contenedores e imágenes
  help        - Muestra esta ayuda

Ejemplos:
  ./docker.sh start
  ./docker.sh logs
  ./docker.sh rebuild
EOF
}

# Detectar el directorio de script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Comando por defecto
COMMAND=${1:-help}

case $COMMAND in
    start)
        print_header "Iniciando QAMS Web"
        docker-compose up -d
        print_success "Aplicación iniciada"
        echo -e "${BLUE}Accede a: http://localhost${NC}"
        ;;

    stop)
        print_header "Deteniendo QAMS Web"
        docker-compose down
        print_success "Aplicación detenida"
        ;;

    restart)
        print_header "Reiniciando QAMS Web"
        docker-compose restart
        print_success "Aplicación reiniciada"
        ;;

    logs)
        print_header "Mostrando logs"
        docker-compose logs -f qams-web
        ;;

    build)
        print_header "Compilando imagen Docker"
        docker-compose build
        print_success "Imagen compilada"
        ;;

    rebuild)
        print_header "Recompilando imagen (sin caché)"
        docker-compose build --no-cache
        print_success "Imagen recompilada"
        ;;

    ps)
        print_header "Estado de contenedores"
        docker-compose ps
        ;;

    shell)
        print_header "Abriendo shell en contenedor"
        docker-compose exec qams-web sh
        ;;

    clean)
        print_header "Limpiando recursos Docker"
        print_warning "Esto eliminará todos los contenedores e imágenes de QAMS"
        read -p "¿Estás seguro? (s/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            docker-compose down -v
            docker rmi qams-web:latest 2>/dev/null || true
            print_success "Limpieza completada"
        else
            print_warning "Limpieza cancelada"
        fi
        ;;

    help|--help|-h)
        show_help
        ;;

    *)
        print_error "Comando desconocido: $COMMAND"
        echo ""
        show_help
        exit 1
        ;;
esac
