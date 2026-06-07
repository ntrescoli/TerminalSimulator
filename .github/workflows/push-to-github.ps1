#!/usr/bin/env pwsh
# Script para subir Terminal Simulator a GitHub (PowerShell)

$ErrorActionPreference = "Stop"

# Configuración
$GIT_USER = "ntrescoli"
$GIT_EMAIL = "ntrescoli@gmail.com"
$REPO_NAME = "terminal-simulator"
$PROJECT_DIR = "e:\Proyectos Software\TerminalSimulator"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Subiendo a GitHub: terminal-simulator" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Cambiar a directorio del proyecto
Set-Location $PROJECT_DIR

# Verificar que git está disponible
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Git no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "`nPor favor instala git desde: https://git-scm.com" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "`n[1/6] Inicializando repositorio git..." -ForegroundColor Yellow
git init

Write-Host "[2/6] Configurando usuario de git..." -ForegroundColor Yellow
git config user.email $GIT_EMAIL
git config user.name $GIT_USER

Write-Host "[3/6] Agregando todos los archivos..." -ForegroundColor Yellow
git add .

Write-Host "[4/6] Creando primer commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Terminal Simulator as NPM package ready"

Write-Host "[5/6] Cambiando rama a main..." -ForegroundColor Yellow
git branch -M main

Write-Host "[6/6] Agregando repositorio remoto y haciendo push..." -ForegroundColor Yellow
git remote add origin "https://github.com/$GIT_USER/$REPO_NAME.git"
git push -u origin main

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ ¡Proyecto subido a GitHub!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "URL: https://github.com/$GIT_USER/$REPO_NAME" -ForegroundColor Cyan
Write-Host "`nPróximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Instala dependencias: pnpm install" -ForegroundColor Gray
Write-Host "  2. Inicia desarrollo: pnpm dev" -ForegroundColor Gray
Write-Host "  3. Haz cambios y: git commit -m 'mensaje' && git push" -ForegroundColor Gray

Read-Host "`nPresiona Enter para salir"
