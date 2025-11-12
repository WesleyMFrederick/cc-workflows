# User Story: Automated Seatbelt Sandboxing for Claude Code in Git Worktrees

## Context: Why is this needed?

I use git worktrees to work on multiple branches simultaneously. When running Claude Code in a worktree, I need:
- Protection from accidental writes outside the current worktree
- Ability to commit/push (requires write access to parent `.git` directory)
- Zero manual configuration (no CLI flags every time)
- Transparent behavior (sandboxed in worktree, normal elsewhere)

## Scope

### Included
- Automated git worktree detection (current directory + parent `.git`)
- Seatbelt policy generation with write restrictions
- Claude Code integration (runs with `--dangerously-skip-permissions` safely)
- Keychain access for OAuth token refresh
- System essentials (temp directories, device files, Library folders)
- Debug mode for policy inspection
- PATH-based interception via `~/.local/bin/claude` symlink
- Support for both interactive shell AND script invocations (e.g., `claude-p`)
- MVP manual installation (developer sets up PATH and symlink)

### Not Included
- Docker backend support (macOS Seatbelt only)
- Linux bubblewrap support (future enhancement)
- Manual path configuration via CLI flags (fully automated only)
- Fine-grained per-file git access (allow entire `.git` directory)
- Cross-platform support (macOS only)
- Automated packaging/installation via npm (post-MVP)
- Shell alias approach (insufficient for script compatibility)

## Acceptance Criteria

### Core Functionality (Validated in POCs)
- [x] Script auto-detects git worktree configuration using `git rev-parse`
- [x] Detects parent `.git` directory location (handles both regular repos and worktrees)
- [x] Generates Seatbelt policy that:
  - [x] Denies all file writes by default
  - [x] Allows writes to current working directory
  - [x] Allows writes to parent `.git` directory (for commits, refs, objects)
  - [x] Allows writes to Claude config directories (`~/.claude`, `~/.config/claude`)
  - [x] Allows writes to system temp directories
  - [x] Allows Keychain access for OAuth
- [x] Runs Claude Code with `--dangerously-skip-permissions` flag
- [x] Provides informative output showing detected paths
- [x] Supports `DEBUG=1` environment variable to show generated Seatbelt policy
- [x] Conditional wrapper auto-detects context and applies sandboxing appropriately:
  - [x] Sandboxes when in git worktree
  - [x] Runs normally in regular git repo
  - [x] Runs normally with no git repo
- [x] All Claude Code flags pass through transparently (--model, -p, --verbose, etc.)
- [x] Wrapper behavior is transparent to user (no visible difference except security)
- [x] Handles edge cases:
  - [x] Regular git repos (not in worktree)
  - [x] Not in a git repository at all
  - [x] Missing `sandbox-exec` command (macOS check)

### Production Installation (MVP)
- [ ] Installation uses PATH-based symlink interception
  - [ ] `~/.local/bin/claude` symlink created pointing to `conditional-claude.sh`
  - [ ] `~/.local/bin` prepended to PATH in shell config
  - [ ] PATH ordering verified (`which claude` shows `~/.local/bin/claude`)
- [ ] Works for both interactive shell AND script invocations
  - [ ] Interactive shell: `claude "prompt"` works
  - [ ] Automated scripts: Scripts calling `claude` (e.g., `claude-p`) work
  - [ ] Both contexts get automatic sandboxing in worktrees
- [ ] Installation validated with test scenarios:
  - [ ] Test 1: Interactive shell invocation in worktree (sandboxed)
  - [ ] Test 2: Script invocation in worktree (sandboxed)
  - [ ] Test 3: Interactive in regular repo (no sandbox)
  - [ ] Test 4: Invocation outside git repo (no sandbox)
  - [ ] Test 5: Flag pass-through works correctly
- [ ] Edge case handling for installation:
  - [ ] Detects if real `claude` not found in PATH
  - [ ] Detects if PATH ordering is wrong
  - [ ] Handles broken symlink gracefully
- [ ] Documentation includes:
  - [ ] One-time setup instructions for MVP
  - [ ] Verification steps for installation
  - [ ] Troubleshooting guide for PATH issues
  - [ ] Design document in `design-docs/`

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All design documents updated
- [ ] Script can be run from any project/folder
- [ ] Code pushed to remote branch
- [ ] User validates it solves their workflow (pending user testing)

## Technical Notes

**Key Implementation Details:**
- Uses `git rev-parse --git-common-dir` to detect parent `.git`
- Uses `git rev-parse --show-toplevel` to detect worktree root
- Escapes paths for Seatbelt policy: `s="${s//\"/\\\"}"`
- Generates policy to temp file with cleanup trap
- Executes: `sandbox-exec -f policy.sb claude --dangerously-skip-permissions "$@"`
- PATH-based interception: `~/.local/bin/claude` → `conditional-claude.sh`
- Symlink allows version control in repo while providing system-wide access

**Installation Architecture:**
- Scripts remain in `packages/sandbox/` under version control
- Symlink created: `~/.local/bin/claude` → `<repo>/packages/sandbox/conditional-claude.sh`
- PATH prepended with `$HOME/.local/bin` in `~/.zshrc`
- Real `claude` binary remains unchanged, accessed via fallback
- Universal interception works for shells, scripts, and automation tools

**Files Delivered:**
- `packages/sandbox/conditional-claude.sh` - Smart wrapper with auto-detection
- `packages/sandbox/claude-worktree-sandbox.sh` - Core sandboxing logic
- `packages/sandbox/AUTOMATED-WORKTREE-SETUP.md` - Setup guide
- `packages/sandbox/SEATBELT-GUIDE.md` - Technical deep-dive
- `packages/sandbox/git-sandbox.sh` - Generic variant with manual flags
- `packages/sandbox/minimal-seatbelt.sh` - Learning example
- `packages/sandbox/design-docs/poc-1-sandboxed-commit-capability.md` - POC 1 results
- `packages/sandbox/design-docs/poc-2-conditional-wrapper.md` - POC 2 results
- `packages/sandbox/design-docs/20251110-production-installation-design.md` - Installation design

## Success Metrics

- User can run `claude "commit message"` in any worktree without manual configuration
- Git operations (commit, push, branch) work automatically
- Files outside worktree remain protected from accidental modification
- Zero Docker/container overhead (native macOS performance)
