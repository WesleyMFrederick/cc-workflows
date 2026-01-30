# Seatbelt Sandboxing Guide

This guide explains how to use macOS Seatbelt for sandboxing, extracted from the CCO project.

## What is Seatbelt?

Seatbelt is macOS's kernel-level access control system. It uses policies written in a Scheme-like language to restrict what programs can do.

**Key command:**

```bash
sandbox-exec -f policy.sb your-command [args...]
```

## Core Pattern: Deny-by-Default

```scheme
(version 1)
(allow default)           ; Allow everything (network, IPC, system calls)
(deny file-write*)        ; DENY all file writes

; Then whitelist specific paths:
(allow file-write* (subpath "/allowed/dir"))      ; Directory + children
(allow file-write* (literal "/allowed/file.txt"))  ; Single file only
```

## Seatbelt Rule Types

### 1. Operations

| Operation | What it controls |
|-----------|------------------|
| `file-read*` | Reading files/directories |
| `file-write*` | Writing files, creating/deleting files, modifying metadata |
| `network*` | All network operations |
| `process-exec` | Executing new processes |
| `mach-lookup` | Looking up macOS services (IPC) |
| `system-socket` | Unix domain sockets |

### 2. Path Matching

| Pattern | Matches | Use Case |
|---------|---------|----------|
| `(subpath "path")` | Directory + all descendants | `(allow file-write* (subpath "/Users/you/code"))` |
| `(literal "path")` | Exact file path only | `(allow file-write* (literal "/etc/hosts"))` |
| `(regex #"pattern")` | Regular expression | `(deny file-read* (regex #"\.ssh/id_"))` |

### 3. Combining Rules

```scheme
; Allow writes to code directory but deny .env files
(allow file-write* (subpath "/Users/you/code"))
(deny file-write* (regex #"/\.env$"))
```

## Essential System Paths

Most programs need these to function:

```scheme
; Temp directories (mandatory for almost everything)
(allow file-write* (subpath "/tmp"))
(allow file-write* (subpath "/var/tmp"))
(allow file-write* (subpath "/var/folders"))
(allow file-write* (subpath "/private/var/folders"))

; Device files (I/O)
(allow file-write* (literal "/dev/null"))
(allow file-write* (literal "/dev/tty"))
(allow file-write* (literal "/dev/stdout"))
(allow file-write* (literal "/dev/stderr"))
(allow file-write* (literal "/dev/random"))
(allow file-write* (literal "/dev/urandom"))

; macOS user directories (app state, caches, logs)
(allow file-write* (subpath "$HOME/Library/Caches"))
(allow file-write* (subpath "$HOME/Library/Logs"))
(allow file-write* (subpath "$HOME/Library/Application Support"))
```

## Advanced: Keychain Access

To allow programs to access the macOS Keychain:

```scheme
; Keychain files
(allow file-read* (subpath "$HOME/Library/Keychains"))
(allow file-write* (subpath "$HOME/Library/Keychains"))
(allow file-read* (subpath "/Library/Keychains"))

; Security framework (needed for Keychain API)
(allow system-mac-syscall (syscall-number 73))
(allow mach-lookup (global-name "com.apple.securityd"))
(allow mach-lookup (global-name "com.apple.security.othersigning"))
(allow mach-lookup (global-name "com.apple.security.credentialstore"))
```

⚠️ **Warning:** Keychain access is powerful - the program can access ALL stored passwords and certificates.

## Git Worktree Pattern

When working with git worktrees, you need write access to:
1. Current worktree directory
2. Parent `.git` directory (for objects, refs, etc.)

```bash
#!/usr/bin/env bash
# Auto-detect git worktree and allow appropriate paths

pwd_abs=$(pwd -P)
policy=$(mktemp -t sandbox.sb)
trap 'rm -f "$policy"' EXIT

# Detect git structure
git_work_tree=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
git_common_dir=$(git rev-parse --git-common-dir 2>/dev/null || echo "")

# Make git_common_dir absolute
if [[ -n "$git_common_dir" && "$git_common_dir" != /* ]]; then
    git_common_dir="$(cd "$git_work_tree" && cd "$git_common_dir" && pwd -P)"
fi

cat > "$policy" <<EOF
(version 1)
(allow default)
(deny file-write*)

; Current directory
(allow file-write* (subpath "$pwd_abs"))

; Git common directory (for worktree operations)
$(if [[ -n "$git_common_dir" ]]; then
    echo "(allow file-write* (subpath \"$git_common_dir\"))"
fi)

; System essentials
(allow file-write* (subpath "/tmp"))
(allow file-write* (subpath "/var/tmp"))
(allow file-write* (literal "/dev/null"))
(allow file-write* (literal "/dev/tty"))
EOF

sandbox-exec -f "$policy" "$@"
```

## Safe Mode: Hide Entire Home Directory

To deny reads outside allowed paths (maximum isolation):

```scheme
(version 1)
(allow default)
(deny file-write*)
(deny file-read* (subpath "$HOME"))  ; Hide entire home directory

; Then re-allow only what's needed
(allow file-read* (subpath "/path/to/project"))
(allow file-write* (subpath "/path/to/project"))
```

## Dynamic Policy Generation

CCO's approach: generate policies on-the-fly based on command-line arguments.

