# Script de PowerShell para Ejecución de Pruebas de Carga y Concurrencia
# Sistema de Cuestionarios NativaTec

param (
    [int]$Concurrencia = 50,
    [string]$CodigoCuestionario = "148177"
)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  NATIVATEC - SUITE DE PRUEBAS DE CARGA Y CONCURRENCIA" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "▸ Concurrencia solicitada : $Concurrencia usuarios simultáneos" -ForegroundColor Yellow
Write-Host "▸ Código de Cuestionario  : $CodigoCuestionario" -ForegroundColor Yellow
Write-Host "▸ Base de Datos           : PostgreSQL Local (localhost:5432/sis_cuestionarios)" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------------"

# Validar que Node.js esté instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Node.js no está instalado o no se encuentra en el PATH." -ForegroundColor Red
    exit 1
}

# Ejecutar el script de carga
node "$PSScriptRoot/../backend/scripts/load_test_concurrency.js" $Concurrencia $CodigoCuestionario
