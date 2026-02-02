# Gap Analysis — Continuous Learning Port

**Feature**: Port Continuous Learning from everything-claude-code to cc-workflows
**Phase**: 2 (Research & Design)
**Date**: 2026-02-02

---

## Source System Inventory

### Component: observe.sh (Observation Hook)

**Source**: `everything-claude-code/skills/continuous-learning-v2/hooks/observe.sh`
**Lines**: 153
**Language**: Bash + embedded Python3
**Lifecycle**: PreToolUse, PostToolUse (matcher: `*`)

**What it does**:
- Reads JSON from stdin (Claude Code hook format)
- Parses with embedded Python3 (`json.loads`)
- Extracts: hook_type, tool_name, tool_input, tool_output, session_id
- Truncates input/output to 5KB
- Appends JSONL to `~/.claude/homunculus/observations.jsonl`
- Auto-archives at 10MB
- Signals observer daemon via SIGUSR1 if running
- Has disable flag (`$CONFIG_DIR/disabled`)

**Target gap**: cc-workflows has **no observation hook**. Needs new file in `.claude/hooks/`.

**Adaptation needed**:
- Storage path: `~/.claude/homunculus/` → `.claude/learned/` (per PRD decision)
- Python3 dependency — source uses embedded Python for JSON parsing. cc-workflows hooks are pure bash. **Decision needed**: keep Python or rewrite to jq/bash.

---

### Component: instinct-cli.py (Instinct CLI)

**Source**: `everything-claude-code/skills/continuous-learning-v2/scripts/instinct-cli.py`
**Lines**: 494
**Language**: Python3
**Commands**: status, import, export, evolve

**What it does**:
- `status`: Loads all instinct YAML files, groups by domain, renders confidence bars
- `import`: Fetches from file/URL, deduplicates by ID, smart merge (higher confidence wins)
- `export`: Filters by domain/confidence, strips sensitive data, outputs YAML
- `evolve`: Clusters instincts by trigger similarity, suggests skill/command/agent candidates

**Target gap**: cc-workflows has **no instinct CLI**. Per PRD, rewrite Python → JS.

