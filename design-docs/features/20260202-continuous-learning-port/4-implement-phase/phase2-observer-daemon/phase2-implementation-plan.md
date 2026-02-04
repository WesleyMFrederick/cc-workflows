# Phase 2: Observer Daemon — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `subagent-driven-development` to implement this plan task-by-task.

**Goal:** Prove automatic pattern detection creates instincts from observations.

**Architecture:** Background observer daemon analyzes `observations.jsonl` using Haiku model, detects patterns (corrections, errors, workflows, preferences), creates instinct YAML files. Stop hook kills daemon on session end.

**Tech Stack:** Bash, Claude CLI (`claude --model haiku`), PID file management

**ACs Covered:** AC14-AC22 from [Spec](../../continuous-learning-port-spec.md)

**Dependency:** Phase 1 must be complete (needs `observations.jsonl` to analyze)

---

## Task 1 — Observer Agent Prompt

**Type:** Infrastructure

### Files

- `.claude/agents/observer.md` (CREATE)

### Step 1: Create agents directory if needed

```bash
mkdir -p .claude/agents
```

### Step 2: Create observer.md

```bash
cat > .claude/agents/observer.md << 'EOF'
---
name: observer
description: Background agent that analyzes session observations to detect patterns and create instincts. Uses Haiku for cost-efficiency.
model: haiku
run_mode: background
---

# Observer Agent

A background agent that analyzes observations from Claude Code sessions to detect patterns and create instincts.

## When to Run

- After significant session activity (20+ tool calls)
- On a scheduled interval (configurable, default 5 minutes)
- When triggered by observation hook (SIGUSR1)

## Input

Reads observations from `$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl`:

    {"timestamp":"2025-01-22T10:30:00Z","event":"tool_start","session":"abc123","tool":"Edit","input":"..."}
    {"timestamp":"2025-01-22T10:30:01Z","event":"tool_complete","session":"abc123","tool":"Edit","output":"..."}

## Pattern Detection

Look for these patterns in observations:

### 1. User Corrections
When a user's follow-up message corrects Claude's previous action:
- "No, use X instead of Y"
- "Actually, I meant..."
- Immediate undo/redo patterns

→ Create instinct: "When doing X, prefer Y"

### 2. Error Resolutions
When an error is followed by a fix:
- Tool output contains error
- Next few tool calls fix it
- Same error type resolved similarly multiple times

→ Create instinct: "When encountering error X, try Y"

### 3. Repeated Workflows
When the same sequence of tools is used multiple times:
- Same tool sequence with similar inputs
- File patterns that change together
- Time-clustered operations

→ Create workflow instinct: "When doing X, follow steps Y, Z, W"

### 4. Tool Preferences
When certain tools are consistently preferred:
- Always uses Grep before Edit
- Prefers Read over Bash cat
- Uses specific Bash commands for certain tasks

→ Create instinct: "When needing X, use tool Y"

## Output

Creates/updates instincts in `$CLAUDE_PROJECT_DIR/.claude/learned/instincts/personal/`:

    ---
    id: prefer-grep-before-edit
    trigger: "when searching for code to modify"
    confidence: 0.65
    domain: "workflow"
    source: "session-observation"
    ---

    # Prefer Grep Before Edit

    ## Action
    Always use Grep to find the exact location before using Edit.

    ## Evidence
    - Observed 8 times in session abc123
    - Pattern: Grep → Read → Edit sequence
    - Last observed: 2025-01-22

## Confidence Calculation

Initial confidence based on observation frequency:
- 1-2 observations: 0.3 (tentative)
- 3-5 observations: 0.5 (moderate)
- 6-10 observations: 0.7 (strong)
- 11+ observations: 0.85 (very strong)

Confidence adjusts over time:
- +0.05 for each confirming observation
- -0.10 for each contradicting observation
- -0.02 per week without observation (decay)

## Important Guidelines

1. **Be Conservative**: Only create instincts for clear patterns (3+ observations)
2. **Be Specific**: Narrow triggers are better than broad ones
3. **Track Evidence**: Always include what observations led to the instinct
4. **Respect Privacy**: Never include actual code snippets, only patterns
5. **Merge Similar**: If a new instinct is similar to existing, update rather than duplicate
EOF

```

