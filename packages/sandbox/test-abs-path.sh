#!/usr/bin/env bash
set -euo pipefail

# Source the abs_path function from conditional-claude.sh
# Extract just the function definition to avoid executing main logic
eval "$(sed -n '/^abs_path()/,/^}/p' ./conditional-claude.sh)"

# Check if abs_path function exists
if ! declare -f abs_path > /dev/null; then
    echo "FAIL: abs_path function not found"
    exit 1
fi

# Test 1: Tilde expansion
result=$(abs_path "~/.ssh")
expected="$HOME/.ssh"
if [[ "$result" != "$expected" ]]; then
    echo "FAIL: Tilde expansion - got $result, expected $expected"
    exit 1
fi

# Test 2: Existing directory (handle macOS /tmp -> /private/tmp symlink)
mkdir -p /tmp/test-deny-path
result=$(abs_path "/tmp/test-deny-path")
# On macOS, /tmp is a symlink to /private/tmp, so canonicalize both
expected=$(cd /tmp/test-deny-path && pwd -P)
if [[ "$result" != "$expected" ]]; then
    echo "FAIL: Existing directory - got $result, expected $expected"
    exit 1
fi

# Test 3: Non-existent path (should return as-is)
result=$(abs_path "/nonexistent/path")
expected="/nonexistent/path"
if [[ "$result" != "$expected" ]]; then
    echo "FAIL: Non-existent path - got $result, expected $expected"
    exit 1
fi

echo "PASS: All abs_path tests passed"