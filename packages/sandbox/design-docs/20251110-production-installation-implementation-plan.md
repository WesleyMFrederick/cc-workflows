# Production Installation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement PATH-based Claude interception using strict TDD (rewrite from scratch)

**Architecture:** Test-first development with RED-GREEN-REFACTOR cycles for each behavior

**Tech Stack:** Bash (wrapper scripts), Vitest (testing), Node.js (test harness), macOS Seatbelt (sandboxing)

**Reference:** [Design Document](20251110-production-installation-design.md)

---

## Task 1 - Setup: Create execution worktree and preserve POC

### Prerequisites
- Main repository must have no uncommitted changes
- Using `using-git-worktrees` skill for worktree creation

### Step 1: Create execution worktree

Use `using-git-worktrees` skill to create isolated worktree:
- Branch name: `feature/sandbox-production-tdd`
- Worktree location: `.worktrees/feature/sandbox-production-tdd`

### Step 2: Preserve POC implementation as reference

```bash
# Rename existing implementation
mv packages/sandbox/conditional-claude.sh packages/sandbox/conditional-claude.sh.poc
```

### Step 3: Create test infrastructure directories

```bash
mkdir -p packages/sandbox/test/helpers
mkdir -p packages/sandbox/test/fixtures
touch packages/sandbox/test/fixtures/.gitkeep
```

### Step 4: Commit setup

Use `create-git-commit` skill:
- Commit message: "chore(sandbox): setup TDD environment with POC preservation"

---

## Task 2 - Create test helper utilities

### Files
- `packages/sandbox/test/helpers/test-helpers.js` (CREATE)

### Step 1: Write test helper implementation

```javascript
// packages/sandbox/test/helpers/test-helpers.js
import { /* child_process, fs, path, os modules */ } from "node:*";

/**
 * Execute bash script and return output
 * Integration: Uses spawnSync for synchronous shell execution
 */
export function runScript(scriptPath, args = [], options = {}) {
  const defaultOptions = {
    encoding: 'utf8',
    ...options,
  };

  // Integration: Spawn bash script synchronously
  const result = /* spawnSync(scriptPath, args, defaultOptions) */;

  // Decision: Throw on non-zero exit with full context
  if (result.status !== 0) {
    const error = /* new Error with message, status, stdout, stderr */;
    throw error;
  }

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    status: result.status,
  };
}

/**
 * Create temporary git repository with worktree
 * Fixture: Real git repo structure for testing git detection
 * Integration: Uses real git commands via execSync
 *
 * Returns: { mainRepo: string, worktree: string, cleanup: function }
 */
export function createTestWorktree() {
  // --- Temp Directory Creation ---
  // Boundary: Create in OS temp location
  const testDir = /* mkdtempSync(join(tmpdir(), 'sandbox-test-')) */;

  // --- Git Initialization ---
  // Integration: Real git init command
  /* execSync('git init', { cwd: testDir }) */;
  /* execSync('git config user.email "test@example.com"', { cwd: testDir }) */;
  /* execSync('git config user.name "Test User"', { cwd: testDir }) */;

  // --- Initial Commit ---
  // Fixture: Minimal file for valid git repo
  /* writeFileSync(join(testDir, 'README.md'), '# Test Repo') */;
  /* execSync('git add .', { cwd: testDir }) */;
  /* execSync('git commit -m "Initial commit"', { cwd: testDir }) */;

  // --- Worktree Creation ---
  const worktreeDir = join(testDir, '.worktrees', 'test-branch');
  /* execSync(`git worktree add "${worktreeDir}" -b test-branch`, { cwd: testDir }) */;

  return {
    mainRepo: testDir,
    worktree: worktreeDir,
    cleanup: () => {
      // Pattern: Remove worktree before directory
      try {
        /* execSync(`git worktree remove "${worktreeDir}" --force`, { cwd: testDir }) */;
      } catch {
        // Ignore cleanup errors
      }
      /* rmSync(testDir, { recursive: true, force: true }) */;
    },
  };
}

/**
 * Create temporary directory (not a git repo)
 * Fixture: Non-git directory for negative test cases
 */
export function createTempDir() {
  const tempDir = /* mkdtempSync(join(tmpdir(), 'sandbox-nogit-')) */;
  return {
    path: tempDir,
    cleanup: () => /* rmSync(tempDir, { recursive: true, force: true }) */,
  };
}
```

