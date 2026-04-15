#!/usr/bin/env bash
# Collect and normalize Squad implementation outcomes with contract validation.
# Appends learnings to .squad/squad-kit-memory/.
# Usage: collect-learnings.sh <raw-outcome.json path>

source "$(dirname "$0")/_common.sh"

check_node_version

RAW_OUTCOME_PATH="${1:?Usage: collect-learnings.sh <raw-outcome.json path>}"

if [ ! -f "$RAW_OUTCOME_PATH" ]; then
  error_exit "Raw outcome not found at: $RAW_OUTCOME_PATH"
fi

# Step 1: Normalize the session outcome
echo "Normalizing session outcome..." >&2
NORMALIZED=$(run_entrypoint "analyzers/runtime/entrypoints.js" normalize "$RAW_OUTCOME_PATH")

# Step 2: Validate against implement session contract
echo "Validating against implement session contract..." >&2
TEMP_NORMALIZED=$(mktemp)
echo "$NORMALIZED" > "$TEMP_NORMALIZED"
VALIDATION=$(run_entrypoint "analyzers/runtime/entrypoints.js" contracts "$TEMP_NORMALIZED" "implement-session.contract.json" 2>&1) || {
  echo "Contract validation failed:" >&2
  echo "$VALIDATION" >&2
  rm -f "$TEMP_NORMALIZED"
  exit 1
}
rm -f "$TEMP_NORMALIZED"

# Output the normalized, validated outcome
json_output "$NORMALIZED"
