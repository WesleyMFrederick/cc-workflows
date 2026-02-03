# Phase 2 Design Whiteboard — Continuous Learning Port

**Feature**: Port Continuous Learning from everything-claude-code to cc-workflows
**Phase**: 2 (Research & Design)
**Date**: 2026-02-02
**Status**: Active

---

## Baseline: Source System (everything-claude-code)

### Component Inventory (Verified)

| Component | File | Lines | Language | Dependencies |
|-----------|------|-------|----------|--------------|
| observe.sh | `skills/continuous-learning-v2/hooks/observe.sh` | 153 | Bash + embedded Python3 | python3 (JSON parsing) |
| instinct-cli.py | `skills/continuous-learning-v2/scripts/instinct-cli.py` | 494 | Python3 | stdlib only (pathlib, json, argparse) |
| start-observer.sh | `skills/continuous-learning-v2/agents/start-observer.sh` | 135 | Bash | claude CLI (haiku model) |
| observer.md | `skills/continuous-learning-v2/agents/observer.md` | 138 | Markdown | N/A (agent prompt) |
| evaluate-session.js | `scripts/hooks/evaluate-session.js` | 79 | Node.js | utils.js (5 functions) |
| config.json | `skills/continuous-learning-v2/config.json` | 42 | JSON | N/A |
| utils.js | `scripts/lib/utils.js` | 418 | Node.js (CommonJS) | fs, path, os, child_process |

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

### Decision 1: observe.sh JSON Parsing → jq

**Choice:** Rewrite embedded Python3 blocks to jq
**Rationale:** cc-workflows hooks consistently use jq. The 3 python3 blocks are simple JSON parsing (~30 lines of logic). Low translation risk, high convention consistency.

**Impact:** observe.sh drops from 153 lines to ~80 lines of pure bash+jq.

### Decision 2: Instinct CLI Location → `.claude/scripts/instinct-cli.js`

**Choice:** Lightweight single JS file in `.claude/scripts/`
**Rationale:** MVP-first. Port what works. The source is a single Python file — keep the same simplicity. Refactor to `tools/` workspace package later when justified.

**Future:** When instinct-cli grows or needs tests/types, migrate to `tools/instinct-cli/` as TypeScript workspace package (like citation-manager).

### Decision 3: /learn and /instinct-status → Skills

**Choice:** Create as `.claude/skills/learn/SKILL.md` and `.claude/skills/instinct-status/SKILL.md`
**Rationale:** Anthropic merged slash commands into skills system (Jan 2026). Skills are the canonical extension mechanism in cc-workflows. Auto-discoverable, can bundle scripts.

### Decision 4: evaluate-session → Standalone Hook

**Choice:** New `.claude/hooks/evaluate-session.sh` (standalone)
**Rationale:** stop-sync.sh is 100+ lines with its own concerns (haiku focus derivation, task scanning, status JSON update). Evaluate-session is simple (~30 lines: count messages, log readiness signal). Single responsibility.

**Port approach:** Rewrite JS to bash (following cc-workflows convention). Source imports 5 utils.js functions — all trivial in bash.

### Decision 5: Utils → New `.claude/scripts/lib/learning-utils.js`

**Choice:** Create new shared JS utility file, add functions as needed during port
**Rationale:** instinct-cli.js needs file I/O helpers. Start fresh (don't port 80% unused source utils). Build up organically. Useful foundation for future JS tools.

**Initial functions:**
- `ensureDir(dirPath)` — mkdir recursive
- `readFile(filePath)` — safe fs.readFileSync
- `writeFile(filePath, content)` — writeFileSync with ensureDir
- `appendFile(filePath, content)` — appendFileSync with ensureDir
- `findFiles(dir, pattern)` — readdirSync + filter
- `log(message)` — stderr output
- `output(data)` — stdout output (JSON-aware)

### Decision 6: Observer Daemon → Include in Port

**Choice:** Port start-observer.sh and observer.md
**Rationale:** Full pipeline parity. Daemon is already optional/disabled-by-default per PRD. Core loop is simple bash (sleep + claude CLI call). Low risk.

**Adaptation:** Path changes (`~/.claude/homunculus/` → `$CLAUDE_PROJECT_DIR/.claude/learned/`). Pass `$CLAUDE_PROJECT_DIR` for project-aware operation.

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

## References

- **PRD**: [PRD](../continuous-learning-port-prd.md)
- **Phase 1 Whiteboard**: [Phase 1 Whiteboard](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md)
- **Source Research**: [Session c0b6ce1f Research](../../20260202-agent-output-capture/1-elicit-discover-sense-make-problem-frame/research/agent-output-c0b6ce1f.md)
