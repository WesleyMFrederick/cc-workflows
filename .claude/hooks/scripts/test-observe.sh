#!/bin/bash
# .claude/hooks/scripts/test-observe.sh
# Test harness for observe.sh — expects observe.sh to exist and handle JSON input

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK_SCRIPT="$SCRIPT_DIR/../observe.sh"
export CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../../.." && pwd)}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

# Setup: Clear observations file
setup() {
  rm -f "$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"
  mkdir -p "$CLAUDE_PROJECT_DIR/.claude/learned"
}

# Test 1: observe.sh exists and is executable
test_script_exists() {
  echo "Test 1: observe.sh exists and is executable"

  if [ ! -f "$HOOK_SCRIPT" ]; then
    fail "observe.sh does not exist at $HOOK_SCRIPT"
  fi

  if [ ! -x "$HOOK_SCRIPT" ]; then
    fail "observe.sh is not executable"
  fi

  pass "observe.sh exists and is executable"
}

# Test 2: PreToolUse hook parses JSON and writes JSONL
test_pre_tool_use() {
  echo "Test 2: PreToolUse captures tool_name, input, session_id"

  cat << 'EOF' | "$HOOK_SCRIPT" pre
{
  "hook_type": "PreToolUse",
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/tmp/test.md",
    "old_string": "foo",
    "new_string": "bar"
  },
  "session_id": "test-session-123"
}
EOF

  OBSERVATIONS_FILE="$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"

  if [ ! -f "$OBSERVATIONS_FILE" ]; then
    fail "observations.jsonl not created"
  fi

  last_line=$(tail -1 "$OBSERVATIONS_FILE")

  # Verify it's valid JSON
  if ! echo "$last_line" | jq empty 2>/dev/null; then
    fail "Output is not valid JSON: $last_line"
  fi

  # Verify required fields
  tool=$(echo "$last_line" | jq -r '.tool')
  session=$(echo "$last_line" | jq -r '.session')
  event=$(echo "$last_line" | jq -r '.event')

  [ "$tool" = "Edit" ] || fail "tool should be 'Edit', got '$tool'"
  [ "$session" = "test-session-123" ] || fail "session should be 'test-session-123', got '$session'"
  [ "$event" = "tool_start" ] || fail "event should be 'tool_start', got '$event'"

  pass "PreToolUse captures correctly"
}

# Test 3: PostToolUse hook captures output
test_post_tool_use() {
  echo "Test 3: PostToolUse captures tool_name, output, timestamp"

  cat << 'EOF' | "$HOOK_SCRIPT" post
{
  "hook_type": "PostToolUse",
  "tool_name": "Bash",
  "tool_output": "command output here",
  "session_id": "test-session-123"
}
EOF

  OBSERVATIONS_FILE="$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"
  last_line=$(tail -1 "$OBSERVATIONS_FILE")

  event=$(echo "$last_line" | jq -r '.event')
  output=$(echo "$last_line" | jq -r '.output')
  timestamp=$(echo "$last_line" | jq -r '.timestamp')

  [ "$event" = "tool_complete" ] || fail "event should be 'tool_complete', got '$event'"
  [ "$output" = "command output here" ] || fail "output not captured correctly"
  [ -n "$timestamp" ] && [ "$timestamp" != "null" ] || fail "timestamp missing"

  pass "PostToolUse captures correctly"
}

# Run all tests
echo "==========================================="
echo "observe.sh Test Suite"
echo "==========================================="
echo ""

setup
test_script_exists
test_pre_tool_use
test_post_tool_use

echo ""
echo "==========================================="
echo -e "${GREEN}All tests passed${NC}"
echo "==========================================="
