# Deny-Path Support for Sandbox Wrapper - Design Document

**Date:** 2025-11-13
**Status:** Design Complete
**Requirements:** [deny-path-support-prd.md](./deny-path-support-prd.md) %% force-extract %%

## Overview

Add `--deny-path` flag support to `conditional-claude.sh` and `claude-worktree-sandbox.sh` to enable filesystem isolation for skill testing. This emulates CCO's deny-path behavior using macOS Seatbelt policies.

**Primary Use Case:** Enable `testing-skills-with-subagents` skill to verify that skills properly handle filesystem access denial by hiding skill files during baseline tests.

## Architecture Decision

**Selected Approach:** Simple loop-based parsing with newline-separated environment variable

**Rationale (Architecture Evaluation Results):**

| Principle Category | Compliance |
|-------------------|------------|
| Modular Design | ✅ Single responsibility, loose coupling, replaceable parts |
| Data-First Design | ✅ Primitive arrays, straight-line happy path |
| Interface Design | ✅ Simplest solution that meets requirements |
| MVP Principles | ✅ Minimal scope, proven patterns, no over-engineering |
| Safety-First | ✅ Fail fast on invalid input, clear error messages |
| Anti-Patterns | ✅ Avoids scattered checks, branch explosion, over-engineering |

**Rejected Alternatives:**
- Array filtering with regex: Violates simplicity, awkward handling of space-separated syntax
- Getopt-based parsing: Over-engineered, macOS/GNU incompatibility issues, external dependency

## Component Design

### conditional-claude.sh Modifications

**Location:** Add after existing helper functions (lines 34-70), before main execution logic (line 73)

**New Function: `abs_path()`**

```bash
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
```

**New Function: `parse_deny_paths()`**

```bash
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
```

**Modified Main Execution:**

```bash
# Parse deny-path flags (NEW)
parse_deny_paths "$@"

# Main logic (MODIFIED to use remaining_args)
if detect_worktree; then
    echo "🔍 Detected git worktree" >&2
    echo "🔒 Running Claude Code in Seatbelt sandbox" >&2

    real_claude=$(find_real_claude) || {
        echo "❌ Real Claude binary not found in PATH" >&2
        exit 127
    }

    script_path="${BASH_SOURCE[0]}"
    if [[ -L "$script_path" ]]; then
        script_path="$(readlink "$script_path")"
    fi
    script_dir="$(cd "$(dirname "$script_path")" && pwd)"
    export REAL_CLAUDE_PATH="$real_claude"
    exec "$script_dir/claude-worktree-sandbox.sh" "${remaining_args[@]}"
else
    real_claude=$(find_real_claude) || {
        echo "❌ Real Claude binary not found in PATH" >&2
        exit 127
    }
    exec "$real_claude" "${remaining_args[@]}"
fi
```

**Total Addition:** ~35 lines

### claude-worktree-sandbox.sh Modifications

**Location:** Add after git detection block (lines 68-112), before policy generation (line 126)

#### New Logic Block: Process Denied Paths

```bash
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
```

**Modified Policy Generation (after line 134):**

```bash
# === DENY all file writes by default ===
echo "(deny file-write*)"

# === DENY specified paths (read + write) === (NEW)
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

# === ALLOW writes to specific locations === (EXISTING)
```

**Total Addition:** ~25 lines

## Data Flow

```text
User: claude --deny-path ~/.ssh --deny-path /tmp/skill.md "analyze code"
       ↓
conditional-claude.sh:
  - parse_deny_paths() extracts: ["~/.ssh", "/tmp/skill.md"]
  - abs_path() resolves: ["/Users/you/.ssh", "/tmp/skill.md"]
  - Export: DENY_PATHS="/Users/you/.ssh\n/tmp/skill.md"
  - remaining_args: ["analyze code"]
       ↓
detect_worktree() → returns 0 (in worktree)
       ↓
claude-worktree-sandbox.sh:
  - Reads DENY_PATHS from environment
  - Validates each path exists
  - Generates Seatbelt deny rules:
    (deny file-read* (subpath "/Users/you/.ssh"))
    (deny file-write* (subpath "/Users/you/.ssh"))
    (deny file-read* (literal "/tmp/skill.md"))
    (deny file-write* (literal "/tmp/skill.md"))
       ↓
sandbox-exec -f policy.sb claude --dangerously-skip-permissions "analyze code"
```

## Error Handling

### 1. Missing Argument

```bash
claude --deny-path
```

