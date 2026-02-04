#!/bin/bash
# Continuous Learning - Session Evaluator
#
# Runs on Stop hook to:
# 1. Kill the observer daemon if running
# 2. Log session statistics
#
# Rewritten from JS to Bash per cc-workflows convention.

set -e

CONFIG_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/learned"
PID_FILE="${CONFIG_DIR}/.observer.pid"
OBSERVATIONS_FILE="${CONFIG_DIR}/observations.jsonl"

# Ensure directory exists
mkdir -p "$CONFIG_DIR"

# Kill observer daemon if running
if [ -f "$PID_FILE" ]; then
  pid=$(cat "$PID_FILE" 2>/dev/null)
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    echo "[ContinuousLearning] Stopping observer daemon (PID: $pid)" >&2
    # First try SIGTERM to allow graceful trap-based cleanup
    kill -TERM "$pid" 2>/dev/null || true
    sleep 1
    # If still running, use SIGKILL
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  fi
  rm -f "$PID_FILE"
fi

# Count observations in session
obs_count=0
if [ -f "$OBSERVATIONS_FILE" ] && [ -r "$OBSERVATIONS_FILE" ]; then
  obs_count=$(grep -c "^" "$OBSERVATIONS_FILE" 2>/dev/null || echo 0)
fi

# Log session summary
echo "[ContinuousLearning] Session ended with $obs_count observations" >&2

# Signal readiness for pattern analysis if threshold met
if [ "$obs_count" -ge 20 ]; then
  echo "[ContinuousLearning] Session has enough observations for pattern analysis" >&2
fi

exit 0
