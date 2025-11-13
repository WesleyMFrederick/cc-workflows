# Production Installation Design: PATH-Based Claude Interception

## Context

The POC validation (POC-1 and POC-2) proved that Seatbelt sandboxing works for git worktrees and that conditional wrapper detection is reliable. Now we need to productionize the installation so that:

1. **All `claude` invocations** (interactive shell AND automated scripts) are intercepted
2. **Worktree sandboxing** happens automatically when inside a worktree
3. **Normal behavior** is preserved when outside worktrees
4. **Setup is MVP-simple** for immediate use today/tomorrow

**Parent Story:** [USER-STORY.md](../USER-STORY.md)

## Requirements Clarification

### New Requirements Discovered

During design discussion, we clarified critical requirements not captured in original user story:

1. **Script Compatibility**: The `claude` command is invoked by automation scripts (e.g., `claude-p` for non-interactive execution). These scripts MUST benefit from automatic sandboxing when run inside worktrees.

2. **Universal Interception**: A shell alias is insufficient because it only works in interactive shells. We need PATH-based interception to catch all invocations.

3. **MVP Setup Model**: For MVP, manual setup by the developer is acceptable. Packaging and automated installation can be deferred to post-MVP.

## Architectural Decision: PATH Symlink Approach

### Decision

Use **PATH-based symlink interception** where:
- `~/.local/bin/claude` (symlink) → `packages/sandbox/conditional-claude.sh`
- `~/.local/bin` is prepended to PATH to take priority over real `claude` binary
- All invocations (shell, scripts, tools) automatically route through wrapper

### Why This Approach

**Evaluated Against Architecture Principles:**

✅ **MVP-First Approach**: Simple enough to implement today, no packaging/npm complexity
✅ **Simplicity First**: Single symlink + PATH configuration, no exotic mechanisms
✅ **Foundation Reuse**: Leverages existing POC scripts, standard Unix PATH mechanism
✅ **Reality Check**: Solves the actual requirement (script compatibility) without over-engineering

### Rejected Alternatives

**Shell Alias**: Only works in interactive shell, doesn't intercept scripts → fails script compatibility requirement

**Rename Real Claude**: Too invasive, breaks on claude updates, not reversible → violates MVP simplicity

**npm Global Package**: Adds packaging complexity, not needed for MVP → deferred to post-MVP

## Design Overview

### Architecture Diagram

```plaintext
┌─────────────────────────────────────────────────────────────┐
│  Any Process Invokes: claude [args...]                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  PATH Resolution           │
         │  Searches: ~/.local/bin    │  ◄─── Priority #1
         │  Finds: claude (symlink)   │
         └────────────┬───────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────┐
    │  conditional-claude.sh                  │
    │  (in packages/sandbox/)                 │
    └─────────────┬───────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Detect Context │
         └────────┬───────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
  ┌──────────┐      ┌─────────────┐
  │ Worktree │      │ Not Worktree│
  └────┬─────┘      └──────┬──────┘
       │                   │
       ▼                   ▼
┌─────────────────┐  ┌───────────────┐
│ claude-worktree-│  │  Real claude  │
│ sandbox.sh      │  │  binary       │
│ (Seatbelt)      │  │  (passthrough)│
└─────────────────┘  └───────────────┘
```

### Component Responsibilities

**conditional-claude.sh** (Decision Engine)
- Detects git worktree context via `git rev-parse`
- Routes to sandboxed wrapper OR real claude binary
- Passes all arguments transparently via `"$@"`

**claude-worktree-sandbox.sh** (Security Engine)
- Generates Seatbelt policy for worktree isolation
- Executes claude with `--dangerously-skip-permissions` (safe inside sandbox)
- Allows writes to: worktree dir, parent `.git`, claude config, system temp, keychains

**Real Claude Binary** (Fallback)
- Unmodified claude installation
- Invoked when outside worktrees

## Installation Design

### Directory Structure

