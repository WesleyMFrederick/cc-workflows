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