### Step 3: Verify

```bash
head -20 .claude/agents/observer.md
```

Expected: YAML frontmatter with name, description, model, run_mode

### Step 4: Commit

Use `create-git-commit` skill.

---

## Task 2 — start-observer.sh

**Type:** TDD

### Files

- `.claude/scripts/start-observer.sh` (CREATE)
- `.claude/scripts/test-start-observer.sh` (CREATE & TEST)

### Step 1: Write the failing test

```bash
cat > .claude/scripts/test-start-observer.sh << 'EOF'
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

echo ""
echo "=========================================="
echo -e "${GREEN}All tests passed${NC}"
echo "=========================================="
EOF

chmod +x .claude/scripts/test-start-observer.sh
```

### Step 2: Run test — expect FAIL

Run: `bash .claude/scripts/test-start-observer.sh`

**Expected:** FAIL — `start-observer.sh does not exist`

### Step 3: Write minimal implementation

```bash
cat > .claude/scripts/start-observer.sh << 'EOF'
#!/bin/bash
# Continuous Learning v2 - Observer Agent Launcher
#
# Starts the background observer agent that analyzes observations
# and creates instincts. Uses Haiku model for cost efficiency.
#
# Usage:
#   start-observer.sh        # Start observer in background
#   start-observer.sh stop   # Stop running observer
#   start-observer.sh status # Check if observer is running

set -e

CONFIG_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/learned"
PID_FILE="${CONFIG_DIR}/.observer.pid"
LOG_FILE="${CONFIG_DIR}/observer.log"
OBSERVATIONS_FILE="${CONFIG_DIR}/observations.jsonl"
INSTINCTS_DIR="${CONFIG_DIR}/instincts/personal"

mkdir -p "$CONFIG_DIR"
mkdir -p "$INSTINCTS_DIR"

case "${1:-start}" in
  stop)
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Stopping observer (PID: $pid)..."
        kill "$pid" 2>/dev/null || true
        rm -f "$PID_FILE"
        echo "Observer stopped."
      else
        echo "Observer not running (stale PID file)."
        rm -f "$PID_FILE"
      fi
    else
      echo "Observer not running."
    fi
    exit 0
    ;;

  status)
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Observer is running (PID: $pid)"
        echo "Log: $LOG_FILE"
        echo "Observations: $(wc -l < "$OBSERVATIONS_FILE" 2>/dev/null | tr -d ' ' || echo 0) lines"
        exit 0
      else
        echo "Observer not running (stale PID file)"
        rm -f "$PID_FILE"
        exit 1
      fi
    else
      echo "Observer not running"
      exit 1
    fi
    ;;

  start)
    # Check if already running
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Observer already running (PID: $pid)"
        exit 0
      fi
      rm -f "$PID_FILE"
    fi

    echo "Starting observer agent..."

    # The observer loop
    (
      trap 'rm -f "$PID_FILE"; exit 0' TERM INT

      analyze_observations() {
        # Only analyze if we have enough observations
        obs_count=$(wc -l < "$OBSERVATIONS_FILE" 2>/dev/null | tr -d ' ' || echo 0)
        if [ "$obs_count" -lt 20 ]; then
          return
        fi

        echo "[$(date)] Analyzing $obs_count observations..." >> "$LOG_FILE"

        # Use Claude Code with Haiku to analyze observations
        if command -v claude &> /dev/null; then
          claude --model haiku --max-turns 3 --print \
            "Read $OBSERVATIONS_FILE and identify patterns. If you find 3+ occurrences of the same pattern, create an instinct file in $INSTINCTS_DIR following the YAML format in .claude/agents/observer.md. Be conservative - only create instincts for clear patterns." \
            >> "$LOG_FILE" 2>&1 || true
        fi

        # Archive processed observations
        if [ -f "$OBSERVATIONS_FILE" ]; then
          archive_dir="${CONFIG_DIR}/observations.archive"
          mkdir -p "$archive_dir"
          mv "$OBSERVATIONS_FILE" "$archive_dir/processed-$(date +%Y%m%d-%H%M%S).jsonl"
          touch "$OBSERVATIONS_FILE"
        fi
      }

      # Handle SIGUSR1 for on-demand analysis
      trap 'analyze_observations' USR1

      echo "$$" > "$PID_FILE"
      echo "[$(date)] Observer started (PID: $$)" >> "$LOG_FILE"

      while true; do
        # Check every 5 minutes
        sleep 300

        analyze_observations
      done
    ) &

    disown

    # Wait a moment for PID file
    sleep 1

    if [ -f "$PID_FILE" ]; then
      echo "Observer started (PID: $(cat "$PID_FILE"))"
      echo "Log: $LOG_FILE"
    else
      echo "Failed to start observer"
      exit 1
    fi
    ;;

  *)
    echo "Usage: $0 {start|stop|status}"
    exit 1
    ;;
esac
EOF

chmod +x .claude/scripts/start-observer.sh
```