```plaintext
packages/sandbox/
├── conditional-claude.sh          # Wrapper (detection logic)
├── claude-worktree-sandbox.sh     # Sandboxing logic (Seatbelt)
├── USER-STORY.md                  # Requirements
├── design-docs/
│   ├── poc-1-sandboxed-commit-capability.md
│   ├── poc-2-conditional-wrapper.md
│   └── 20251110-production-installation-design.md  (this file)
└── ... (other scripts, docs)

~/.local/bin/
└── claude -> /absolute/path/to/packages/sandbox/conditional-claude.sh
```

### Setup Procedure (MVP)

**Prerequisites:**
- macOS with `sandbox-exec` command
- Existing `claude` installation
- Git repository with worktrees

**Installation Steps:**

1. **Ensure `~/.local/bin` exists**

   ```bash
   mkdir -p ~/.local/bin
   ```

2. **Find real claude location**

   ```bash
   which claude
   # Expected: /usr/local/bin/claude or similar
   ```

3. **Add `~/.local/bin` to PATH (if not present)**

   ```bash
   # Add to ~/.zshrc (MUST be before other PATH additions)
   export PATH="$HOME/.local/bin:$PATH"

   # Reload shell
   source ~/.zshrc
   ```

4. **Create symlink**

   ```bash
   ln -sf /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/packages/sandbox/conditional-claude.sh ~/.local/bin/claude
   ```

5. **Verify installation**

   ```bash
   # Should show ~/.local/bin/claude (the symlink)
   which claude

   # Should show the symlink target
   ls -l $(which claude)
   ```

6. **Test in worktree**

   ```bash
   cd .worktrees/some-worktree
   claude -p "What is 2+2?"
   # Should see: "🔍 Detected git worktree" and "🔒 Running Claude Code in Seatbelt sandbox"
   ```

7. **Test outside worktree**

   ```bash
   cd /path/to/regular/repo
   claude -p "What is 2+2?"
   # Should run normally, no sandbox messages
   ```

### Validation Tests

#### Test 1: Interactive Shell Invocation

```bash
cd .worktrees/test-worktree
claude "show git status"
# Expected: Sandboxed, shows worktree detection
```

#### Test 2: Script Invocation (e.g., claude-p)

```bash
cd .worktrees/test-worktree
claude-p "echo test"  # Assuming claude-p calls `claude` internally
# Expected: Sandboxed automatically
```

#### Test 3: Regular Repo (No Sandbox)

```bash
cd /path/to/main/repo
claude "show git status"
# Expected: No sandbox, normal claude behavior
```

#### Test 4: No Git Repo

```bash
cd /tmp
claude "echo hello"
# Expected: No sandbox, normal claude behavior
```

#### Test 5: Flag Pass-through

```bash
cd .worktrees/test-worktree
claude --model sonnet --verbose -p "test"
# Expected: All flags passed correctly, sandboxed
```

## Behavior Specification

### Worktree Detection Logic

**Detection Criteria:**

```bash
common_dir=$(git rev-parse --git-common-dir 2>/dev/null)
git_dir=$(git rev-parse --git-dir 2>/dev/null)

if [[ "$common_dir" != "$git_dir" ]]; then
    # Different dirs = worktree
    USE_SANDBOX=true
else
    # Same dir = regular repo or no git
    USE_SANDBOX=false
fi
```

### Sandboxing Policy

When sandboxed, Seatbelt policy allows writes to:

**Worktree Operations:**
- Current working directory (the worktree)
- Parent `.git` directory (for commits, refs, objects)
- Worktree-specific `.git` file

**Claude Operations:**
- `~/.claude` directory
- `~/.config/claude` directory
- `~/.claude.json` file

**System Operations:**
- Temp directories (`/tmp`, `/var/tmp`, `/var/folders`)
- Device files (`/dev/null`, `/dev/tty`, etc.)
- User Library folders (Caches, Logs, Application Support)
- Keychain (for OAuth token refresh)

**Everything Else:** Read-only or denied

### Debug Mode

Set `DEBUG=1` or `CCO_DEBUG=1` to see generated Seatbelt policy:

```bash
DEBUG=1 claude "commit changes"
# Shows:
# === Generated Seatbelt Policy ===
# (version 1)
# (allow default)
# (deny file-write*)
# ... (full policy)
# =================================
```

