---
name: importing-session-to-worktree
description: Use when you need to resume a Claude Code session from a different project directory (typically a worktree) - copies transcript and updates sessions-index so claude --resume works across project boundaries
---

# Importing a Session to a Worktree

## Overview

Imports a Claude Code session from one project directory into another so `claude --resume <session-id>` works in the target directory. Sessions are tied to project directories via transcript files and `sessions-index.json` — this skill bridges that gap.

## When to Use

- After creating a worktree, need to continue an existing session's work
- Resuming a session started in main repo from a worktree (or vice versa)
- `claude --resume <id>` says "session not found" because you're in a different project directory

## Prerequisites

- Know the source session ID (UUID format)
- Target directory exists (worktree already created)
- `jq` installed (`brew install jq` if missing)

## What Lives Where

| Item | Location | Cross-project? |
|------|----------|---------------|
| Transcript `.jsonl` | `~/.claude/projects/<encoded-path>/` | **NO** — must copy |
| Session subdir (subagents) | `~/.claude/projects/<encoded-path>/<session-id>/` | **NO** — must copy |
| `sessions-index.json` | `~/.claude/projects/<encoded-path>/` | **NO** — must update |
| Task list | `~/.claude/tasks/<session-id>/` | YES — global |
| Plan files | `~/.claude/plans/` | YES — global |

## Path Encoding

Claude encodes project paths by replacing `/` and `_` with `-`:

```bash
# /Users/me/my_project → -Users-me-my-project
echo "$PROJECT_PATH" | sed 's|[/_]|-|g'
```

## Workflow

Run each command, verify output, then proceed to next.

### Step 1: Set Variables

```bash
SESSION_ID="<paste-session-id-here>"
TARGET_PATH="$(pwd)"  # Run from worktree directory
```

### Step 2: Find Source Project Directory

```bash
SOURCE_DIR=$(grep -rl "$SESSION_ID" ~/.claude/projects/*/sessions-index.json 2>/dev/null | head -1 | xargs dirname)
echo "Source: $SOURCE_DIR"
```

If empty — session ID is wrong or session was never indexed. Check `ls ~/.claude/projects/*/sessions-index.json` and search manually.

### Step 3: Derive Target Project Directory

```bash
TARGET_ENCODED=$(echo "$TARGET_PATH" | sed 's|[/_]|-|g')
TARGET_DIR="$HOME/.claude/projects/$TARGET_ENCODED"
echo "Target: $TARGET_DIR"
```

### Step 4: Create Target Directory

```bash
mkdir -p "$TARGET_DIR"
```

### Step 5: Copy Transcript

```bash
cp "$SOURCE_DIR/$SESSION_ID.jsonl" "$TARGET_DIR/"
ls -la "$TARGET_DIR/$SESSION_ID.jsonl"  # Verify
```

### Step 6: Copy Session Subdirectory (if exists)

```bash
if [ -d "$SOURCE_DIR/$SESSION_ID" ]; then
  cp -r "$SOURCE_DIR/$SESSION_ID" "$TARGET_DIR/"
  echo "Copied session subdirectory (subagents/tool-results)"
else
  echo "No session subdirectory — skipping (normal for simple sessions)"
fi
```

### Step 7: Update sessions-index.json

```bash
# Extract entry from source index
SOURCE_ENTRY=$(jq --arg sid "$SESSION_ID" '.entries[] | select(.sessionId == $sid)' "$SOURCE_DIR/sessions-index.json")

# Update fullPath and projectPath in the entry
UPDATED_ENTRY=$(echo "$SOURCE_ENTRY" | jq \
  --arg fp "$TARGET_DIR/$SESSION_ID.jsonl" \
  --arg pp "$TARGET_PATH" \
  '.fullPath = $fp | .projectPath = $pp')

# Merge into target index (create if needed)
TARGET_INDEX="$TARGET_DIR/sessions-index.json"
if [ -f "$TARGET_INDEX" ]; then
  # Add entry to existing index (skip if already present)
  EXISTS=$(jq --arg sid "$SESSION_ID" '.entries[] | select(.sessionId == $sid)' "$TARGET_INDEX")
  if [ -z "$EXISTS" ]; then
    jq --argjson entry "$UPDATED_ENTRY" '.entries += [$entry]' "$TARGET_INDEX" > "${TARGET_INDEX}.tmp"
    mv "${TARGET_INDEX}.tmp" "$TARGET_INDEX"
    echo "Added entry to existing index"
  else
    echo "Entry already exists in target index — skipping"
  fi
else
  # Create new index with single entry
  jq -n --argjson entry "$UPDATED_ENTRY" '{"version": 1, "entries": [$entry]}' > "$TARGET_INDEX"
  echo "Created new sessions-index.json"
fi
```

### Step 8: Verify

```bash
# Check entry exists in target index
jq --arg sid "$SESSION_ID" '.entries[] | select(.sessionId == $sid) | {sessionId, summary, projectPath}' "$TARGET_INDEX"

# Check transcript exists
ls -la "$TARGET_DIR/$SESSION_ID.jsonl"

# Check tasks still accessible (global — should just work)
ls ~/.claude/tasks/$SESSION_ID/ 2>/dev/null && echo "Tasks found" || echo "No tasks (normal if session had none)"
```

Then run: `claude --resume "$SESSION_ID"` from the target directory.

## Common Mistakes

### Wrong encoding
**Symptom:** Target dir doesn't match what Claude creates
**Fix:** Both `/` AND `_` become `-`. Use `sed 's|[/_]|-|g'`, not just `sed 's|/|-|g'`

### Missing session subdirectory
**Symptom:** Session resumes but subagent context is lost
**Fix:** Always check for and copy `$SOURCE_DIR/$SESSION_ID/` directory (Step 6)

### Stale fullPath in index entry
**Symptom:** Resume works but Claude looks for transcript in wrong location
**Fix:** Step 7 updates `fullPath` and `projectPath` — don't skip the `jq` update

### Session not in any index
**Symptom:** Step 2 `grep` returns empty
**Fix:** The session may exist as a `.jsonl` file without an index entry (old sessions). Manually find: `ls ~/.claude/projects/*/$SESSION_ID.jsonl`

## Quick Reference

| Step | Command | Verify |
|------|---------|--------|
| Find source | `grep -rl "$SID" ~/.claude/projects/*/sessions-index.json` | Non-empty path |
| Encode target | `pwd \| sed 's\|[/_]\|-\|g'` | Matches Claude's encoding |
| Copy transcript | `cp $SOURCE/$SID.jsonl $TARGET/` | File exists in target |
| Copy subagents | `cp -r $SOURCE/$SID/ $TARGET/` (if exists) | Dir exists or skipped |
| Update index | `jq` merge entry | Entry in target index |
| Resume | `claude --resume $SID` | Session loads |