**Detection:** `[[ -z "${2:-}" ]]` in parse_deny_paths()
**Action:** Print error to stderr, exit code 1
**Message:** `Error: --deny-path requires a path argument`

### 2. Non-Existent Path

```bash
claude --deny-path ~/nonexistent "test"
```

**Detection:** `[[ ! -e "$path" ]]` in sandbox script
**Action:** Warn to stderr, continue processing
**Message:** `⚠️  Warning: deny-path doesn't exist: /Users/you/nonexistent`
**Rationale:** Matches CCO behavior (FR3)

### 3. Outside Worktree

```bash
cd ~/regular-repo
claude --deny-path ~/.ssh "test"
```

**Detection:** `detect_worktree` returns 1
**Action:** Flags parsed and removed, route to real Claude
**Result:** No sandbox, no warnings, transparent pass-through (FR7)

### 4. Claude Binary Not Found

**Existing behavior - unchanged**
**Action:** Print error, exit code 127

## Testing Strategy

### Test Setup: Using Git Worktrees

Use the `using-git-worktrees` skill to create test worktrees:

```bash
# Skill will:
# 1. Detect current branch (feature/deny-path-support)
# 2. Create worktree: .worktrees/feature-deny-path-support-worktree
# 3. Install dependencies
# 4. Report location
```

### Test 1: Deny Skill File Access (Primary Use Case)

**Setup:**

```bash
# Create test skill file
mkdir -p /tmp/test-skills
echo "SECRET SKILL INSTRUCTIONS" > /tmp/test-skills/secret-skill.md

# Create worktree (using skill)
git worktree add .worktrees/feature-deny-path-support-worktree -b feature-deny-path-support-worktree
cd .worktrees/feature-deny-path-support-worktree
```

**Execute:**

```bash
claude --deny-path /tmp/test-skills/secret-skill.md "read /tmp/test-skills/secret-skill.md"
```

**Expected Output:**

```text
🔍 Detected git worktree
🔒 Running Claude Code in Seatbelt sandbox
🚫 Processing denied paths:
   🚫 Denying access: /tmp/test-skills/secret-skill.md

[Claude attempts to read file]
Error: Permission denied: /tmp/test-skills/secret-skill.md
```

**Verification:**
- Stderr shows sandbox detection messages
- Stderr shows deny-path processing
- Claude receives permission denied error when accessing file
- Exit code from Claude (not wrapper)

### Test 2: Error Handling - Missing Argument

**Execute:**

```bash
claude --deny-path
```

**Expected Output:**

```text
Error: --deny-path requires a path argument
[exit code: 1]
```

**Verification:**
- Error message printed to stderr
- Exits immediately with code 1
- No Claude execution

### Test 3: Transparent Outside Worktree

**Setup:**

```bash
# Switch to main repo (not a worktree)
cd /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows
```

**Execute:**

```bash
claude --deny-path ~/.ssh "show git status"
```

**Expected Output:**

```text
[Normal Claude output - no sandbox messages]
```

**Verification:**
- No "🔍 Detected git worktree" message
- No "🔒 Running Claude Code in Seatbelt sandbox" message
- Claude executes normally
- --deny-path flag removed from arguments

## Implementation Checklist

- [x] Add `abs_path()` function to conditional-claude.sh
- [x] Add `parse_deny_paths()` function to conditional-claude.sh
- [x] Modify main execution block to use `remaining_args`
- [x] Add deny-path processing block to claude-worktree-sandbox.sh
- [x] Add deny rules to Seatbelt policy generation
- [x] Run Test 1: Deny skill file access
- [x] Run Test 2: Missing argument error handling
- [x] Run Test 3: Transparent outside worktree
- [x] Update documentation references

## Success Criteria

1. All three tests pass
2. Implementation adds ~60 lines total (35 + 25)
3. No performance degradation (< 100ms overhead per NFR4)
4. Error messages are clear and actionable
5. Behavior matches requirements FR1-FR9, NFR1-NFR5

## References

- Requirements: [deny-path-support-prd.md](./deny-path-support-prd.md)
- Architecture Principles: [ARCHITECTURE-PRINCIPLES.md](../../../../../ARCHITECTURE-PRINCIPLES.md)
- Related Design: [poc-2-conditional-wrapper.md](../20251110-sandbox/poc-2-conditional-wrapper.md)
- Consumer Skill: [testing-skills-with-subagents](../../../../../.claude/skills/testing-skills-with-subagents/SKILL.md)
