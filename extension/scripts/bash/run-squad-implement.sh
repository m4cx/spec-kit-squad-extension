#!/usr/bin/env bash
# Run Squad implementation - delegates to squad CLI.
# The extension does NOT implement task routing logic.
# Usage: run-squad-implement.sh <handoff.json path>

source "$(dirname "$0")/_common.sh"

check_node_version

HANDOFF_PATH="${1:?Usage: run-squad-implement.sh <handoff.json path>}"

if [ ! -f "$HANDOFF_PATH" ]; then
  error_exit "Handoff payload not found at: $HANDOFF_PATH"
fi

# Verify squad CLI is available
if ! command -v squad &>/dev/null; then
  error_exit "squad CLI not found on PATH. Install @bradygaster/squad-cli first."
fi

echo "Delegating implementation to Squad..." >&2
echo "Handoff payload: $HANDOFF_PATH" >&2

# Pass handoff to Squad - the extension does not route tasks to members
squad implement --handoff "$HANDOFF_PATH"
