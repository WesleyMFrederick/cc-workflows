# Phase 2 Design Whiteboard — Continuous Learning Port

**Feature**: Port Continuous Learning from everything-claude-code to cc-workflows
**Phase**: 2 (Research & Design)
**Date**: 2026-02-02
**Status**: Active

> **Phase 1 Context:**
> - [Source System Analysis](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Source%20System%20Analysis)
> - [Decisions Made](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Decisions%20Made)
> - [Draft ACs](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Draft%20Acceptance%20Criteria)
>
> **Requirements:** [PRD](../continuous-learning-port-prd.md)%%force-extract%%

---

## Source System Research Findings

> **Component inventory:** See [Phase 1 Source System Analysis](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Source%20System%20Analysis)

### Key Architecture Insight

Source separates **deterministic capture** (hooks, 100% reliable) from **probabilistic analysis** (observer agent). This is the core strength.

Pipeline: `Tool Call → observe.sh → observations.jsonl → Observer/Learn → instincts/*.yaml`

### What instinct-cli.py Actually Does (No utils.js Dependency)

The Python CLI uses **only stdlib** — pathlib for file I/O, argparse for CLI, json for parsing. It does NOT import utils.js. When ported to JS, it needs equivalent Node.js fs/path operations.

Functions needed in JS port:
- `readFile` / `writeFile` — fs wrappers with ensureDir
- `ensureDir` — mkdir recursive
- `findFiles` — readdirSync + filter for *.yaml
- `log` / `output` — stderr/stdout helpers

### What evaluate-session.js Imports from utils.js

5 functions: `getLearnedSkillsDir`, `ensureDir`, `readFile`, `countInFile`, `log`

When rewritten to bash (cc-workflows convention), these become trivial: `wc -l`, `mkdir -p`, `cat`, `echo >&2`.

---

## Baseline: Target System (cc-workflows)

### Hook Infrastructure (Actual)

**settings.json hook structure:**

| Lifecycle | Matcher | Hook(s) | Purpose |
|-----------|---------|---------|---------|
| SessionStart | `startup\|resume\|clear\|compact` | session-start.sh | Status tracking |
| UserPromptSubmit | `""` (all) | user-prompt-submit.sh | Prompt processing |
| PreToolUse | `Task` | pre-task-status-reminder.sh | Task reminders |
| PostToolUse | `Task` | post-task-status-reminder.sh | Task status |
| PostToolUse | `Write\|Edit\|MultiEdit` | smart-lint.sh, citation-validator.sh | Linting, validation |
| PostToolUse | `Write\|Edit` | plan-path-sync.sh | Plan tracking |
| PostToolUse | `TaskCreate\|TaskUpdate` | task-status-sync.sh | Task sync |
| PostToolUse | `Read` | citation-extractor.sh | Citation extraction |
| Stop | `""` (all) | stop-sync.sh | Session status sync |

**Hook conventions observed:**
- All bash with `set -euo pipefail`
- `INPUT=$(cat)` for stdin, `jq` for JSON parsing
- `$SCRIPT_DIR` / `$PROJECT_ROOT` path pattern
- Shared lib: `lib/status-helpers.sh`
- Metrics logged to stderr: `echo "[hook-name] key=value" >&2`
- python3 used in stop-sync.sh for timing (not foreign dep)

**No existing:** learning infrastructure, observations, instincts, pattern detection

### Directory Structure (Actual)

```text
.claude/
├── hooks/           # 12 bash scripts + lib/status-helpers.sh
├── settings.json    # Hook registration (matcher-based)
├── skills/          # ~30 skill directories (SKILL.md pattern)
├── agents/          # Agent markdown files
├── scripts/         # Utility scripts (currently empty scripts/ subdir in hooks)
├── plans/           # Session plans
└── tasks/           # Session tasks
```

---

## Design Decisions

