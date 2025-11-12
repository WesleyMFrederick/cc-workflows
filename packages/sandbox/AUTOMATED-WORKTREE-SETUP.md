# Automated Git Worktree Sandboxing for Claude Code

This guide shows you how to set up **fully automated** Seatbelt sandboxing for Claude Code in git worktrees - no manual CLI flags needed.

## The Problem You're Solving

When you create a git worktree:

```
~/projects/myproject/           # Main repo
  .git/                         # Main git directory
  .git/worktrees/
    feature-branch/             # Worktree metadata

~/worktrees/feature-branch/     # Your worktree
  .git                          # File pointing to ../projects/myproject/.git/worktrees/feature-branch
  src/
  README.md
```

**You want:**
- ✅ Claude can write to `~/worktrees/feature-branch/` (current worktree)
- ✅ Claude can write to `~/projects/myproject/.git/` (for commits, refs, etc.)
- ❌ Claude CANNOT write anywhere else on your system

**Without manual CLI flags every time.**

## Solution: Automated Wrapper Script

The `claude-worktree-sandbox.sh` script automatically:
1. Detects your git worktree configuration
2. Finds the parent `.git` directory
3. Creates a Seatbelt policy allowing only those paths
4. Runs Claude with `--dangerously-skip-permissions` (safe because of Seatbelt)

## Setup (One-Time)

### Step 1: Copy the Script

```bash
# Download or copy claude-worktree-sandbox.sh to a permanent location
cp examples/claude-worktree-sandbox.sh ~/.local/bin/claude-sandboxed

# Make it executable
chmod +x ~/.local/bin/claude-sandboxed
```

### Step 2: Create an Alias

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# Replace 'claude' with sandboxed version
alias claude='claude-sandboxed'

# Or keep original and add a separate command
alias cs='claude-sandboxed'  # "claude sandboxed"
```

### Step 3: Reload Shell

```bash
source ~/.zshrc  # or ~/.bashrc
```

## Usage

Now just use Claude normally in any git worktree:

```bash
cd ~/worktrees/feature-branch

# Just works - automatically sandboxed!
claude "refactor the authentication module"

# Git operations work automatically
claude "commit these changes with a descriptive message"

# Create files in the worktree
claude "create a new API endpoint"
```

**No flags. No configuration. Fully automatic.**

## What's Happening Behind the Scenes

When you run `claude "commit these changes"`:

```
1. claude-sandboxed detects: pwd = ~/worktrees/feature-branch
2. Runs: git rev-parse --show-toplevel → ~/worktrees/feature-branch
3. Runs: git rev-parse --git-common-dir → ~/projects/myproject/.git
4. Generates Seatbelt policy:
   (allow file-write* (subpath "~/worktrees/feature-branch"))
   (allow file-write* (subpath "~/projects/myproject/.git"))
   (allow file-write* (subpath "~/.claude"))
   (deny file-write* everywhere else)
5. Executes: sandbox-exec -f policy.sb claude --dangerously-skip-permissions "commit these changes"
```

## Verify It's Working

```bash
# Run with debug output
DEBUG=1 claude "what is 2+2?"

# You'll see:
# 🔍 Detected git worktree:
#    📂 Work tree: /Users/you/worktrees/feature-branch
#    📂 Common .git: /Users/you/projects/myproject/.git
#    🌿 Branch: feature-branch
#
# 🔒 Running Claude Code in Seatbelt sandbox
#    ✅ Write access: Current directory
#    ✅ Write access: /Users/you/projects/myproject/.git
#    ✅ Write access: Claude config directories
#    ❌ Everything else: Read-only or denied
```

## Advanced: Restricting to Specific Git Paths

The current implementation allows writes to the **entire** parent `.git` directory. If you want to be more restrictive, you can modify the script to allow only:

```scheme
; Allow only this branch's ref
(allow file-write* (literal "$git_common_dir/refs/heads/$current_branch"))

; Allow worktree metadata
(allow file-write* (subpath "$git_common_dir/worktrees/$worktree_name"))

; Objects directory (for commits)
(allow file-write* (subpath "$git_common_dir/objects"))

; Index and other essential files
(allow file-write* (literal "$git_common_dir/index"))
(allow file-write* (literal "$git_common_dir/COMMIT_EDITMSG"))
```

However, this is **complex** because git operations touch many files (pack files, loose objects, refs, etc.). The current approach (allowing entire `.git`) is a good balance between security and functionality.

## How It Compares to CCO

| Feature | CCO | claude-worktree-sandbox |
|---------|-----|-------------------------|
| **Backend** | Docker + Seatbelt | Seatbelt only |
| **Worktree detection** | Manual with `--add-dir` | ✅ Automatic |
| **Setup complexity** | Docker required | ✅ Just bash + Seatbelt |
| **Performance** | Container overhead | ✅ Native |
| **Cross-platform** | ✅ Linux + macOS | ⚠️ macOS only |
| **Transparency** | Visible wrapper | ✅ Drop-in replacement |

## Troubleshooting

### "sandbox-exec not found"
- **Solution**: This only works on macOS. For Linux, you'd need to adapt this to use `bubblewrap` instead.

### "Claude Code not found"
- **Solution**: Install Claude Code or update the `claude_cmd` variable in the script to match your installation (e.g., `ccr code`).

### "Permission denied" when committing
- **Debug**: Run with `DEBUG=1 claude "your command"` to see the generated policy.
- **Check**: Ensure the parent `.git` directory is being detected correctly.

### Works in regular repos but not worktrees
- **Debug**: Run `git rev-parse --git-common-dir` in your worktree - it should point to the parent repo.
- **Fix**: If it doesn't, your worktree setup may be non-standard.

## Customization

### Add Additional Writable Directories

Edit the script to add more paths:

```bash
# Around line 120, add:
write_paths+=("$HOME/downloads")  # Allow writes to downloads
write_paths+=("$HOME/Desktop")    # Allow writes to desktop
```

### Change Claude Command

```bash
# Edit line ~30:
claude_cmd="ccr code"  # Use Claude Code Repl instead
```

### Remove Keychain Access (More Restrictive)

```bash
# Comment out lines 189-196 in the generated policy section
# This will break OAuth refresh but increases security
```

## Why This Approach?

**Compared to Docker:**
- ✅ **No mounting issues** - runs on your actual filesystem
- ✅ **Git worktrees just work** - can access parent `.git` naturally
- ✅ **Better performance** - no container overhead
- ✅ **Simpler setup** - just a bash script

**Compared to no sandboxing:**
- ✅ **Protection from mistakes** - Claude can't accidentally `rm -rf ~`
- ✅ **Controlled access** - Only current project + git repo
- ✅ **Peace of mind** - Even with `--dangerously-skip-permissions`

## Next Steps

1. **Test it**: Try the script in a few worktrees to verify it works
2. **Customize it**: Add/remove paths based on your workflow
3. **Share it**: This pattern works for any command-line tool, not just Claude

## Files in This Directory

- `claude-worktree-sandbox.sh` - Full automated wrapper (recommended)
- `git-sandbox.sh` - Generic git-aware sandbox (manual flags)
- `minimal-seatbelt.sh` - Bare minimum example (learning)
- `SEATBELT-GUIDE.md` - Deep dive into Seatbelt syntax
- `AUTOMATED-WORKTREE-SETUP.md` - This file

Pick the one that fits your use case!
