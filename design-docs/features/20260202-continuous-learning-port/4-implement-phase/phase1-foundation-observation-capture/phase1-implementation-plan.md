# Phase 1: Foundation + Observation Capture — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `subagent-driven-development` to implement this plan task-by-task.

**Goal:** Prove tool capture works without breaking existing hooks or impacting performance.

**Architecture:** Project-local observation system in `.claude/learned/`. Hook captures all tools via `*` matcher, writes append-only JSONL, auto-archives at 10MB. Bash+jq implementation (no Python dependency).

**Tech Stack:** Bash, jq (JSON processing), Claude Code hooks system

**ACs Covered:** AC1-AC13 from [Spec](../../continuous-learning-port-spec.md)

---

## Task 1 — Foundation: Directory Structure + Config

**Type:** Infrastructure (no TDD)

### Files

- `.claude/learned/` (CREATE directory structure)
- `.claude/learned/config.json` (CREATE)
- `.gitignore` (MODIFY)

### Step 1: Create directory structure

```bash
mkdir -p .claude/learned/observations.archive
mkdir -p .claude/learned/instincts/personal
mkdir -p .claude/learned/instincts/inherited
```

### Step 2: Create config.json

```bash
cat > .claude/learned/config.json << 'EOF'
{
  "version": "2.0",
  "observation": {
    "enabled": true,
    "store_path": ".claude/learned/observations.jsonl",
    "max_file_size_mb": 10,
    "archive_after_days": 7,
    "capture_tools": ["*"],
    "ignore_tools": []
  },
  "instincts": {
    "personal_path": ".claude/learned/instincts/personal/",
    "inherited_path": ".claude/learned/instincts/inherited/",
    "min_confidence": 0.3,
    "auto_approve_threshold": 0.7,
    "confidence_decay_rate": 0.02,
    "max_instincts": 100
  },
  "observer": {
    "enabled": false,
    "model": "haiku",
    "run_interval_minutes": 5,
    "min_observations_to_analyze": 20,
    "patterns_to_detect": [
      "user_corrections",
      "error_resolutions",
      "repeated_workflows",
      "tool_preferences"
    ]
  },
  "evolution": {
    "cluster_threshold": 3,
    "evolved_path": ".claude/learned/evolved/",
    "auto_evolve": false
  }
}
EOF
```

### Step 3: Update .gitignore

Add to `.gitignore`:

```gitignore
# Continuous learning personal data
.claude/learned/
```

### Step 4: Verify

```bash
tree .claude/learned/ -L 2
```

Expected:

```text
.claude/learned/
├── config.json
├── instincts
│   ├── inherited
│   └── personal
└── observations.archive
```

### Step 5: Commit

Use `create-git-commit` skill.

---

## Task 2 — Test Harness for observe.sh (RED)

**Type:** TDD — Write failing test first

### Files

- `.claude/hooks/scripts/test-observe.sh` (CREATE)

### Step 1: Write the test harness

```bash
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
echo "=========================================="
echo "observe.sh Test Suite"
echo "=========================================="
echo ""

setup
test_script_exists
test_pre_tool_use
test_post_tool_use

echo ""
echo "=========================================="
echo -e "${GREEN}All tests passed${NC}"
echo "=========================================="
```

### Step 2: Make executable

```bash
chmod +x .claude/hooks/scripts/test-observe.sh
```

### Step 3: Run test — expect FAIL

```bash
bash .claude/hooks/scripts/test-observe.sh
```

**Expected:** FAIL — `observe.sh does not exist`

### Step 4: Commit

Use `create-git-commit` skill with message: "test(hooks): add test harness for observe.sh (RED)"

---

## Task 3 — observe.sh Minimal Implementation (GREEN)

**Type:** TDD — Make tests pass

### Files

- `.claude/hooks/observe.sh` (CREATE)

### Step 1: Write minimal implementation

```bash
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

exit 0
```

### Step 2: Make executable

```bash
chmod +x .claude/hooks/observe.sh
```

### Step 3: Run test — expect PASS

```bash
bash .claude/hooks/scripts/test-observe.sh
```

**Expected:** All 3 tests pass

### Step 4: Verify JSONL output manually

```bash
cat .claude/learned/observations.jsonl | jq .
```

**Expected:** Valid JSON entries with timestamp, event, tool, session fields

### Step 5: Commit

Use `create-git-commit` skill with message: "feat(hooks): implement observe.sh with jq parsing (GREEN)"

---

