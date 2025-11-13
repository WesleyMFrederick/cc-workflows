#!/usr/bin/env bash
set -euo pipefail

# Find real claude binary in PATH, skipping wrapper directory
# Returns path to real claude, or returns 1 if not found
find_real_claude() {
	# Get wrapper directory (absolute path)
	local wrapper_dir
	wrapper_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

	# Split PATH and iterate through directories
	local IFS=':'
	local path_dir
	for path_dir in $PATH; do
		# Skip empty entries
		if [[ -z "$path_dir" ]]; then
			continue
		fi

		# Skip wrapper directory
		if [[ "$(cd "$path_dir" 2>/dev/null && pwd)" == "$wrapper_dir" ]]; then
			continue
		fi

		# Check if claude binary exists and is executable
		if [[ -x "$path_dir/claude" ]]; then
			echo "$path_dir/claude"
			return 0
		fi
	done

	return 1
}

# Convert relative path to absolute path
abs_path() {
	local p="$1"
	# Expand tilde
	if [[ "$p" == "~"* ]]; then
		p="${p/#\~/$HOME}"
	fi
	# Convert to absolute
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

# Parse --deny-path flags from arguments
# Returns: Sets DENY_PATHS env var, populates remaining_args array
parse_deny_paths() {
	local deny_paths=()
	remaining_args=()

	while [[ $# -gt 0 ]]; do
		case "$1" in
			--deny-path)
				# Check for missing argument
				if [[ -z "${2:-}" ]]; then
					echo "Error: --deny-path requires a path argument" >&2
					exit 1
				fi
				# Resolve to absolute path and add to array
				deny_paths+=("$(abs_path "$2")")
				shift 2
				;;
			--deny-path=*)
				# Extract path after = and resolve
				deny_paths+=("$(abs_path "${1#--deny-path=}")")
				shift
				;;
			*)
				# Not a deny-path flag, keep for Claude
				remaining_args+=("$1")
				shift
				;;
		esac
	done

	# Export as newline-separated string
	if [[ ${#deny_paths[@]} -gt 0 ]]; then
		export DENY_PATHS="$(printf '%s\n' "${deny_paths[@]}")"
	fi
}

# Detect if running in a git worktree
# Returns 0 if worktree detected, 1 if not in git repo
detect_worktree() {
	# Check if we're in a git repository
	if ! git rev-parse --git-dir &>/dev/null; then
		return 1
	fi

	# Get the git directory (can be relative or absolute)
	local git_dir
	git_dir=$(git rev-parse --git-dir)

	# Get the common directory (points to main repo)
	local common_dir
	common_dir=$(git rev-parse --git-common-dir)

	# Normalize relative paths to absolute for comparison
	if [[ ! "$git_dir" = /* ]]; then
		git_dir="$(pwd)/$git_dir"
	fi

	if [[ ! "$common_dir" = /* ]]; then
		common_dir="$(pwd)/$common_dir"
	fi

	# Resolve symlinks and canonical paths
	git_dir=$(cd "$(dirname "$git_dir")" && pwd)/$(basename "$git_dir")
	common_dir=$(cd "$(dirname "$common_dir")" && pwd)/$(basename "$common_dir")

	# If they're different, we're in a worktree
	if [[ "$git_dir" != "$common_dir" ]]; then
		return 0
	fi

	return 1
}

# Parse deny-path flags
parse_deny_paths "$@"

# Main logic
if detect_worktree; then
	echo "🔍 Detected git worktree" >&2
	echo "🔒 Running Claude Code in Seatbelt sandbox" >&2

	# Find real claude binary (not the wrapper)
	real_claude=$(find_real_claude) || {
		echo "❌ Real Claude binary not found in PATH" >&2
		exit 127
	}

	# Pass real claude path to sandbox script via environment variable
	# Resolve symlink to get actual script location
	script_path="${BASH_SOURCE[0]}"
	if [[ -L "$script_path" ]]; then
		script_path="$(readlink "$script_path")"
	fi
	script_dir="$(cd "$(dirname "$script_path")" && pwd)"
	export REAL_CLAUDE_PATH="$real_claude"
	exec "$script_dir/claude-worktree-sandbox.sh" "${remaining_args[@]}"
else
	# Route to real claude binary
	real_claude=$(find_real_claude) || {
		echo "❌ Real Claude binary not found in PATH" >&2
		exit 127
	}
	exec "$real_claude" "${remaining_args[@]}"
fi
