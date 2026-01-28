#!/bin/bash
# PostToolUse(Write) hook: Auto-populate plan_path when a plan file is written
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
STATUS_FILE="${PROJECT_ROOT}/current-status.json"

INPUT=$(cat)

# Extract file path and session
file_path=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
session_id=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)

# Only act on plan file writes
[[ -z "$file_path" || -z "$session_id" ]] && exit 0
[[ ! "$file_path" =~ \.claude/plans/.*\.md$ ]] && exit 0
[[ ! -f "$STATUS_FILE" ]] && exit 0

# Extract focus from plan title (first H1 header)
plan_focus=$(head -5 "$file_path" | grep -m1 "^# " | sed 's/^# //' || echo "")
[[ -z "$plan_focus" ]] && plan_focus="Plan work"
plan_focus="Plan: ${plan_focus}"

# Update plan_path and focus
jq --arg sid "$session_id" \
   --arg pp "$file_path" \
   --arg focus "$plan_focus" \
   '.active_sessions[$sid].plan_path = $pp |
    .active_sessions[$sid].focus = $focus' \
   "$STATUS_FILE" > "${STATUS_FILE}.tmp.$$" && mv "${STATUS_FILE}.tmp.$$" "$STATUS_FILE"

exit 0
