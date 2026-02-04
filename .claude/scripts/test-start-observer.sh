#!/bin/bash
# Test harness for start-observer.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OBSERVER_SCRIPT="$SCRIPT_DIR/start-observer.sh"
export CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

# Setup: Clean state
setup() {
  rm -f "$CLAUDE_PROJECT_DIR/.claude/learned/.observer.pid"
  rm -f "$CLAUDE_PROJECT_DIR/.claude/learned/observer.log"
  mkdir -p "$CLAUDE_PROJECT_DIR/.claude/learned"
}

# Test 1: Script exists and is executable
test_script_exists() {
  echo "Test 1: start-observer.sh exists and is executable"

  if [ ! -f "$OBSERVER_SCRIPT" ]; then
    fail "start-observer.sh does not exist at $OBSERVER_SCRIPT"
  fi

  if [ ! -x "$OBSERVER_SCRIPT" ]; then
    fail "start-observer.sh is not executable"
  fi

  pass "Script exists and is executable"
}

# Test 2: Start creates PID file
test_start_creates_pid() {
  echo "Test 2: start command creates PID file"

  "$OBSERVER_SCRIPT" start
  sleep 1

  PID_FILE="$CLAUDE_PROJECT_DIR/.claude/learned/.observer.pid"
  if [ ! -f "$PID_FILE" ]; then
    fail "PID file not created"
  fi

  pid=$(cat "$PID_FILE")
  if ! kill -0 "$pid" 2>/dev/null; then
    fail "PID $pid is not a running process"
  fi

  pass "Start creates valid PID file"

  # Cleanup
  "$OBSERVER_SCRIPT" stop > /dev/null 2>&1 || true
}

# Test 3: Status reports running state
test_status_running() {
  echo "Test 3: status command reports running state"

  "$OBSERVER_SCRIPT" start
  sleep 1

  if ! "$OBSERVER_SCRIPT" status | grep -q "running"; then
    "$OBSERVER_SCRIPT" stop > /dev/null 2>&1 || true
    fail "Status should report 'running'"
  fi

  pass "Status reports running correctly"

  # Cleanup
  "$OBSERVER_SCRIPT" stop > /dev/null 2>&1 || true
}

# Test 4: Stop kills daemon
test_stop_kills_daemon() {
  echo "Test 4: stop command kills daemon"

  "$OBSERVER_SCRIPT" start
  sleep 1

  PID_FILE="$CLAUDE_PROJECT_DIR/.claude/learned/.observer.pid"
  pid=$(cat "$PID_FILE")

  "$OBSERVER_SCRIPT" stop
  sleep 1

  if kill -0 "$pid" 2>/dev/null; then
    fail "Process $pid still running after stop"
  fi

  if [ -f "$PID_FILE" ]; then
    fail "PID file should be removed after stop"
  fi

  pass "Stop kills daemon and removes PID file"
}

# Test 5: Status reports not running when stopped
test_status_not_running() {
  echo "Test 5: status command reports not running when stopped"

  if "$OBSERVER_SCRIPT" status 2>&1 | grep -q "not running"; then
    pass "Status reports not running correctly"
  else
    fail "Status should report 'not running'"
  fi
}

# Test 6: Start when already running is idempotent
test_start_already_running() {
  echo "Test 6: start command when already running is idempotent"

  "$OBSERVER_SCRIPT" start
  sleep 1

  PID_FILE="$CLAUDE_PROJECT_DIR/.claude/learned/.observer.pid"
  pid1=$(cat "$PID_FILE")

  # Second start should report already running and return same PID
  if ! "$OBSERVER_SCRIPT" start 2>&1 | grep -q "already running"; then
    "$OBSERVER_SCRIPT" stop > /dev/null 2>&1 || true
    fail "Should report 'already running'"
  fi

  pid2=$(cat "$PID_FILE")

  if [ "$pid1" != "$pid2" ]; then
    "$OBSERVER_SCRIPT" stop > /dev/null 2>&1 || true
    fail "Double start should return same PID"
  fi

  pass "Start when already running is idempotent"

  # Cleanup
  "$OBSERVER_SCRIPT" stop > /dev/null 2>&1 || true
}

# Run all tests
echo "=========================================="
echo "start-observer.sh Test Suite"
echo "=========================================="
echo ""

setup
test_script_exists
test_start_creates_pid
test_stop_kills_daemon
test_status_not_running
test_status_running
test_start_already_running

echo ""
echo "=========================================="
echo -e "${GREEN}All tests passed${NC}"
echo "=========================================="
