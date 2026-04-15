#!/usr/bin/env bash
# Validate Squad readiness for topology-agnostic checks.
# Usage: validate-squad-readiness.sh

source "$(dirname "$0")/_common.sh"

check_node_version

echo "Running Squad readiness validation..." >&2

# Run the readiness analyzer
RESULT=$(run_entrypoint "analyzers/runtime/entrypoints.js" readiness)

IS_READY=$(echo "$RESULT" | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>console.log(JSON.parse(d).is_ready))")

if [ "$IS_READY" = "true" ]; then
  echo "Squad is ready for implementation." >&2
else
  echo "Squad readiness check FAILED." >&2
fi

json_output "$RESULT"

if [ "$IS_READY" != "true" ]; then
  exit 1
fi
