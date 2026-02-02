# Solutions Hypothesis — Continuous Learning Port

**Feature**: Port Continuous Learning from everything-claude-code to cc-workflows
**Phase**: 2 (Research & Design)
**Date**: 2026-02-02

---

## Hypothesis Overview

Port the continuous learning system with **minimal changes** — adapt paths and storage locations, resolve the Python dependency question, rewrite CLI from Python to JS, and integrate hooks into existing cc-workflows infrastructure.

---

## Decision 1: Python Dependency in observe.sh

### Problem

Source `observe.sh` uses embedded Python3 for JSON parsing (3 separate `python3 <<EOF` blocks). cc-workflows hooks are pure bash. Python3 is available on macOS but adds a dependency.

### Options

| Option | Pros | Cons |
|--------|------|------|
| **A: Keep Python3** | Zero translation risk, proven code | Adds Python dependency, inconsistent with cc-workflows bash convention |
| **B: Rewrite to jq** | No Python dep, faster execution | jq is also a dependency (not always installed) |
| **C: Rewrite to Node.js** | Consistent with instinct CLI (JS), no extra deps | More complex for a hook, slower startup than bash |
| **D: Keep Python3 for now, refactor later** | Ships fastest, defers risk | Technical debt |

### Decision: **Option D — Keep Python3, refactor later**

