# POC-2: Conditional Wrapper

## Context

Create smart wrapper that detects git worktree context and conditionally applies sandboxing. POC-1 proved sandboxing works - now validate that we can make it automatic and transparent.

**Parent Story:** [USER-STORY.md](../USER-STORY.md)
**Previous POC:** [poc-1-sandboxed-commit-capability.md](./poc-1-sandboxed-commit-capability.md)

## POC Strategy

### POC-1: Sandboxed Commit Capability
**Status:** ✅ PASSED

### POC-2: Conditional Wrapper (This Document)
**Goal:** Auto-detect worktree, apply sandbox only when needed
**Timeline:** 1-2 hours
**Status:** Design complete

## Scope

### Included
- Worktree detection logic
- Conditional sandboxing (in worktree vs outside)
- Full Claude flag pass-through
- No-op behavior when outside worktrees
- Error handling for edge cases

### Not Included
- Production installation paths
- Alias setup automation
- Performance optimization
- Multi-repo support

## Design

### Detection Logic

```bash
# Detect if in git worktree
if git rev-parse --git-common-dir &>/dev/null; then
    common_dir="$(git rev-parse --git-common-dir)"
    git_dir="$(git rev-parse --git-dir)"

    # Are we in a worktree?
    if [[ "$common_dir" != "$git_dir" ]]; then
        # YES: Use sandboxed wrapper
        exec ./claude-worktree-sandbox.sh "$@"
    fi
fi

# NO: Run Claude normally
exec claude "$@"
```

### Wrapper Behavior

**In worktree:**
- Detect worktree configuration
- Generate Seatbelt policy
- Execute: `sandbox-exec -f policy.sb claude "$@"`

**Outside worktree (regular repo or no git):**
- Pass through to Claude directly
- No sandboxing applied
- Zero overhead

### Flag Pass-through

All Claude flags must pass through transparently. The wrapper uses `"$@"` to preserve all arguments.

**Complete Claude Code Flag Reference:**

System Prompt Control:
- `--system-prompt <text>` - Replace entire system prompt
- `--system-prompt-file <file>` - Replace prompt from file
- `--append-system-prompt <text>` - Append to system prompt

Session Management:
- `--resume <session-id>` - Resume specific session
- `--continue` - Resume most recent conversation
- `--max-turns <number>` - Limit agentic turns

Tool & Permission Control:
- `--allowedTools <list>` - Allow specific tools without prompts
- `--disallowedTools <list>` - Block specific tools
- `--dangerously-skip-permissions` - Skip all permission prompts
- `--permission-mode <mode>` - Set permission strategy
- `--permission-prompt-tool <tool>` - Handle prompts programmatically

Model & Output:
- `--model <alias>` - Choose model (sonnet, opus, haiku)
- `--print` or `-p` - Print response and exit
- `--output-format <text|json|stream-json>` - Output format
- `--input-format <text|stream-json>` - Input format
- `--include-partial-messages` - Include streaming messages
- `--verbose` - Enable verbose logging

Workspace & Context:
- `--add-dir <dir>` - Add extra working directories
- `--config-dir <dir>` - Custom config directory
- `--agents <json>` - Define custom subagents

Debugging:
- `--mcp-debug` - Enable MCP debugging

**POC Test Flags (selected for validation):**
- `-p "prompt"` - Basic prompt flag (most common use case)
- `--model sonnet` - Model selection (verifies complex args)
- `--verbose` - Boolean flag (verifies flag-only args)
- `--dangerously-skip-permissions` - Already used by sandbox wrapper
2
## Test Procedure

```bash
# 1. Create wrapper script (conditional-claude.sh)
# Implements detection logic above

# 2. Test in worktree
cd .worktrees/poc-sandbox-test
./conditional-claude.sh -p "show git status"
# Expected: Runs sandboxed, shows worktree detection

# 3. Test outside worktree (main repo)
cd /path/to/main/repo
./conditional-claude.sh -p "show git status"
# Expected: Runs normally, no sandbox

# 4. Test with no git repo
cd /tmp
./conditional-claude.sh -p "echo hello"
# Expected: Runs normally, no sandbox

# 5. Test flag pass-through
cd .worktrees/poc-sandbox-test
./conditional-claude.sh --model sonnet -p "test"
# Expected: All flags passed correctly
```