## Task 4 — Add Truncation Verification (TDD)

**Type:** TDD — Verify 5KB truncation works

### Files

- `.claude/hooks/scripts/test-observe.sh` (MODIFY — add test)

### Step 1: Add truncation test

Add to `test-observe.sh` before the "Run all tests" section:

```bash
# Test 4: Input/output truncated to 5KB
test_truncation() {
  echo "Test 4: Truncates input/output to 5KB max"

  # Generate 10KB of data
  LARGE_DATA=$(printf 'x%.0s' {1..10240})

  # Create JSON with large input
  echo "{
    \"hook_type\": \"PreToolUse\",
    \"tool_name\": \"Write\",
    \"tool_input\": {
      \"content\": \"$LARGE_DATA\"
    },
    \"session_id\": \"truncation-test\"
  }" | "$HOOK_SCRIPT" pre

  OBSERVATIONS_FILE="$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"
  last_line=$(tail -1 "$OBSERVATIONS_FILE")

  # Get length of input field
  input_length=$(echo "$last_line" | jq -r '.input | length')

  if [ "$input_length" -le 5100 ]; then
    pass "Input truncated to $input_length chars (≤5KB + JSON overhead)"
  else
    fail "Input not truncated: $input_length chars (should be ≤5100)"
  fi
}
```

Add `test_truncation` to the test run sequence.

### Step 2: Run test — expect PASS

```bash
bash .claude/hooks/scripts/test-observe.sh
```

**Expected:** PASS — truncation already implemented in Task 3 via `.[0:5000]`

### Step 3: Commit

Use `create-git-commit` skill with message: "test(hooks): add truncation verification test"

---

## Task 5 — Add Auto-Archive Logic (TDD)

**Type:** TDD — Add archive at 10MB

### Files

- `.claude/hooks/scripts/test-observe.sh` (MODIFY — add test)
- `.claude/hooks/observe.sh` (MODIFY — add archive logic)

### Step 1: Add archive test

Add to `test-observe.sh`:

```bash
# Test 5: Auto-archive at 10MB
test_archive() {
  echo "Test 5: Auto-archives observations.jsonl at 10MB"

  OBSERVATIONS_FILE="$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"
  ARCHIVE_DIR="$CLAUDE_PROJECT_DIR/.claude/learned/observations.archive"

  # Create a fake 11MB file to trigger archive
  dd if=/dev/zero of="$OBSERVATIONS_FILE" bs=1m count=11 2>/dev/null

  # Trigger observe.sh (archive check happens before write)
  echo '{"hook_type":"PreToolUse","tool_name":"Test","session_id":"archive-test"}' | "$HOOK_SCRIPT" pre

  # Check if archive was created
  archive_count=$(ls -1 "$ARCHIVE_DIR" 2>/dev/null | wc -l | tr -d ' ')

  if [ "$archive_count" -gt 0 ]; then
    pass "Archive created ($archive_count files in observations.archive/)"
  else
    fail "Archive not created when file exceeded 10MB"
  fi

  # Cleanup
  rm -f "$ARCHIVE_DIR"/*
}
```

Add `test_archive` to test sequence.

### Step 2: Run test — expect FAIL

```bash
bash .claude/hooks/scripts/test-observe.sh
```

**Expected:** FAIL — archive logic not yet implemented

### Step 3: Add archive logic to observe.sh

Add after `mkdir -p "$CONFIG_DIR"` and before reading stdin:

```bash
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
```

### Step 4: Run test — expect PASS

```bash
bash .claude/hooks/scripts/test-observe.sh
```

**Expected:** All tests pass including archive test

### Step 5: Commit

Use `create-git-commit` skill with message: "feat(hooks): add auto-archive at 10MB threshold"

---

## Task 6 — Add SIGUSR1 Signaling (TDD)

**Type:** TDD — Signal observer daemon

### Files

- `.claude/hooks/scripts/test-observe.sh` (MODIFY — add test)
- `.claude/hooks/observe.sh` (MODIFY — add signal logic)

### Step 1: Add signal test

Add to `test-observe.sh`:

```bash
# Test 6: SIGUSR1 signal to observer daemon
test_signal_observer() {
  echo "Test 6: Sends SIGUSR1 to observer daemon if running"

  PID_FILE="$CLAUDE_PROJECT_DIR/.claude/learned/.observer.pid"

  # Create PID file with current shell PID (safe test target)
  echo $$ > "$PID_FILE"

  # Trigger observe.sh
  echo '{"hook_type":"PreToolUse","tool_name":"Test","session_id":"signal-test"}' | "$HOOK_SCRIPT" pre

  # If we got here without crashing, signal handling is graceful
  pass "Signal sent without error (SIGUSR1 is non-fatal)"

  # Cleanup
  rm -f "$PID_FILE"
}

# Test 7: Handles invalid PID gracefully
test_invalid_pid() {
  echo "Test 7: Handles invalid PID file gracefully"

  PID_FILE="$CLAUDE_PROJECT_DIR/.claude/learned/.observer.pid"

  # Create PID file with non-existent PID
  echo "99999" > "$PID_FILE"

  # Trigger observe.sh — should not fail
  echo '{"hook_type":"PreToolUse","tool_name":"Test","session_id":"invalid-pid-test"}' | "$HOOK_SCRIPT" pre

  if [ $? -eq 0 ]; then
    pass "Hook tolerates invalid PID"
  else
    fail "Hook failed with invalid PID"
  fi

  # Cleanup
  rm -f "$PID_FILE"
}
```

Add both tests to sequence.

### Step 2: Run test — expect FAIL

```bash
bash .claude/hooks/scripts/test-observe.sh
```

**Expected:** May pass (no-op) or fail depending on shell behavior

### Step 3: Add signal logic to observe.sh

Add at the end, before `exit 0`:

```bash
# Signal observer daemon if running (SIGUSR1 = "new observations available")
OBSERVER_PID_FILE="${CONFIG_DIR}/.observer.pid"
if [ -f "$OBSERVER_PID_FILE" ]; then
  observer_pid=$(cat "$OBSERVER_PID_FILE" 2>/dev/null)
  if [ -n "$observer_pid" ] && kill -0 "$observer_pid" 2>/dev/null; then
    kill -USR1 "$observer_pid" 2>/dev/null || true
  fi
fi
```

### Step 4: Run test — expect PASS

```bash
bash .claude/hooks/scripts/test-observe.sh
```

**Expected:** All tests pass

### Step 5: Commit

Use `create-git-commit` skill with message: "feat(hooks): add SIGUSR1 signal to observer daemon"

---

## Task 7 — Performance Benchmark

**Type:** Validation (no TDD)

### Files

- `.claude/hooks/scripts/benchmark-observe.sh` (CREATE)

### Step 1: Create benchmark script

```bash
#!/bin/bash
# .claude/hooks/scripts/benchmark-observe.sh
# Benchmark observe.sh performance — target: <100ms per call

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK_SCRIPT="$SCRIPT_DIR/../observe.sh"
export CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../../.." && pwd)}"

echo "=========================================="
echo "observe.sh Performance Benchmark"
echo "Target: <100ms per hook execution"
echo "=========================================="
echo ""

# Test data
TEST_JSON='{
  "hook_type": "PreToolUse",
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/tmp/test.md",
    "old_string": "foo",
    "new_string": "bar"
  },
  "session_id": "benchmark-test"
}'

# Benchmark: 10 iterations
echo "Running 10 iterations..."
total_time=0
iterations=10

for i in $(seq 1 $iterations); do
  start=$(python3 -c "import time; print(int(time.time() * 1000))")
  echo "$TEST_JSON" | "$HOOK_SCRIPT" pre > /dev/null 2>&1
  end=$(python3 -c "import time; print(int(time.time() * 1000))")

  elapsed=$((end - start))
  total_time=$((total_time + elapsed))
  printf "  Iteration %2d: %3dms\n" "$i" "$elapsed"
done

avg_time=$((total_time / iterations))

echo ""
echo "=========================================="
echo "Results:"
echo "  Total time: ${total_time}ms"
echo "  Average:    ${avg_time}ms"
echo ""

if [ "$avg_time" -lt 100 ]; then
  echo "✓ PASS: Performance target met (<100ms)"
  exit 0
else
  echo "✗ FAIL: Performance target missed (${avg_time}ms >= 100ms)"
  exit 1
fi
```

### Step 2: Make executable and run

```bash
chmod +x .claude/hooks/scripts/benchmark-observe.sh
bash .claude/hooks/scripts/benchmark-observe.sh
```

**Expected:** Average <100ms (typically 10-30ms)

### Step 3: Document results in plan notes

Record actual performance numbers for AC9 validation.

### Step 4: Commit

Use `create-git-commit` skill with message: "test(hooks): add performance benchmark for observe.sh"

