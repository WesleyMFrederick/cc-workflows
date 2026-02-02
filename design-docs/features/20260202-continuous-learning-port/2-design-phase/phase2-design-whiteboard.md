# Phase 2 Design Whiteboard — Continuous Learning Port

**Feature**: Port Continuous Learning from everything-claude-code to cc-workflows
**Phase**: 2 (Research & Design)
**Date**: 2026-02-02

---

## Research Findings

### Source System Architecture

The everything-claude-code continuous learning system (v2) has a clear pipeline:

```text
Tool Call → observe.sh → observations.jsonl → Observer Agent → instincts/personal/*.yaml
                                              ↑
                                         /learn command (manual alternative)
```

**Key insight**: The system separates **deterministic capture** (hooks, 100% reliable) from **probabilistic analysis** (observer agent, pattern detection). This separation is the core architectural strength.

### Source Component Relationships

```text
observe.sh ──writes──→ observations.jsonl ──read by──→ start-observer.sh (daemon)
     │                                                        │
     └──signals──→ .observer.pid (SIGUSR1)                   │
                                                              ▼
                                                    observer.md (Haiku prompt)
                                                              │
                                                              ▼
                                                    instincts/personal/*.yaml
                                                              │
                                                    ┌─────────┼─────────┐
                                                    ▼         ▼         ▼
                                              instinct-cli  /learn   /instinct-status
                                              (status,      (manual  (dashboard)
                                               import,      extract)
                                               export)
```

### Target System Constraints

1. **Hook convention**: cc-workflows hooks are bash scripts in `.claude/hooks/`
2. **Settings structure**: Hook registration via `.claude/settings.json` with matcher-based arrays
3. **Skill convention**: Skills are markdown files in `.claude/skills/<name>/SKILL.md`
4. **No existing learning**: Zero learning infrastructure exists — clean slate
5. **Per-project storage**: PRD mandates `.claude/learned/` not global `~/.claude/`

### cc-workflows Hook Execution Model

From reading `settings.json`:
- Multiple matcher groups can exist per lifecycle event
- Hooks within a group fire sequentially
- Different matcher groups are independent
- `$CLAUDE_PROJECT_DIR` is available as env var in hooks

**Important**: Adding a `*` matcher for observe.sh won't interfere with existing matchers (`Task`, `Write|Edit|MultiEdit`, `Read`, etc.) because they're separate hook entries.

---

## Design Iterations

### Iteration 1: Direct Port (Rejected)

Copy all files, change paths only.

**Problem**: Source uses `~/.claude/homunculus/` (global). PRD requires per-project. Also, utils.js would be ported in full unnecessarily.

### Iteration 2: Minimal Port with Adaptation (Selected)

Port components with these changes:
1. Path adaptation (global → per-project)
2. Python CLI → JS CLI (per NFR5)
3. Minimal utils.js subset
4. Skills instead of slash commands
5. Keep Python in observe.sh (per NFR8 — preserve source scripts)

**Why this works**: Minimizes translation risk while meeting all PRD requirements. The only significant rewrite is instinct-cli.py → .js, which is unavoidable per requirements.

---

## Key Design Patterns Identified

### Pattern: Append-Only Observation Log

Source uses JSONL with append-only writes. This is fast, safe, and enables concurrent access.

```text
observe.sh → echo "$json" >> observations.jsonl   (append)
observer   → read observations.jsonl               (read)
archive    → mv observations.jsonl → archive/      (rotate)
```

**Keep as-is**: This pattern maps directly to cc-workflows with no changes.

### Pattern: YAML Frontmatter Instincts

Instincts use YAML frontmatter + markdown body. The CLI parses this custom format.

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

**Keep as-is**: This format is human-readable, works with the parser, and Claude can easily create/read these files.

### Pattern: Confidence-Weighted Decisions

The confidence model drives behavior:
- `0.3-0.69`: Suggested only
- `0.7+`: Auto-approved
- Increases: `+0.05` per confirming observation
- Decreases: `-0.10` per contradiction, `-0.02` per week decay

**Keep as-is**: Well-designed scoring model. No changes needed.

---

## Unresolved Items

### Performance Profiling Needed

The `*` matcher means observe.sh fires on EVERY tool call. Source claim is <100ms. Need to validate after integration since cc-workflows already has several hooks firing.

**Mitigation**: Profile after first integration. If slow, optimize Python parsing or move to jq.

### Observer Daemon Project Awareness

The daemon runs as a background process. With per-project storage, it needs to know which project's observations to analyze.

**Solution**: Pass `$CLAUDE_PROJECT_DIR` when starting the daemon. PID file stored in project's `.claude/learned/`.

---

## References

- **Gap Analysis**: [[gap-analysis|Gap Analysis]]
- **Solutions Hypothesis**: [[solutions-hypothesis|Solutions Hypothesis]]
- **PRD**: [[../continuous-learning-port-prd|PRD]]
- **Phase 1 Whiteboard**: [[../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1|Phase 1 Whiteboard]]
