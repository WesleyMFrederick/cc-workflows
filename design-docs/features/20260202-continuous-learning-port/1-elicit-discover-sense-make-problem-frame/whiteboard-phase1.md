# Continuous Learning Port — Phase 1 Whiteboard

> **Feature:** Port continuous learning from everything-claude-code to cc-workflows
> **Phase:** Discovery / Elicitation / Sense-Making
> **Date:** 2026-02-02
> **Source repo:** everything-claude-code

---

## Problem Statement

cc-workflows has no mechanism to learn from session activity. Every session starts fresh with no knowledge of past patterns, corrections, or workflows. The everything-claude-code project has a proven continuous learning system that captures tool usage, detects patterns, and creates reusable instincts. We want to port this system to cc-workflows.

---

## Two-Phase Approach

### Phase A (First): Continuous Learning of Instincts

Port the observation → pattern detection → instinct creation pipeline.

**Components:**

1. **Observation hooks** — observe.sh captures every PreToolUse/PostToolUse event
2. **`/learn` command** — manual pattern extraction from session transcript
3. **`/instinct-status` command** — dashboard showing learned instincts with confidence bars
4. **Observer daemon** (optional, off by default) — background Haiku analysis every 5 min

### Phase B (Later): Feature-Based Session Context

Replace current-session.json with feature-linked session persistence. Separate feature — see [[20260202-agent-output-capture]].

---

## Source System Analysis

### Source: everything-claude-code

**Hook scripts (all JS except observe.sh):**

| Script | Type | Lifecycle | Purpose |
|--------|------|-----------|---------|
| `session-start.js` | JS | SessionStart | Load recent sessions + learned skills |
| `session-end.js` | JS | SessionEnd | Create session .tmp with template |
| `pre-compact.js` | JS | PreCompact | Log compaction events to session file |
| `suggest-compact.js` | JS | PreToolUse | Track tool count, suggest compaction |
| `evaluate-session.js` | JS | SessionEnd | Signal pattern extraction readiness |
| `observe.sh` | Bash | PreToolUse/PostToolUse | Capture tool I/O → observations.jsonl |

**Instinct CLI (Python → will rewrite to JS):**

| Command | Purpose |
|---------|---------|
| `instinct-cli.py status` | Display instincts with confidence bars |
| `instinct-cli.py import` | Import instincts from file/URL |
| `instinct-cli.py export` | Export instincts (strips sensitive data) |

**Slash commands (Markdown):**

| Command | Purpose |
|---------|---------|
| `/learn` | Manual mid-session pattern extraction |
| `/instinct-status` | View learned instincts dashboard |
| `/evolve` | Cluster instincts → skills/commands/agents |

**Supporting files:**

| File | Purpose |
|------|---------|
| `utils.js` | Core file I/O: writeFile, appendFile, replaceInFile |
| `config.json` | Learning pipeline configuration |
| `observer.md` | Observer agent prompt (background Haiku) |
| `start-observer.sh` | Daemon management script |

### Instinct Data Model

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7      # 0.3 (tentative) → 0.9 (near-certain)
domain: "code-style"  # code-style, testing, git, workflow, debugging
source: "session-observation"
---

# Prefer Functional Style

## Action
Use functional patterns over classes when appropriate.

