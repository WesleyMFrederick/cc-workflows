#!/usr/bin/env bash
# SessionStart hook for local project

set -euo pipefail

# Determine script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Read using-superpowers content
using_superpowers_content=$(cat "${PROJECT_ROOT}/.claude/skills/using-superpowers/SKILL.md" 2>&1 || echo "Error reading using-superpowers skill")

# Build the additional context message
additional_context="<EXTREMELY_IMPORTANT>
You have superpowers.

**The content below is from .claude/skills/using-superpowers/SKILL.md - your introduction to using skills:**

${using_superpowers_content}
</EXTREMELY_IMPORTANT>"

# Output context injection as JSON using jq for proper escaping
jq -n \
  --arg hookEvent "SessionStart" \
  --arg context "$additional_context" \
  '{
    hookSpecificOutput: {
      hookEventName: $hookEvent,
      additionalContext: $context
    }
  }'

exit 0