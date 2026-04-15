# Inject implementation learnings into /speckit.plan context.
# Usage: inject-plan-learnings.ps1

. "$PSScriptRoot/Common.ps1"

Test-NodeVersion

try {
    $context = node -e "
import { buildPlanningContext, formatContextForInjection } from '$($script:DistDir -replace '\\','/')/learning-store/prompt-injector.js';
const pkg = await buildPlanningContext('$($script:RepoRoot -replace '\\','/')');
const output = formatContextForInjection(pkg);
if (output) process.stdout.write(output);
" 2>$null

    if ($context) {
        Write-Output $context
    }
}
catch {
    # Graceful degradation - no learnings available
}
