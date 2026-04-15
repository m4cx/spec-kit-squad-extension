# Build handoff payload from tasks.md for Squad delegation.
# Usage: build-handoff-from-tasks.ps1 -TasksPath <tasks.md path>
param(
    [Parameter(Mandatory)][string]$TasksPath
)

. "$PSScriptRoot/Common.ps1"

Test-NodeVersion

if (-not (Test-Path $TasksPath)) {
    Exit-WithError "tasks.md not found at: $TasksPath. Run /speckit.tasks first."
}

# Step 1: Check squad readiness
Write-Host "Checking Squad readiness..." -ForegroundColor Cyan
$readiness = Invoke-Entrypoint -Entrypoint "analyzers/runtime/entrypoints.js" -Arguments "readiness"
$readinessObj = $readiness | ConvertFrom-Json

if (-not $readinessObj.is_ready) {
    Write-Error "Squad is not ready. Diagnostics:"
    Write-Error ($readiness -join "`n")
    exit 1
}

# Step 2: Build handoff payload
Write-Host "Building handoff payload from $TasksPath..." -ForegroundColor Cyan
$handoff = Invoke-Entrypoint -Entrypoint "analyzers/runtime/entrypoints.js" -Arguments @("handoff", $TasksPath)

Write-JsonOutput -Json ($handoff -join "`n")
