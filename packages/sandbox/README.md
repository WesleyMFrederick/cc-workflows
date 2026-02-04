# Sandbox Claude Wrapper (Seatbelt + Version Pinning)

This package provides a `claude` wrapper that automatically runs Claude Code inside a macOS Seatbelt sandbox when you’re in a **git worktree**, and otherwise runs Claude normally.

It’s designed for KISS/DRY:
- You always type `claude`.
- The wrapper always executes the “real” Claude at a fixed path: `/opt/homebrew/bin/claude`.
- Version changes happen via npm **only** (one command), and the wrapper automatically uses whatever version npm installed.

> Current intended setup:  
> `~/.local/bin/claude` → wrapper (this package)  
> `/opt/homebrew/bin/claude` → real Claude Code (npm-global)

***

## How it works

- `~/.local/bin/claude` is a Bash script wrapper.
- If it detects you’re in a git worktree, it exports `REAL_CLAUDE_PATH=/opt/homebrew/bin/claude` and execs `claude-worktree-sandbox.sh`, which runs:
  - `sandbox-exec -f <generated policy> "$REAL_CLAUDE_PATH" --dangerously-skip-permissions ...`
- If you’re not in a worktree, it directly execs `/opt/homebrew/bin/claude`.

This lets you safely use `--dangerously-skip-permissions` inside a strict file-write sandbox.

***

## Install / Wiring (one-time)

1) Ensure the wrapper is the `claude` you run:

```bash
mkdir -p ~/.local/bin
# Put the wrapper script at:
#   ~/.local/bin/claude
chmod +x ~/.local/bin/claude
```

2) Ensure your shell PATH prefers `~/.local/bin`:

```bash
# In ~/.zshrc
export PATH="$HOME/.local/bin:$PATH"
```

3) Ensure the sandbox script is executable:

```bash
chmod +x /path/to/cc-workflows/packages/sandbox/claude-worktree-sandbox.sh
```

***

## Update / Downgrade Claude Code (the important part)

### Rule
**You only change versions by changing `/opt/homebrew/bin/claude` via npm.**  
The wrapper never needs edits for upgrades/downgrades.

### Check current version

```bash
/opt/homebrew/bin/claude --version
claude --version
```

Both should match (since the wrapper execs the real binary).

### Upgrade to latest

```bash
npm i -g @anthropic-ai/claude-code@latest
```

### Downgrade (pin a specific version)

```bash
npm i -g @anthropic-ai/claude-code@2.1.21
```

### See what versions are available

```bash
npm view @anthropic-ai/claude-code version
npm view @anthropic-ai/claude-code versions --json | tail
```

(First shows “current latest”; second lists historical versions.)

### Verify the real binary path is still correct

```bash
ls -l /opt/homebrew/bin/claude
which -a claude
```

You should see `~/.local/bin/claude` first and `/opt/homebrew/bin/claude` after.

***

## Troubleshooting

### “No such file or directory: claude-worktree-sandbox.sh”
Your wrapper is probably trying to exec the sandbox script relative to its own location.

Fix: in the wrapper, exec the sandbox script by **absolute path**, e.g.:

```bash
exec "$HOME/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/packages/sandbox/claude-worktree-sandbox.sh" "${remaining_args[@]}"
```

### `claude doctor` warns about “native at ~/.local/bin/claude”
That’s because `doctor` sees a `claude` executable in `~/.local/bin` and labels it as “native”. In this setup, that file is intentionally the wrapper.

What matters:
- `Invoked: /opt/homebrew/bin/claude` (real)
- `Currently running: npm-global`

### Sandbox recursion / infinite loop
`claude-worktree-sandbox.sh` must exec the real binary via `REAL_CLAUDE_PATH` (not by calling `claude` again).

Good:

```bash
exec sandbox-exec -f "$policy_file" "$REAL_CLAUDE_PATH" ...
```

Bad:

```bash
exec sandbox-exec ... claude ...
```

***

## Notes

- This setup intentionally disables auto-updating (e.g. `DISABLE_AUTOUPDATER=1`) so versions stay stable unless you explicitly change them.
- If you want “zero warnings in doctor”, you’d need the wrapper to have a different name (or a shell function/alias), but that violates the “always type `claude`” goal.

If you want, paste the directory structure of your `packages/sandbox/` folder and I’ll tailor the README paths so they match your repo exactly.

Sources
