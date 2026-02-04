#!/usr/bin/env bash
# Stop hook orchestrator - coordinates status sync and observer cleanup
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

# Run status stop-sync
"${SCRIPT_DIR}/status/stop-sync.sh"

# Run observer evaluation (stays in root)
"${SCRIPT_DIR}/evaluate-session.sh"

exit 0
