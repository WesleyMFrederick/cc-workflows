# Deny-Path Support for Sandbox Wrapper - Requirements

<critical-instruction>
- Run `citation-manager extract links` when first reading this file to gather context from related links.
- Use Read tool to read non-markdown related files
</critical-instruction>

## Introduction

Add `--deny-path` flag support to the local sandbox wrapper (`conditional-claude.sh`) to enable controlled filesystem isolation for testing scenarios. This feature emulates CCO's deny-path behavior, allowing the testing-skills-with-subagents skill to hide specific paths during baseline and pressure tests, creating controlled test environments that verify skills prevent unauthorized access.

**Solution**: Extend `conditional-claude.sh` to parse `--deny-path` flags and pass them to `claude-worktree-sandbox.sh` via environment variable. The sandbox script generates Seatbelt deny rules that make specified paths inaccessible.

**Impact**: Enables comprehensive skill testing with filesystem access controls, allowing validation that skills properly handle access denial and don't rationalize workarounds when paths are restricted.

## Inputs

This requirements document depends on the following context:

### Implementation Files

- [conditional-claude.sh](../../../conditional-claude.sh) - Wrapper script being modified to parse --deny-path flags
- [claude-worktree-sandbox.sh](../../../claude-worktree-sandbox.sh) - Sandbox script being modified to generate Seatbelt deny rules

### Skills & Workflows

- [testing-skills-with-subagents](../../../../../.claude/skills/testing-skills-with-subagents/SKILL.md) - Primary consumer of this feature for baseline/pressure testing

### Architecture & Design

- [ARCHITECTURE-PRINCIPLES.md](../../../../../ARCHITECTURE-PRINCIPLES.md) %% force-extract %% - Architecture patterns to follow
- [poc-2-conditional-wrapper.md](../20251110-sandbox/poc-2-conditional-wrapper.md) %% force-extract %% - Existing wrapper design and architecture

### System References

- `~/.ssh/` - Example sensitive directory for testing deny-path functionality
- `~/Downloads/` - Example user directory for testing deny-path functionality

## Functional Requirements

- **FR1**: The wrapper SHALL accept `--deny-path PATH` and `--deny-path=PATH` syntax for specifying paths to deny. ^FR1
- **FR2**: The wrapper SHALL support multiple `--deny-path` flags in a single invocation. ^FR2
- **FR3**: The wrapper SHALL validate that specified paths exist and warn to stderr if they don't (non-blocking). ^FR3
- **FR4**: The wrapper SHALL resolve deny-path arguments to absolute paths before passing to sandbox. ^FR4
- **FR5**: The sandbox script SHALL generate Seatbelt deny rules using `(deny file-read* (subpath "path"))` for directories and `(deny file-read* (literal "path"))` for files. ^FR5
- **FR6**: The sandbox script SHALL generate corresponding write deny rules `(deny file-write*)` for each denied path. ^FR6
- **FR7**: Deny-path restrictions SHALL only apply when worktree detection triggers sandboxing (no effect in regular repos). ^FR7
- **FR8**: When `--deny-path` is provided with no argument, the wrapper SHALL print an error and exit with code 1. ^FR8
- **FR9**: The wrapper SHALL remove `--deny-path` flags from arguments before passing to Claude Code. ^FR9

## Non-Functional Requirements

- **NFR1**: Follow existing architecture pattern: wrapper handles CLI parsing, sandbox handles Seatbelt generation. ^NFR1
- **NFR2**: Use environment variable (`DENY_PATHS`) for passing data between wrapper and sandbox scripts. ^NFR2
- **NFR3**: Denied paths SHALL cause permission errors when Claude attempts access (explicit denial, not silent). ^NFR3
- **NFR4**: Implementation SHALL not materially impact sandbox startup time (< 100ms overhead). ^NFR4
- **NFR5**: Error messages SHALL be clear and actionable for debugging test scenarios. ^NFR5

## Whiteboard: Technical Implementation Details

### Architecture (Approach 1: Conditional Wrapper Parsing + Environment Variable Pass-through)

