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

echo "==========================================="
echo "Stop Hook Integration Tests"
echo "==========================================="
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
echo "==========================================="
echo -e "${GREEN}All integration tests passed${NC}"
echo "==========================================="
