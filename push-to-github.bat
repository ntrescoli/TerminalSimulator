@echo off
REM Script para subir Terminal Simulator a GitHub
REM Reemplaza los valores según necesario

setlocal enabledelayedexpansion

REM Configuración
set "GIT_USER=ntrescoli"
set "GIT_EMAIL=ntrescoli@gmail.com"
set "REPO_NAME=terminal-simulator"
set "PROJECT_DIR=e:\Proyectos Software\TerminalSimulator"

echo.
echo ========================================
echo Subiendo a GitHub: terminal-simulator
echo ========================================
echo.

REM Cambiar a directorio del proyecto
cd /d "%PROJECT_DIR%" || exit /b 1

echo [1/6] Inicializando repositorio git...
git init
if errorlevel 1 (
    echo ERROR: No se pudo inicializar git
    echo Asegúrate de tener git instalado
    pause
    exit /b 1
)

echo [2/6] Configurando usuario de git...
git config user.email "%GIT_EMAIL%"
git config user.name "%GIT_USER%"

echo [3/6] Agregando todos los archivos...
git add .

echo [4/6] Creando primer commit...
git commit -m "Initial commit: Terminal Simulator as NPM package ready"

echo [5/6] Cambiando rama a main...
git branch -M main

echo [6/6] Agregando repositorio remoto y haciendo push...
git remote add origin https://github.com/%GIT_USER%/%REPO_NAME%.git
git push -u origin main

echo.
echo ========================================
echo ✅ ¡Proyecto subido a GitHub!
echo ========================================
echo.
echo URL: https://github.com/%GIT_USER%/%REPO_NAME%
echo.
pause