## Evidence
- Observed 5 instances in sessions abc123, def456
- User corrected class-based → functional on 2025-01-15
```

**Confidence scoring:**

- `+0.05` per confirming observation
- `-0.10` per contradicting observation (user correction)
- `-0.02` per week without observation (decay)
- `0.7+` = auto-applied; below = suggested only

### Observation Format

```json
{
  "timestamp": "2026-02-02T12:00:00Z",
  "event": "tool_start|tool_complete",
  "tool": "Edit|Write|Bash|Read|Grep|Glob",
  "input": "truncated to 5KB",
  "output": "truncated to 5KB",
  "session": "session-id"
}
```

Stored as JSONL (one observation per line). Auto-archives at 10MB.

---

## Target System Analysis

### Target: cc-workflows

**Existing hooks in `.claude/hooks/`:**

- citation-extractor.sh, citation-validator.sh
- plan-path-sync.sh, task-status-sync.sh
- session-start.sh, stop-sync.sh
- user-prompt-submit.sh
- pre-task-status-reminder.sh, post-task-status-reminder.sh
- view-hook-logs.sh
- lib/status-helpers.sh

**Hook config:** `.claude/settings.json` manages lifecycle events (UserPromptSubmit, PreToolUse, PostToolUse, SessionStart, Stop).

**No existing:** continuous learning, observation, instincts, or pattern detection.

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Hook location** | `.claude/hooks/` (consolidated) | Matches cc-workflows convention, all hooks co-located |
| **Storage location** | `.claude/learned/` (per-project) | Project-specific learning, not global |
| **Script language** | Shell + JS as-is, Python → JS | Minimize translation errors, JS already proven in hooks |
| **Observer mode** | Hybrid (daemon optional, manual always) | Off by default, user controls learning intensity |
| **Port approach** | Direct port, minimal changes | Least error potential, path changes only |
| **Phase A scope** | All 4 components | Observation + /learn + /instinct-status + optional daemon |

---

## Per-Project Storage Structure

```text
.claude/learned/
├── observations.jsonl           # Tool call captures (append-only)
├── observations.archive/        # Archived observations
├── instincts/
│   ├── personal/               # Auto-learned from sessions
│   │   ├── prefer-functional.yaml
│   │   └── ...
│   └── inherited/              # Imported from others
│       └── ...
├── evolved/                    # Future: clustered instincts
│   ├── commands/
│   ├── skills/
│   └── agents/
└── config.json                 # Learning pipeline settings
```

---

## Research References

- [[research/agent-output-c0b6ce1f|Session c0b6ce1f Agent Output]] — Full source system analysis
- Source repo: `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/everything-claude-code/`

---

## Draft Acceptance Criteria

> Implementation-specific details extracted from PRD during outcome-oriented rewrite. These draft ACs will be formalized in Sequencing with system context.

### Observation Capture ([[continuous-learning-port-prd#^FR1|FR1]])

- PreToolUse hook captures tool name, input, and session ID as JSONL entries appended to `.claude/learned/observations.jsonl` ^AC-draft-1
- PostToolUse hook captures tool name, output, and timestamp as JSONL entries appended to `.claude/learned/observations.jsonl` ^AC-draft-2
- Captured tools: Edit, Write, Bash, Read, Grep, Glob; NOT TodoWrite ^AC-draft-3
- Observation inputs and outputs truncated to 5KB max per entry ^AC-draft-4

### Storage Management ([[continuous-learning-port-prd#^FR2|FR2]])

- Auto-archive `observations.jsonl` to `.claude/learned/observations.archive/` when file size exceeds 10MB ^AC-draft-5
- No data loss during archive operation ^AC-draft-6

### Hook Integration ([[continuous-learning-port-prd#^FR3|FR3]])

- observe.sh registered in `.claude/settings.json` PreToolUse and PostToolUse arrays alongside existing hooks ^AC-draft-7
- Existing hooks (citation-validator, plan-path-sync, etc.) continue to fire correctly after integration ^AC-draft-8

### Pattern Extraction ([[continuous-learning-port-prd#^FR4|FR4]])

- `/learn` slash command analyzes current session transcript ^AC-draft-9
- Creates instinct YAML files in `.claude/learned/instincts/personal/` with user approval ^AC-draft-10

### Instinct Persistence ([[continuous-learning-port-prd#^FR5|FR5]])

- Instincts stored in YAML format with required fields: id, trigger, confidence, domain, source, action, evidence ^AC-draft-11
- Confidence scoring: +0.05 per confirming observation, -0.10 per contradiction, -0.02 per week decay ^AC-draft-12
- Confidence ≥ 0.7 = auto-applied; below = suggested only ^AC-draft-13

### Instinct Visibility ([[continuous-learning-port-prd#^FR6|FR6]])

- `/instinct-status` slash command displays all instincts grouped by domain ^AC-draft-14
- Visual confidence bars shown for each instinct ^AC-draft-15

### Background Pattern Detection ([[continuous-learning-port-prd#^FR7|FR7]])

- Observer daemon analyzes observations at configurable interval using Haiku model ^AC-draft-16
- Detects four pattern types: user corrections, error resolutions, repeated workflows (3+ occurrences), tool preferences ^AC-draft-17
- System signals daemon via SIGUSR1 when new observations written ^AC-draft-18
- Daemon starts/stops cleanly with PID file management ^AC-draft-19
- SessionEnd hook kills daemon ^AC-draft-20
- Disabled by default, opt-in via config ^AC-draft-21

### Instinct Portability ([[continuous-learning-port-prd#^FR8|FR8]])

- Instinct CLI tool (JS) supports status, import, and export subcommands ^AC-draft-22
- Import detects duplicates and updates only if higher-confidence version found ^AC-draft-23
- Export strips sensitive data: actual code, file paths, session IDs, timestamps older than 1 week ^AC-draft-24

### Performance ([[continuous-learning-port-prd#^NFR1|NFR1]])

- Observation hooks complete in under 100ms ^AC-draft-25

### Data Integrity ([[continuous-learning-port-prd#^NFR2|NFR2]])

- Append-only writes for observations — no in-place modification of JSONL file ^AC-draft-26

### Convention Compliance ([[continuous-learning-port-prd#^NFR4|NFR4]])

- Observation hook written in bash (cc-workflows hook convention) ^AC-draft-27
- Instinct CLI written in JavaScript (avoid Python dependency) ^AC-draft-28
- All hook scripts located in `.claude/hooks/` ^AC-draft-29

### Per-Project Scoping ([[continuous-learning-port-prd#^NFR5|NFR5]])

- All learned data stored in `.claude/learned/` (not global `~/.claude/`) ^AC-draft-30

### Translation Risk ([[continuous-learning-port-prd#^NFR6|NFR6]])

- Port preserves source system scripts as-is (bash and JS), with only path and storage location changes ^AC-draft-31
- Python CLI → JS is the only language translation ^AC-draft-32

### Configuration ([[continuous-learning-port-prd#^NFR7|NFR7]])

- `config.json` in `.claude/learned/` for all configurable parameters ^AC-draft-33

---

## Open Questions

1. Should `utils.js` be ported as a standalone lib or merged with existing cc-workflows utilities?
2. How should `/learn` interact with existing cc-workflows skills (writing-skills, etc.)?
3. Should the observer daemon use the cc-workflows scratchpad or `.claude/learned/` for temp files?
4. How to handle instinct conflicts across projects (if user works on multiple)?

---

## Carry Forward to Design

> Items requiring Phase 2 resolution with system context.

### Draft ACs Needing Validation

- **AC-draft-25** (100ms threshold): Needs profiling in cc-workflows hook chain to validate feasibility with multiple hooks firing
- **AC-draft-12/13** (confidence scoring thresholds): Needs validation that source system values work in cc-workflows context
- **AC-draft-17** (3+ occurrences for repeated workflows): Threshold may need tuning based on cc-workflows usage patterns

### Implementation Decisions Deferred to Design

- **utils.js approach**: Port as standalone lib in `.claude/learned/lib/` or merge with existing cc-workflows utilities? (Open Question #1)
- **Observer temp files**: Use cc-workflows scratchpad or `.claude/learned/` for daemon working files? (Open Question #3)
- **`/learn` interaction with existing skills**: How does `/learn` relate to writing-skills, writing-slash-commands, etc.? (Open Question #2)
- **Instinct conflict resolution**: Cross-project instinct handling when user works on multiple projects (Open Question #4)
- **Hook registration automation**: Manual `.claude/settings.json` edit vs. setup script?

### Architecture Validation Needed

- Verify `.claude/learned/` directory structure doesn't conflict with any existing cc-workflows conventions
- Confirm SIGUSR1 signaling works reliably across macOS and Linux for daemon notification
- Validate that append-only JSONL writes are atomic enough to prevent corruption from concurrent hook invocations

---

## Next Steps

1. Write Phase 2 design document (adapt to cc-workflows architecture)
2. Write requirements document (FR/NFR with anchors)
3. Create implementation plan
4. Execute port
