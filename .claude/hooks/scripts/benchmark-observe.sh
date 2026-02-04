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
TEST_JSON='{"hook_type":"PreToolUse","tool_name":"Edit","tool_input":{"file_path":"/tmp/test.md","old_string":"foo","new_string":"bar"},"session_id":"benchmark-test"}'

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
