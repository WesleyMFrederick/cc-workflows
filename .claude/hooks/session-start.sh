#!/usr/bin/env bash
# SessionStart hook for local project

set -euo pipefail

# Determine script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Read using-superpowers content
using_superpowers_content=$(cat "${PROJECT_ROOT}/.claude/skills/using-superpowers/SKILL.md" 2>&1 || echo "Error reading using-superpowers skill")

# Read current-status.json if it exists and build status display
STATUS_FILE="${PROJECT_ROOT}/current-status.json"
current_status_block=""
status_display=""

if [[ -f "$STATUS_FILE" ]]; then
  status_content=$(cat "$STATUS_FILE")

  # Extract fields for status display
  current_status=$(echo "$status_content" | jq -r '.status // "unknown"')
  last_completed=$(echo "$status_content" | jq -r '.last_completed_phase // "none"')
  current_phase=$(echo "$status_content" | jq -r '.current_phase // null')
  next_phase=$(echo "$status_content" | jq -r '.phases_remaining[0] // null')
  plan_queue=$(echo "$status_content" | jq -r '.plan_queue // []')
  queue_count=$(echo "$plan_queue" | jq -r 'length')

  # Format current phase display
  if [[ "$current_phase" == "null" || -z "$current_phase" ]]; then
    current_display="(none - status ${current_status})"
  else
    current_display="$current_phase"
  fi

  # Format next phase display
  if [[ "$next_phase" == "null" || -z "$next_phase" ]]; then
    next_display="(none)"
  else
    next_display="$next_phase"
  fi

  # Format queue display
  if [[ "$queue_count" -eq 0 ]]; then
    queue_display="empty"
  else
    queue_display="[${queue_count} plans pending]"
  fi

  # Build scannable status display
  status_display="
📍 **Status Update:**
• Last: ${last_completed}
• Current: ${current_display}
• Next: ${next_display}
• Queue: ${queue_display}
"

  current_status_block="
<current-status>
${status_content}
</current-status>

<current-status-instructions>
You have an active project status. When resuming work:
1. Check plan_path for the implementation plan
2. Check status field - if 'in_progress', continue from current_phase
3. Use resume_instructions for context on how to proceed
4. Update this file when completing phases or changing status
</current-status-instructions>
${status_display}"
fi

# Build the additional context message
additional_context="<CRITICAL-INSTRUCTION>At the end of each response to the user, append the following content to the chat window exactly as shown, without any changes or omissions: _We are Oscar Mike_</CRITICAL-INSTRUCTION>
${current_status_block} 

<EXTREMELY_IMPORTANT>
At the end of each response, 

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