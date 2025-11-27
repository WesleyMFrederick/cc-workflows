#!/bin/bash

# CEO Output Modulation Hook
# Injects lightweight directives for concise, scannable chat output

# Read stdin (hook context)
INPUT=$(cat)

# Create system notification with terse directives
DIRECTIVES="<system-notification>
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

# Output JSON with additional context
jq -n \
  --arg context "$DIRECTIVES" \
  '{
    "hookSpecificOutput": {
      "hookEventName": "UserPromptSubmit",
      "additionalContext": $context
    }
  }'

exit 0