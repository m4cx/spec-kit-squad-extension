# Collect and normalize Squad implementation outcomes with contract validation.
# Appends learnings to .squad/squad-kit-memory/.
# Usage: collect-learnings.ps1 -RawOutcomePath <raw-outcome.json path>
param(
    [Parameter(Mandatory)][string]$RawOutcomePath
)

. "$PSScriptRoot/Common.ps1"

Test-NodeVersion

if (-not (Test-Path $RawOutcomePath)) {
    Exit-WithError "Raw outcome not found at: $RawOutcomePath"
}

# Step 1: Normalize the session outcome
Write-Host "Normalizing session outcome..." -ForegroundColor Cyan
$normalized = Invoke-Entrypoint -Entrypoint "analyzers/runtime/entrypoints.js" -Arguments @("normalize", $RawOutcomePath)

# Step 2: Validate against implement session contract
Write-Host "Validating against implement session contract..." -ForegroundColor Cyan
$tempFile = [System.IO.Path]::GetTempFileName()
try {
    ($normalized -join "`n") | Set-Content -Path $tempFile -Encoding UTF8
    Invoke-Entrypoint -Entrypoint "analyzers/runtime/entrypoints.js" -Arguments @("contracts", $tempFile, "implement-session.contract.json")
}
catch {
    Write-Error "Contract validation failed: $_"
    exit 1
}
finally {
    Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
}

Write-JsonOutput -Json ($normalized -join "`n")
