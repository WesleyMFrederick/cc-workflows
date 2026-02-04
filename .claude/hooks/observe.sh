#!/bin/bash
# .claude/hooks/observe.sh
# Continuous Learning v2 - Observation Hook
#
# Captures tool use events for pattern analysis.
# Claude Code passes hook data via stdin as JSON.
#
# Usage: observe.sh pre|post
# - pre: Called on PreToolUse (tool_start event)
# - post: Called on PostToolUse (tool_complete event)

set -e

# Configuration
CONFIG_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/learned"
OBSERVATIONS_FILE="${CONFIG_DIR}/observations.jsonl"

# Ensure directory exists
mkdir -p "$CONFIG_DIR"

# Archive if file exceeds 10MB (check BEFORE writing)
MAX_FILE_SIZE_MB=10
if [ -f "$OBSERVATIONS_FILE" ]; then
  file_size_mb=$(du -m "$OBSERVATIONS_FILE" 2>/dev/null | cut -f1)
  if [ "${file_size_mb:-0}" -ge "$MAX_FILE_SIZE_MB" ]; then
    archive_dir="${CONFIG_DIR}/observations.archive"
    mkdir -p "$archive_dir"
    archive_filename="observations-$(date +%Y%m%d-%H%M%S).jsonl"
    mv "$OBSERVATIONS_FILE" "$archive_dir/$archive_filename"
  fi
fi

# Skip if disabled via marker file
if [ -f "$CONFIG_DIR/disabled" ]; then
  exit 0
fi

# Read JSON from stdin
INPUT_JSON=$(cat)

# Exit silently if no input
if [ -z "$INPUT_JSON" ]; then
  exit 0
fi

# Determine event type from argument
HOOK_ARG="${1:-pre}"
if [ "$HOOK_ARG" = "post" ]; then
  EVENT="tool_complete"
else
  EVENT="tool_start"
fi

# Parse input and build observation using jq
# - Extract tool_name, tool_input, tool_output, session_id
# - Truncate input/output to 5KB (5000 chars)
# - Add timestamp and event type
OBSERVATION=$(echo "$INPUT_JSON" | jq -c --arg event "$EVENT" '
{
  timestamp: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
  event: $event,
  tool: (.tool_name // .tool // "unknown"),
  session: (.session_id // "unknown")
} + (
  if .tool_input then
    { input: (.tool_input | tostring | .[0:5000]) }
  else {} end
) + (
  if .tool_output then
    { output: (.tool_output | tostring | .[0:5000]) }
  else {} end
)
' 2>/dev/null)

# Fallback if jq parsing fails
if [ -z "$OBSERVATION" ] || [ "$OBSERVATION" = "null" ]; then
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  OBSERVATION="{\"timestamp\":\"$timestamp\",\"event\":\"parse_error\",\"raw\":$(echo "$INPUT_JSON" | jq -Rs '.[0:1000]')}"
fi

# Append to observations file (atomic append)
echo "$OBSERVATION" >> "$OBSERVATIONS_FILE"

# Signal observer daemon if running (SIGUSR1 = "new observations available")
OBSERVER_PID_FILE="${CONFIG_DIR}/.observer.pid"
if [ -f "$OBSERVER_PID_FILE" ]; then
  observer_pid=$(cat "$OBSERVER_PID_FILE" 2>/dev/null)
  if [ -n "$observer_pid" ] && kill -0 "$observer_pid" 2>/dev/null; then
    kill -USR1 "$observer_pid" 2>/dev/null || true
  fi
fi

exit 0
