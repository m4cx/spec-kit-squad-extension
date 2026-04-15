# Common helpers for spec-kit-squad-extension PowerShell scripts.
# Dot-source this file: . "$PSScriptRoot/Common.ps1"

$ErrorActionPreference = 'Stop'

# Resolve the extension/dist directory relative to this script's location.
$script:ScriptDir = $PSScriptRoot
$script:ExtensionDir = Split-Path -Parent (Split-Path -Parent $script:ScriptDir)
$script:DistDir = Join-Path $script:ExtensionDir 'dist'
$script:RepoRoot = Split-Path -Parent $script:ExtensionDir

function Test-NodeVersion {
    param([int]$RequiredMajor = 20)
    try {
        $nodeVersion = (node --version 2>$null) -replace '^v', ''
        $major = [int]($nodeVersion.Split('.')[0])
        if ($major -lt $RequiredMajor) {
            throw "Node.js >= $RequiredMajor required, found v$nodeVersion"
        }
    }
    catch {
        throw "Node.js >= $RequiredMajor is required but not found: $_"
    }
}

function Invoke-Entrypoint {
    param(
        [Parameter(Mandatory)][string]$Entrypoint,
        [Parameter(ValueFromRemainingArguments)][string[]]$Arguments
    )
    $entrypointPath = Join-Path $script:DistDir $Entrypoint
    if (-not (Test-Path $entrypointPath)) {
        throw "Missing compiled entrypoint: $entrypointPath"
    }
    $allArgs = @($entrypointPath) + ($Arguments ?? @())
    & node @allArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Entrypoint '$Entrypoint' failed with exit code $LASTEXITCODE"
    }
}

function Write-JsonOutput {
    param([Parameter(Mandatory)][string]$Json)
    Write-Output $Json
}

function Exit-WithError {
    param(
        [Parameter(Mandatory)][string]$Message,
        [int]$ExitCode = 1
    )
    Write-Error $Message
    exit $ExitCode
}
