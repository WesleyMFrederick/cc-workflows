# Claude Wrapper Installation Guide

This guide covers installing and verifying the Claude wrapper for automatic Seatbelt sandboxing in git worktrees.

## Prerequisites

Before installing, ensure you have:

- **macOS** with `sandbox-exec` command available
- **Existing Claude installation** (check with `which claude`)
- **Git** with worktree support (check with `git worktree --help`)
- **zsh or bash** shell with access to `~/.zshrc` or `~/.bashrc`

## Quick Install

The easiest way to install is using the provided installation script.

### Step 1: Run Installation Script

Navigate to the repository and run:

```bash
cd /path/to/cc-workflows
./packages/sandbox/install-claude-wrapper.sh
```

The script will:
1. Create `~/.local/bin` directory if it doesn't exist
2. Create a symlink to `conditional-claude.sh`
3. Check if `~/.local/bin` is in your PATH
4. Display verification commands

### Step 2: Update PATH (if needed)

If the script indicates `~/.local/bin` is NOT in your PATH, add it to your shell configuration:

**For zsh (macOS default):**

```bash
# Edit ~/.zshrc
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**For bash:**

```bash
# Edit ~/.bashrc
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Important:** The `~/.local/bin` entry MUST come before other PATH entries to take priority.

### Step 3: Verify Installation

Run the verification script:

```bash
./packages/sandbox/verify-installation.sh
```

Expected output:

```plaintext
=== Installation Verification ===

Check 1: ~/.local/bin
  ✓ Exists

Check 2: Symlink
  ✓ Exists
  Target: /path/to/packages/sandbox/conditional-claude.sh

Check 3: PATH
  ✓ In PATH

Check 4: which claude
  ✓ Resolves to wrapper

Check 5: Real claude binary
  ✓ Found
  Location: /usr/local/bin/claude

=== Summary ===
✓ All checks passed
```

All 5 checks should pass for proper installation.

## Manual Installation

If you prefer to install manually or the scripts don't work for your setup:

### Step 1: Create ~/.local/bin Directory

```bash
mkdir -p ~/.local/bin
```

### Step 2: Create Symlink

Replace `/path/to` with the actual path to your repository:

```bash
ln -s /path/to/cc-workflows/packages/sandbox/conditional-claude.sh ~/.local/bin/claude
```

To verify the symlink:

```bash
ls -l ~/.local/bin/claude
# Should show: ~/.local/bin/claude -> /path/to/cc-workflows/packages/sandbox/conditional-claude.sh
```

### Step 3: Update PATH

Add to `~/.zshrc` (or `~/.bashrc` for bash):

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Then reload your shell:

```bash
source ~/.zshrc
```

### Step 4: Verify Installation

Test that the wrapper is being used:

```bash
which claude
# Should output: /Users/yourname/.local/bin/claude

readlink ~/.local/bin/claude
# Should show the path to conditional-claude.sh
```

## Testing Installation

### Test 1: Verify PATH Resolution

```bash
which claude
```

Should output: `/Users/yourname/.local/bin/claude` (NOT `/usr/local/bin/claude` or similar)

### Test 2: Test in Git Worktree

Navigate to a git worktree and run:

```bash
cd /path/to/repo/.worktrees/some-branch
claude -p "What is 2+2?"
```

Expected output should include:

```plaintext
🔍 Detected git worktree
🔒 Running Claude Code in Seatbelt sandbox
```

### Test 3: Test Outside Worktree

Navigate to a regular git repository and run:

```bash
cd /path/to/regular/repo
claude -p "What is 2+2?"
```

Expected: NO sandbox messages. Claude runs normally.

### Test 4: Test Outside Git Repository

Run from a non-git directory:

```bash
cd /tmp
claude -p "What is 2+2?"
```

Expected: NO sandbox messages. Claude runs normally.

### Test 5: Verify Flag Pass-Through

Test that Claude flags work correctly:

```bash
# In a worktree
cd /path/to/repo/.worktrees/some-branch
claude --model sonnet -p "test"
```

Expected: Command executes successfully with no flag errors.

## Troubleshooting

### Issue: `which claude` shows wrong location

**Problem:** `which claude` returns `/usr/local/bin/claude` instead of `~/.local/bin/claude`

**Solution:**
1. Check your PATH ordering: `echo $PATH`
2. The `~/.local/bin` entry must come FIRST
3. Edit `~/.zshrc` and move the `export PATH="$HOME/.local/bin:$PATH"` line to the top
4. Reload: `source ~/.zshrc`
5. Verify: `which claude` should now show `~/.local/bin/claude`

### Issue: Real Claude binary not found error

