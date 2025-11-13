# Deny-Path Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `--deny-path` flag support to sandbox wrapper for filesystem isolation testing

**Architecture:** Simple loop-based flag parsing in conditional-claude.sh, environment variable pass-through to claude-worktree-sandbox.sh, Seatbelt policy generation with recursive directory denial

**Tech Stack:** Bash 3.2+, macOS Seatbelt (sandbox-exec), Git worktrees

**Status:** ✅ IMPLEMENTED (2025-01-13)

## Implementation Notes

**Testing Strategy:** This plan originally specified bash unit tests, but we implemented using the existing Vitest integration test infrastructure instead:

- Created `test/conditional-claude-deny-path.test.js` with 5 comprehensive integration tests
- Tests cover: --deny-path flag parsing (space and = syntax), multiple paths, error handling, pass-through outside worktree
- All 13 sandbox tests pass (5 new + 8 existing = no regressions)
- Used existing test helpers (`runScript`, `createTestWorktree`, `createTempDir`)

**Commits:**
- `2af96b4` - feat(sandbox): add abs_path() helper for deny-path resolution
- `0ba7e89` - feat(sandbox): implement --deny-path flag support for filesystem isolation

---

## Task 1 - Add abs_path() helper function to conditional-claude.sh

### Files
- `packages/sandbox/conditional-claude.sh:34` (MODIFY - insert after find_real_claude())

### Step 1: Write the failing test

Create test file to verify abs_path() function:

```bash
# packages/sandbox/test-abs-path.sh
#!/usr/bin/env bash
source ./conditional-claude.sh

# Test 1: Tilde expansion
result=$(abs_path "~/.ssh")
expected="$HOME/.ssh"
if [[ "$result" != "$expected" ]]; then
    echo "FAIL: Tilde expansion - got $result, expected $expected"
    exit 1
fi

# Test 2: Existing directory
mkdir -p /tmp/test-deny-path
result=$(abs_path "/tmp/test-deny-path")
expected="/tmp/test-deny-path"
if [[ "$result" != "$expected" ]]; then
    echo "FAIL: Existing directory - got $result, expected $expected"
    exit 1
fi

# Test 3: Non-existent path (should return as-is)
result=$(abs_path "/nonexistent/path")
expected="/nonexistent/path"
if [[ "$result" != "$expected" ]]; then
    echo "FAIL: Non-existent path - got $result, expected $expected"
    exit 1
fi

echo "PASS: All abs_path tests passed"
```

### Step 2: Run test to verify it fails

Run: `bash packages/sandbox/test-abs-path.sh`
Expected: FAIL with "abs_path: command not found" or similar

### Step 3: Write minimal implementation

Add after line 33 in conditional-claude.sh:

```bash
# Convert relative path to absolute path
abs_path() {
 local p="$1"
 # Expand tilde
 if [[ "$p" == "~"* ]]; then
  p="${p/#\~/$HOME}"
 fi
 # Convert to absolute
 if [[ -e "$p" ]]; then
  if [[ -d "$p" ]]; then
   (cd "$p" && pwd -P)
  else
   (cd "$(dirname "$p")" && printf '%s/%s\n' "$(pwd -P)" "$(basename "$p")")
  fi
 else
  echo "$p"  # Return as-is if doesn't exist
 fi
}
```

### Step 4: Run test to verify it passes

Run: `bash packages/sandbox/test-abs-path.sh`
Expected: PASS with "All abs_path tests passed"

### Step 5: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(sandbox): add abs_path() helper for deny-path resolution"
- Files: packages/sandbox/conditional-claude.sh, packages/sandbox/test-abs-path.sh

---

## Task 2 - Add parse_deny_paths() function to conditional-claude.sh

### Files
- `packages/sandbox/conditional-claude.sh:71` (MODIFY - insert after abs_path())

### Step 1: Write the failing test

Create test file to verify parse_deny_paths() function:

