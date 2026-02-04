# Phase 3 Whiteboard — Sequencing: Continuous Learning Port

**Feature**: Continuous Learning Port
**Phase**: 3 (Sequencing)
**Date**: 2026-02-02
**Inputs**:
- [PRD](../continuous-learning-port-prd.md)%%force-extract%%
- [Phase 2 Whiteboard](../2-design-phase/phase2-design-whiteboard.md)
- [Spec](../continuous-learning-port-spec.md)%%force-extract%%

---

## Sequencing Methodology Discussion

### Question: What methodology for ordering work?

**Options considered:**

1. **Risk-based + dependencies** — Order by technical risk first, respecting hard dependencies. Proves observe.sh early since it's highest technical risk (every tool call, hook conflicts).
2. **Dependency-only (bottom-up)** — Pure dependency ordering. Simpler but doesn't prioritize risk validation.
3. **Value-based (user-facing first)** — Ship what users can use soonest. Riskier technically but validates user value fast.

### Decision: Value-based with experiment framework

**Rationale:** Treat each phase as an experiment. User value is the primary hypothesis we need to validate — "do users actually want this?" is the riskiest question.

### Experiment-Based Prioritization Framework

Each build phase is an experiment producing evidence. Score on four dimensions:

| Dimension | Question |
|-----------|----------|
| **Expected Weight of Evidence** | Will competing hypotheses predict different outcomes? |
| **Decision Value** | What strategic decisions does the answer unlock? |
| **Cost** | What resources does the experiment require? |
| **Reversibility** | How bad is failure? Can we roll back? |

**Prioritization formula:** High Priority = High Expected Weight + High Decision Value + Acceptable Cost + Good Reversibility

**Primary lens: USER VALUE** — the most important impact we want quick feedback on.

---

## Build Phases

### Phase 1: Foundation + Observation Capture

**Goal:** Prove tool capture works without breaking existing hooks or impacting performance.

**Components:**
- `config.json` (COPY+MODIFY) — foundation for all components
- `observe.sh` (REWRITE) — Python→jq, core capture mechanism
- `settings.json` updates — hook registration for PreToolUse/PostToolUse
- `.gitignore` update — exclude `.claude/learned/`

**Validates:**
- observations.jsonl populates with tool events
- No performance degradation (<100ms per hook)
- Existing hooks still fire correctly

**Risk:** Medium — observe.sh jq rewrite is highest technical risk. Validate early.

---

### Phase 2: Observer Daemon (Automatic Instinct Creation)

**Goal:** Prove automatic pattern detection creates instincts from observations.

**Components:**
- `start-observer.sh` (COPY+MODIFY) — daemon lifecycle management
- `observer.md` (COPY+MODIFY) — Haiku agent prompt
- `evaluate-session.sh` (REWRITE) — JS→Bash, Stop hook cleanup

**Validates:**
- Instinct YAML files appear in `.claude/learned/instincts/personal/`
- Daemon starts/stops cleanly with PID management
- Stop hook kills daemon on session end

**Risk:** Low — mostly path changes, daemon already proven in source.

**Dependency:** Phase 1 (needs observations.jsonl to analyze)

---

### Phase 3: Visibility (User Dashboard)

**Goal:** Users can see learned instincts with confidence bars.

**Components:**
- `learning-utils.js` (NEW) — JS file I/O utilities
- `instinct-cli.js` (TRANSLATE) — Python→JS, status subcommand
- `instinct-status` skill (NEW) — `/instinct-status` entry point

**Validates:**
- `/instinct-status` displays instincts grouped by domain
- Confidence bars render correctly
- CLI runs without errors

**Risk:** Medium — 494-line Python→JS translation.

**Dependency:** Phase 2 (needs instincts to display)

---

### Phase 4: Evolution + Portability

**Goal:** Full pipeline — instincts become skills, import/export works.

**Components:**
- `instinct-cli.js` evolve subcommand
- `instinct-cli.js` import/export subcommands
- `evolve` skill (ADAPT) — `/evolve` entry point

**Validates:**
- `/evolve` clusters 3+ related instincts into skills
- Export strips sensitive data
- Import deduplicates, merges higher-confidence

**Risk:** Low — building on proven CLI from Phase 3.

**Dependency:** Phase 3 (extends instinct-cli.js)

---

## Formalized Acceptance Criteria

> Anchored with `^ACn` for traceability. Each AC links to FR from [PRD](../continuous-learning-port-prd.md).

### Phase 1: Foundation + Observation Capture

