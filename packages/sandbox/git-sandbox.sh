#!/usr/bin/env bash
# git-sandbox - Run commands with Seatbelt sandboxing optimized for git worktrees
#
# Usage: git-sandbox <command> [args...]
# Example: git-sandbox claude "commit these changes"
#
# Features:
# - Auto-detects git worktree parent .git directory
# - Allows writes to current worktree + parent .git
# - Denies writes everywhere else
# - Full read access to filesystem (for git operations)

set -euo pipefail

usage() {
    cat <<EOF
Usage: git-sandbox [OPTIONS] <command> [args...]

Git-aware sandboxing using macOS Seatbelt.

Options:
  -w, --write PATH     Additional writable path (repeatable)
  --safe              Hide entire \$HOME except allowed paths
  --deny PATH         Deny read/write access to path
  -h, --help          Show this help

Examples:
  # Run Claude in sandboxed worktree
  git-sandbox claude "commit these changes"

  # Allow writes to another directory
  git-sandbox -w ~/downloads claude "save results"

  # Safe mode (hide rest of home directory)
  git-sandbox --safe -w ~/code claude "analyze this"

Git Worktree Support:
  Automatically detects and allows:
  - Current directory (write)
  - Parent .git directory (write, for worktree operations)
  - Entire filesystem (read, so git can access objects)
EOF
    exit 0
}

# Escape path for Seatbelt policy
policy_quote() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    printf '%s' "$s"
}