## Edge Cases and Error Handling

### Edge Case: Real Claude Not Found

**Scenario:** `conditional-claude.sh` can't find real `claude` binary

**Behavior:** Error message to stderr, exit code 127

**Example:**

```plaintext
❌ Error: Real 'claude' command not found in PATH
   ~/.local/bin/claude is a wrapper - ensure real claude is installed
```

### Edge Case: Missing `sandbox-exec`

**Scenario:** User is not on macOS or `sandbox-exec` is unavailable

**Behavior:** `claude-worktree-sandbox.sh` detects and errors

**Example:**

```plaintext
❌ Error: sandbox-exec not found (macOS only)
   This script uses macOS Seatbelt for sandboxing
```

### Edge Case: PATH Ordering Wrong

**Scenario:** Real `claude` appears before `~/.local/bin` in PATH

**Behavior:** Wrapper never invoked, no sandboxing

**Detection:**

```bash
which claude
# If shows /usr/local/bin/claude instead of ~/.local/bin/claude
# PATH ordering is wrong
```

**Fix:** Move `export PATH="$HOME/.local/bin:$PATH"` to top of `~/.zshrc`

### Edge Case: Symlink Broken

**Scenario:** Symlink target moved or deleted

**Behavior:** Shell reports "command not found"

**Fix:** Recreate symlink with correct path

## Acceptance Criteria Mapping

This design satisfies all original acceptance criteria plus new requirements:

### Original AC (All Met by POCs)
- [x] Script auto-detects git worktree configuration
- [x] Detects parent `.git` directory location
- [x] Generates Seatbelt policy with proper restrictions
- [x] Runs Claude with `--dangerously-skip-permissions`
- [x] Works without CLI arguments
- [x] Provides informative output
- [x] Supports `DEBUG=1` mode
- [x] Conditional wrapper detects context correctly
- [x] All flags pass through transparently
- [x] Handles edge cases (regular repo, no git, missing sandbox-exec)

### New AC (Added from Design Discussion)
- [ ] Installation uses PATH-based symlink interception
- [ ] Works for both interactive shell AND script invocations
- [ ] `~/.local/bin` is configured in PATH with priority
- [ ] Symlink points to repo version (packages/sandbox/)
- [ ] Validated with automated scripts (e.g., claude-p)
- [ ] Setup documented for MVP manual installation

## Success Metrics

**Functional:**
- Any process invoking `claude` (shell or script) gets automatic sandboxing in worktrees
- Zero behavior change for code outside worktrees
- All existing scripts (claude-p, etc.) work unchanged

**Operational:**
- Setup time: < 5 minutes
- Zero performance overhead outside worktrees
- Minimal overhead inside worktrees (Seatbelt policy generation ~10ms)

**Safety:**
- Files outside worktree remain protected from accidental modification
- Git operations (commit, push, branch) work automatically
- No false positives (no sandbox when not in worktree)

## Testing Strategy

### Philosophy and Principles

Following workspace testing standards:
- **MVP-Focused Testing**: Target 0.3:1 to 0.5:1 test-to-code ratio
- **Integration-Driven**: Prove system behavior works end-to-end
- **Real Systems, Fake Fixtures**: Test against real shell execution, real git commands, real file system
- **Zero Mocking**: No mocks for system commands or shell behavior
- **Test-Driven Development**: Write test first, watch it fail, write minimal code to pass

### Testing Approach

**Test Level:** CLI Integration Tests using workspace Vitest framework

**Rationale:**
- Shell scripts are orchestration code (detect context → route → exec)
- Value comes from proving the integrated system works (PATH resolution, git detection, sandbox execution)
- Unit testing individual shell functions provides minimal confidence
- Integration tests validate acceptance criteria directly

### TDD Implementation Strategy

**Approach:** Rewrite `conditional-claude.sh` from scratch using strict TDD

1. **Preserve POC**: Rename existing `conditional-claude.sh` to `conditional-claude.sh.poc` for reference
2. **RED-GREEN-REFACTOR**: Each behavior gets one task with:
   - RED: Write test, run (verify FAIL), commit
   - GREEN: Write minimal code to pass, run (verify PASS), commit
   - REFACTOR: Clean up if needed, keep tests green, commit
