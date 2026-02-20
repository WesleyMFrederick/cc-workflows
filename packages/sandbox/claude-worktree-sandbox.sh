#!/usr/bin/env bash
# claude-worktree-sandbox - Fully automated Seatbelt sandboxing for Claude in git worktrees
#
# Usage: claude-worktree-sandbox [claude args...]
# Example: claude-worktree-sandbox "commit these changes"
#
# Automatically allows writes ONLY to:
# 1. Current worktree directory
# 2. Parent .git directory (for worktree operations)
# 3. Claude's config directories
# 4. System temp directories
#
# Everything else is read-only or denied.

set -euo pipefail

# Escape path for Seatbelt policy
escape_path() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    printf '%s' "$s"
}

# Get absolute path
abs_path() {
    local p="$1"
    if [[ "$p" == "~"* ]]; then
        p="${p/#\~/$HOME}"
    fi
    if [[ -e "$p" ]]; then
        if [[ -d "$p" ]]; then
            (cd "$p" && pwd -P)
        else
            (cd "$(dirname "$p")" && printf '%s/%s\n' "$(pwd -P)" "$(basename "$p")")
        fi
    else
        echo "$p"  # Return as-is if doesn't exist
    fi
}

# Detect Claude command (use passed path from wrapper, or fallback)
if [[ -n "${REAL_CLAUDE_PATH:-}" ]]; then
    claude_cmd="$REAL_CLAUDE_PATH"
elif command -v ccr &>/dev/null; then
    claude_cmd="ccr code"
else
    echo "❌ Error: Claude Code path not provided and fallback 'ccr' not found" >&2
    echo "   This script should be called via conditional-claude.sh wrapper" >&2
    exit 127
fi

# Check for sandbox-exec
if ! command -v sandbox-exec &>/dev/null; then
    echo "❌ Error: sandbox-exec not found (macOS only)" >&2
    echo "   This script uses macOS Seatbelt for sandboxing" >&2
    exit 127
fi

# Get current directory
pwd_abs="$(pwd -P)"

# Initialize arrays for writable paths
write_paths=()
branch_specific_paths=()

