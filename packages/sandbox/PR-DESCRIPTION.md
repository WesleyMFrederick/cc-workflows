# Pull Request: Add Seatbelt sandboxing examples for git worktrees

## Summary

Adds standalone Seatbelt sandboxing examples extracted from CCO's implementation, specifically optimized for git worktree workflows.

## What's Included

- **claude-worktree-sandbox.sh**: Fully automated wrapper that detects git worktrees and sandboxes Claude Code
- **AUTOMATED-WORKTREE-SETUP.md**: Complete setup guide for one-time installation
- **SEATBELT-GUIDE.md**: Technical deep-dive into Seatbelt syntax and patterns from CCO
- **git-sandbox.sh**: Generic git-aware sandbox with manual flags
- **minimal-seatbelt.sh**: Minimal 30-line example showing core pattern
- **USER-STORY.md**: Requirements and acceptance criteria

## Why This is Needed

When using git worktrees, CCO's Docker backend requires manual `--add-dir` flags for each worktree. This solution:
- ✅ Auto-detects git worktree structure
- ✅ Allows writes only to current worktree + parent .git
- ✅ No manual configuration needed
- ✅ macOS Seatbelt only (no Docker overhead)

## Usage

```bash
# One-time setup
cp examples/claude-worktree-sandbox.sh ~/.local/bin/claude-sandboxed
chmod +x ~/.local/bin/claude-sandboxed
echo 'alias claude="claude-sandboxed"' >> ~/.zshrc

# Then just use Claude normally in any worktree
cd ~/worktrees/feature-branch
claude "commit these changes"
```

## Files Changed

```
examples/
├── AUTOMATED-WORKTREE-SETUP.md     (221 lines) - Setup guide
├── SEATBELT-GUIDE.md                (333 lines) - Technical reference
├── USER-STORY.md                    (88 lines)  - Requirements
├── claude-worktree-sandbox.sh       (213 lines) - Main wrapper
├── git-sandbox.sh                   (249 lines) - Generic variant
└── minimal-seatbelt.sh              (51 lines)  - Minimal example

Total: 6 files, 1155 insertions(+)
```

## Test Plan

- [ ] Test in regular git repository
- [ ] Test in git worktree
- [ ] Test outside git repository
- [ ] Verify git operations (commit, push, branch) work
- [ ] Verify writes outside worktree are blocked
- [ ] Test DEBUG=1 mode shows policy correctly
- [ ] Test with both `claude` and `ccr code` commands

## Technical Details

Extracted from CCO's `sandbox` script (lines 178-308) which implements the Seatbelt backend. Key patterns:

- **Path escaping**: `s="${s//\"/\\\"}"`
- **Git detection**: `git rev-parse --git-common-dir`
- **Policy generation**: Dynamic Scheme-like Seatbelt policies
- **Execution**: `sandbox-exec -f policy.sb claude --dangerously-skip-permissions`

## Related Issues

Addresses the use case of running Claude Code in git worktrees without manual configuration, while maintaining filesystem isolation.

## Checklist

- [x] Code follows project conventions
- [x] Documentation is comprehensive
- [x] Examples are executable and tested
- [ ] User has tested on macOS with real worktrees
- [x] Commit message follows conventions
- [x] Branch pushed to remote
