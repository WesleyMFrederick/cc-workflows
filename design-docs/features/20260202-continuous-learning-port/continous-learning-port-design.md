# Design Document — Continuous Learning Port

**Feature**: Port Continuous Learning from everything-claude-code to cc-workflows
**Phase**: 2 (Research & Design)
**Date**: 2026-02-02
**Status**: Draft
**Inputs**: [PRD](./continuous-learning-port-prd.md)%%force-extract%%, [Phase 2 Whiteboard](./2-design-phase/phase2-design-whiteboard.md)

---

## Design Overview

Port the continuous learning pipeline to cc-workflows with these adaptations:

1. **observe.sh** — rewritten to pure bash+jq (cc-workflows convention)
2. **instinct-cli.js** — Python → JS rewrite, lightweight single file
3. **evaluate-session.sh** — JS → bash rewrite, standalone Stop hook
4. **Skills** — /learn and /instinct-status as SKILL.md files
5. **Observer daemon** — ported with per-project path awareness
6. **Storage** — per-project `.claude/learned/` (not global)

---

## Component Design

### 1. observe.sh — Observation Hook

**Design Decision:** [Decision 1: JSON Parsing → jq](./2-design-phase/phase2-design-whiteboard.md#Decision%201%20observe.sh%20JSON%20Parsing%20→%20jq)
**Lifecycle:** PreToolUse + PostToolUse (matcher: `*`)
**Language:** Pure bash + jq (rewrite from Python3)
**Location:** `.claude/hooks/observe.sh` (target cc-workflows path, not baseline)

**Behavior:**

1. Read JSON from stdin (`INPUT=$(cat)`)
2. Parse with jq: extract tool_name, tool_input/output, session_id
3. Determine event type from `$1` arg: `pre` → `tool_start`, `post` → `tool_complete`
4. Truncate input/output to 5KB
5. Build observation JSON and append to `$LEARNED_DIR/observations.jsonl`
6. Auto-archive if file exceeds 10MB
7. Signal observer daemon via SIGUSR1 if running
8. Check for disabled flag (`$LEARNED_DIR/disabled`)

**Key difference from source:** No tool filtering at capture time. All tools captured. Observer/learn phase decides relevance.

**Observation format:**

```json
{
  "timestamp": "2026-02-02T12:00:00Z",
  "event": "tool_start|tool_complete",
  "tool": "Edit|Write|Bash|Read|Task|...",
  "input": "truncated to 5KB (tool_start only)",
  "output": "truncated to 5KB (tool_complete only)",
  "session": "session-id"
}
```

**Path resolution:**

```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LEARNED_DIR="${PROJECT_ROOT}/.claude/learned"
```

**settings.json registration:**

```json
{
  "matcher": "*",
  "hooks": [{
    "type": "command",
    "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/observe.sh pre"
  }]
}
```

Separate entries for PreToolUse (`pre` arg) and PostToolUse (`post` arg).

**Baseline:** `everything-claude-code/skills/continuous-learning-v2/hooks/observe.sh` (see [PRD Source System](./continuous-learning-port-prd.md#Source%20System))

---

### 2. instinct-cli.js — Instinct Management CLI

**Design Decision:** [Decision 2: Instinct CLI Location](./2-design-phase/phase2-design-whiteboard.md#Decision%202%20Instinct%20CLI%20Location%20→%20`.claude/scripts/instinct-cli.js`)
**Language:** JavaScript (Node.js)
**Location:** `.claude/scripts/instinct-cli.js`
**Dependencies:** `.claude/scripts/lib/learning-utils.js` (shared utils)

**Commands (ported from Python, excluding evolve):**

| Command | Purpose | Source Lines |
|---------|---------|-------------|
| `status` | Display instincts grouped by domain with confidence bars | ~60 |
| `import <source>` | Import from file/URL with dedup and smart merge | ~120 |
| `export` | Export with privacy stripping | ~45 |

**evolve command:** Out of scope (Phase A.2 per PRD)

**Key adaptations:**
- Paths: `~/.claude/homunculus/` → `$CLAUDE_PROJECT_DIR/.claude/learned/`
- Project dir from env: `process.env.CLAUDE_PROJECT_DIR || process.cwd()`
- Uses learning-utils.js for file I/O
- argparse → `process.argv` parsing (lightweight, no npm deps)

**Instinct YAML format (unchanged from source):**

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
---

# Prefer Functional Style

## Action
Use functional patterns over classes when appropriate.

## Evidence
- Observed 5 instances in sessions abc123, def456
```

---

### 3. learning-utils.js — Shared JS Utilities

**Location:** `.claude/scripts/lib/learning-utils.js`
**Purpose:** Shared file I/O helpers for instinct-cli.js (and future JS tools)

**Functions:**

```javascript
// Directory
ensureDir(dirPath)        // mkdir -p equivalent

// File I/O
readFile(filePath)        // fs.readFileSync, returns null on error
writeFile(filePath, content)  // writeFileSync with ensureDir
appendFile(filePath, content) // appendFileSync with ensureDir

// Search
findFiles(dir, pattern, options)  // readdirSync + filter, sorted by mtime

// Hook I/O
log(message)              // console.error (stderr, visible to user)
output(data)              // console.log (stdout, JSON-aware)
```

**Design principle:** Start minimal, add functions as port demands them. No speculative porting.

---

### 4. evaluate-session.sh — Session Evaluation Hook

**Design Decision:** [Decision 4: evaluate-session → Standalone Hook](./2-design-phase/phase2-design-whiteboard.md#Decision%204%20evaluate-session%20→%20Standalone%20Hook)
**Lifecycle:** Stop (matcher: `""`)
**Language:** Bash (rewrite from JS)
**Location:** `.claude/hooks/evaluate-session.sh`

**Behavior:**

1. Read stdin JSON, extract `transcript_path` and `session_id`
2. Count user messages in transcript (`jq` count)
3. Skip if session too short (< 10 messages, configurable)
4. Log readiness signal to stderr
5. Optionally kill observer daemon PID on session end

**Why standalone:** stop-sync.sh already handles focus derivation, task scanning, and status JSON update. Mixing evaluate-session concerns violates single responsibility.

---

### 5. Skills — /learn and /instinct-status

**Location:** `.claude/skills/learn/SKILL.md` and `.claude/skills/instinct-status/SKILL.md`

#### /learn Skill

**Purpose:** Manual mid-session pattern extraction from conversation context

**Behavior:**
1. Claude analyzes current session transcript (available in context window)
2. Identifies extractable patterns: corrections, error resolutions, workflows, preferences
3. Drafts instinct YAML file(s) with proposed id, trigger, confidence, domain
4. Presents to user for approval
5. On approval, writes to `.claude/learned/instincts/personal/`

**Key insight:** /learn does NOT read observations.jsonl. It analyzes the session transcript directly (already in Claude's context). Observations are for the automated observer daemon.

#### /instinct-status Skill

**Purpose:** Display learned instincts dashboard

**Behavior:**
1. Invokes `node .claude/scripts/instinct-cli.js status`
2. Displays instincts grouped by domain with confidence bars
3. Shows observation count and storage stats

#### continuous-learning Skill (Main Entry Point)

**Location:** `.claude/skills/continuous-learning/SKILL.md`
**Purpose:** Top-level skill documenting the learning system, configuration, and available commands

---

### 6. Observer Daemon

**Location:** `.claude/scripts/start-observer.sh` (launcher) + `.claude/agents/observer.md` (prompt)

**Behavior:**

1. Start: Spawns background process, writes PID to `.claude/learned/.observer.pid`
2. Loop: Every 5 minutes, checks observations.jsonl for 20+ entries
3. Analyze: Calls `claude --model haiku --max-turns 3 --print` with observer.md prompt
4. Archive: Moves processed observations to `.claude/learned/observations.archive/`
5. Signal: Responds to SIGUSR1 for on-demand analysis
6. Stop: Cleans up PID file on TERM/INT

**Adaptations:**
- All paths use `$CLAUDE_PROJECT_DIR/.claude/learned/`
- Project dir passed via environment or resolved from script location
- Disabled by default (`config.json: observer.enabled: false`)

**Pattern detection (from observer.md, unchanged):**
- User corrections → high-confidence instincts
- Error resolutions → error-handling instincts
- Repeated workflows (3+ occurrences) → workflow instincts
- Tool preferences → tool-choice instincts

---

### 7. config.json — Learning Pipeline Configuration

**Design Decisions:** Per-Project Storage (see [PRD NFR5](./continuous-learning-port-prd.md#^NFR5)), Capture All Tools (see [PRD FR1](./continuous-learning-port-prd.md#^FR1))
**Location:** `.claude/learned/config.json`

**Adapted from source:**

```json
{
  "version": "2.0",
  "observation": {
    "enabled": true,
    "max_file_size_mb": 10,
    "archive_after_days": 7
  },
  "instincts": {
    "min_confidence": 0.3,
    "auto_approve_threshold": 0.7,
    "confidence_decay_rate": 0.02,
    "max_instincts": 100
  },
  "observer": {
    "enabled": false,
    "model": "haiku",
    "run_interval_minutes": 5,
    "min_observations_to_analyze": 20,
    "patterns_to_detect": [
      "user_corrections",
      "error_resolutions",
      "repeated_workflows",
      "tool_preferences"
    ]
  }
}
```

**Removed from source:**
- All hardcoded paths (resolved at runtime from project root)
- `integration.skill_creator_api` (not relevant)
- `integration.backward_compatible_v1` (no v1)
- `observation.capture_tools` / `ignore_tools` (capture all tools now)
- `evolution` section (Phase A.2)

**Validation:** Read config, log warning to stderr if malformed, fall back to hardcoded defaults.

---

## Integration Points

### settings.json Changes

Three new hook entries added to existing arrays:

| Lifecycle | Matcher | Hook | Notes |
|-----------|---------|------|-------|
| PreToolUse | `*` | `observe.sh pre` | New matcher group, no conflict with `Task` matcher |
| PostToolUse | `*` | `observe.sh post` | New matcher group, no conflict with existing matchers |
| Stop | `""` | `evaluate-session.sh` | New entry alongside existing stop-sync.sh |

### .gitignore

Add `.claude/learned/` — personal learning data should not be committed.

### No Changes to Existing Components

- All existing hooks unchanged
- No modifications to settings.json structure (only additions)
- No changes to existing skills, agents, or scripts

---

## Interface Contracts

How components communicate — no APIs, all file-based and stdio.

| From | To | Channel | Format |
|------|----|---------|--------|
| Claude Code | observe.sh | stdin (hook) | JSON: `{tool_name, tool_input, session_id}` |
| observe.sh | observations.jsonl | file append | JSONL (see observation format above) |
| observe.sh | observer daemon | SIGUSR1 signal | PID from `.observer.pid` |
| observer daemon | instinct files | file write | YAML frontmatter + markdown |
| observer daemon | observations archive | file move | `.jsonl` → `observations.archive/` |
| Claude Code | evaluate-session.sh | stdin (hook) | JSON: `{transcript_path, session_id}` |
| evaluate-session.sh | observer daemon | SIGTERM | PID from `.observer.pid` |
| /learn skill | instinct files | file write (via Claude) | YAML frontmatter + markdown |
| /instinct-status skill | instinct-cli.js | subprocess | `node instinct-cli.js status` → stdout |
| instinct-cli.js | instinct files | file read/write | YAML parse/serialize |
| config.json | all components | file read | JSON (fallback to hardcoded defaults) |

### Shared State

All components share state through `.claude/learned/`:

```text
.claude/learned/
├── observations.jsonl          # append-only log (observe.sh writes, daemon reads)
├── observations.archive/       # rotated logs (daemon moves here)
├── instincts/personal/         # YAML files (daemon + /learn write, CLI reads)
├── config.json                 # settings (all components read)
├── .observer.pid               # daemon PID (observe.sh + evaluate-session.sh read)
└── disabled                    # kill switch (observe.sh checks existence)
```

---

## Data Flows

### Flow 1: Observation Capture (every tool call)

```text
Claude calls tool → hook fires → observe.sh reads stdin JSON
  → jq extracts fields → truncate to 5KB → append JSONL
  → if daemon running: SIGUSR1
```

**Satisfies:** [FR1](./continuous-learning-port-prd.md#^FR1) (capture), [FR2](./continuous-learning-port-prd.md#^FR2) (storage management)

### Flow 2: Manual Learning (/learn command)

```text
User invokes /learn → Claude reads session transcript (in context)
  → identifies patterns → drafts instinct YAML → user approves
  → writes to .claude/learned/instincts/personal/
```

**Satisfies:** [FR4](./continuous-learning-port-prd.md#^FR4) (manual extraction), [FR5](./continuous-learning-port-prd.md#^FR5) (persist instincts)

### Flow 3: Automated Pattern Detection (observer daemon, opt-in)

```text
Timer or SIGUSR1 → check observations.jsonl (20+ entries?)
  → call claude --model haiku with observer.md prompt
  → haiku analyzes observations → outputs instinct YAML
  → daemon writes instinct files → archives processed observations
```

**Satisfies:** [FR7](./continuous-learning-port-prd.md#^FR7) (background detection)

### Flow 4: Session End Cleanup

```text
Session ends → Stop hook fires → evaluate-session.sh reads stdin
  → counts messages (skip if < 10) → logs readiness
  → optionally kills observer daemon PID
```

---

## Success Criteria

Design-level success criteria trace to [PRD Success Criteria](./continuous-learning-port-prd.md#Success%20Criteria).

**Design-specific criteria (not in PRD):**

- observe.sh adds < 50ms latency per tool call (jq parse + append)
- No modifications to existing hook scripts or settings.json structure
- All file paths resolved at runtime — zero hardcoded absolute paths
- config.json validation: warn on stderr + use defaults (never crash)

---

## File Inventory (New Files)

| File | Type | Lines (est) | Port From |
|------|------|-------------|-----------|
| `.claude/hooks/observe.sh` | Bash | ~80 | observe.sh (153 lines, rewrite to jq) |
| `.claude/hooks/evaluate-session.sh` | Bash | ~30 | evaluate-session.js (79 lines, rewrite to bash) |
| `.claude/scripts/instinct-cli.js` | JS | ~400 | instinct-cli.py (494 lines, minus evolve cmd) |
| `.claude/scripts/lib/learning-utils.js` | JS | ~60 | New (subset of utils.js patterns) |
| `.claude/scripts/start-observer.sh` | Bash | ~135 | start-observer.sh (direct port, path changes) |
| `.claude/agents/observer.md` | Markdown | ~130 | observer.md (direct port, path changes) |
| `.claude/skills/learn/SKILL.md` | Markdown | ~50 | New (based on /learn command behavior) |
| `.claude/skills/instinct-status/SKILL.md` | Markdown | ~30 | New (based on /instinct-status behavior) |
| `.claude/skills/continuous-learning/SKILL.md` | Markdown | ~80 | New (system overview skill) |
| `.claude/learned/config.json` | JSON | ~25 | config.json (adapted, sections removed) |

**Total:** 10 new files, ~1020 estimated lines

### Modified Files

| File | Change |
|------|--------|
| `.claude/settings.json` | Add 3 hook entries (PreToolUse, PostToolUse, Stop) |
| `.gitignore` | Add `.claude/learned/` |

---

## References

- **PRD**: [PRD](./continuous-learning-port-prd.md)%%force-extract%%
- **Phase 2 Whiteboard**: [Whiteboard](./2-design-phase/phase2-design-whiteboard.md)
- **Phase 1 Whiteboard**: [Phase 1 Whiteboard](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md)
- **Source Research**: [Session c0b6ce1f Research](../20260202-agent-output-capture/1-elicit-discover-sense-make-problem-frame/research/agent-output-c0b6ce1f.md)
