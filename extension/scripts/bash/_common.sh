#!/usr/bin/env bash
# Common helpers for spec-kit-squad-extension bash scripts.
# Source this file: source "$(dirname "$0")/_common.sh"

set -euo pipefail

# Resolve the extension/dist directory relative to this script's location.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTENSION_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIST_DIR="$EXTENSION_DIR/dist"
REPO_ROOT="$(cd "$EXTENSION_DIR/.." && pwd)"

# Node.js minimum version check
check_node_version() {
  local required_major=20
  local node_version
  node_version="$(node --version 2>/dev/null || echo "v0.0.0")"
  local major
  major="$(echo "$node_version" | sed 's/v//' | cut -d. -f1)"
  if [ "$major" -lt "$required_major" ]; then
    echo "ERROR: Node.js >= $required_major required, found $node_version" >&2
    exit 1
  fi
}

# Run a compiled entrypoint from extension/dist
run_entrypoint() {
  local entrypoint="$1"
  shift
  local entrypoint_path="$DIST_DIR/$entrypoint"
  if [ ! -f "$entrypoint_path" ]; then
    echo "ERROR: Missing compiled entrypoint: $entrypoint_path" >&2
    exit 1
  fi
  node "$entrypoint_path" "$@"
}

# JSON output helper
json_output() {
  echo "$1"
}

# Error output helper
error_exit() {
  echo "ERROR: $1" >&2
  exit "${2:-1}"
}