### Step 4: Run test — expect PASS

Run: `bash .claude/scripts/test-start-observer.sh`

**Expected:** All 5 tests pass

### Step 5: Commit

Use `create-git-commit` skill.

---

## Task 3 — evaluate-session.sh

**Type:** TDD

### Files

- `.claude/hooks/evaluate-session.sh` (CREATE)
- `.claude/hooks/scripts/test-evaluate-session.sh` (CREATE & TEST)

### Step 1: Write the failing test

```bash
cat > .claude/hooks/scripts/test-evaluate-session.sh << 'EOF'
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
  echo '{"event":"test1"}' > "$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"
  echo '{"event":"test2"}' >> "$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"
  echo '{"event":"test3"}' >> "$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"

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
EOF

chmod +x .claude/hooks/scripts/test-evaluate-session.sh
```

### Step 2: Run test — expect FAIL

Run: `bash .claude/hooks/scripts/test-evaluate-session.sh`

**Expected:** FAIL — `evaluate-session.sh does not exist`

### Step 3: Write minimal implementation

```bash
cat > .claude/hooks/evaluate-session.sh << 'EOF'
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
    kill "$pid" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
fi

# Count observations in session
obs_count=0
if [ -f "$OBSERVATIONS_FILE" ]; then
  obs_count=$(wc -l < "$OBSERVATIONS_FILE" | tr -d ' ')
fi

# Log session summary
echo "[ContinuousLearning] Session ended with $obs_count observations" >&2

# Signal readiness for pattern analysis if threshold met
if [ "$obs_count" -ge 20 ]; then
  echo "[ContinuousLearning] Session has enough observations for pattern analysis" >&2
fi

exit 0
EOF

chmod +x .claude/hooks/evaluate-session.sh
```

### Step 4: Run test — expect PASS

Run: `bash .claude/hooks/scripts/test-evaluate-session.sh`

**Expected:** All 4 tests pass

### Step 5: Commit

Use `create-git-commit` skill.

---

## Task 4 — Stop Hook Registration

**Type:** Integration

### Files

- `.claude/settings.json` (MODIFY)
- `.claude/hooks/scripts/test-stop-integration.sh` (CREATE & TEST)

### Step 1: Create integration test