### Step 2: Commit test helpers

Use `create-git-commit` skill:
- Commit message: "test(sandbox): add test helper utilities for git fixtures"

---

## Task 3 - RED-GREEN: Detect worktree context

### Files
- `packages/sandbox/test/conditional-claude-detection.test.js` (CREATE)
- `packages/sandbox/conditional-claude.sh` (CREATE)

### Step 1 (RED): Write failing test

```javascript
// packages/sandbox/test/conditional-claude-detection.test.js
import { /* Vitest imports */ } from "vitest";
import { /* test helper imports */ } from "./helpers/test-helpers.js";

const conditionalClaudePath = /* resolve script path */;

describe("Worktree Detection", () => {
  let testFixture;

  afterEach(() => {
    if (testFixture?.cleanup) testFixture.cleanup();
  });

  it("should detect when inside git worktree", () => {
    // Given: A git repository with a worktree
    // Fixture: Real git repo with worktree structure
    testFixture = /* createTestWorktree() */;

    // When: conditional-claude.sh executes in the worktree
    // Integration: Real bash script execution
    const result = /* runScript(conditionalClaudePath, ['-p', 'echo test'], { cwd: testFixture.worktree }) */;

    // Then: Output indicates worktree was detected
    // Verification: Sandbox diagnostic messages appear in stderr
    expect(result.stderr).toContain('🔍 Detected git worktree');
    expect(result.stderr).toContain('🔒 Running Claude Code in Seatbelt sandbox');
  });
});
```

### Step 2 (RED): Run test and verify FAIL

Run: `npm test packages/sandbox/test/conditional-claude-detection.test.js`