- **D1: observe.sh JSON parsing → jq** — Rewrite embedded Python3 blocks to jq. cc-workflows hooks consistently use jq. The 3 python3 blocks are simple JSON parsing (~30 lines of logic). Low translation risk, high convention consistency. Impact: observe.sh drops from 153 to ~80 lines of pure bash+jq. ^decision-observe-jq _([FR1](../continuous-learning-port-prd.md#^FR1), [FR3](../continuous-learning-port-prd.md#^FR3), [NFR1](../continuous-learning-port-prd.md#^NFR1))_

- **D2: Instinct CLI location → `.claude/scripts/instinct-cli.js`** — MVP-first single JS file. Port what works. Source is single Python file — keep the same simplicity. Future: migrate to `tools/instinct-cli/` as TypeScript workspace package when justified. ^decision-cli-location _([FR6](../continuous-learning-port-prd.md#^FR6), [FR8](../continuous-learning-port-prd.md#^FR8), [NFR4](../continuous-learning-port-prd.md#^NFR4))_

- **D3: /learn and /instinct-status → Skills** — Create as `.claude/skills/learn/SKILL.md` and `.claude/skills/instinct-status/SKILL.md`. Anthropic merged slash commands into skills system (Jan 2026). Skills are canonical extension mechanism in cc-workflows. Auto-discoverable, can bundle scripts. ^decision-skills _([FR4](../continuous-learning-port-prd.md#^FR4), [FR5](../continuous-learning-port-prd.md#^FR5), [FR6](../continuous-learning-port-prd.md#^FR6))_

- **D4: evaluate-session → Standalone Hook** — New `.claude/hooks/evaluate-session.sh`. stop-sync.sh is 100+ lines with its own concerns. Evaluate-session is simple (~30 lines). Single responsibility. Port approach: Rewrite JS to bash (cc-workflows convention). ^decision-evaluate-session _([FR7](../continuous-learning-port-prd.md#^FR7), [NFR4](../continuous-learning-port-prd.md#^NFR4))_

- **D5: Utils → New `.claude/scripts/lib/learning-utils.js`** — Create new shared JS utility file, add functions as needed during port. instinct-cli.js needs file I/O helpers. Start fresh (don't port 80% unused source utils). Initial functions: ensureDir, readFile, writeFile, appendFile, findFiles, log, output. ^decision-utils  _(Supporting: [FR6](../continuous-learning-port-prd.md#^FR6), [FR8](../continuous-learning-port-prd.md#^FR8))_

- **D6: Observer Daemon → Include in Port** — Port start-observer.sh and observer.md. Full pipeline parity. Daemon already optional/disabled-by-default per PRD. Core loop is simple bash. Low risk. Adaptation: path changes (`~/.claude/homunculus/` → `$CLAUDE_PROJECT_DIR/.claude/learned/`). ^decision-observer-daemon _([FR7](../continuous-learning-port-prd.md#^FR7))_

---

## Component Architecture (Target)

```text
.claude/
├── hooks/
│   ├── observe.sh                    # NEW — PreToolUse/PostToolUse (matcher: *)
│   ├── evaluate-session.sh           # NEW — Stop hook
│   └── lib/
│       └── status-helpers.sh         # EXISTING (unchanged)
├── scripts/
│   ├── lib/
│   │   └── learning-utils.js         # NEW — Shared JS utils for CLI
│   ├── instinct-cli.js               # NEW — Instinct management CLI
│   └── start-observer.sh             # NEW — Observer daemon lifecycle
├── skills/
│   ├── learn/
│   │   └── SKILL.md                  # NEW — Manual pattern extraction
│   ├── instinct-status/
│   │   └── SKILL.md                  # NEW — Instinct dashboard
│   └── continuous-learning/
│       └── SKILL.md                  # NEW — Main skill entry point
├── agents/
│   └── observer.md                   # NEW — Observer agent prompt
├── learned/
│   ├── observations.jsonl            # NEW — Tool event captures
│   ├── observations.archive/         # NEW — Archived observations
│   ├── instincts/
│   │   ├── personal/                 # NEW — Auto-learned instincts
│   │   └── inherited/                # NEW — Imported instincts
│   ├── evolved/                      # NEW — Future: clustered instincts
│   │   ├── commands/
│   │   ├── skills/
│   │   └── agents/
│   └── config.json                   # NEW — Learning pipeline settings
└── settings.json                     # MODIFIED — Add 3 new hook entries
```

## Settings.json Integration

New hook entries to add alongside existing:

```json
{
  "PreToolUse": [
    {
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/observe.sh pre"
      }]
    }
  ],
  "PostToolUse": [
    {
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/observe.sh post"
      }]
    }
  ],
  "Stop": [
    {
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/evaluate-session.sh"
      }]
    }
  ]
}
```

**Safe integration:** `*` matcher creates a new matcher group — fires independently from existing matchers (`Task`, `Write|Edit`, `Read`, etc.). No conflict.

---

## Path Mapping (Source → Target)

| Source Path | Target Path |
|-------------|-------------|
| `~/.claude/homunculus/observations.jsonl` | `$PROJECT/.claude/learned/observations.jsonl` |
| `~/.claude/homunculus/instincts/personal/` | `$PROJECT/.claude/learned/instincts/personal/` |
| `~/.claude/homunculus/instincts/inherited/` | `$PROJECT/.claude/learned/instincts/inherited/` |
| `~/.claude/homunculus/evolved/` | `$PROJECT/.claude/learned/evolved/` |
| `~/.claude/homunculus/config.json` | `$PROJECT/.claude/learned/config.json` |
| `~/.claude/homunculus/.observer.pid` | `$PROJECT/.claude/learned/.observer.pid` |
| `~/.claude/homunculus/observer.log` | `$PROJECT/.claude/learned/observer.log` |

Where `$PROJECT` = `$CLAUDE_PROJECT_DIR`

---

## Config.json Adaptation

Port from source with these changes:
- All paths: `~/.claude/homunculus/` → relative to `.claude/learned/`
- Remove `integration.skill_creator_api` (not relevant)
- Remove `integration.backward_compatible_v1` (no v1 exists)
- Keep `observer.enabled: false` (disabled by default)
- Keep `observer.min_observations_to_analyze: 20`

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| observe.sh jq rewrite introduces parsing bugs | Medium | Simple JSON ops; test with real Claude hook JSON format |
| Hook performance with `*` matcher on every tool | Medium | jq is fast; append-only write; profile after integration |
| instinct-cli.py → JS translation bugs | Medium | Port function-by-function; source is 494 lines, manageable |
| Observer daemon orphaned processes | Low | PID file management; evaluate-session.sh can clean up on Stop |
| `.claude/learned/` not in .gitignore | Low | Add to .gitignore during implementation; observations are personal |

---

## Resolved Open Items

1. **.gitignore**: `.claude/learned/` will be gitignored (personal learning data) — implementation detail
2. **observe.sh tool filter**: **Capture ALL tools** — no filter at capture time. `*` matcher records everything. Analysis phase decides relevance. More data = better patterns.
3. **Skill SKILL.md content**: Write during implementation — content defined in design doc
4. **Config validation**: **Validate and warn** — log warning to stderr if config has issues, use hardcoded defaults as fallback

---

## Draft AC Validation

> Source: [Phase 1 Draft ACs](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Draft%20Acceptance%20Criteria)
> Legend: ✅ Validated | ⚠️ Revised | ❌ Dropped

**Observation Capture (FR1):**

- [AC-draft-1](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-1): ✅ Validated
- [AC-draft-2](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-2): ✅ Validated
- [AC-draft-3](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-3): ⚠️ **REVISED** — Capture ALL tools via `*` matcher, not filtered list. Analysis phase decides relevance. Per [Resolved Item #2](#Resolved%20Open%20Items).
- [AC-draft-4](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-4): ✅ Validated

**Storage Management (FR2):**

- [AC-draft-5](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-5): ✅ Validated
- [AC-draft-6](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-6): ✅ Validated

**Hook Integration (FR3):**

- [AC-draft-7](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-7): ✅ Validated — `*` matcher creates independent hook group
- [AC-draft-8](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-8): ✅ Validated — No conflict with existing matchers

**Pattern Extraction (FR4):**

- [AC-draft-9](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-9): ✅ Validated — Implemented as skill per [D3](#^decision-skills)
- [AC-draft-10](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-10): ✅ Validated

**Instinct Persistence (FR5):**

- [AC-draft-11](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-11): ✅ Validated
- [AC-draft-12](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-12): ✅ Validated — Source values preserved per [NFR6](../continuous-learning-port-prd.md#^NFR6)
- [AC-draft-13](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-13): ✅ Validated

**Instinct Visibility (FR6):**

- [AC-draft-14](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-14): ✅ Validated — Implemented as skill per [D3](#^decision-skills)
- [AC-draft-15](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-15): ✅ Validated

**Background Pattern Detection (FR7):**

- [AC-draft-16](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-16): ✅ Validated
- [AC-draft-17](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-17): ✅ Validated
- [AC-draft-18](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-18): ✅ Validated
- [AC-draft-19](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-19): ✅ Validated
- [AC-draft-20](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-20): ⚠️ **REVISED** — Stop hook (not SessionEnd) kills daemon. evaluate-session.sh runs on Stop lifecycle.
- [AC-draft-21](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-21): ✅ Validated

**Instinct Portability (FR8):**

- [AC-draft-22](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-22): ✅ Validated — CLI at `.claude/scripts/instinct-cli.js` per [D2](#^decision-cli-location)
- [AC-draft-23](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-23): ✅ Validated
- [AC-draft-24](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-24): ✅ Validated

**Performance (NFR1):**

- [AC-draft-25](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-25): ✅ Validated — jq rewrite per [D1](#decision-observe-jq) supports <100ms

**Data Integrity (NFR2):**

- [AC-draft-26](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-26): ✅ Validated

**Convention Compliance (NFR4):**

- [AC-draft-27](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-27): ✅ Validated — jq, not python per [D1](#decision-observe-jq)
- [AC-draft-28](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-28): ✅ Validated
- [AC-draft-29](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-29): ✅ Validated

**Per-Project Scoping (NFR5):**

- [AC-draft-30](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-30): ✅ Validated

**Translation Risk (NFR6):**

- [AC-draft-31](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-31): ⚠️ **REVISED** — observe.sh python blocks → jq (not "as-is") per [D1](#decision-observe-jq). Low risk rewrite.
- [AC-draft-32](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-32): ✅ Validated

**Configuration (NFR7):**

- [AC-draft-33](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-33): ✅ Validated

**Summary:** 30 validated, 3 revised, 0 dropped.

---

## References

- **PRD**: [PRD](../continuous-learning-port-prd.md)%%force-extract%%
- **Phase 1 Whiteboard**: [Phase 1 Whiteboard](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md)
- **Source Research**: [Session c0b6ce1f Research](../../20260202-agent-output-capture/1-elicit-discover-sense-make-problem-frame/research/agent-output-c0b6ce1f.md)
