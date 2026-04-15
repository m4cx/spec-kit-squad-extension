# Run Squad implementation - delegates to squad CLI.
# The extension does NOT implement task routing logic.
# Usage: run-squad-implement.ps1 -HandoffPath <handoff.json path>
param(
    [Parameter(Mandatory)][string]$HandoffPath
)

. "$PSScriptRoot/Common.ps1"

Test-NodeVersion

if (-not (Test-Path $HandoffPath)) {
    Exit-WithError "Handoff payload not found at: $HandoffPath"
}

# Verify squad CLI is available
$squadCmd = Get-Command squad -ErrorAction SilentlyContinue
if (-not $squadCmd) {
    Exit-WithError "squad CLI not found on PATH. Install @bradygaster/squad-cli first."
}

Write-Host "Delegating implementation to Squad..." -ForegroundColor Cyan
Write-Host "Handoff payload: $HandoffPath" -ForegroundColor Gray

# Pass handoff to Squad - the extension does not route tasks to members
& squad implement --handoff $HandoffPath
if ($LASTEXITCODE -ne 0) {
    Exit-WithError "Squad implementation failed with exit code $LASTEXITCODE"
}