- AC1: PreToolUse hook captures tool name, input, session ID as JSONL entries appended to `.claude/learned/observations.jsonl` ([[../continuous-learning-port-prd#^FR1|FR1]]) ^AC1
- AC2: PostToolUse hook captures tool name, output, timestamp as JSONL entries appended to `.claude/learned/observations.jsonl` ([[../continuous-learning-port-prd#^FR1|FR1]]) ^AC2
- AC3: ALL tools captured via `*` matcher — analysis phase decides relevance ([[../continuous-learning-port-prd#^FR1|FR1]]) ^AC3
- AC4: Observation inputs/outputs truncated to 5KB max per entry ([[../continuous-learning-port-prd#^FR2|FR2]]) ^AC4
- AC5: Auto-archive `observations.jsonl` to `.claude/learned/observations.archive/` when file exceeds 10MB ([[../continuous-learning-port-prd#^FR2|FR2]]) ^AC5
- AC6: No data loss during archive operation ([[../continuous-learning-port-prd#^NFR2|NFR2]]) ^AC6
- AC7: observe.sh registered in `.claude/settings.json` PreToolUse and PostToolUse arrays ([[../continuous-learning-port-prd#^FR3|FR3]]) ^AC7
- AC8: Existing hooks (citation-validator, plan-path-sync, etc.) continue to fire correctly ([[../continuous-learning-port-prd#^FR3|FR3]]) ^AC8
- AC9: Observation hooks complete in under 100ms ([[../continuous-learning-port-prd#^NFR1|NFR1]]) ^AC9
- AC10: Append-only writes for observations — no in-place modification ([[../continuous-learning-port-prd#^NFR2|NFR2]]) ^AC10
- AC11: Observation hook written in bash with jq (no python3) ([[../continuous-learning-port-prd#^NFR4|NFR4]]) ^AC11
- AC12: All learned data stored in `.claude/learned/` (not global `~/.claude/`) ([[../continuous-learning-port-prd#^NFR5|NFR5]]) ^AC12
- AC13: `config.json` in `.claude/learned/` for all configurable parameters ([[../continuous-learning-port-prd#^NFR7|NFR7]]) ^AC13

### Phase 2: Observer Daemon

- AC14: Observer daemon analyzes observations at configurable interval using Haiku model ([[../continuous-learning-port-prd#^FR7|FR7]]) ^AC14
- AC15: Detects four pattern types: user corrections, error resolutions, repeated workflows (3+), tool preferences ([[../continuous-learning-port-prd#^FR7|FR7]]) ^AC15
- AC16: System signals daemon via SIGUSR1 when new observations written ([[../continuous-learning-port-prd#^FR7|FR7]]) ^AC16
- AC17: Daemon starts/stops cleanly with PID file management ([[../continuous-learning-port-prd#^FR7|FR7]]) ^AC17
- AC18: Stop hook kills daemon ([[../continuous-learning-port-prd#^FR7|FR7]]) ^AC18
- AC19: Disabled by default, opt-in via config ([[../continuous-learning-port-prd#^FR7|FR7]]) ^AC19
- AC20: Instincts stored in YAML format with required fields: id, trigger, confidence, domain, source, action, evidence ([[../continuous-learning-port-prd#^FR5|FR5]]) ^AC20
- AC21: Confidence scoring: +0.05 per confirming observation, -0.10 per contradiction, -0.02 per week decay ([[../continuous-learning-port-prd#^FR5|FR5]]) ^AC21
- AC22: Confidence ≥ 0.7 = auto-applied; below = suggested only ([[../continuous-learning-port-prd#^FR5|FR5]]) ^AC22

### Phase 3: Visibility

- AC23: `/instinct-status` skill displays all instincts grouped by domain ([[../continuous-learning-port-prd#^FR6|FR6]]) ^AC23
- AC24: Visual confidence bars shown for each instinct ([[../continuous-learning-port-prd#^FR6|FR6]]) ^AC24
- AC25: Instinct CLI (JS) supports status subcommand ([[../continuous-learning-port-prd#^FR6|FR6]]) ^AC25
- AC26: Instinct CLI written in JavaScript (avoid Python dependency) ([[../continuous-learning-port-prd#^NFR4|NFR4]]) ^AC26
- AC27: All hook scripts located in `.claude/hooks/` ([[../continuous-learning-port-prd#^NFR4|NFR4]]) ^AC27

### Phase 4: Evolution + Portability

- AC28: Instinct CLI supports import and export subcommands ([[../continuous-learning-port-prd#^FR8|FR8]]) ^AC28
- AC29: Import detects duplicates, updates only if higher-confidence version found ([[../continuous-learning-port-prd#^FR8|FR8]]) ^AC29
- AC30: Export strips sensitive data: code, file paths, session IDs, timestamps older than 1 week ([[../continuous-learning-port-prd#^FR8|FR8]]) ^AC30
- AC31: `/evolve` skill clusters 3+ related instincts into discoverable skills ([[../continuous-learning-port-prd#^FR9|FR9]]) ^AC31
- AC32: Generated skills placed in `.claude/learned/evolved/skills/` ([[../continuous-learning-port-prd#^FR9|FR9]]) ^AC32
- AC33: Evolved skills auto-discoverable by Claude via standard skill discovery ([[../continuous-learning-port-prd#^FR9|FR9]]) ^AC33

---

## Risk Summary by Phase

| Phase | Risk Level | Key Risk | Mitigation |
|-------|------------|----------|------------|
| 1 | **Medium** | observe.sh jq rewrite parsing bugs | Test with real Claude hook JSON format |
| 2 | Low | Daemon orphaned processes | PID file + Stop hook cleanup |
| 3 | **Medium** | 494-line Python→JS translation | Function-by-function port with tests |
| 4 | Low | Building on Phase 3 CLI | Incremental extension |

---

## Component Dependency Graph

```text
config.json
    ↓
observe.sh ←── settings.json hooks
    ↓
observations.jsonl
    ↓
┌───────────────────────────────┐
│ start-observer.sh + observer.md │
│ evaluate-session.sh            │
└───────────────────────────────┘
    ↓
instincts/*.yaml
    ↓
learning-utils.js → instinct-cli.js
                        ↓
              ┌─────────┴─────────┐
              ↓                   ↓
    instinct-status skill    evolve skill
```

---

## Next: Implementation Plans

After sequencing approval, create Phase 4 implementation plans per `writing-plans` skill:
- One plan per build phase
- Tasks at 2-5 minute granularity
- ACs become test cases