**Adaptation needed**:
- Language: Python → JavaScript (per [[../continuous-learning-port-prd#^NFR5|NFR5]])
- Paths: `~/.claude/homunculus/` → `.claude/learned/`
- `evolve` command is OUT OF SCOPE for Phase A (per PRD)

---

### Component: observer.md + start-observer.sh (Observer Daemon)

**Source**: `everything-claude-code/skills/continuous-learning-v2/agents/`
**Lines**: observer.md (138), start-observer.sh (135)

**What it does**:
- `observer.md`: Agent prompt for Haiku-based pattern detection
- `start-observer.sh`: Daemon lifecycle (start/stop/status), PID file, SIGUSR1 handler
- Runs `claude --model haiku --max-turns 3 --print` to analyze observations
- Archives processed observations after analysis

**Target gap**: cc-workflows has **no background analysis daemon**.

**Adaptation needed**:
- Storage paths change
- Daemon should be purely optional (per [[../continuous-learning-port-prd#^NFR9|NFR9]])

---

### Component: SKILL.md (Skill Definition)

**Source**: `everything-claude-code/skills/continuous-learning-v2/SKILL.md`
**Lines**: 285

**What it does**:
- Skill entry point for Claude to discover and use the learning system
- Documents commands, configuration, file structure, confidence model

**Target gap**: cc-workflows needs equivalent skill or slash command definitions.

**Adaptation needed**:
- Paths change
- Remove references to v1 backward compatibility (cc-workflows has no v1)
- Remove Skill Creator integration (not relevant to port)

---

### Component: config.json (Configuration)

**Source**: `everything-claude-code/skills/continuous-learning-v2/config.json`
**Lines**: 42

**What it does**:
- Configures observation (capture tools, size limits, archive policy)
- Configures instincts (paths, confidence thresholds, decay rate, max count)
- Configures observer (model, interval, min observations, pattern types)
- Configures evolution (cluster threshold, evolved path)

**Target gap**: cc-workflows has **no learning config**.

**Adaptation needed**:
- Paths: `~/.claude/homunculus/` → `.claude/learned/`
- Remove `integration.skill_creator_api` (not relevant)
- Remove `integration.backward_compatible_v1` (no v1 exists)

---

### Component: Session Hooks (session-start.js, session-end.js, evaluate-session.js)

**Source**: `everything-claude-code/scripts/hooks/`

**What they do**:
- `session-start.js`: Loads recent sessions + learned skills on start
- `session-end.js`: Creates/updates session .tmp file with template
- `evaluate-session.js`: Signals pattern extraction readiness at session end

**Target gap**: cc-workflows already has `session-start.sh` and `stop-sync.sh`. These serve different purposes than the source hooks.

**Adaptation needed**:
- `session-start.js` and `session-end.js` are **session persistence** (Phase B — OUT OF SCOPE)
- `evaluate-session.js` is relevant — signals that session should be analyzed for patterns
- Could integrate evaluate-session logic into existing `stop-sync.sh` or add standalone hook

---

### Component: utils.js (Utility Library)

**Source**: `everything-claude-code/scripts/lib/utils.js`
**Lines**: 418
**Language**: JavaScript (CommonJS)

**What it does**:
- Cross-platform file I/O: readFile, writeFile, appendFile, replaceInFile
- Directory management: ensureDir, findFiles
- Date/time helpers
- Git utilities: isGitRepo, getGitModifiedFiles
- Hook I/O: readStdinJson, log, output
- Command execution: runCommand, commandExists

**Target gap**: cc-workflows hooks are bash-based. Session hooks use bash `lib/status-helpers.sh`.

**Adaptation needed**:
- **Open Question 1 from whiteboard**: Should utils.js be ported as standalone lib or merged?
- Only the instinct CLI (JS) needs utils.js functionality
- Bash hooks don't need it — they have their own patterns
- **Recommendation**: Port only the subset needed by instinct-cli.js (readFile, writeFile, appendFile, ensureDir, findFiles). Don't port the full library.

---

## Target System Context

### Existing Hook Infrastructure

| Hook Lifecycle | Existing Hooks | Matchers |
|----------------|---------------|----------|
| SessionStart | session-start.sh | startup\|resume\|clear\|compact |
| UserPromptSubmit | user-prompt-submit.sh | (all) |
| PreToolUse | pre-task-status-reminder.sh | Task |
| PostToolUse | post-task-status-reminder.sh, smart-lint.sh, citation-validator.sh, plan-path-sync.sh, task-status-sync.sh, citation-extractor.sh | Task, Write\|Edit\|MultiEdit, Write\|Edit, TaskCreate\|TaskUpdate, Read |
| Stop | stop-sync.sh | (all) |

### Hook Integration Points

**PreToolUse** — needs new entry with matcher `*` for observe.sh
**PostToolUse** — needs new entry with matcher `*` for observe.sh
**Stop** — optionally add evaluate-session logic

**Conflict risk**: Existing PreToolUse only matches `Task`. Adding `*` matcher is safe — different matcher groups fire independently.

### Existing Storage

```text
.claude/
├── hooks/           # All hook scripts (consolidated)
├── settings.json    # Hook registration
├── skills/          # Skill definitions
├── plans/           # Session plans
├── tasks/           # Session tasks
└── scripts/         # Utility scripts
```

**New addition needed**: `.claude/learned/` directory tree (per PRD storage structure)

---

## Gap Summary

| Component | Source | Target Exists? | Port Action |
|-----------|--------|---------------|-------------|
| observe.sh | Bash+Python | No | Port with path changes, decide on Python dep |
| instinct-cli.py | Python | No | Rewrite to JS |
| observer.md | Markdown | No | Port with path changes |
| start-observer.sh | Bash | No | Port with path changes |
| SKILL.md | Markdown | No | Create adapted version |
| config.json | JSON | No | Port with path/feature changes |
| session-start.js | JS | Partial (bash exists) | OUT OF SCOPE (Phase B) |
| session-end.js | JS | Partial (bash exists) | OUT OF SCOPE (Phase B) |
| evaluate-session.js | JS | No | Port evaluate logic only |
| utils.js | JS | No | Port minimal subset for CLI |
| /learn command | Markdown | No | Create new slash command |
| /instinct-status command | Markdown | No | Create new slash command |
| settings.json registration | JSON | Yes | Add new hook entries |

### Critical Gaps (Must Address in Design)

1. **Python dependency in observe.sh** — Source uses embedded Python3 for JSON parsing. cc-workflows hooks are pure bash. Either keep Python dep or rewrite to jq.
2. **utils.js scope** — Only instinct CLI needs JS utils. Don't port the full library.
3. **evaluate-session integration** — Integrate into existing Stop hook or standalone?
4. **Slash commands vs skills** — `/learn` and `/instinct-status` need to be created as cc-workflows skills (markdown-based).

---

## References

- **Source System**: [[../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1|Phase 1 Whiteboard]]
- **Requirements**: [[../continuous-learning-port-prd|PRD]]%%force-extract%%
