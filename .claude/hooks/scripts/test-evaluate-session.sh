#!/bin/bash
# Test harness for evaluate-session.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK_SCRIPT="$SCRIPT_DIR/../evaluate-session.sh"
export CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../../.." && pwd)}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

# Setup
setup() {
  mkdir -p "$CLAUDE_PROJECT_DIR/.claude/learned"
  rm -f "$CLAUDE_PROJECT_DIR/.claude/learned/.observer.pid"
}

# Test 1: Script exists and is executable
test_script_exists() {
  echo "Test 1: evaluate-session.sh exists and is executable"

  if [ ! -f "$HOOK_SCRIPT" ]; then
    fail "evaluate-session.sh does not exist at $HOOK_SCRIPT"
  fi

  if [ ! -x "$HOOK_SCRIPT" ]; then
    fail "evaluate-session.sh is not executable"
  fi

  pass "Script exists and is executable"
}

# Test 2: Handles missing PID file gracefully
test_no_pid_file() {
  echo "Test 2: Handles missing PID file gracefully"

  rm -f "$CLAUDE_PROJECT_DIR/.claude/learned/.observer.pid"

  # Should not fail
  if "$HOOK_SCRIPT" 2>&1; then
    pass "Handles missing PID file"
  else
    fail "Script failed with missing PID file"
  fi
}

# Test 3: Kills running observer daemon
test_kills_daemon() {
  echo "Test 3: Kills running observer daemon"

  # Start a mock daemon (sleep process)
  sleep 600 &
  mock_pid=$!

  # Write PID file
  echo "$mock_pid" > "$CLAUDE_PROJECT_DIR/.claude/learned/.observer.pid"

  # Run hook
  "$HOOK_SCRIPT"

  sleep 1

  # Check if process was killed
  if kill -0 "$mock_pid" 2>/dev/null; then
    kill "$mock_pid" 2>/dev/null || true
    fail "Daemon should have been killed"
  fi

  # Check if PID file was removed
  if [ -f "$CLAUDE_PROJECT_DIR/.claude/learned/.observer.pid" ]; then
    fail "PID file should be removed"
  fi

  pass "Kills daemon and removes PID file"
}

# Test 4: Logs observation count
test_logs_observation_count() {
  echo "Test 4: Logs observation count to stderr"

  # Create some observations
  echo '{\"event\":\"test1\"}' > "$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"
  echo '{\"event\":\"test2\"}' >> "$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"
  echo '{\"event\":\"test3\"}' >> "$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"

  output=$("$HOOK_SCRIPT" 2>&1)

  if echo "$output" | grep -q "3"; then
    pass "Logs observation count"
  else
    fail "Should log observation count"
  fi

  # Cleanup
  rm -f "$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"
}

# Run all tests
echo "=========================================="
echo "evaluate-session.sh Test Suite"
echo "=========================================="
echo ""

setup
test_script_exists
test_no_pid_file
test_kills_daemon
test_logs_observation_count

echo ""
echo "=========================================="
echo -e "${GREEN}All tests passed${NC}"
echo "=========================================="
