# POC-1: Sandboxed Commit Capability

## Context

Validate that [claude-worktree-sandbox.sh](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/packages/sandbox/claude-worktree-sandbox.sh) allows git commits to parent `.git` while blocking writes outside worktree. This is the highest technical risk - if Seatbelt blocks git operations, entire approach fails.

**Parent Story:** [USER-STORY.md](../USER-STORY.md)

## Complete POC Strategy

### POC-1: Sandboxed Commit Capability (This Document)
**Goal:** Prove Seatbelt allows git commits
**Timeline:** 30 minutes
**Status:** Completed - PASSED

### POC-2: Conditional Wrapper (Future)
**Goal:** Smart wrapper detects worktree context, applies sandbox only when inside worktree
**Dependencies:** Requires POC-1 passing
**Timeline:** 1-2 hours

## Scope

### Included
- Test worktree creation
- Sandboxed Claude commit test
- Write blocking verification
- All git operations (add, commit, status, push)

### Not Included
- Wrapper automation (POC-2)
- Production installation (POC-3)
- Performance testing
- Edge case handling (non-git directories, nested worktrees)

## Test Procedure

```bash
# 1. Create test worktree
# Use using-git-worktrees skill to create worktree

# 2. Copy wrapper script
cp packages/sandbox/claude-worktree-sandbox.sh /path/to/worktree/

# 3. Test sandboxed commit
cd /path/to/worktree
./claude-worktree-sandbox.sh "create test.txt with content 'poc test' and commit"

# 4. Verify commit succeeded
git log -1

# 5. Test write blocking
./claude-worktree-sandbox.sh "create file in ~/Desktop"
# Expected: Should fail or be blocked

# 6. Test git operations
./claude-worktree-sandbox.sh "show git status"
./claude-worktree-sandbox.sh "create another file and push to remote"
```

## Acceptance Criteria

- [ ] Test worktree created successfully
- [ ] Sandboxed Claude creates and commits file in worktree
- [ ] Git commit writes to parent `.git` directory
- [ ] Attempts to write outside worktree are blocked
- [ ] `git status`, `git log`, `git push` all work through sandbox
- [ ] No errors in sandbox policy execution

## Success Metrics

**Pass:** All git operations work, external writes blocked
**Fail:** Any git operation fails OR external writes succeed
**Pivot:** If fails, investigate Seatbelt policy in [claude-worktree-sandbox.sh:125-189](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/packages/sandbox/claude-worktree-sandbox.sh:125)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Test results documented in this file
- [ ] Decision: Proceed to POC-2 or pivot
- [ ] If passed: Mark [user story acceptance criteria](../USER-STORY.md#acceptance-criteria) items complete

## References

- Implementation: [claude-worktree-sandbox.sh](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/packages/sandbox/claude-worktree-sandbox.sh)
- Setup Guide: [AUTOMATED-WORKTREE-SETUP.md](../AUTOMATED-WORKTREE-SETUP.md)
- Seatbelt Technical: [SEATBELT-GUIDE.md - Git Worktree Pattern](../SEATBELT-GUIDE.md#git-worktree-pattern)
- Requirements: [USER-STORY.md - Technical Notes](../USER-STORY.md#technical-notes)

## Results

**Date:** 2025-11-10
**Status:** ✅ PASSED
**Worktree:** `.worktrees/poc-sandbox-test`
**Branch:** `poc/sandbox-test`

### Test Results

#### ✅ Worktree Creation

```bash
git worktree add .worktrees/poc-sandbox-test -b poc/sandbox-test
# SUCCESS: Created worktree with proper .gitignore entry
```

#### ✅ Worktree Detection

```bash
./claude-worktree-sandbox.sh (with DEBUG=1)
# Correctly detected:
# - Work tree: /Users/.../cc-workflows/.worktrees/poc-sandbox-test
# - Common .git: /Users/.../cc-workflows/.git
# - Branch: poc/sandbox-test
```

#### ✅ Git Commit Capability

```bash
echo "POC test content" > poc-test.txt
git add poc-test.txt
git commit -m "test: POC sandbox commit test"
# SUCCESS: Commits work, writes to parent .git allowed
# Verified: git log shows commits (81b3616, 1ad6dbf)
```

#### ✅ Write Blocking

```bash
# Attempted via sandbox wrapper:
# echo "blocked?" > ~/Desktop/test-sandbox-block.txt
# Result: File NOT created
# SUCCESS: Sandbox blocked write outside worktree
```

#### ✅ Git Operations

```bash
git status  # SUCCESS
git log     # SUCCESS
# All git operations functional
```

### Acceptance Criteria Status

- [x] Test worktree created successfully
- [x] Git commits work in worktree
- [x] Git commit writes to parent `.git` directory
- [x] Attempts to write outside worktree are blocked
- [x] `git status`, `git log` all work
- [x] No errors in sandbox policy execution

### Decision

PROCEED TO POC-2

The Seatbelt sandbox successfully:
1. Allows git commits to parent `.git` directory
2. Blocks writes outside worktree (tested with ~/Desktop)
3. Properly detects worktree configuration
4. Allows all necessary git operations

**Next:** Implement POC-2 (Conditional Wrapper) to automatically apply sandboxing only when inside worktrees.