```bash
#!/usr/bin/env bash
write_paths=()

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -w|--write)
            write_paths+=("$2")
            shift 2
            ;;
        --)
            shift
            break
            ;;
        *)
            break
            ;;
    esac
done

# Generate policy
policy=$(mktemp -t sandbox.sb)
{
    echo "(version 1)"
    echo "(allow default)"
    echo "(deny file-write*)"

    # Current directory
    echo "(allow file-write* (subpath \"$(pwd -P)\"))"

    # Additional paths
    for path in "${write_paths[@]}"; do
        echo "(allow file-write* (subpath \"$path\"))"
    done

    # System essentials...
} > "$policy"

sandbox-exec -f "$policy" "$@"
rm -f "$policy"
```

## Debugging Policies

**View generated policy:**

```bash
CCO_DEBUG=1 ./git-sandbox.sh ls
```

**Test a policy:**

```bash
# Create test policy
cat > test.sb <<'EOF'
(version 1)
(allow default)
(deny file-write*)
(allow file-write* (subpath "/tmp"))
EOF

# Try to write to various locations
sandbox-exec -f test.sb bash -c 'echo test > /tmp/ok.txt'        # ✅ Works
sandbox-exec -f test.sb bash -c 'echo test > ~/denied.txt'       # ❌ Denied
```

## Common Patterns from CCO

### 1. Path Escaping
Always escape paths that go into policies:

```bash
escape_path() {
    local s="$1"
    s="${s//\\/\\\\}"    # Escape backslashes
    s="${s//\"/\\\"}"    # Escape quotes
    printf '%s' "$s"
}

# Use it:
printf '(allow file-write* (subpath "%s"))\n' "$(escape_path "$path")"
```

### 2. Absolute Paths
Always use absolute paths in policies:

```bash
pwd_abs=$(pwd -P)  # Resolve symlinks
```

### 3. File vs Directory
Handle files differently from directories:

```bash
if [[ -d "$path" ]]; then
    echo "(allow file-write* (subpath \"$path\"))"
else
    echo "(allow file-write* (literal \"$path\"))"
fi
```

## Real-World Example: Sandboxed Claude Code

```bash
#!/usr/bin/env bash
# Run Claude Code with write access only to current project

policy=$(mktemp -t claude-sandbox.sb)
trap 'rm -f "$policy"' EXIT

cat > "$policy" <<EOF
(version 1)
(allow default)
(deny file-write*)

; Project directory
(allow file-write* (subpath "$(pwd -P)"))

; Claude's config directories
(allow file-write* (subpath "$HOME/.claude"))
(allow file-write* (subpath "$HOME/.config/claude"))
(allow file-write* (literal "$HOME/.claude.json"))

; Keychain (for OAuth)
(allow file-read* (subpath "$HOME/Library/Keychains"))
(allow file-write* (subpath "$HOME/Library/Keychains"))
(allow system-mac-syscall (syscall-number 73))
(allow mach-lookup (global-name "com.apple.securityd"))

; System essentials
(allow file-write* (subpath "/tmp"))
(allow file-write* (subpath "/var/tmp"))
(allow file-write* (subpath "/var/folders"))
(allow file-write* (literal "/dev/null"))
(allow file-write* (literal "/dev/tty"))

; Library directories
(allow file-write* (subpath "$HOME/Library/Caches"))
(allow file-write* (subpath "$HOME/Library/Logs"))
(allow file-write* (subpath "$HOME/Library/Application Support"))
EOF

exec sandbox-exec -f "$policy" claude --dangerously-skip-permissions "$@"
```

## Process Management

To allow programs to signal processes (e.g., `pkill`, `kill`):

```scheme
; Process management (pkill/kill for stale test runners like vitest)
(allow process-info*)
(allow signal)
```

| Operation | What it enables |
|-----------|----------------|
| `process-info*` | Process info queries (used internally by `pkill`) |
| `signal` | `pkill`, `kill` to send signals (SIGTERM, SIGKILL, etc.) |

⚠️ **macOS Sequoia limitation:** `/bin/ps` is setuid root + SIP-restricted (`-rwsr-xr-x restricted`). Sequoia blocks setuid+restricted binaries inside `sandbox-exec` — no policy can override this. Use `pgrep`/`pkill` instead (not setuid, works fine in sandbox).

## Resources

- **Seatbelt Syntax**: No official docs; reverse-engineered from macOS
- **CCO's Implementation**: See `sandbox` script in CCO repo
- **Alternative Tools**:
  - Linux: `bubblewrap` (similar concept, different syntax)
  - General: Docker/containers (heavier but cross-platform)

## Tips

1. **Always include `/tmp`** - almost everything needs it
2. **Test incrementally** - start with minimal rules, add as needed
3. **Use Safe Mode carefully** - hiding `$HOME` can break unexpected things
4. **Debug with `-v`** - see what's being denied in Console.app
5. **Keychain is all-or-nothing** - no way to grant partial access

## Comparison: Seatbelt vs Docker

| Feature | Seatbelt | Docker |
|---------|----------|--------|
| **Performance** | ✅ Native | ⚠️ Overhead |
| **Complexity** | ✅ Simple policies | ⚠️ Images, mounts |
| **Git worktrees** | ✅ Just works | ⚠️ Manual mounting |
| **Platform** | ⚠️ macOS only | ✅ Cross-platform |
| **Isolation level** | ⚠️ Filesystem only | ✅ Full container |
| **Debugging** | ⚠️ Limited tools | ✅ Good tooling |