**Problem:** Running claude shows error: `Real 'claude' command not found in PATH`

**Solution:**
1. Verify Claude is installed: `which claude` (this will show wrapper, but ensures real claude exists)
2. Check PATH excludes wrapper location: `echo $PATH | tr ':' '\n'`
3. Ensure real claude is installed in a standard location (e.g., `/usr/local/bin`)
4. If Claude was recently installed/updated, restart your terminal

### Issue: Symlink is broken

**Problem:** `ls -l ~/.local/bin/claude` shows symlink with red color or `(broken link)`

**Solution:**
1. Check if the target path still exists: `ls -l /path/to/conditional-claude.sh`
2. If moved, recreate the symlink with the new path:

   ```bash
   rm ~/.local/bin/claude
   ln -s /new/path/to/conditional-claude.sh ~/.local/bin/claude
   ```

### Issue: Sandbox isn't being applied in worktrees

**Problem:** Running claude in a worktree doesn't show sandbox messages

**Solution:**
1. Verify you're actually in a worktree: `git rev-parse --git-dir`
   - Should show something like `.git` or a path ending in `/worktrees/...`
2. Verify the wrapper is being used: `which claude` should show `~/.local/bin/claude`
3. Check if `sandbox-exec` is available: `which sandbox-exec` (should exist on macOS)
4. Use debug mode to see what's happening:

   ```bash
   DEBUG=1 claude -p "test"
   ```

### Issue: "command not found" error

**Problem:** Running `claude` shows: `command not found`

**Solution:**
1. Verify symlink exists: `ls ~/.local/bin/claude`
2. Verify symlink target exists: `ls /path/to/conditional-claude.sh`
3. Verify `~/.local/bin` is in PATH: `echo $PATH | grep "\.local/bin"`
4. Check shell is reading config: `echo $SHELL` (should be `/bin/zsh` or `/bin/bash`)
5. Reload shell config: `source ~/.zshrc` (or `~/.bashrc`)

### Issue: PATH ordering wrong after update

**Problem:** After updating shell config, PATH still has wrong order

**Solution:**
1. Verify the line was added: `grep "\.local/bin" ~/.zshrc`
2. Check line position: Should be BEFORE any other PATH modifications
3. Example correct order:

   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   # ... other PATH modifications below
   ```

4. Save file, then test: `source ~/.zshrc` and `echo $PATH`

## Debug Mode

To see detailed information about what the wrapper is doing:

```bash
DEBUG=1 claude -p "test"
```

Or:

```bash
CCO_DEBUG=1 claude -p "test"
```

This will display:
- Git detection output
- Worktree detection logic
- Seatbelt policy (if in worktree)
- Command execution details

## Uninstallation

To remove the wrapper and restore original behavior:

### Step 1: Remove Symlink

```bash
rm ~/.local/bin/claude
```

### Step 2: Remove PATH Configuration (optional)

If you don't use `~/.local/bin` for other tools, remove from `~/.zshrc`:

```bash
# Remove this line:
export PATH="$HOME/.local/bin:$PATH"
```

Then reload: `source ~/.zshrc`

### Step 3: Verify Removal

```bash
which claude
# Should now show: /usr/local/bin/claude (or wherever real claude is installed)

ls ~/.local/bin/claude
# Should show: "No such file or directory"
```

## How It Works

The wrapper uses a simple PATH-based interception mechanism:

1. **Symlink in PATH**: `~/.local/bin/claude` points to `conditional-claude.sh`
2. **Context Detection**: When invoked, the wrapper detects if you're in a git worktree
3. **Automatic Routing**:
   - In worktree: Routes to `claude-worktree-sandbox.sh` (Seatbelt sandboxing)
   - Outside worktree: Routes to real Claude binary (normal behavior)
4. **Transparent Pass-Through**: All arguments and flags are passed unchanged

This means:
- All `claude` invocations (shell, scripts, tools) are automatically intercepted
- Worktree sandboxing happens automatically
- Normal behavior is preserved outside worktrees
- No manual context switching needed

## Architecture Reference

For detailed architecture and design decisions, see:
- [Production Installation Design](design-docs/20251110-production-installation-design.md)
- [POC 1: Sandboxed Commit Capability](design-docs/poc-1-sandboxed-commit-capability.md)
- [POC 2: Conditional Wrapper](design-docs/poc-2-conditional-wrapper.md)

## Support

If you encounter issues not covered in the troubleshooting section:

1. Check the debug output: `DEBUG=1 claude -p "test"`
2. Verify all installation steps completed
3. Ensure PATH environment variable is correct
4. Check that all required files exist and are executable