Expected: FAIL (script doesn't exist)

### Step 3 (RED): Commit failing test

Use `create-git-commit` skill:
- Commit message: "test(sandbox): RED - add test for worktree detection"

### Step 4 (GREEN): Create minimal script with worktree detection

```bash
#!/usr/bin/env bash
# conditional-claude.sh - Smart wrapper for Claude with auto-sandboxing

set -euo pipefail

# Detect if we're in a git worktree
# Integration: Reference .poc file for implementation pattern
detect_worktree() {
    # --- Git Repository Check ---
    # Boundary: Check if we're in any git repo
    if ! git rev-parse --git-dir &>/dev/null 2>&1; then
        return 1  # Not in git repo
    fi

    # --- Directory Resolution ---
    # Integration: Use git rev-parse for worktree detection
    local common_dir git_dir
    common_dir="$(/* git rev-parse --git-common-dir */)"
    git_dir="$(/* git rev-parse --git-dir */)"

    # --- Path Normalization ---
    # Pattern: Convert relative to absolute for comparison
    if [[ -n "$common_dir" && "$common_dir" != /* ]]; then
        common_dir="$(/* cd to toplevel, cd to common_dir, pwd -P */)"
    fi
    if [[ -n "$git_dir" && "$git_dir" != /* ]]; then
        git_dir="$(/* cd to git_dir, pwd -P */)"
    fi

    # --- Worktree Detection ---
    # Decision: Different dirs = worktree
    if [[ -n "$common_dir" && -n "$git_dir" && "$common_dir" != "$git_dir" ]]; then
        return 0  # In worktree
    fi

    return 1  # Not in worktree
}

# Get script directory
script_dir="$(/* resolve script directory */)"

# --- Main Logic ---
if detect_worktree; then
    # Integration: Route to sandbox wrapper
    exec "$script_dir/claude-worktree-sandbox.sh" "$@"
else
    # Decision: Fail for now (will implement in later task)
    echo "Not in worktree - real claude routing not yet implemented" >&2
    exit 1
fi
```

### Step 5 (GREEN): Make script executable

Run: `chmod +x packages/sandbox/conditional-claude.sh`

### Step 6 (GREEN): Run test and verify PASS

Run: `npm test packages/sandbox/test/conditional-claude-detection.test.js`

Expected: PASS

### Step 7 (GREEN): Commit passing implementation

Use `create-git-commit` skill:
- Commit message: "feat(sandbox): GREEN - implement worktree detection logic"

---

## Task 4 - RED-GREEN: Detect regular repository

### Files
- `packages/sandbox/test/conditional-claude-detection.test.js` (MODIFY)

### Step 1 (RED): Add test for regular repo

```javascript
// Add to existing describe block in conditional-claude-detection.test.js

it("should detect when in regular git repository", () => {
  // Given: A regular git repository (not a worktree)
  testFixture = /* createTestWorktree() */;

  // When: conditional-claude.sh executes in main repo
  const result = /* runScript in mainRepo directory */;

  // Then: No sandbox messages appear
  // Verification: Regular claude behavior (no worktree markers)
  expect(result.stderr).not.toContain('🔍 Detected git worktree');
  expect(result.stderr).not.toContain('🔒 Running Claude Code in Seatbelt sandbox');
});
```

### Step 2 (RED): Run test and verify FAIL

Run: `npm test packages/sandbox/test/conditional-claude-detection.test.js`

Expected: Test "should detect when in regular git repository" - FAIL

### Step 3 (RED): Commit failing test

Use `create-git-commit` skill:
- Commit message: "test(sandbox): RED - add test for regular repo detection"

### Step 4 (GREEN): Implementation already handles this

The existing `detect_worktree()` function already returns false (exit 1) for regular repos where `common_dir == git_dir`. However, the script currently exits with error for non-worktrees.

This test will remain failing until Task 6 when we implement real claude routing.

### Step 5: Skip GREEN for now

This test requires real claude routing (Task 6). Mark this as "will pass after Task 6" and continue.

---

## Task 5 - RED-GREEN: Detect no git repository

### Files
- `packages/sandbox/test/conditional-claude-detection.test.js` (MODIFY)

### Step 1 (RED): Add test for no git repo

```javascript
// Add to existing describe block

it("should detect when not in git repository", () => {
  // Given: A directory that is not a git repository
  // Fixture: Non-git temp directory
  testFixture = /* createTempDir() */;

  // When: conditional-claude.sh executes in non-git directory
  const result = /* runScript in non-git directory */;

  // Then: No sandbox messages appear
  // Verification: Regular claude behavior
  expect(result.stderr).not.toContain('🔍 Detected git worktree');
  expect(result.stderr).not.toContain('🔒 Running Claude Code in Seatbelt sandbox');
});
```

### Step 2 (RED): Run test and verify FAIL

Run: `npm test packages/sandbox/test/conditional-claude-detection.test.js`

Expected: Test "should detect when not in git repository" - FAIL

### Step 3 (RED): Commit failing test

Use `create-git-commit` skill:
- Commit message: "test(sandbox): RED - add test for no git repo detection"

### Step 4: Skip GREEN for now

This test also requires real claude routing (Task 6). Continue to next task.

---

## Task 6 - RED-GREEN: Route to real claude when not in worktree

### Files
- `packages/sandbox/test/conditional-claude-routing.test.js` (CREATE)
- `packages/sandbox/conditional-claude.sh` (MODIFY)

### Step 1 (RED): Write test for real claude routing

```javascript
// packages/sandbox/test/conditional-claude-routing.test.js
import { /* Vitest imports */ } from "vitest";
import { /* test helper imports */ } from "./helpers/test-helpers.js";

const conditionalClaudePath = /* resolve path */;

describe("Routing to Real Claude", () => {
  let testFixture;

  afterEach(() => {
    if (testFixture?.cleanup) testFixture.cleanup();
  });

  it("should route to real claude when in regular repo", () => {
    // Given: Inside a regular git repository
    testFixture = /* createTestWorktree() */;

    // When: Execute claude command in main repo
    const result = /* runScript in mainRepo */;

    // Then: Real claude was invoked (no sandbox messages)
    // Verification: Command executes, no error about "not yet implemented"
    expect(result.stderr).not.toContain('🔒 Running Claude Code in Seatbelt sandbox');
    expect(result.stderr).not.toContain('not yet implemented');
    expect(result.status).toBe(0);
  });
});
```

### Step 2 (RED): Run test and verify FAIL

Run: `npm test packages/sandbox/test/conditional-claude-routing.test.js`

Expected: FAIL (exits with "not yet implemented" error)

### Step 3 (RED): Commit failing test

Use `create-git-commit` skill:
- Commit message: "test(sandbox): RED - add test for real claude routing"

### Step 4 (GREEN): Implement find_real_claude function

```bash
# Add to conditional-claude.sh before main logic

# Find real claude binary (excluding this wrapper)
# Integration: Reference .poc file for implementation
find_real_claude() {
    # --- Wrapper Location ---
    # Boundary: Get this wrapper's directory
    local wrapper_dir="$(/* resolve script directory to absolute */)"

    # --- PATH Search ---
    # Pattern: Iterate PATH, skip wrapper location
    local IFS=':'
    for dir in $PATH; do
        # Pattern: Resolve to absolute path
        local abs_dir="$(/* resolve dir to absolute or keep as-is */)"

        # Decision: Skip wrapper directory
        if [[ "$abs_dir" == "$wrapper_dir" ]]; then
            continue
        fi

        # Boundary: Check for executable claude
        if [[ -x "$abs_dir/claude" ]]; then
            echo "$abs_dir/claude"
            return 0
        fi
    done

    return 1  # Not found
}

# Modify main logic else block:
else
    # --- Find Real Claude ---
    # Boundary: Search PATH for real claude
    real_claude="$(find_real_claude)"

    # Decision: Error if not found
    if [[ -z "$real_claude" ]]; then
        echo "❌ Error: Real 'claude' command not found in PATH" >&2
        echo "   ~/.local/bin/claude is a wrapper - ensure real claude is installed" >&2
        exit 127
    fi

    # Integration: Execute real claude
    exec "$real_claude" "$@"
fi
```

### Step 5 (GREEN): Run test and verify PASS

Run: `npm test packages/sandbox/test/conditional-claude-routing.test.js`

Expected: PASS (also fixes Task 4 and Task 5 tests)

### Step 6 (GREEN): Run all detection tests

Run: `npm test packages/sandbox/test/conditional-claude-detection.test.js`

Expected: All 3 detection tests now PASS

### Step 7 (GREEN): Commit implementation

Use `create-git-commit` skill:
- Commit message: "feat(sandbox): GREEN - implement real claude routing with PATH search"

---

## Task 7 - RED-GREEN: Route to sandbox in worktree

### Files
- `packages/sandbox/test/conditional-claude-routing.test.js` (MODIFY)

### Step 1 (RED): Add test for sandbox routing

```javascript
// Add to existing describe block in conditional-claude-routing.test.js

it("should route to sandboxed wrapper when in worktree", () => {
  // Given: Inside a git worktree
  testFixture = /* createTestWorktree() */;

  // When: Execute claude command in worktree
  const result = /* runScript in worktree */;

  // Then: Sandbox wrapper was invoked
  // Verification: Sandbox messages AND worktree details appear
  expect(result.stderr).toContain('🔒 Running Claude Code in Seatbelt sandbox');
  expect(result.stderr).toContain('Work tree:');
  expect(result.stderr).toContain('Common .git:');
});
```

### Step 2 (RED): Run test and verify FAIL or PASS

Run: `npm test packages/sandbox/test/conditional-claude-routing.test.js`

Expected: Might already PASS if worktree routing works. If FAIL, verify error.

### Step 3: Verify implementation

The worktree routing code already exists from Task 3 (routes to `claude-worktree-sandbox.sh`). This test should pass.

### Step 4: Commit test

Use `create-git-commit` skill:
- Commit message: "test(sandbox): add test for sandbox routing in worktree"

---

## Task 8 - RED-GREEN: Pass through single flag

### Files
- `packages/sandbox/test/conditional-claude-flags.test.js` (CREATE)

### Step 1 (RED): Write test for single flag

```javascript
// packages/sandbox/test/conditional-claude-flags.test.js
import { /* Vitest imports */ } from "vitest";
import { /* test helper imports */ } from "./helpers/test-helpers.js";

const conditionalClaudePath = /* resolve path */;

describe("Flag Pass-Through", () => {
  let testFixture;

  afterEach(() => {
    if (testFixture?.cleanup) testFixture.cleanup();
  });

  it("should pass through print flag", () => {
    // Given: Inside a worktree
    testFixture = /* createTestWorktree() */;

    // When: Execute with -p flag
    // Pattern: Test flag doesn't cause errors
    const result = /* runScript with ['-p', 'echo TESTOUTPUT'] */;

    // Then: Command executed with flag
    // Verification: Exit code 0, output contains expected text
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('TESTOUTPUT');
  });
});
```

### Step 2 (RED): Run test and verify FAIL or PASS

Run: `npm test packages/sandbox/test/conditional-claude-flags.test.js`

Expected: Should PASS (script uses `"$@"` which preserves all arguments)

### Step 3: Commit test

Use `create-git-commit` skill:
- Commit message: "test(sandbox): add test for single flag pass-through"

---

## Task 9 - RED-GREEN: Pass through multiple flags

### Files
- `packages/sandbox/test/conditional-claude-flags.test.js` (MODIFY)

### Step 1 (RED): Add test for multiple flags

```javascript
// Add to existing describe block

it("should pass through multiple combined flags", () => {
  // Given: Inside a worktree with multiple flags
  testFixture = /* createTestWorktree() */;

  // When: Execute with multiple flags
  const result = /* runScript with ['--model', 'sonnet', '--verbose', '-p', 'echo test'] */;

  // Then: All flags accepted without errors
  // Verification: Exit success, no "unknown option" errors
  expect(result.status).toBe(0);
  expect(result.stderr).not.toContain('unknown option');
  expect(result.stderr).not.toContain('invalid flag');
});
```

### Step 2 (RED): Run test and verify PASS

Run: `npm test packages/sandbox/test/conditional-claude-flags.test.js`

Expected: PASS (script already preserves all flags)

### Step 3: Commit test

Use `create-git-commit` skill:
- Commit message: "test(sandbox): add test for multiple flag pass-through"

---

## Task 10 - RED-GREEN: Error when real claude not found

### Files
- `packages/sandbox/test/conditional-claude-errors.test.js` (CREATE)

### Step 1 (RED): Write test for missing claude error

```javascript
// packages/sandbox/test/conditional-claude-errors.test.js
import { /* Vitest imports */ } from "vitest";
import { /* test helper imports */ } from "./helpers/test-helpers.js";

const conditionalClaudePath = /* resolve path */;

describe("Error Handling", () => {
  let testFixture;

  afterEach(() => {
    if (testFixture?.cleanup) testFixture.cleanup();
  });

  it("should error when real claude not found in PATH", () => {
    // Given: Regular directory with PATH excluding real claude
    testFixture = /* createTempDir() */;

    // When: Execute wrapper with minimal PATH
    // Pattern: Expect throw, catch and assert error properties
    try {
      /* runScript with env: { PATH: '/usr/bin:/bin' } */;
      throw new Error('Should have thrown error');
    } catch (error) {
      // Then: Error message indicates real claude not found
      // Verification: Specific error text AND exit code 127
      expect(error.stderr || error.message).toContain('Real \'claude\' command not found');
      expect(error.status).toBe(127);
    }
  });
});
```

### Step 2 (RED): Run test and verify FAIL or PASS

Run: `npm test packages/sandbox/test/conditional-claude-errors.test.js`

Expected: Should PASS (error handling already implemented in Task 6)

### Step 3: Commit test

Use `create-git-commit` skill:
- Commit message: "test(sandbox): add test for real claude not found error"

---

## Task 11 - Create installation script

### Files
- `packages/sandbox/install-claude-wrapper.sh` (CREATE)

### Step 1: Create installation script with dry-run mode

```bash
#!/usr/bin/env bash
# install-claude-wrapper.sh - Install PATH-based Claude interception

set -euo pipefail

# --- Color Definitions ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# --- Dry Run Detection ---
DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}🔍 DRY RUN MODE${NC}\n"
fi

# --- Path Setup ---
SCRIPT_DIR="$(/* resolve script directory */)"
CONDITIONAL_CLAUDE_PATH="$SCRIPT_DIR/conditional-claude.sh"
LOCAL_BIN_DIR="$HOME/.local/bin"
SYMLINK_PATH="$LOCAL_BIN_DIR/claude"

# --- Step 1: Create Directory ---
echo -e "${BLUE}Step 1: Creating ~/.local/bin directory${NC}"
if [[ ! -d "$LOCAL_BIN_DIR" ]]; then
    if [[ "$DRY_RUN" == true ]]; then
        echo "  Would create: $LOCAL_BIN_DIR"
    else
        /* mkdir -p */
        echo -e "  ${GREEN}✓${NC} Created"
    fi
else
    echo -e "  ${GREEN}✓${NC} Already exists"
fi
echo ""

# --- Step 2: Create Symlink ---
echo -e "${BLUE}Step 2: Creating symlink${NC}"
if [[ -e "$SYMLINK_PATH" ]]; then
    if [[ -L "$SYMLINK_PATH" ]]; then
        # Pattern: Handle existing symlink
        existing_target="$(/* readlink */)"
        echo -e "  ${YELLOW}⚠${NC} Symlink exists"
        echo "  Current: $existing_target"
        echo "  New: $CONDITIONAL_CLAUDE_PATH"

        if [[ "$DRY_RUN" == true ]]; then
            echo "  Would replace"
        else
            /* prompt and replace if confirmed */
        fi
    else
        echo -e "  ${RED}✗${NC} File exists (not symlink)"
        exit 1
    fi
else
    if [[ "$DRY_RUN" == true ]]; then
        echo "  Would create: $SYMLINK_PATH -> $CONDITIONAL_CLAUDE_PATH"
    else
        /* ln -s */
        echo -e "  ${GREEN}✓${NC} Created"
    fi
fi
echo ""

# --- Step 3: Verify PATH ---
echo -e "${BLUE}Step 3: Verifying PATH${NC}"
if [[ ":$PATH:" == *":$LOCAL_BIN_DIR:"* ]]; then
    echo -e "  ${GREEN}✓${NC} In PATH"
else
    echo -e "  ${RED}✗${NC} NOT in PATH"
    echo "  Add to ~/.zshrc: export PATH=\"\$HOME/.local/bin:\$PATH\""
fi
echo ""

# --- Step 4: Verification Steps ---
if [[ "$DRY_RUN" == false ]]; then
    echo -e "${BLUE}Verification:${NC}"
    echo "  which claude"
    echo "  ls -l \$(which claude)"
fi
```

### Step 2: Make executable and commit

Run: `chmod +x packages/sandbox/install-claude-wrapper.sh`

Use `create-git-commit` skill:
- Commit message: "feat(sandbox): add installation script with dry-run mode"

---

## Task 12 - Create verification script

### Files
- `packages/sandbox/verify-installation.sh` (CREATE)

### Step 1: Create verification script

```bash
#!/usr/bin/env bash
# verify-installation.sh - Verify Claude wrapper installation

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Installation Verification ===${NC}\n"

ERRORS=0
WARNINGS=0

# --- Check 1: Directory ---
echo -e "${BLUE}Check 1: ~/.local/bin${NC}"
if [[ -d "$HOME/.local/bin" ]]; then
    echo -e "  ${GREEN}✓${NC} Exists"
else
    echo -e "  ${RED}✗${NC} Missing"
    ((ERRORS++))
fi
echo ""

# --- Check 2: Symlink ---
echo -e "${BLUE}Check 2: Symlink${NC}"
if [[ -L "$HOME/.local/bin/claude" ]]; then
    echo -e "  ${GREEN}✓${NC} Exists"
    target="$(/* readlink */)"
    echo "  Target: $target"
else
    echo -e "  ${RED}✗${NC} Missing"
    ((ERRORS++))
fi
echo ""

# --- Check 3: PATH ---
echo -e "${BLUE}Check 3: PATH${NC}"
if [[ ":$PATH:" == *":$HOME/.local/bin:"* ]]; then
    echo -e "  ${GREEN}✓${NC} In PATH"
else
    echo -e "  ${RED}✗${NC} NOT in PATH"
    ((ERRORS++))
fi
echo ""

# --- Check 4: which Resolution ---
echo -e "${BLUE}Check 4: which claude${NC}"
which_result="$(/* which claude */)"
if [[ "$which_result" == "$HOME/.local/bin/claude" ]]; then
    echo -e "  ${GREEN}✓${NC} Resolves to wrapper"
else
    echo -e "  ${YELLOW}⚠${NC} Incorrect resolution"
    ((WARNINGS++))
fi
echo ""

# --- Check 5: Real Claude ---
echo -e "${BLUE}Check 5: Real claude binary${NC}"
found_claude=false
IFS=':'
for dir in $PATH; do
    if [[ -x "$dir/claude" && "$dir" != "$HOME/.local/bin" ]]; then
        echo -e "  ${GREEN}✓${NC} Found"
        echo "  Location: $dir/claude"
        found_claude=true
        break
    fi
done
if [[ "$found_claude" == false ]]; then
    echo -e "  ${RED}✗${NC} Not found"
    ((ERRORS++))
fi
echo ""

# --- Summary ---
echo -e "${BLUE}=== Summary ===${NC}"
if [[ $ERRORS -eq 0 && $WARNINGS -eq 0 ]]; then
    echo -e "${GREEN}✓ All checks passed${NC}"
    exit 0
elif [[ $ERRORS -eq 0 ]]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s), $WARNINGS warning(s)${NC}"
    exit 1
fi
```

### Step 2: Make executable and commit

Run: `chmod +x packages/sandbox/verify-installation.sh`

Use `create-git-commit` skill:
- Commit message: "feat(sandbox): add verification script for installation"

---

## Task 13 - Create installation documentation

### Files
- `packages/sandbox/INSTALLATION.md` (CREATE)

### Step 1: Create comprehensive installation guide

Document structure:

```markdown
# Claude Wrapper Installation Guide

## Prerequisites
- macOS with sandbox-exec
- Existing claude installation
- Git with worktrees
- zsh or bash shell

## Quick Install
1. Run installation script
2. Update PATH (if needed)
3. Verify installation

## Manual Installation
1. Create ~/.local/bin directory
2. Create symlink
3. Update PATH
4. Verify

## Testing Installation
- Test in worktree (should show sandbox)
- Test in regular repo (no sandbox)
- Test outside git (no sandbox)

## Troubleshooting
- PATH ordering issues
- Real claude not found
- Symlink broken
- Sandbox applies incorrectly

## Uninstallation
- Remove symlink
- Remove PATH config
- Verify removal

## Debug Mode
- Use DEBUG=1 for verbose output
```

Reference: See design doc [Setup Procedure](20251110-production-installation-design.md#Setup%20Procedure%20(MVP)) for detailed content.

### Step 2: Commit documentation

Use `create-git-commit` skill:
- Commit message: "docs(sandbox): add installation guide with troubleshooting"

---

## Execution Summary

**TDD Approach:**
- ✅ Each behavior: ONE task with RED-GREEN-REFACTOR cycle
- ✅ Test first, watch fail, implement minimal code, watch pass
- ✅ POC preserved as `.poc` reference file
- ✅ Tests use real git repos (temporary fixtures in /tmp)

**Deliverables:**
- 13 tasks with proper TDD sequencing
- Test infrastructure with git fixture helpers
- Production `conditional-claude.sh` built from scratch via TDD
- Installation and verification scripts
- Comprehensive documentation

**Post-Implementation:**
1. Run full test suite: `npm test packages/sandbox/test/`
2. Run installation: `./packages/sandbox/install-claude-wrapper.sh`
3. Verify: `./packages/sandbox/verify-installation.sh`
4. Test in real worktrees and regular repos