# Get absolute path
abs_path() {
    local p="$1"
    # Expand tilde
    if [[ "$p" == "~" || "$p" == ~/* ]]; then
        p="${p/#\~/$HOME}"
    fi
    if [[ -e "$p" ]]; then
        if [[ -d "$p" ]]; then
            (cd "$p" && pwd -P)
        else
            (cd "$(dirname "$p")" && printf '%s/%s\n' "$(pwd -P)" "$(basename "$p")")
        fi
    else
        # For non-existent paths, ensure parent exists
        local parent base
        parent="$(dirname "$p")"
        base="$(basename "$p")"
        if [[ -d "$parent" ]]; then
            (cd "$parent" && printf '%s/%s\n' "$(pwd -P)" "$base")
        else
            echo "Error: Parent directory does not exist: $parent" >&2
            exit 1
        fi
    fi
}

# Parse arguments
write_paths=()
deny_paths=()
safe_mode=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        -w|--write)
            shift
            [[ $# -gt 0 ]] || usage
            write_paths+=("$(abs_path "$1")")
            shift
            ;;
        --deny)
            shift
            [[ $# -gt 0 ]] || usage
            deny_paths+=("$(abs_path "$1")")
            shift
            ;;
        --safe)
            safe_mode=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        --)
            shift
            break
            ;;
        -*)
            echo "Unknown option: $1" >&2
            usage
            ;;
        *)
            break
            ;;
    esac
done

[[ $# -gt 0 ]] || usage

# Check for sandbox-exec
if ! command -v sandbox-exec &>/dev/null; then
    echo "Error: sandbox-exec not found (macOS only)" >&2
    exit 127
fi

# Get current directory
PWD_ABS="$(pwd -P)"

# Auto-detect git configuration
git_common_dir=""
git_work_tree=""

if git rev-parse --git-dir &>/dev/null; then
    # We're in a git repository
    git_work_tree="$(git rev-parse --show-toplevel 2>/dev/null || echo "")"
    git_common_dir="$(git rev-parse --git-common-dir 2>/dev/null || echo "")"

    # If git_common_dir is relative, make it absolute
    if [[ -n "$git_common_dir" && "$git_common_dir" != /* ]]; then
        git_common_dir="$(cd "$git_work_tree" && cd "$git_common_dir" && pwd -P)"
    fi

    # If we're in a worktree (git_common_dir is outside current tree), add it
    if [[ -n "$git_common_dir" && "$git_common_dir" != "$git_work_tree/.git" ]]; then
        echo "🔍 Detected git worktree" >&2
        echo "   Work tree: $git_work_tree" >&2
        echo "   Common .git: $git_common_dir" >&2
        write_paths+=("$git_common_dir")
    fi

    # Always allow the work tree
    if [[ -n "$git_work_tree" && "$git_work_tree" != "$PWD_ABS" ]]; then
        write_paths+=("$git_work_tree")
    fi
fi

# Generate Seatbelt policy
policy_file="$(mktemp -t git-sandbox.XXXXXX.sb)"
trap 'rm -f "$policy_file"' EXIT

{
    echo "(version 1)"
    echo "(allow default)"

    # Deny all writes by default
    echo "(deny file-write*)"

    # Safe mode: deny reads in $HOME too
    if [[ "$safe_mode" == true ]]; then
        printf '(deny file-read* (subpath "%s"))\n' "$(policy_quote "$HOME")"
    fi

    # 1. Current working directory (always writable)
    printf '(allow file-write* (subpath "%s"))\n' "$(policy_quote "$PWD_ABS")"
    if [[ "$safe_mode" == true ]]; then
        printf '(allow file-read* (subpath "%s"))\n' "$(policy_quote "$PWD_ABS")"
    fi

    # 2. Additional writable paths
    for path in "${write_paths[@]}"; do
        if [[ -d "$path" ]]; then
            printf '(allow file-write* (subpath "%s"))\n' "$(policy_quote "$path")"
            if [[ "$safe_mode" == true ]]; then
                printf '(allow file-read* (subpath "%s"))\n' "$(policy_quote "$path")"
            fi
        else
            # Create file if it doesn't exist (so Seatbelt can reference it)
            [[ -e "$path" ]] || touch "$path"
            printf '(allow file-write* (literal "%s"))\n' "$(policy_quote "$path")"
            if [[ "$safe_mode" == true ]]; then
                printf '(allow file-read* (literal "%s"))\n' "$(policy_quote "$path")"
            fi
        fi
    done

    # 3. Deny paths
    for path in "${deny_paths[@]}"; do
        if [[ -d "$path" ]]; then
            printf '(deny file-read* (subpath "%s"))\n' "$(policy_quote "$path")"
            printf '(deny file-write* (subpath "%s"))\n' "$(policy_quote "$path")"
        else
            printf '(deny file-read* (literal "%s"))\n' "$(policy_quote "$path")"
            printf '(deny file-write* (literal "%s"))\n' "$(policy_quote "$path")"
        fi
    done

    # 4. System essentials
    echo "(allow file-write* (subpath \"/tmp\"))"
    echo "(allow file-write* (subpath \"/var/tmp\"))"
    echo "(allow file-write* (subpath \"/var/folders\"))"
    echo "(allow file-write* (subpath \"/private/var/folders\"))"
    echo "(allow file-write* (subpath \"/private/tmp\"))"

    # Device files
    for dev in null zero random urandom tty stdin stdout stderr fd; do
        echo "(allow file-write* (literal \"/dev/$dev\"))"
    done

    # User Library folders (for app state, caches, logs)
    printf '(allow file-write* (subpath "%s/Library/Caches"))\n' "$(policy_quote "$HOME")"
    printf '(allow file-write* (subpath "%s/Library/Logs"))\n' "$(policy_quote "$HOME")"
    printf '(allow file-write* (subpath "%s/Library/Application Support"))\n' "$(policy_quote "$HOME")"

    # Keychain access (for OAuth, credentials)
    printf '(allow file-read* (subpath "%s/Library/Keychains"))\n' "$(policy_quote "$HOME")"
    printf '(allow file-write* (subpath "%s/Library/Keychains"))\n' "$(policy_quote "$HOME")"
    printf '(allow file-read* (subpath "/Library/Keychains"))\n'

    # Security framework (needed for Keychain)
    echo "(allow system-mac-syscall (syscall-number 73))"
    echo "(allow mach-lookup (global-name \"com.apple.securityd\"))"
    echo "(allow mach-lookup (global-name \"com.apple.security.othersigning\"))"
    echo "(allow mach-lookup (global-name \"com.apple.security.credentialstore\"))"

} > "$policy_file"

# Debug: Show policy if CCO_DEBUG=1
if [[ "${CCO_DEBUG:-}" == "1" ]]; then
    echo "=== Generated Seatbelt Policy ===" >&2
    cat "$policy_file" >&2
    echo "=================================" >&2
fi

# Run command in sandbox
echo "🔒 Running in Seatbelt sandbox: $*" >&2
exec sandbox-exec -f "$policy_file" "$@"
