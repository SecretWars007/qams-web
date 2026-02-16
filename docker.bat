@echo off
REM Script para gestionar la aplicación Docker en Windows

setlocal enabledelayedexpansion

set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=help

if /i "%COMMAND%"=="start" (
    echo.
    echo ========================================
    echo Iniciando QAMS Web
    echo ========================================
    docker-compose up -d
    echo.
    echo [OK] Aplicación iniciada
    echo Accede a: http://localhost
    goto :end
)

if /i "%COMMAND%"=="stop" (
    echo.
    echo ========================================
    echo Deteniendo QAMS Web
    echo ========================================
    docker-compose down
    echo [OK] Aplicación detenida
    goto :end
)

if /i "%COMMAND%"=="restart" (
    echo.
    echo ========================================
    echo Reiniciando QAMS Web
    echo ========================================
    docker-compose restart
    echo [OK] Aplicación reiniciada
    goto :end
)

if /i "%COMMAND%"=="logs" (
    echo.
    echo ========================================
    echo Mostrando logs
    echo ========================================
    docker-compose logs -f qams-web
    goto :end
)

if /i "%COMMAND%"=="build" (
    echo.
    echo ========================================
    echo Compilando imagen Docker
    echo ========================================
    docker-compose build
    echo [OK] Imagen compilada
    goto :end
)

if /i "%COMMAND%"=="rebuild" (
    echo.
    echo ========================================
    echo Recompilando imagen (sin caché)
    echo ========================================
    docker-compose build --no-cache
    echo [OK] Imagen recompilada
    goto :end
)

if /i "%COMMAND%"=="ps" (
    echo.
    echo ========================================
    echo Estado de contenedores
    echo ========================================
    docker-compose ps
    goto :end
)

if /i "%COMMAND%"=="shell" (
    echo.
    echo ========================================
    echo Abriendo shell en contenedor
    echo ========================================
    docker-compose exec qams-web sh
    goto :end
)

if /i "%COMMAND%"=="clean" (
    echo.
    echo ========================================
    echo Limpiando recursos Docker
    echo ========================================
    echo ADVERTENCIA: Esto eliminará todos los contenedores e imágenes de QAMS
    set /p confirmation="¿Estás seguro? (s/n): "
    if /i "!confirmation!"=="s" (
        docker-compose down -v
        docker rmi qams-web:latest
        echo [OK] Limpieza completada
    ) else (
        echo Limpieza cancelada
    )
    goto :end
)

if /i "%COMMAND%"=="help" (
    goto :show_help
)

echo [ERROR] Comando desconocido: %COMMAND%
echo.
goto :show_help

:show_help
echo.
echo ========================================
echo QAMS Web - Docker Management Script
echo ========================================
echo.
echo Uso: docker.bat [comando]
echo.
echo Comandos disponibles:
echo   start       - Inicia la aplicación (docker-compose up -d)
echo   stop        - Detiene la aplicación
echo   restart     - Reinicia la aplicación
echo   logs        - Muestra logs en tiempo real
echo   build       - Compila la imagen Docker
echo   rebuild     - Reconstruye la imagen (sin caché)
echo   ps          - Muestra estado de los contenedores
echo   shell       - Abre shell en el contenedor
echo   clean       - Limpia contenedores e imágenes
echo   help        - Muestra esta ayuda
echo.
echo Ejemplos:
echo   docker.bat start
echo   docker.bat logs
echo   docker.bat rebuild
echo.

:end
endlocal
