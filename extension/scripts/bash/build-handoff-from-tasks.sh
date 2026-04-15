#!/usr/bin/env bash
# Build handoff payload from tasks.md for Squad delegation.
# Usage: build-handoff-from-tasks.sh <tasks.md path>

source "$(dirname "$0")/_common.sh"

check_node_version

TASKS_PATH="${1:?Usage: build-handoff-from-tasks.sh <tasks.md path>}"

if [ ! -f "$TASKS_PATH" ]; then
  error_exit "tasks.md not found at: $TASKS_PATH. Run /speckit.tasks first."
fi

# Step 1: Check squad readiness
echo "Checking Squad readiness..." >&2
READINESS=$(run_entrypoint "analyzers/runtime/entrypoints.js" readiness)
IS_READY=$(echo "$READINESS" | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>console.log(JSON.parse(d).is_ready))")

if [ "$IS_READY" != "true" ]; then
  echo "Squad is not ready. Diagnostics:" >&2
  echo "$READINESS" >&2
  exit 1
fi

# Step 2: Build handoff payload
echo "Building handoff payload from $TASKS_PATH..." >&2
HANDOFF=$(run_entrypoint "analyzers/runtime/entrypoints.js" handoff "$TASKS_PATH")

# Output the handoff JSON
json_output "$HANDOFF"