```bash
# packages/sandbox/test-parse-deny-paths.sh
#!/usr/bin/env bash
source ./conditional-claude.sh

# Test 1: Single --deny-path with space syntax
unset DENY_PATHS remaining_args
parse_deny_paths --deny-path ~/.ssh "analyze code"
if [[ "$DENY_PATHS" != "$HOME/.ssh" ]]; then
    echo "FAIL: Single deny-path - got '$DENY_PATHS', expected '$HOME/.ssh'"
    exit 1
fi
if [[ "${remaining_args[*]}" != "analyze code" ]]; then
    echo "FAIL: Remaining args - got '${remaining_args[*]}', expected 'analyze code'"
    exit 1
fi

# Test 2: Multiple --deny-path flags
unset DENY_PATHS remaining_args
parse_deny_paths --deny-path ~/.ssh --deny-path /tmp/secret "test"
expected=$(printf '%s\n%s' "$HOME/.ssh" "/tmp/secret")
if [[ "$DENY_PATHS" != "$expected" ]]; then
    echo "FAIL: Multiple deny-paths - got '$DENY_PATHS', expected '$expected'"
    exit 1
fi

# Test 3: --deny-path=PATH syntax
unset DENY_PATHS remaining_args
parse_deny_paths --deny-path=~/.ssh "test"
if [[ "$DENY_PATHS" != "$HOME/.ssh" ]]; then
    echo "FAIL: Equals syntax - got '$DENY_PATHS', expected '$HOME/.ssh'"
    exit 1
fi

# Test 4: Missing argument (should exit with error)
unset DENY_PATHS remaining_args
if parse_deny_paths --deny-path 2>/dev/null; then
    echo "FAIL: Missing argument - should have exited with error"
    exit 1
fi

echo "PASS: All parse_deny_paths tests passed"
```

### Step 2: Run test to verify it fails

Run: `bash packages/sandbox/test-parse-deny-paths.sh`
Expected: FAIL with "parse_deny_paths: command not found"

### Step 3: Write minimal implementation

Add after abs_path() function in conditional-claude.sh:

```bash
# Parse --deny-path flags from arguments
# Returns: Sets DENY_PATHS env var, populates remaining_args array
parse_deny_paths() {
 local deny_paths=()
 remaining_args=()

 while [[ $# -gt 0 ]]; do
  case "$1" in
   --deny-path)
    # Check for missing argument
    if [[ -z "${2:-}" ]]; then
     echo "Error: --deny-path requires a path argument" >&2
     exit 1
    fi
    # Resolve to absolute path and add to array
    deny_paths+=("$(abs_path "$2")")
    shift 2
    ;;
   --deny-path=*)
    # Extract path after = and resolve
    deny_paths+=("$(abs_path "${1#--deny-path=}")")
    shift
    ;;
   *)
    # Not a deny-path flag, keep for Claude
    remaining_args+=("$1")
    shift
    ;;
  esac
 done

 # Export as newline-separated string
 if [[ ${#deny_paths[@]} -gt 0 ]]; then
  export DENY_PATHS="$(printf '%s\n' "${deny_paths[@]}")"
 fi
}
```

### Step 4: Run test to verify it passes

Run: `bash packages/sandbox/test-parse-deny-paths.sh`
Expected: PASS with "All parse_deny_paths tests passed"

### Step 5: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(sandbox): add parse_deny_paths() for CLI flag parsing"
- Files: packages/sandbox/conditional-claude.sh, packages/sandbox/test-parse-deny-paths.sh

---

## Task 3 - Modify conditional-claude.sh main execution to use parsed deny paths

### Files
- `packages/sandbox/conditional-claude.sh:73-99` (MODIFY)

### Step 1: Write the failing integration test

Create integration test to verify end-to-end argument parsing:

```bash
# packages/sandbox/test-integration-deny-path.sh
#!/usr/bin/env bash

# Test that conditional-claude.sh correctly parses and passes args
# We'll mock detect_worktree and check the exec call

# Create a mock detect_worktree that returns 1 (not worktree)
# This lets us verify argument parsing without triggering sandbox

cd packages/sandbox

# Test: Verify --deny-path flags are removed from remaining args
result=$(bash -c '
source ./conditional-claude.sh
detect_worktree() { return 1; }
find_real_claude() { echo "/usr/local/bin/claude"; }
export -f detect_worktree find_real_claude

# Parse args
parse_deny_paths --deny-path ~/.ssh "show git status"

# Verify DENY_PATHS was set
if [[ -z "$DENY_PATHS" ]]; then
    echo "FAIL: DENY_PATHS not set"
    exit 1
fi

# Verify remaining_args contains only non-deny-path args
if [[ "${remaining_args[*]}" != "show git status" ]]; then
    echo "FAIL: remaining_args incorrect: ${remaining_args[*]}"
    exit 1
fi

echo "PASS"
')

if [[ "$result" != "PASS" ]]; then
    echo "$result"
    exit 1
fi

echo "PASS: Integration test passed"
```

### Step 2: Run test to verify current behavior

Run: `bash packages/sandbox/test-integration-deny-path.sh`
Expected: FAIL (main execution not yet modified to call parse_deny_paths)

### Step 3: Modify main execution block

Replace lines 73-99 in conditional-claude.sh with:

```bash
# Parse deny-path flags
parse_deny_paths "$@"

# Main logic
if detect_worktree; then
 echo "🔍 Detected git worktree" >&2
 echo "🔒 Running Claude Code in Seatbelt sandbox" >&2

 # Find real claude binary (not the wrapper)
 real_claude=$(find_real_claude) || {
  echo "❌ Real Claude binary not found in PATH" >&2
  exit 127
 }

 # Pass real claude path to sandbox script via environment variable
 # Resolve symlink to get actual script location
 script_path="${BASH_SOURCE[0]}"
 if [[ -L "$script_path" ]]; then
  script_path="$(readlink "$script_path")"
 fi
 script_dir="$(cd "$(dirname "$script_path")" && pwd)"
 export REAL_CLAUDE_PATH="$real_claude"
 exec "$script_dir/claude-worktree-sandbox.sh" "${remaining_args[@]}"
else
 # Route to real claude binary
 real_claude=$(find_real_claude) || {
  echo "❌ Real Claude binary not found in PATH" >&2
  exit 127
 }
 exec "$real_claude" "${remaining_args[@]}"
fi
```

### Step 4: Run test to verify it passes

Run: `bash packages/sandbox/test-integration-deny-path.sh`
Expected: PASS with "Integration test passed"

### Step 5: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(sandbox): integrate deny-path parsing into main execution"
- Files: packages/sandbox/conditional-claude.sh

---

## Task 4 - Add deny-path processing logic to claude-worktree-sandbox.sh

### Files
- `packages/sandbox/claude-worktree-sandbox.sh:113` (MODIFY - insert after git detection block)

### Step 1: Write the failing test

Create test to verify deny-path processing from environment variable:

```bash
# packages/sandbox/test-sandbox-deny-processing.sh
#!/usr/bin/env bash

# Test that sandbox script correctly processes DENY_PATHS env var

cd packages/sandbox

# Create test paths
mkdir -p /tmp/test-deny-dir
touch /tmp/test-deny-file.txt

# Export DENY_PATHS
export DENY_PATHS=$(printf '%s\n%s' "/tmp/test-deny-dir" "/tmp/test-deny-file.txt")

# Source the script and capture stderr
result=$(bash -c '
source ./claude-worktree-sandbox.sh 2>&1 | grep "🚫 Denying access" || echo "FAIL"
' 2>&1)

if [[ "$result" == "FAIL" ]]; then
    echo "FAIL: Deny-path processing not implemented"
    exit 1
fi

echo "PASS: Deny-path processing working"
```

### Step 2: Run test to verify it fails

Run: `bash packages/sandbox/test-sandbox-deny-processing.sh`
Expected: FAIL with "Deny-path processing not implemented"

### Step 3: Write minimal implementation

Add after line 112 (after git detection block) in claude-worktree-sandbox.sh:

```bash
# Process denied paths from environment variable
denied_paths=()
if [[ -n "${DENY_PATHS:-}" ]]; then
 echo "🚫 Processing denied paths:" >&2
 while IFS= read -r path; do
  [[ -z "$path" ]] && continue

  # Validate path exists (warn if not, but continue - matches CCO)
  if [[ ! -e "$path" ]]; then
   echo "   ⚠️  Warning: deny-path doesn't exist: $path" >&2
  else
   denied_paths+=("$path")
   echo "   🚫 Denying access: $path" >&2
  fi
 done <<< "$DENY_PATHS"
 echo "" >&2
fi
```

### Step 4: Run test to verify it passes

Run: `bash packages/sandbox/test-sandbox-deny-processing.sh`
Expected: PASS with "Deny-path processing working"

### Step 5: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(sandbox): add deny-path processing from environment variable"
- Files: packages/sandbox/claude-worktree-sandbox.sh

---

## Task 5 - Add Seatbelt deny rules generation to policy file

### Files
- `packages/sandbox/claude-worktree-sandbox.sh:134` (MODIFY - add deny rules after line 134)

### Step 1: Write the failing test

Create test to verify Seatbelt policy contains deny rules:

```bash
# packages/sandbox/test-seatbelt-deny-rules.sh
#!/usr/bin/env bash

# Test that Seatbelt policy includes deny rules for denied paths

cd packages/sandbox

# Setup
mkdir -p /tmp/test-deny-dir
touch /tmp/test-deny-file.txt
export DENY_PATHS=$(printf '%s\n%s' "/tmp/test-deny-dir" "/tmp/test-deny-file.txt")

# Run policy generation portion and check output
result=$(bash -c '
# Mock the necessary functions
git() { return 1; }  # Not in git repo
command() { return 0; }  # sandbox-exec exists
export -f git command
export REAL_CLAUDE_PATH="/usr/local/bin/claude"

# Source just the policy generation part
source ./claude-worktree-sandbox.sh 2>&1 | grep -E "(deny file-read.*test-deny)" || echo "FAIL"
' 2>&1)

if [[ "$result" == "FAIL" ]]; then
    echo "FAIL: Seatbelt deny rules not generated"
    exit 1
fi

echo "PASS: Seatbelt deny rules generated"
```

### Step 2: Run test to verify it fails

Run: `bash packages/sandbox/test-seatbelt-deny-rules.sh`
Expected: FAIL with "Seatbelt deny rules not generated"

### Step 3: Write minimal implementation

Add after line 134 (after `echo "(deny file-write*)"`) in claude-worktree-sandbox.sh:

```bash
 # === DENY specified paths (read + write) ===
 for denied_path in "${denied_paths[@]}"; do
  if [[ -d "$denied_path" ]]; then
   # Directory: use subpath for recursive denial
   printf '(deny file-read* (subpath "%s"))\n' "$(escape_path "$denied_path")"
   printf '(deny file-write* (subpath "%s"))\n' "$(escape_path "$denied_path")"
  else
   # File: use literal for exact match
   printf '(deny file-read* (literal "%s"))\n' "$(escape_path "$denied_path")"
   printf '(deny file-write* (literal "%s"))\n' "$(escape_path "$denied_path")"
  fi
 done

 # === ALLOW writes to specific locations === (EXISTING COMMENT)
```

Note: The existing comment on line 136 will shift down - this is expected.

### Step 4: Run test to verify it passes

Run: `bash packages/sandbox/test-seatbelt-deny-rules.sh`
Expected: PASS with "Seatbelt deny rules generated"

### Step 5: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(sandbox): generate Seatbelt deny rules for denied paths"
- Files: packages/sandbox/claude-worktree-sandbox.sh

---

## Task 6 - Create Test 1: Verify deny-path blocks file access in worktree

### Files
- `packages/sandbox/tests/test-deny-path-blocks-access.sh` (CREATE & TEST)

### Step 1: Write the test