3. **Reference POC**: Use `.poc` file as implementation reference when writing GREEN code
4. **No code before test**: Delete any code written before its test (Iron Law)

**Test Fixture Pattern:**
- **Static fixtures**: Checked into `packages/sandbox/test/fixtures/` (markdown files, configs)
- **Dynamic fixtures**: Created in `/tmp` during test execution (git repos with worktrees)
- **Rationale**: Cannot check git repos into git repos (nested `.git`), so test helpers create temporary repos for git-dependent tests

**Execution Context:**
- Implementation happens in git worktree (using `using-git-worktrees` skill)
- Test helpers create separate temporary git repos in `/tmp` for test fixtures
- Tests run against real git commands in temporary repos

### Test Categories and Scenarios

#### Category 1: Worktree Detection

##### Test: should detect worktree context correctly

```javascript
it('should detect worktree when inside git worktree', () => {
  // Given: Test fixture creates real git worktree
  // When: conditional-claude.sh executes git rev-parse commands
  // Then: Detects worktree (common_dir ≠ git_dir)
});

it('should detect regular repo when in main repository', () => {
  // Given: Test executed in regular git repository root
  // When: conditional-claude.sh executes git rev-parse commands
  // Then: Detects regular repo (common_dir == git_dir)
});

it('should detect no git repo when outside git', () => {
  // Given: Test executed in /tmp directory
  // When: conditional-claude.sh executes git rev-parse commands
  // Then: Detects no repository (command fails gracefully)
});
```

#### Category 2: Routing Behavior

##### Test: should route to correct execution path based on context

```javascript
it('should route to sandbox when in worktree', () => {
  // Given: Test executed inside git worktree
  // When: conditional-claude.sh invoked with test prompt
  // Then: Output contains "🔍 Detected git worktree" and "🔒 Running Claude Code in Seatbelt sandbox"
});

it('should route to real claude when in regular repo', () => {
  // Given: Test executed in regular git repository
  // When: conditional-claude.sh invoked with test prompt
  // Then: Output shows normal claude behavior (no sandbox messages)
});

it('should route to real claude when outside git', () => {
  // Given: Test executed in /tmp directory
  // When: conditional-claude.sh invoked with test prompt
  // Then: Output shows normal claude behavior (no sandbox messages)
});
```

#### Category 3: Flag Pass-Through

##### Test: should pass all Claude flags transparently

```javascript
it('should pass through model flag', () => {
  // Given: Test with --model sonnet flag
  // When: conditional-claude.sh --model sonnet -p "test" invoked
  // Then: Claude executes with sonnet model (no flag errors)
});

it('should pass through multiple combined flags', () => {
  // Given: Test with --model sonnet --verbose -p flags
  // When: conditional-claude.sh invoked with multiple flags
  // Then: All flags processed correctly by underlying claude
});
```

#### Category 4: PATH Interception

##### Test: should intercept claude command via PATH

```javascript
it('should resolve wrapper first in PATH', () => {
  // Given: ~/.local/bin/claude symlink exists and PATH configured
  // When: which claude executed
  // Then: Returns ~/.local/bin/claude (the wrapper)
});

it('should intercept direct shell invocation', () => {
  // Given: PATH configured with wrapper priority
  // When: claude -p "test" invoked from shell
  // Then: Wrapper executes (not real claude binary)
});
```

#### Category 5: Sandbox Isolation

##### Test: should enforce write restrictions correctly

```javascript
it('should allow writes inside worktree', () => {
  // Given: Inside git worktree with sandbox active
  // When: Attempt to create file in worktree via claude
  // Then: File created successfully in worktree directory
});

it('should block writes outside worktree', () => {
  // Given: Inside git worktree with sandbox active
  // When: Attempt to create file in ~/Desktop via claude
  // Then: Write blocked (file not created)
});

it('should allow git operations to parent git directory', () => {
  // Given: Inside git worktree with sandbox active
  // When: Execute git add and git commit via claude
  // Then: Git operations succeed (writes to parent .git allowed)
});
```