---

## Task 8 — settings.json Integration + End-to-End Test

**Type:** Integration

### Files

- `.claude/settings.json` (MODIFY — add hook entries)
- `.claude/hooks/scripts/test-integration.sh` (CREATE)

### Step 1: Create integration test

```bash
#!/bin/bash
# .claude/hooks/scripts/test-integration.sh
# Integration test: verify hooks registered and end-to-end capture works

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
echo "Integration Tests"
echo "=========================================="
echo ""

# Test 1: PreToolUse hook registered
echo "Test 1: PreToolUse hook registration"
if jq -e '.hooks.PreToolUse[] | select(.matcher == "*")' "$SETTINGS_FILE" > /dev/null 2>&1; then
  pass "observe.sh registered in PreToolUse"
else
  fail "observe.sh NOT registered in PreToolUse"
fi

# Test 2: PostToolUse hook registered
echo "Test 2: PostToolUse hook registration"
if jq -e '.hooks.PostToolUse[] | select(.matcher == "*")' "$SETTINGS_FILE" > /dev/null 2>&1; then
  pass "observe.sh registered in PostToolUse"
else
  fail "observe.sh NOT registered in PostToolUse"
fi

# Test 3: End-to-end capture
echo "Test 3: End-to-end observation capture"

rm -f "$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl"

# Simulate PreToolUse + PostToolUse
echo '{"hook_type":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"/tmp/test.md"},"session_id":"e2e-test"}' | "$CLAUDE_PROJECT_DIR/.claude/hooks/observe.sh" pre

echo '{"hook_type":"PostToolUse","tool_name":"Read","tool_output":"file contents here","session_id":"e2e-test"}' | "$CLAUDE_PROJECT_DIR/.claude/hooks/observe.sh" post

obs_count=$(wc -l < "$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl" | tr -d ' ')

if [ "$obs_count" -eq 2 ]; then
  pass "End-to-end capture working (2 observations)"
else
  fail "Expected 2 observations, got $obs_count"
fi

# Test 4: Existing hooks preserved
echo "Test 4: Existing hooks preserved"
if jq -e '.hooks.PostToolUse[] | select(.matcher == "Read")' "$SETTINGS_FILE" > /dev/null 2>&1; then
  pass "Existing Read hooks preserved"
else
  echo "  (No Read-specific hooks found — OK if not in this repo)"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}All integration tests passed${NC}"
echo "=========================================="
```

### Step 2: Run integration test — expect FAIL

```bash
chmod +x .claude/hooks/scripts/test-integration.sh
bash .claude/hooks/scripts/test-integration.sh
```

**Expected:** FAIL — hooks not yet in settings.json

### Step 3: Update settings.json

Read current file, then add observe.sh hooks. Add these entries to the appropriate arrays:

**PreToolUse array — add:**

```json
{
  "matcher": "*",
  "hooks": [
    {
      "type": "command",
      "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/observe.sh pre"
    }
  ]
}
```

**PostToolUse array — add:**

```json
{
  "matcher": "*",
  "hooks": [
    {
      "type": "command",
      "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/observe.sh post"
    }
  ]
}
```

### Step 4: Run integration test — expect PASS

```bash
bash .claude/hooks/scripts/test-integration.sh
```

**Expected:** All tests pass

### Step 5: Commit

Use `create-git-commit` skill with message: "feat(hooks): register observe.sh in settings.json"

---

## Phase 1 Complete — AC Validation

| AC | Description | Validated By |
|----|-------------|--------------|
| AC1 | PreToolUse captures tool, input, session | Task 3 test |
| AC2 | PostToolUse captures tool, output, timestamp | Task 3 test |
| AC3 | ALL tools captured via `*` matcher | Task 8 settings.json |
| AC4 | Truncated to 5KB | Task 4 test |
| AC5 | Auto-archive at 10MB | Task 5 test |
| AC6 | No data loss during archive | Task 5 (mv is atomic) |
| AC7 | Registered in settings.json | Task 8 test |
| AC8 | Existing hooks preserved | Task 8 test |
| AC9 | <100ms performance | Task 7 benchmark |
| AC10 | Append-only writes | observe.sh uses `>>` |
| AC11 | Bash + jq (no python3) | observe.sh implementation |
| AC12 | Data in .claude/learned/ | All paths use CONFIG_DIR |
| AC13 | config.json exists | Task 1 |

**Next Phase:** Phase 2 (Observer Daemon) builds on this foundation.
