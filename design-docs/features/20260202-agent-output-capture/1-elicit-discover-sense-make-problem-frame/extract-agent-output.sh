#!/usr/bin/env bash
# extract-agent-output.sh — Extract agent (Task tool) output from JSONL transcript
#
# Usage:
#   ./extract-agent-output.sh <transcript.jsonl> [output.md]
#
# Extracts:
#   1. All Task tool calls (agent invocations) with their descriptions
#   2. The full text response returned by each agent
#
# Output: Formatted markdown with agent prompt + response per agent
#
# Dependencies: jq (https://jqlang.github.io/jq/)

set -euo pipefail

TRANSCRIPT="${1:?Usage: $0 <transcript.jsonl> [output.md]}"
OUTPUT="${2:-}"

if [[ ! -f "$TRANSCRIPT" ]]; then
  echo "Error: File not found: $TRANSCRIPT" >&2
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "Error: jq is required but not installed" >&2
  exit 1
fi

# Step 1: Find all Task tool_use IDs and their descriptions/prompts
# Task tool calls are in top-level "assistant" entries
TASK_CALLS=$(jq -c '
  select(.type == "assistant") |
  .message.content[]? |
  select(.type == "tool_use") |
  select(.name == "Task") |
  {id: .id, description: .input.description, prompt: (.input.prompt | .[0:200]), subagent_type: .input.subagent_type}
' "$TRANSCRIPT" 2>/dev/null)

if [[ -z "$TASK_CALLS" ]]; then
  echo "No Task tool calls found in transcript." >&2
  exit 0
fi

# Step 2: Build markdown output
MD="# Agent Output Extraction\n\n"
MD+="> **Source:** \`$(basename "$TRANSCRIPT")\`\n"
MD+="> **Extracted:** $(date '+%Y-%m-%d %H:%M')\n\n"
MD+="---\n\n"

AGENT_COUNT=0

while IFS= read -r call; do
  AGENT_COUNT=$((AGENT_COUNT + 1))
  TOOL_USE_ID=$(echo "$call" | jq -r '.id')
  DESCRIPTION=$(echo "$call" | jq -r '.description // "unnamed"')
  PROMPT_PREVIEW=$(echo "$call" | jq -r '.prompt // "no prompt"')
  SUBAGENT_TYPE=$(echo "$call" | jq -r '.subagent_type // "unknown"')

  MD+="## Agent $AGENT_COUNT: $DESCRIPTION\n\n"
  MD+="- **Type:** $SUBAGENT_TYPE\n"
  MD+="- **Tool Use ID:** \`$TOOL_USE_ID\`\n"
  MD+="- **Prompt preview:** $PROMPT_PREVIEW...\n\n"

  # Step 3: Find the tool_result for this Task call
  AGENT_TEXT=$(jq -r --arg id "$TOOL_USE_ID" '
    select(.type == "user") |
    .message.content[]? |
    select(.type == "tool_result") |
    select(.tool_use_id == $id) |
    .content[]? |
    select(.type == "text") |
    .text
  ' "$TRANSCRIPT" 2>/dev/null)

  if [[ -n "$AGENT_TEXT" ]]; then
    TEXT_LEN=${#AGENT_TEXT}
    MD+="### Agent Response ($TEXT_LEN chars)\n\n"
    MD+="$AGENT_TEXT\n\n"
  else
    MD+="### Agent Response\n\n"
    MD+="_No text output captured._\n\n"
  fi

  MD+="---\n\n"
done <<< "$TASK_CALLS"

MD+="_Extracted $AGENT_COUNT agent(s) from transcript._\n"

# Step 4: Output
if [[ -n "$OUTPUT" ]]; then
  echo -e "$MD" > "$OUTPUT"
  echo "Saved $AGENT_COUNT agent output(s) to: $OUTPUT" >&2
else
  echo -e "$MD"
fi
