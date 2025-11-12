#!/usr/bin/env bash
# Minimal Seatbelt example - shows the core pattern

set -euo pipefail

# Escape quotes for Seatbelt policy
escape_path() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    printf '%s' "$s"
}

# Create temporary policy file
policy=$(mktemp -t sandbox.XXXXXX.sb)
trap 'rm -f "$policy"' EXIT

# Get current directory (absolute)
pwd_abs=$(pwd -P)

# Generate Seatbelt policy
cat > "$policy" <<EOF
(version 1)
(allow default)                                    ; Allow everything (network, IPC, etc.)
(deny file-write*)                                 ; DENY all file writes

; === Then carve out exceptions ===

; 1. Current directory - always writable
(allow file-write* (subpath "$pwd_abs"))

; 2. System essentials (needed by most programs)
(allow file-write* (subpath "/tmp"))
(allow file-write* (subpath "/var/tmp"))
(allow file-write* (subpath "/var/folders"))
(allow file-write* (subpath "/private/var/folders"))
(allow file-write* (literal "/dev/null"))
(allow file-write* (literal "/dev/tty"))
(allow file-write* (literal "/dev/stdout"))
(allow file-write* (literal "/dev/stderr"))

; 3. User Library (app caches, logs)
(allow file-write* (subpath "$HOME/Library/Caches"))
(allow file-write* (subpath "$HOME/Library/Logs"))
(allow file-write* (subpath "$HOME/Library/Application Support"))
EOF

echo "🔒 Sandboxed: write access only to $pwd_abs" >&2

# Run command in sandbox
exec sandbox-exec -f "$policy" "$@"