```bash
#!/usr/bin/env bash
# Test: Verify --deny-path blocks file access in worktree

set -euo pipefail

echo "=== Test 1: Deny-Path Blocks File Access in Worktree ==="

# Setup: Create test worktree
WORKTREE_DIR=".worktrees/test-deny-path-$(date +%s)"
git worktree add "$WORKTREE_DIR" -b test-deny-path-branch 2>/dev/null || true
cd "$WORKTREE_DIR"

# Create test skill file
mkdir -p /tmp/test-skills
echo "SECRET SKILL INSTRUCTIONS" > /tmp/test-skills/secret-skill.md

# Test: Try to read denied file
echo "Testing deny-path with file access..."
OUTPUT=$(../conditional-claude.sh --deny-path /tmp/test-skills/secret-skill.md "read /tmp/test-skills/secret-skill.md" 2>&1 || true)

# Verify: Should see sandbox messages and permission denial
if ! echo "$OUTPUT" | grep -q "🔒 Running Claude Code in Seatbelt sandbox"; then
    echo "❌ FAIL: Sandbox not activated"
    exit 1
fi

if ! echo "$OUTPUT" | grep -q "🚫 Denying access: /tmp/test-skills/secret-skill.md"; then
    echo "❌ FAIL: Deny-path not processed"
    exit 1
fi

# Note: We can't easily test that Claude gets permission denied without
# actually running Claude, so we verify the sandbox setup is correct

echo "✅ PASS: Deny-path correctly configured in sandbox"

# Cleanup
cd ../..
git worktree remove "$WORKTREE_DIR" --force 2>/dev/null || true
git branch -D test-deny-path-branch 2>/dev/null || true
rm -rf /tmp/test-skills
```

### Step 2: Run test to verify implementation works

Run: `bash packages/sandbox/tests/test-deny-path-blocks-access.sh`
Expected: PASS with "✅ PASS: Deny-path correctly configured in sandbox"

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "test(sandbox): add test for deny-path file access blocking"
- Files: packages/sandbox/tests/test-deny-path-blocks-access.sh

---

## Task 7 - Create Test 2: Verify error handling for missing --deny-path argument

### Files
- `packages/sandbox/tests/test-deny-path-error-handling.sh` (CREATE & TEST)

### Step 1: Write the test

```bash
#!/usr/bin/env bash
# Test: Verify error handling for missing --deny-path argument

set -euo pipefail

echo "=== Test 2: Error Handling - Missing Argument ==="

cd packages/sandbox

# Test: Run with --deny-path but no argument
OUTPUT=$(./conditional-claude.sh --deny-path 2>&1 || true)
EXIT_CODE=$?

# Verify: Should exit with code 1
if [[ $EXIT_CODE -ne 1 ]]; then
    echo "❌ FAIL: Expected exit code 1, got $EXIT_CODE"
    exit 1
fi

# Verify: Should show error message
if ! echo "$OUTPUT" | grep -q "Error: --deny-path requires a path argument"; then
    echo "❌ FAIL: Expected error message not found"
    echo "Got: $OUTPUT"
    exit 1
fi

echo "✅ PASS: Error handling works correctly"
```

### Step 2: Run test to verify implementation works

Run: `bash packages/sandbox/tests/test-deny-path-error-handling.sh`
Expected: PASS with "✅ PASS: Error handling works correctly"

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "test(sandbox): add test for deny-path error handling"
- Files: packages/sandbox/tests/test-deny-path-error-handling.sh

---

## Task 8 - Create Test 3: Verify transparent pass-through outside worktree

### Files
- `packages/sandbox/tests/test-deny-path-passthrough.sh` (CREATE & TEST)

### Step 1: Write the test

