#!/bin/bash
# End-to-end validation for Observer Daemon pipeline

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"

OBSERVER_SCRIPT="$SCRIPT_DIR/start-observer.sh"
EVALUATE_SCRIPT="$CLAUDE_PROJECT_DIR/.claude/hooks/evaluate-session.sh"
CONFIG_DIR="$CLAUDE_PROJECT_DIR/.claude/learned"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; cleanup; exit 1; }

cleanup() {
  "$OBSERVER_SCRIPT" stop > /dev/null 2>&1 || true
  rm -f "$CONFIG_DIR/.observer.pid"
}

echo "=========================================="
echo "Observer Daemon E2E Validation"
echo "=========================================="
echo ""

# Ensure clean state
cleanup

# Test 1: Full lifecycle - start → verify → stop via hook
echo "Test 1: Full daemon lifecycle"

# Start daemon
"$OBSERVER_SCRIPT" start
sleep 1

# Verify running
if ! "$OBSERVER_SCRIPT" status | grep -q "running"; then
  fail "Daemon should be running after start"
fi

pid=$(cat "$CONFIG_DIR/.observer.pid")
pass "Daemon started (PID: $pid)"

# Stop via evaluate-session.sh (simulating Stop hook)
"$EVALUATE_SCRIPT" 2>/dev/null
sleep 3

# Verify stopped - give a bit more time due to nohup subprocess timing
max_attempts=5
attempt=0
while kill -0 "$pid" 2>/dev/null && [ $attempt -lt $max_attempts ]; do
  sleep 1
  attempt=$((attempt + 1))
done

if kill -0 "$pid" 2>/dev/null; then
  fail "Daemon should be stopped after evaluate-session.sh"
fi

if [ -f "$CONFIG_DIR/.observer.pid" ]; then
  fail "PID file should be removed"
fi

pass "Daemon stopped via Stop hook"

# Test 2: Log file created
echo "Test 2: Observer creates log file"

"$OBSERVER_SCRIPT" start
sleep 1

if [ -f "$CONFIG_DIR/observer.log" ]; then
  pass "Log file created at $CONFIG_DIR/observer.log"
else
  fail "Log file not created"
fi

cleanup

# Test 3: Double start is idempotent
echo "Test 3: Double start is idempotent"

"$OBSERVER_SCRIPT" start
sleep 1
pid1=$(cat "$CONFIG_DIR/.observer.pid")

"$OBSERVER_SCRIPT" start
sleep 1
pid2=$(cat "$CONFIG_DIR/.observer.pid")

if [ "$pid1" = "$pid2" ]; then
  pass "Double start returns same PID (idempotent)"
else
  fail "Double start created new process"
fi

cleanup

# Test 4: Claude invocation via SIGUSR1
echo "Test 4: Claude invocation (SIGUSR1 trigger)"

# Clear log for clean test
rm -f "$CONFIG_DIR/observer.log"

"$OBSERVER_SCRIPT" start
sleep 1
pid=$(cat "$CONFIG_DIR/.observer.pid")

# Create 25 fake observations to exceed threshold
obs_file="$CONFIG_DIR/observations.jsonl"
rm -f "$obs_file"
for i in $(seq 1 25); do
  echo "{\"type\":\"test\",\"data\":\"observation $i\"}" >> "$obs_file"
done

# Trigger immediate analysis via SIGUSR1
kill -USR1 "$pid" 2>/dev/null || true
sleep 3

# Check log for errors
if grep -q "No such file or directory" "$CONFIG_DIR/observer.log" 2>/dev/null; then
  fail "Claude binary path resolution failed (see observer.log)"
fi

# Verify analysis was attempted (log shows "Analyzing")
if grep -q "Analyzing" "$CONFIG_DIR/observer.log" 2>/dev/null; then
  pass "Claude invocation triggered successfully"
else
  fail "Analysis not triggered (SIGUSR1 may have failed)"
fi

cleanup

echo ""
echo "=========================================="
echo -e "${GREEN}All E2E tests passed${NC}"
echo "=========================================="
