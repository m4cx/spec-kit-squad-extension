#!/usr/bin/env bash
# Inject implementation learnings into /speckit.plan context.
# Usage: inject-plan-learnings.sh

source "$(dirname "$0")/_common.sh"

check_node_version

# Build and output planning context with learnings
CONTEXT=$(node -e "
import { buildPlanningContext, formatContextForInjection } from '$DIST_DIR/learning-store/prompt-injector.js';
const pkg = await buildPlanningContext('$REPO_ROOT');
const output = formatContextForInjection(pkg);
if (output) process.stdout.write(output);
" 2>/dev/null) || true

if [ -n "$CONTEXT" ]; then
  echo "$CONTEXT"
fi