**Rationale**: PRD says "preserve source system scripts as-is, with only path and storage location changes" ([[../continuous-learning-port-prd#^NFR8|NFR8]]). Rewriting the JSON parsing introduces unnecessary translation risk. Python3 is pre-installed on macOS. Refactoring to pure bash/jq is a future improvement, not a port requirement.

---

## Decision 2: utils.js Scope

### Problem

Source system has a 418-line `utils.js` with cross-platform file I/O, git helpers, date formatting, etc. The instinct CLI (JS) needs some of these utilities. Should we port the full library?

### Options

| Option | Pros | Cons |
|--------|------|------|
| **A: Port full utils.js** | Complete parity | 80%+ unused, maintenance burden |
| **B: Port minimal subset** | Only what's needed, lean | May need to add functions later |
| **C: Inline utilities in CLI** | Zero external deps | Code duplication if reused |

### Decision: **Option B — Port minimal subset**

**Functions needed by instinct CLI**:
- `ensureDir` — directory creation
- `readFile` / `writeFile` / `appendFile` — file I/O
- `findFiles` — glob pattern matching in directories
- `log` / `output` — hook I/O helpers

**Functions NOT needed**:
- Git utilities (not relevant to instinct management)
- `replaceInFile`, `countInFile`, `grepFile` (not used by CLI)
- Platform detection (macOS only for now)
- `readStdinJson` (observe.sh handles its own stdin)

**Implementation**: Create `.claude/hooks/lib/learning-utils.js` with only the needed functions.

---

## Decision 3: evaluate-session Integration

### Problem

Source has `evaluate-session.js` that runs on Stop hook to signal pattern extraction readiness. cc-workflows already has `stop-sync.sh` on the Stop hook.

### Options

| Option | Pros | Cons |
|--------|------|------|
| **A: Add to existing stop-sync.sh** | Single Stop hook, simpler | Mixes concerns |
| **B: Create standalone evaluate-session.sh** | Clean separation | Another hook script |
| **C: Integrate into observer daemon** | Observer handles all analysis | Daemon is optional, this should always run |

### Decision: **Option B — Standalone evaluate-session.sh**

**Rationale**: The evaluate-session logic is simple (count messages, log readiness signal). Keeping it separate from stop-sync.sh maintains single responsibility. It's a lightweight bash script (~30 lines) that mirrors the source JS behavior.

---

## Decision 4: Slash Commands Implementation

### Problem

Source has `/learn`, `/instinct-status`, and `/evolve` as markdown-based slash commands. cc-workflows uses skills (markdown-based) for similar functionality. How should these be implemented?

### Options

| Option | Pros | Cons |
|--------|------|------|
| **A: Create as skills** | Consistent with cc-workflows convention | Skills are more heavyweight than slash commands |
| **B: Create as slash commands** | Lightweight, direct invocation | cc-workflows primarily uses skills |
| **C: Hybrid — skill with slash command aliases** | Best of both, discoverable | More files to maintain |

### Decision: **Option A — Create as skills**

**Rationale**: cc-workflows uses skills as the primary extension mechanism. `/learn` and `/instinct-status` map naturally to skills. The skill definition can include the slash command alias for convenience.

**Skills to create**:
- `.claude/skills/learn/SKILL.md` — manual pattern extraction
- `.claude/skills/instinct-status/SKILL.md` — instinct dashboard

**Out of scope**: `/evolve` (Phase A.2 per PRD)

---

## Decision 5: Per-Project vs Global Storage

### Problem

Source stores everything in `~/.claude/homunculus/` (global). PRD specifies `.claude/learned/` (per-project). This is a fundamental architectural change.

### Decision: **Per-project as specified in PRD**

**Implications**:
- All path references in observe.sh, config.json, instinct-cli change
- Observer daemon needs project-aware path resolution
- Import/export becomes the mechanism for cross-project sharing
- `$CLAUDE_PROJECT_DIR/.claude/learned/` is the base path

**Path mapping**:

| Source Path | Target Path |
|-------------|-------------|
| `~/.claude/homunculus/observations.jsonl` | `$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl` |
| `~/.claude/homunculus/instincts/personal/` | `$CLAUDE_PROJECT_DIR/.claude/learned/instincts/personal/` |
| `~/.claude/homunculus/instincts/inherited/` | `$CLAUDE_PROJECT_DIR/.claude/learned/instincts/inherited/` |
| `~/.claude/homunculus/evolved/` | `$CLAUDE_PROJECT_DIR/.claude/learned/evolved/` |
| `~/.claude/homunculus/config.json` | `$CLAUDE_PROJECT_DIR/.claude/learned/config.json` |

---

## Decision 6: Open Question Resolution

### Q1: Should utils.js be ported as standalone lib or merged?

**Answer**: Port minimal subset as `.claude/hooks/lib/learning-utils.js` (see Decision 2).

### Q2: How should /learn interact with existing cc-workflows skills?

**Answer**: `/learn` is a standalone skill. It reads session transcript context (available in Claude's context window) and creates instinct YAML files. It does NOT interact with other skills — it's an independent pattern extraction tool.

### Q3: Should the observer daemon use scratchpad or .claude/learned/ for temp files?

**Answer**: `.claude/learned/` — the observer's PID file (`.observer.pid`) and log (`observer.log`) belong with the learning data, not in a session-scoped scratchpad.

### Q4: How to handle instinct conflicts across projects?

**Answer**: Per-project storage means no conflicts by default. Cross-project sharing is done explicitly via import/export. The import command already handles deduplication and confidence comparison.

---

## Component Architecture (Target)

```text
.claude/
├── hooks/
│   ├── observe.sh                    # NEW - PreToolUse/PostToolUse observation
│   ├── evaluate-session.sh           # NEW - Stop hook, signals pattern readiness
│   └── lib/
│       ├── status-helpers.sh         # EXISTING
│       └── learning-utils.js         # NEW - Minimal JS utils for CLI
├── skills/
│   ├── learn/
│   │   └── SKILL.md                  # NEW - /learn slash command
│   └── instinct-status/
│       └── SKILL.md                  # NEW - /instinct-status slash command
├── learned/
│   ├── observations.jsonl            # NEW - Tool event captures
│   ├── observations.archive/         # NEW - Archived observations
│   ├── instincts/
│   │   ├── personal/                 # NEW - Auto-learned instincts
│   │   └── inherited/                # NEW - Imported instincts
│   ├── evolved/                      # NEW - Future: clustered instincts
│   │   ├── commands/
│   │   ├── skills/
│   │   └── agents/
│   └── config.json                   # NEW - Learning pipeline settings
├── agents/
│   ├── observer.md                   # NEW - Observer agent prompt
│   └── start-observer.sh            # NEW - Daemon lifecycle
└── scripts/
    └── instinct-cli.js               # NEW - Instinct management CLI
```

---

## Settings.json Integration

New hook entries to add (alongside existing hooks):

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

**Note**: These are ADDITIONAL entries. Existing hook entries remain unchanged.

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| observe.sh Python dep on non-macOS | Low | macOS-only for now; refactor to jq later |
| Hook performance (`*` matcher on every tool) | Medium | observe.sh is fast (append-only); profile after integration |
| Per-project path resolution in daemon | Low | Use `$CLAUDE_PROJECT_DIR` env var |
| instinct-cli.py → JS translation bugs | Medium | Port function-by-function with test validation |
| Existing hooks disrupted | Low | New entries use different matchers; independent firing |

---

## References

- **Gap Analysis**: [[gap-analysis|Gap Analysis]]
- **Requirements**: [[../continuous-learning-port-prd|PRD]]
- **Phase 1 Whiteboard**: [[../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1|Phase 1 Whiteboard]]