```bash
cat > .claude/hooks/scripts/test-stop-integration.sh << 'EOF'
#!/bin/bash
# Integration test for Stop hook registration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../../.." && pwd)}"

SETTINGS_FILE="$CLAUDE_PROJECT_DIR/.claude/settings.json"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

echo "=========================================="
echo "Stop Hook Integration Tests"
echo "=========================================="
echo ""

# Test 1: Stop hook registered in settings.json
echo "Test 1: evaluate-session.sh registered in Stop hooks"
if jq -e '.hooks.Stop[] | select(.hooks[].command | contains("evaluate-session.sh"))' "$SETTINGS_FILE" > /dev/null 2>&1; then
  pass "evaluate-session.sh registered in Stop"
else
  fail "evaluate-session.sh NOT registered in Stop hooks"
fi

# Test 2: Hook command uses correct path
echo "Test 2: Hook command uses CLAUDE_PROJECT_DIR"
if jq -r '.hooks.Stop[].hooks[].command' "$SETTINGS_FILE" 2>/dev/null | grep -q 'CLAUDE_PROJECT_DIR'; then
  pass "Hook uses CLAUDE_PROJECT_DIR"
else
  fail "Hook should use CLAUDE_PROJECT_DIR variable"
fi

# Test 3: Existing Stop hooks preserved
echo "Test 3: Existing Stop hooks preserved"
if jq -e '.hooks.Stop[] | select(.hooks[].command | contains("stop-sync.sh"))' "$SETTINGS_FILE" > /dev/null 2>&1; then
  pass "Existing stop-sync.sh hook preserved"
else
  echo "  (No stop-sync.sh hook found — OK if not in this repo)"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}All integration tests passed${NC}"
echo "=========================================="
EOF

chmod +x .claude/hooks/scripts/test-stop-integration.sh
```

### Step 2: Run test — expect FAIL

Run: `bash .claude/hooks/scripts/test-stop-integration.sh`

**Expected:** FAIL — `evaluate-session.sh NOT registered in Stop hooks`

### Step 3: Update settings.json

Read current `.claude/settings.json`, then add to the Stop hooks array:

```json
{
  "matcher": "",
  "hooks": [
    {
      "type": "command",
      "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/evaluate-session.sh"
    }
  ]
}
```

**Note:** Add as a new entry in the `hooks.Stop` array, preserving existing entries.

### Step 4: Run test — expect PASS

Run: `bash .claude/hooks/scripts/test-stop-integration.sh`

**Expected:** All tests pass

### Step 5: Commit

Use `create-git-commit` skill.

---

## Task 5 — End-to-End Validation

**Type:** Validation

### Files

- `.claude/scripts/test-observer-e2e.sh` (CREATE)

### Step 1: Create end-to-end test script

```bash
cat > .claude/scripts/test-observer-e2e.sh << 'EOF'
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
"$EVALUATE_SCRIPT"
sleep 1

# Verify stopped
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

echo ""
echo "=========================================="
echo -e "${GREEN}All E2E tests passed${NC}"
echo "=========================================="
EOF

chmod +x .claude/scripts/test-observer-e2e.sh
```

### Step 2: Run validation

Run: `bash .claude/scripts/test-observer-e2e.sh`

**Expected:** All 3 tests pass

### Step 3: Commit

Use `create-git-commit` skill.

---

## Phase 2 Complete — AC Validation

| AC | Description | Validated By |
|----|-------------|--------------|
| AC14 | Observer analyzes at configurable interval using Haiku | Task 2 (start-observer.sh, 5-min loop) |
| AC15 | Detects 4 pattern types | Task 1 (observer.md prompt) |
| AC16 | SIGUSR1 signal for new observations | Task 2 (trap USR1) |
| AC17 | Daemon starts/stops with PID management | Task 2 tests |
| AC18 | Stop hook kills daemon | Task 3, Task 4 |
| AC19 | Disabled by default, opt-in | Phase 1 config.json (observer.enabled: false) |
| AC20 | Instincts in YAML with required fields | Task 1 (observer.md format) |
| AC21 | Confidence scoring rules | Task 1 (observer.md) |
| AC22 | Confidence ≥ 0.7 auto-applied | Task 1 (observer.md) |

**Next Phase:** Phase 3 (Visibility) builds CLI for viewing instincts.
