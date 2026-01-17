#!/bin/bash

# CEO Output Modulation Hook + Plan Execution Status Reminder
# Injects concise output directives and detects plan execution patterns

set -euo pipefail

# Read stdin (hook context)
INPUT=$(cat)

# Determine project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

STATUS_FILE="${PROJECT_ROOT}/current-status.json"
USER_PROMPT=$(echo "$INPUT" | jq -r '.userPrompt // empty' 2>/dev/null)
PLAN_EXECUTION_REMINDER=""

# Check for plan execution patterns (only if status file exists and not in_progress)
if [[ -n "$USER_PROMPT" && -f "$STATUS_FILE" ]]; then
  if echo "$USER_PROMPT" | grep -qiE "(implement.*plan|execute.*plan|start.*implementation|begin.*plan|continue.*plan|resume.*plan)"; then
    current_status=$(jq -r '.status // "pending"' "$STATUS_FILE" 2>/dev/null)
    if [[ "$current_status" != "in_progress" ]]; then
      PLAN_EXECUTION_REMINDER="
<plan-execution-reminder>
**Starting plan execution.** Update current-status.json:
- status: 'in_progress'
- plan_path: path to plan file
- current_phase: first phase
- phases_remaining: populate from plan
- timestamp: current ISO-8601 time
</plan-execution-reminder>"
    fi
  fi
fi

# CEO output preferences (always active)
CEO_DIRECTIVES="<system-notification>
<ceo-output-preferences>
**HOOK_TEST_MARKER_CEO_OUTPUT_HOOK_ACTIVE**

**Context:** User is CEO - time-sensitive, needs scannable output.

**Chat Output Rules:**
- Keep responses CONCISE and SCANNABLE
- Use bullets, short paragraphs, clear headers
- Front-load key information
- Omit verbose explanations unless explicitly requested

**File Output Rules:**
- Detailed documentation allowed in files
- Code comments, full examples acceptable

**Presenting Options:**
- ALWAYS use numbered lists OR AskUserQuestion tool
- Never present options in prose paragraphs
- When using AskUserQuestion: ALWAYS include your recommendation
  • State preference IN the question: \"I recommend [X] because [Y]\"
  • Explain trade-offs for all options in their descriptions
  • Guide the decision - don't just present choices
  • Example: \"Which approach? I recommend parallel execution because it validates assumptions faster with minimal additional code.\"

**Adding Detail:**
- Provide detail ONLY when CEO explicitly requests it
- Default to minimal necessary information
- Ask 'Need more detail?' rather than over-explaining

**Summary:** Be brief. Be clear. Be actionable.
</ceo-output-preferences>
</system-notification>"

# Output JSON with combined context
jq -n \
  --arg context "${CEO_DIRECTIVES}${PLAN_EXECUTION_REMINDER}" \
  '{
    "hookSpecificOutput": {
      "hookEventName": "UserPromptSubmit",
      "additionalContext": $context
    }
  }'

exit 0