#### Category 6: Error Handling

##### Test: should detect and report error conditions

```javascript
it('should error when real claude not found', () => {
  // Given: Real claude binary not in PATH
  // When: conditional-claude.sh attempts fallback to real claude
  // Then: Error message "Real 'claude' command not found in PATH" to stderr
});

it('should error when sandbox-exec missing', () => {
  // Given: Non-macOS system or sandbox-exec unavailable
  // When: claude-worktree-sandbox.sh attempts sandboxing
  // Then: Error message "sandbox-exec not found (macOS only)" to stderr
});
```

### Test Implementation Pattern

**Using Workspace Vitest Framework:**

```javascript
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Conditional Claude Wrapper Integration Tests', () => {
  let testDir;
  let worktreeDir;

  beforeEach(() => {
    // Given: Create temporary git repository for testing
    testDir = mkdtempSync(join(tmpdir(), 'sandbox-test-'));
    execSync('git init', { cwd: testDir });
    execSync('git config user.email "test@example.com"', { cwd: testDir });
    execSync('git config user.name "Test User"', { cwd: testDir });

    // Create initial commit
    writeFileSync(join(testDir, 'README.md'), '# Test');
    execSync('git add .', { cwd: testDir });
    execSync('git commit -m "Initial commit"', { cwd: testDir });

    // Create worktree
    worktreeDir = join(testDir, '.worktrees', 'test-branch');
    execSync(`git worktree add ${worktreeDir} -b test-branch`, { cwd: testDir });
  });

  afterEach(() => {
    // Cleanup test fixtures
    execSync(`rm -rf ${testDir}`);
  });

  it('should detect worktree when inside git worktree', () => {
    // When: Execute wrapper in worktree
    const output = execSync(
      'bash /path/to/conditional-claude.sh -p "echo test"',
      { cwd: worktreeDir, encoding: 'utf8' }
    );

    // Then: Worktree detection message appears
    expect(output).toContain('🔍 Detected git worktree');
    expect(output).toContain('🔒 Running Claude Code in Seatbelt sandbox');
  });
});
```

### Manual Validation (MVP)

For MVP, the following tests are validated manually during installation:
- PATH interception (tests 10-11)
- Sandbox isolation (tests 13-15)

**Manual Test Procedure:**

1. **Verify PATH Resolution:**

   ```bash
   which claude
   # Should show: ~/.local/bin/claude
   ```

2. **Test in Worktree:**

   ```bash
   cd .worktrees/some-branch
   claude -p "What is 2+2?"
   # Should show sandbox messages
   ```

3. **Test Outside Worktree:**

   ```bash
   cd /path/to/main/repo
   claude -p "What is 2+2?"
   # Should NOT show sandbox messages
   ```

### Post-MVP: Automated Test Suite

**Future Enhancement:** Create comprehensive automated test suite covering all scenarios using workspace Vitest framework, including:
- Automated git repository fixture creation
- Automated worktree setup/teardown
- Full acceptance criteria coverage
- CI integration for regression testing

## Post-MVP Considerations

**Packaging (Future):**
- Create npm package for distribution
- Automated setup script
- Support for `npm install -g` workflow

**Cross-Platform (Future):**
- Linux support via bubblewrap
- Windows support (if feasible)

**Enhanced Features (Future):**
- Configurable sandbox policies
- Per-project sandbox customization
- Telemetry/logging of sandbox events

## References

- POC Validation: [poc-1-sandboxed-commit-capability.md](./poc-1-sandboxed-commit-capability.md)
- Conditional Logic: [poc-2-conditional-wrapper.md](./poc-2-conditional-wrapper.md)
- Requirements: [USER-STORY.md](../USER-STORY.md)
- Implementation Scripts: [conditional-claude.sh](../conditional-claude.sh), [claude-worktree-sandbox.sh](../claude-worktree-sandbox.sh)
- Workspace Testing Standards: [Architecture - Baseline.md](<../../../ARCHITECTURE.md#Testing Strategy>)