## Acceptance Criteria

- [ ] Wrapper detects worktree context correctly
- [ ] Sandbox applied when in worktree
- [ ] No sandbox when outside worktree
- [ ] All Claude flags pass through correctly
- [ ] Works with no git repository present
- [ ] No errors in detection logic
- [ ] Transparent user experience (no visible difference except security)

## Success Metrics

**Pass:** Correct behavior in all 3 contexts (worktree, regular repo, no git)
**Fail:** Detection fails OR flags don't pass through OR sandbox applies incorrectly
**Pivot:** If detection unreliable, consider explicit flag (e.g., `--sandbox`)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Test results documented in this file
- [ ] Wrapper script created and tested
- [ ] Decision: Ready for production integration or needs refinement

## References

- POC-1 Results: [poc-1-sandboxed-commit-capability.md](./poc-1-sandboxed-commit-capability.md)
- Implementation: [claude-worktree-sandbox.sh](../claude-worktree-sandbox.sh)
- Requirements: [USER-STORY.md](../USER-STORY.md)

## Implementation Notes

### Edge Cases

**Regular git repo (not worktree):**
- `git rev-parse --git-common-dir` returns `.git`
- `git rev-parse --git-dir` returns `.git`
- These are equal → NOT a worktree → No sandbox

**Worktree:**
- `--git-common-dir` returns parent repo `.git`
- `--git-dir` returns worktree-specific `.git`
- These differ → IS a worktree → Apply sandbox

**No git repo:**
- `git rev-parse` fails
- No sandbox, run Claude normally

### Script Structure

```bash
#!/usr/bin/env bash
# conditional-claude - Smart wrapper for Claude with auto-sandboxing

detect_worktree() {
    # Detection logic
}

main() {
    if detect_worktree; then
        exec claude-worktree-sandbox.sh "$@"
    else
        exec claude "$@"
    fi
}

main "$@"
```

## Results

**Date:** 2025-11-10
**Status:** ✅ PASSED
**Script:** `packages/sandbox/conditional-claude.sh`

### Test Results

#### ✅ Test 1: Worktree Detection and Sandboxing

```bash
cd .worktrees/poc-sandbox-test
./conditional-claude.sh -p "What is 2+2?"

# Output showed:
# 🔍 Detected git worktree
# 🔒 Running Claude Code in Seatbelt sandbox
# Result: 4
```

SUCCESS: Wrapper detected worktree context and applied sandboxing

#### ✅ Test 2: Regular Repository (No Sandbox)

```bash
cd /path/to/main/repo
./conditional-claude.sh -p "What is 3+3?"

# Output showed:
# Result: 6 (no sandbox messages)
```

SUCCESS: Wrapper ran Claude normally without sandboxing in main repo

#### ✅ Test 3: No Git Repository (No Sandbox)

```bash
cd /tmp
./conditional-claude.sh -p "What is 5+5?"

# Output showed:
# Result: 10 (no sandbox messages, no errors)
```

SUCCESS: Wrapper ran Claude normally with no git repository present

#### ✅ Test 4: Flag Pass-through

```bash
# Test --model flag
./conditional-claude.sh --model sonnet -p "Respond with TEST"
# SUCCESS: Model flag passed correctly, got response

# Test --verbose flag
./conditional-claude.sh --verbose -p "Say OK"
# SUCCESS: Boolean flag passed correctly, got response
```

SUCCESS: All tested flags passed through correctly

### Acceptance Criteria Status

- [x] Wrapper detects worktree context correctly
- [x] Sandbox applied when in worktree
- [x] No sandbox when outside worktree
- [x] All Claude flags pass through correctly
- [x] Works with no git repository present
- [x] No errors in detection logic
- [x] Transparent user experience

### Decision

READY FOR NEXT PHASE

The conditional wrapper successfully:
1. Auto-detects git worktree vs regular repo vs no git
2. Applies sandboxing only when in worktree
3. Passes all flags through transparently
4. Handles all edge cases correctly
5. Provides transparent user experience

**Next:** Determine production integration approach (installation paths, aliases, testing)