# Auto-detect git configuration
if git rev-parse --git-dir &>/dev/null 2>&1; then
    git_work_tree="$(git rev-parse --show-toplevel 2>/dev/null || echo "")"
    git_dir="$(git rev-parse --git-dir 2>/dev/null || echo "")"
    git_common_dir="$(git rev-parse --git-common-dir 2>/dev/null || echo "")"
    current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"

    # Make paths absolute
    if [[ -n "$git_dir" && "$git_dir" != /* ]]; then
        git_dir="$(cd "$git_dir" && pwd -P)"
    fi
    if [[ -n "$git_common_dir" && "$git_common_dir" != /* ]]; then
        git_common_dir="$(cd "$git_work_tree" && cd "$git_common_dir" && pwd -P)"
    fi

    # Check if we're in a worktree
    if [[ -n "$git_common_dir" && "$git_common_dir" != "$git_dir" ]]; then
        echo "🔍 Detected git worktree:" >&2
        echo "   📂 Work tree: $git_work_tree" >&2
        echo "   📂 Common .git: $git_common_dir" >&2
        echo "   🌿 Branch: $current_branch" >&2
        echo "" >&2

        # Allow the entire common .git directory
        # (Fine-grained access is complex due to shared objects, refs, etc.)
        write_paths+=("$git_common_dir")

        # Also allow the worktree-specific .git file/directory
        if [[ -e "$git_work_tree/.git" ]]; then
            if [[ -d "$git_work_tree/.git" ]]; then
                write_paths+=("$git_work_tree/.git")
            else
                # .git is a file pointing to worktree metadata
                branch_specific_paths+=("$git_work_tree/.git")
            fi
        fi
    elif [[ -n "$git_dir" ]]; then
        # Regular git repo (not a worktree)
        echo "🔍 Detected regular git repository:" >&2
        echo "   📂 Repository: $git_work_tree" >&2
        echo "   🌿 Branch: $current_branch" >&2
        echo "" >&2

        write_paths+=("$git_dir")
    fi
fi

# Detect submodule local-path remotes and allow writes to hub repos
if [[ -n "${git_work_tree:-}" && -f "$git_work_tree/.gitmodules" ]]; then
    echo "📦 Scanning submodule hubs:" >&2
    while IFS= read -r line; do
        local_url="${line##* }"
        # Resolve relative paths against worktree root
        if [[ "$local_url" != /* ]]; then
            local_url="$(cd "$git_work_tree" && cd "$local_url" 2>/dev/null && pwd -P)" || continue
        fi
        # Only local filesystem paths that exist
        if [[ -d "$local_url" ]]; then
            write_paths+=("$local_url")
            echo "   ✅ Hub: $local_url" >&2
        fi
    done < <(git -C "$git_work_tree" config -f .gitmodules --get-regexp 'submodule\..*\.url')
fi

# Process denied paths from environment variable
denied_paths=()
if [[ -n "${DENY_PATHS:-}" ]]; then
	echo "🚫 Processing denied paths:" >&2
	while IFS= read -r path; do
		[[ -z "$path" ]] && continue

		# Validate path exists (warn if not, but continue - matches CCO)
		if [[ ! -e "$path" ]]; then
			echo "   ⚠️  Warning: deny-path doesn't exist: $path" >&2
		else
			denied_paths+=("$path")
			echo "   🚫 Denying access: $path" >&2
		fi
	done <<< "$DENY_PATHS"
	echo "" >&2
fi

# Detect Claude config directories
claude_config_dirs=()
if [[ -n "${CLAUDE_CONFIG_DIR:-}" ]]; then
    claude_config_dirs+=("$(abs_path "$CLAUDE_CONFIG_DIR")")
elif [[ -d "$HOME/.config/claude" ]]; then
    claude_config_dirs+=("$HOME/.config/claude")
fi
if [[ -d "$HOME/.claude" ]]; then
    claude_config_dirs+=("$HOME/.claude")
fi

# Generate Seatbelt policy
policy_file="$(mktemp -t claude-worktree.XXXXXX.sb)"
trap 'rm -f "$policy_file"' EXIT

{
    echo "(version 1)"
    echo "(allow default)"  # Allow network, IPC, process spawning, etc.

    # === DENY all file writes by default ===
    echo "(deny file-write*)"

    # === DENY specified paths (read + write) ===
    for denied_path in "${denied_paths[@]}"; do
        if [[ -d "$denied_path" ]]; then
            # Directory: use subpath for recursive denial
            printf '(deny file-read* (subpath "%s"))\n' "$(escape_path "$denied_path")"
            printf '(deny file-write* (subpath "%s"))\n' "$(escape_path "$denied_path")"
        else
            # File: use literal for exact match
            printf '(deny file-read* (literal "%s"))\n' "$(escape_path "$denied_path")"
            printf '(deny file-write* (literal "%s"))\n' "$(escape_path "$denied_path")"
        fi
    done

    # === ALLOW writes to specific locations ===

    # 1. Current working directory (the worktree)
    printf '(allow file-write* (subpath "%s"))\n' "$(escape_path "$pwd_abs")"

    # 2. Git directories (common .git for worktree operations)
    for git_path in "${write_paths[@]}"; do
        printf '(allow file-write* (subpath "%s"))\n' "$(escape_path "$git_path")"
    done

    # 3. Branch-specific files (like .git file in worktree)
    for file_path in "${branch_specific_paths[@]}"; do
        printf '(allow file-write* (literal "%s"))\n' "$(escape_path "$file_path")"
    done

    # 4. Claude Code configuration directories
    for config_dir in "${claude_config_dirs[@]}"; do
        if [[ -n "$config_dir" ]]; then
            printf '(allow file-write* (subpath "%s"))\n' "$(escape_path "$config_dir")"
        fi
    done

    # 5. Claude's main config file in home directory
    printf '(allow file-write* (literal "%s/.claude.json"))\n' "$(escape_path "$HOME")"

    # 6. System temp directories (essential for most programs)
    echo "(allow file-write* (subpath \"/tmp\"))"
    echo "(allow file-write* (subpath \"/var/tmp\"))"
    echo "(allow file-write* (subpath \"/var/folders\"))"
    echo "(allow file-write* (subpath \"/private/var/folders\"))"
    echo "(allow file-write* (subpath \"/private/tmp\"))"

    # 7. Device files (I/O)
    for dev in null zero random urandom tty stdin stdout stderr fd; do
        echo "(allow file-write* (literal \"/dev/$dev\"))"
    done

    # 8. User Library folders (needed for app state, caches, logs)
    printf '(allow file-write* (subpath "%s/Library/Caches"))\n' "$(escape_path "$HOME")"
    printf '(allow file-write* (subpath "%s/Library/Logs"))\n' "$(escape_path "$HOME")"
    printf '(allow file-write* (subpath "%s/Library/Application Support"))\n' "$(escape_path "$HOME")"

    # 9. Keychain access (for OAuth token refresh)
    printf '(allow file-read* (subpath "%s/Library/Keychains"))\n' "$(escape_path "$HOME")"
    printf '(allow file-write* (subpath "%s/Library/Keychains"))\n' "$(escape_path "$HOME")"
    printf '(allow file-read* (subpath "/Library/Keychains"))\n'

    # Security framework (needed for Keychain API)
    echo "(allow system-mac-syscall (syscall-number 73))"
    echo "(allow mach-lookup (global-name \"com.apple.securityd\"))"
    echo "(allow mach-lookup (global-name \"com.apple.security.othersigning\"))"
    echo "(allow mach-lookup (global-name \"com.apple.security.credentialstore\"))"

    # Process management (pgrep/pkill/kill for stale test runners like vitest)
    # NOTE: /bin/ps is setuid root + SIP-restricted — macOS Sequoia blocks
    # setuid+restricted binaries inside sandbox-exec. Use pgrep/pkill instead.
    echo "(allow process-info*)"
    echo "(allow signal)"

} > "$policy_file"

# Debug mode: show generated policy
if [[ "${DEBUG:-}" == "1" || "${CCO_DEBUG:-}" == "1" ]]; then
    echo "=== Generated Seatbelt Policy ===" >&2
    cat "$policy_file" >&2
    echo "=================================" >&2
    echo "" >&2
fi

# Show what we're doing
echo "🔒 Running Claude Code in Seatbelt sandbox" >&2
echo "   ✅ Write access: Current directory" >&2
if [[ ${#write_paths[@]} -gt 0 ]]; then
    for git_path in "${write_paths[@]}"; do
        echo "   ✅ Write access: $git_path" >&2
    done
fi
echo "   ✅ Write access: Claude config directories" >&2
echo "   ❌ Everything else: Read-only or denied" >&2
echo "" >&2

# Run Claude Code with sandbox and --dangerously-skip-permissions
# (Safe to use --dangerously-skip-permissions because we're in a sandbox)
exec sandbox-exec -f "$policy_file" $claude_cmd --dangerously-skip-permissions "$@"