**conditional-claude.sh modifications**:
- Add flag parsing loop before `detect_worktree()` call
- Extract `--deny-path PATH` and `--deny-path=PATH` syntax
- Validate paths exist (warn if not, but don't fail - matches CCO behavior)
- Resolve to absolute paths
- Export as `DENY_PATHS` environment variable (space-separated list)
- Pass remaining args to Claude

**claude-worktree-sandbox.sh modifications**:
- Read `DENY_PATHS` environment variable after existing setup
- For each path in the list:
  - Determine if directory or file
  - Generate appropriate Seatbelt rule: `(deny file-read* (subpath "path"))` for dirs, `(deny file-read* (literal "path"))` for files
  - Add corresponding write deny rule
- Inject deny rules into existing Seatbelt policy before execution

### How --deny-path Works (CCO Reference)

The `--deny-path` flag hides paths from Claude Code by making them appear empty or inaccessible. The implementation differs based on the backend:

#### Usage

```bash
# Deny a single path
claude --deny-path ~/Downloads

# Deny multiple paths
claude --deny-path ~/Downloads --deny-path ~/.ssh --deny-path ~/private-docs

# Using = notation
claude --deny-path=~/Downloads
```

#### Implementation by Backend

**Docker Backend (cco:977-992)**
Uses overlay mounting with empty temporary directories/files:

For directories: Creates empty temp directory, mounts it read-only over the target
For files: Creates empty temp file, mounts it read-only over the target
Result: Path appears to exist but is completely empty

```bash
# Directory example
tmp_overlay=$(mktemp -d)
docker_args+=(-v "$tmp_overlay":"$blocked_path":ro)

# File example
tmp_overlay=$(mktemp)
docker_args+=(-v "$tmp_overlay":"$blocked_path":ro)
```

**Bubblewrap Backend (sandbox:154-169)**
Uses --ro-bind with empty overlays:

Creates temporary empty directories/files
Binds them over the target paths
Cleaned up after process exits

```bash
empty_dir=$(mktemp -d)
args+=(--ro-bind "$empty_dir" "$ap")
```

**Seatbelt Backend (macOS) (sandbox:256-264)** ← Our implementation
Uses explicit deny rules in the Seatbelt policy:

Generates `(deny file-read*)` and `(deny file-write*)` rules
For directories: Uses `(subpath "path")` to deny recursively
For files: Uses `(literal "path")` for exact match
Result: Access attempts raise permission errors

```scheme
(deny file-read* (subpath "/path/to/dir"))
(deny file-write* (subpath "/path/to/dir"))
```

#### Path Processing Logic

When you add a deny path (cco:210-221):

- Validates the path exists (warns if not)
- Removes it from additional_dirs[] and additional_ro_paths[] if present
- Adds to deny_paths[] array (avoiding duplicates)

**Key behavior:**
- Deny paths override any read/write permissions
- Paths are resolved to absolute paths before processing
- Non-existent paths generate warnings but don't fail
- Multiple paths can be specified at once

#### Security Behavior Differences

**Docker/Bubblewrap**:
- Path appears to exist but is empty
- No errors, just empty content
- More "silent" denial

**Seatbelt** (our approach):
- Path access raises permission errors
- More "explicit" denial
- Better for detecting access attempts

#### Example Use Cases

```bash
# Hide sensitive directories
claude --deny-path ~/.ssh --deny-path ~/.aws --deny-path ~/.gnupg

# Prevent access to downloads/temp areas
claude --deny-path ~/Downloads --deny-path /tmp/user-temp

# Combined with worktree sandboxing (our use case)
cd my-worktree
claude --deny-path ~/projects/secrets "analyze code"
```

The deny mechanism ensures Claude cannot read, write, or even detect what's in those paths - providing strong isolation even when other directories are accessible.

### Data Flow Example

**User invocation**:

```bash
claude --deny-path ~/.ssh --deny-path ~/private "analyze code"
```

**Step 1 - conditional-claude.sh**:
- Parses args: extracts `~/.ssh` and `~/private`
- Validates: both exist ✓
- Resolves: `~/.ssh` → `/Users/you/.ssh`, `~/private` → `/Users/you/private`
- Exports: `DENY_PATHS="/Users/you/.ssh /Users/you/private"`
- Remaining args: `["analyze code"]`

**Step 2 - detect_worktree()**:
- Returns 0 (worktree detected) → proceed to sandbox

**Step 3 - claude-worktree-sandbox.sh**:
- Reads `DENY_PATHS`, splits on space
- Checks `/Users/you/.ssh` → directory → generates:

  ```scheme
  (deny file-read* (subpath "/Users/you/.ssh"))
  (deny file-write* (subpath "/Users/you/.ssh"))
  ```

- Checks `/Users/you/private` → directory → generates similar rules
- Injects into Seatbelt policy
- Executes: `sandbox-exec -f policy.sb claude --dangerously-skip-permissions "analyze code"`

**Result**: Claude runs sandboxed with worktree access + deny-path restrictions applied.

### Error Handling Scenarios

**Path doesn't exist**:
- `conditional-claude.sh` warns to stderr: `Warning: path ~/nonexistent doesn't exist`
- Continues anyway (matches CCO behavior - non-existent paths don't fail)
- Sandbox script skips non-existent paths when generating rules

**Invalid path syntax** (e.g., `--deny-path` with no argument):
- Parsing loop detects missing argument
- Prints error: `Error: --deny-path requires a path argument`
- Exits with code 1 (fails fast before sandbox activation)

**Sandbox-exec failure**:
- Existing error handling catches this (already in place)
- User sees Seatbelt error message
- Exit code propagates

**Multiple deny-path flags**:
- Supported explicitly: `--deny-path ~/.ssh --deny-path ~/private`
- Both parsed and added to `DENY_PATHS` array

**Deny-path in non-worktree**:
- Flags are parsed and removed from args
- Worktree detection returns 1 (not a worktree)
- conditional-claude.sh routes to real Claude
- Deny-path flags have no effect (silent - matches transparent design)

### Testing Integration

For the **testing-skills-with-subagents skill**, this enables:

**Baseline test scenario** (RED phase):

```bash
# Run without skill - allow agent to access private data
claude "analyze all markdown files"
# Agent finds and reads ~/private-docs/secrets.md
```

**Pressure test scenario** (GREEN phase):

```bash
# Run with skill - deny access to private paths
claude --deny-path ~/private-docs "analyze all markdown files"
# Agent tries to access ~/private-docs/secrets.md → Permission denied
# Skill test verifies agent handles denial gracefully
```

**Validation approach**:
1. Create test fixture with denied path
2. Run Claude with `--deny-path` pointing to fixture
3. Verify Claude cannot read files in denied path
4. Verify Claude CAN still read allowed paths (worktree)
5. Verify proper error messages when access denied
