# Validate Squad readiness for topology-agnostic checks.
# Usage: validate-squad-readiness.ps1

. "$PSScriptRoot/Common.ps1"

Test-NodeVersion

Write-Host "Running Squad readiness validation..." -ForegroundColor Cyan

$result = Invoke-Entrypoint -Entrypoint "analyzers/runtime/entrypoints.js" -Arguments "readiness"
$resultObj = ($result -join "`n") | ConvertFrom-Json

if ($resultObj.is_ready) {
    Write-Host "Squad is ready for implementation." -ForegroundColor Green
} else {
    Write-Host "Squad readiness check FAILED." -ForegroundColor Red
}

Write-JsonOutput -Json ($result -join "`n")

if (-not $resultObj.is_ready) {
    exit 1
}