```bash
#!/usr/bin/env bash
# Test: Verify transparent pass-through outside worktree

set -euo pipefail

echo "=== Test 3: Transparent Outside Worktree ==="

# Navigate to main repo (not a worktree)
cd /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows

# Test: Run with --deny-path outside worktree
OUTPUT=$(packages/sandbox/conditional-claude.sh --deny-path ~/.ssh "show git status" 2>&1 || true)

# Verify: Should NOT show sandbox messages
if echo "$OUTPUT" | grep -q "🔍 Detected git worktree"; then
    echo "❌ FAIL: Sandbox should not activate outside worktree"
    exit 1
fi

if echo "$OUTPUT" | grep -q "🔒 Running Claude Code in Seatbelt sandbox"; then
    echo "❌ FAIL: Seatbelt should not activate outside worktree"
    exit 1
fi

# Note: We can't verify Claude executes normally without actually calling Claude
# But we can verify the wrapper doesn't activate sandboxing

echo "✅ PASS: Transparent pass-through works correctly"
```

### Step 2: Run test to verify implementation works

Run: `bash packages/sandbox/tests/test-deny-path-passthrough.sh`
Expected: PASS with "✅ PASS: Transparent pass-through works correctly"

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "test(sandbox): add test for deny-path transparent pass-through"
- Files: packages/sandbox/tests/test-deny-path-passthrough.sh

---

## Task 9 - Commit implementation with test results

### Files
- All modified files from previous tasks

### Step 1: Run all tests to verify complete implementation

```bash
# Run all unit tests
bash packages/sandbox/test-abs-path.sh
bash packages/sandbox/test-parse-deny-paths.sh
bash packages/sandbox/test-integration-deny-path.sh
bash packages/sandbox/test-sandbox-deny-processing.sh
bash packages/sandbox/test-seatbelt-deny-rules.sh

# Run all integration tests
bash packages/sandbox/tests/test-deny-path-blocks-access.sh
bash packages/sandbox/tests/test-deny-path-error-handling.sh
bash packages/sandbox/tests/test-deny-path-passthrough.sh
```

Expected: All tests PASS

### Step 2: Clean up test files

```bash
# Remove unit test files (keep integration tests)
rm packages/sandbox/test-abs-path.sh
rm packages/sandbox/test-parse-deny-paths.sh
rm packages/sandbox/test-integration-deny-path.sh
rm packages/sandbox/test-sandbox-deny-processing.sh
rm packages/sandbox/test-seatbelt-deny-rules.sh
```

### Step 3: Verify implementation meets success criteria

Check:
- ✅ All tests pass
- ✅ Implementation added ~60 lines total (35 conditional-claude.sh + 25 claude-worktree-sandbox.sh + 10 deny rules)
- ✅ No performance degradation (< 100ms overhead - verify with time command)
- ✅ Error messages are clear and actionable
- ✅ Behavior matches requirements FR1-FR9, NFR1-NFR5

### Step 4: Final commit

Use `create-git-commit` skill to commit:
- Message: "feat(sandbox): complete deny-path support implementation

  - Add --deny-path flag parsing to conditional-claude.sh
  - Add Seatbelt deny rules generation to claude-worktree-sandbox.sh
  - Add comprehensive test suite for deny-path functionality
  - Verify transparent pass-through outside worktrees
  - All tests passing, meets performance requirements"
- Files: All modified files

### Step 5: Document completion

Update design document status:
- Change status from "Design Complete" to "Implemented"
- Add implementation date
- Link to test results

---

## Execution Notes

**Prerequisites:**
- Git worktree support enabled
- macOS with sandbox-exec available
- Claude Code installed in PATH
- Test fixtures directory writable (/tmp)

**Testing Approach:**
- Unit tests for individual functions (abs_path, parse_deny_paths)
- Integration tests for end-to-end workflows
- Manual verification for Claude Code execution (optional)

**Common Issues:**
- Path resolution: Ensure tilde expansion works correctly
- Array handling: Bash arrays are tricky - use "${array[@]}" syntax
- Seatbelt syntax: Test policy generation with DEBUG=1 flag
- Worktree detection: Verify worktree detection works in test environment

**Performance Validation:**

```bash
# Benchmark wrapper overhead
time packages/sandbox/conditional-claude.sh --deny-path ~/.ssh --deny-path /tmp/test "help"
# Should be < 100ms overhead vs direct claude execution
```
