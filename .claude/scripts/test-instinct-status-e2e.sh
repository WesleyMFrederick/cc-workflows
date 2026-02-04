#!/bin/bash
# End-to-end validation for Phase 3 Visibility pipeline

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"

CLI_SCRIPT="$SCRIPT_DIR/instinct-cli.js"
LEARNED_DIR="$CLAUDE_PROJECT_DIR/.claude/learned"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; cleanup; exit 1; }

cleanup() {
  rm -rf "$LEARNED_DIR/instincts/personal/test-instinct.yaml" 2>/dev/null || true
}

echo "=========================================="
echo "Instinct Status E2E Validation"
echo "=========================================="
echo ""

# Setup
mkdir -p "$LEARNED_DIR/instincts/personal"
mkdir -p "$LEARNED_DIR/instincts/inherited"

# Test 1: CLI runs without error
echo "Test 1: CLI executes successfully"

if node "$CLI_SCRIPT" status > /dev/null 2>&1; then
  pass "CLI runs without error"
else
  fail "CLI failed to execute"
fi

# Test 2: CLI shows help when no command
echo "Test 2: CLI shows help without command"

output=$(node "$CLI_SCRIPT" 2>&1)
if echo "$output" | grep -q "Instinct CLI"; then
  pass "CLI shows help"
else
  fail "CLI should show help"
fi

# Test 3: Create test instinct and verify it appears
echo "Test 3: Displays created instinct"

cat > "$LEARNED_DIR/instincts/personal/test-instinct.yaml" << 'YAML'
---
id: e2e-test-instinct
trigger: "when running e2e tests"
confidence: 0.85
domain: testing
source: session-observation
---

# E2E Test Instinct

## Action
Verify the e2e test passes.

## Evidence
- Created for e2e validation
YAML

output=$(node "$CLI_SCRIPT" status)

if echo "$output" | grep -q "e2e-test-instinct"; then
  pass "Instinct appears in status"
else
  fail "Created instinct not found in status output"
fi

# Test 4: Confidence bar renders correctly
echo "Test 4: Confidence bar renders"

if echo "$output" | grep -q "████████░░"; then
  pass "Confidence bar renders (85% = 8 blocks)"
else
  # May be 9 blocks due to rounding
  if echo "$output" | grep -q "█████████░"; then
    pass "Confidence bar renders (85% rounded to 9 blocks)"
  else
    fail "Confidence bar not found or incorrect"
  fi
fi

# Test 5: Domain grouping works
echo "Test 5: Domain grouping"

if echo "$output" | grep -q "TESTING"; then
  pass "Domain grouping works"
else
  fail "Domain header not found"
fi

# Cleanup
cleanup

echo ""
echo "=========================================="
echo -e "${GREEN}All E2E tests passed${NC}"
echo "=========================================="
