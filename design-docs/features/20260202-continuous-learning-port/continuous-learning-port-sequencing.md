# Sequencing Document — Continuous Learning Port

**Feature**: Port Continuous Learning from everything-claude-code to cc-workflows
**Phase**: 3 (Sequencing)
**Date**: 2026-02-02
**Status**: Draft
**Inputs**: [PRD](./continuous-learning-port-prd.md)%%force-extract%%, [Design Doc](./continous-learning-port-design.md)%%force-extract%%, [Phase 2 Whiteboard](./2-design-phase/phase2-design-whiteboard.md), [Phase 3 Whiteboard](./3-sequencing-phase/phase3-sequencing-whiteboard.md)

---

## Sequencing Methodology

**Primary**: User Value — ship what users interact with first to validate core value proposition
**Secondary**: Risk — among equal-value items, validate riskiest assumptions earlier
**Tertiary**: Dependency — hard prerequisites override both above

Each phase is an **experiment** producing evidence. Scored on four dimensions per [Phase 3 Whiteboard](./3-sequencing-phase/phase3-sequencing-whiteboard.md#Experiment-Based%20Prioritization%20Framework):

- **Expected Weight of Evidence** — will competing hypotheses predict different outcomes?
- **Decision Value** — what strategic decisions does the answer unlock?
- **Cost** — what resources does the experiment require?
- **Reversibility** — how bad is failure? Can we roll back?

---

## Hypotheses This Port Must Validate

| ID | Hypothesis | Competing Prediction | If Wrong | Source |
|----|-----------|---------------------|----------|--------|
| H1 | Users will invoke `/learn` to extract patterns mid-session | "Too much friction, nobody uses it" | Core value prop dead | [PRD FR4](./continuous-learning-port-prd.md#^FR4) |
| H1b | Context window retains enough detail for useful extraction | "Summarization loses early patterns" | Mitigation: invoke /learn then **rewind** to backtrack | [Design Doc /learn](./continous-learning-port-design.md#5.%20Skills%20%E2%80%94%20/learn%20and%20/instinct-status), [Phase 3 Whiteboard](./3-sequencing-phase/phase3-sequencing-whiteboard.md#H1b%20validation%20strategy) |
| H2 | Seeing learned instincts motivates continued use | "Users don't check back" | Retention loop broken | [PRD FR6](./continuous-learning-port-prd.md#^FR6) |
| H3 | Automated capture produces observations worth analyzing | "Noise drowns signal" | Pipeline unjustified | [PRD FR1](./continuous-learning-port-prd.md#^FR1), [Design Doc observe.sh](./continous-learning-port-design.md#1.%20observe.sh%20%E2%80%94%20Observation%20Hook) |
| H4 | Background Haiku generates instincts users actually value | "Auto-instincts too generic" | Automation not worth the complexity | [PRD FR7](./continuous-learning-port-prd.md#^FR7), [Design Doc Observer](./continous-learning-port-design.md#6.%20Observer%20Daemon) |
| H5 | Users want to share instincts across projects | "Per-project is enough" | Import/export is waste | [PRD FR8](./continuous-learning-port-prd.md#^FR8) |

---

## Prioritization Matrix

| Experiment | Tests | Weight | Decision Value | Cost | Reversibility | **Priority** |
|-----------|-------|--------|---------------|------|---------------|-------------|
| /learn + foundation | **H1, H1b** | **High** | **Very High** | Low | Good | **1** |
| /instinct-status + CLI status | **H2** | **High** | **High** | Low | Good | **2** |
| observe.sh + hooks | **H3** | **Medium** | **Medium** | Low | Good | **3** |
| Observer daemon POC | **H4** | **High** | **Very High** | Medium | Medium | **4** |
| import/export | **H5** | **Low** | Medium | Low | Good | **5** |
| evaluate-session.sh + prod daemon | -- | **Low** | Low | Low | Good | **6** |

---

## Sequence

### Phase 1: `/learn` Skill + Foundation

**Experiment**: "Do users extract patterns?"
**Gate**: User invokes /learn 3+ times voluntarily
**Validates**: [H1](./3-sequencing-phase/phase3-sequencing-whiteboard.md#Hypotheses%20This%20Port%20Must%20Validate), [H1b](./3-sequencing-phase/phase3-sequencing-whiteboard.md#H1b%20validation%20strategy)
**Validation workflow**: Invoke `/learn` mid-session when patterns are fresh, then **rewind** to backtrack — captures instincts without polluting session

**Why first**: Highest user value. `/learn` is a pure SKILL.md — no scripts, no hooks, no CLI. Claude reads session transcript from context window and writes instinct YAML with Write tool. Cheapest experiment to ship. See [Design Doc /learn](./continous-learning-port-design.md#5.%20Skills%20%E2%80%94%20/learn%20and%20/instinct-status): "Key insight: /learn does NOT read observations.jsonl."

**Components**:

| Component | Source |
|-----------|--------|
| `.claude/skills/learn/SKILL.md` | [Design Doc](./continous-learning-port-design.md#/learn%20Skill) — new, based on source behavior |
| `.claude/skills/continuous-learning/SKILL.md` | [Design Doc](./continous-learning-port-design.md#continuous-learning%20Skill%20(Main%20Entry%20Point)) — system overview |
| `.claude/learned/config.json` | [Design Doc](./continous-learning-port-design.md#7.%20config.json%20%E2%80%94%20Learning%20Pipeline%20Configuration) — adapted from source |
| `.gitignore` update | [Design Doc](./continous-learning-port-design.md#.gitignore) — add `.claude/learned/` |

#### Acceptance Criteria — Phase 1

| AC | Criteria | Traces To | Draft Source |
|----|----------|-----------|--------------|
| ^AC1 | `/learn` skill analyzes current session transcript and identifies extractable patterns (corrections, error resolutions, workflows, preferences) | [FR4](./continuous-learning-port-prd.md#^FR4) | [AC-draft-9](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-9) |
| ^AC2 | `/learn` creates instinct YAML files in `.claude/learned/instincts/personal/` with user approval before writing | [FR4](./continuous-learning-port-prd.md#^FR4), [FR5](./continuous-learning-port-prd.md#^FR5) | [AC-draft-10](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-10) |
| ^AC3 | Instincts stored in YAML format with required fields: id, trigger, confidence, domain, source, action, evidence | [FR5](./continuous-learning-port-prd.md#^FR5) | [AC-draft-11](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-11) |
| ^AC4 | Confidence scoring: +0.05 per confirming observation, -0.10 per contradiction, -0.02 per week decay | [FR5](./continuous-learning-port-prd.md#^FR5) | [AC-draft-12](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-12) |
| ^AC5 | All learned data stored in `.claude/learned/` (not global `~/.claude/`) | [NFR5](./continuous-learning-port-prd.md#^NFR5) | [AC-draft-30](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-30) |
| ^AC6 | `config.json` in `.claude/learned/` for all configurable parameters, with validation warning on stderr and hardcoded defaults as fallback | [NFR7](./continuous-learning-port-prd.md#^NFR7) | [AC-draft-33](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-33), [Design Doc](./continous-learning-port-design.md#7.%20config.json%20%E2%80%94%20Learning%20Pipeline%20Configuration) |
| ^AC7 | `.claude/learned/` added to `.gitignore` — personal learning data not committed | [NFR5](./continuous-learning-port-prd.md#^NFR5) | [Phase 2 Whiteboard](./2-design-phase/phase2-design-whiteboard.md#Resolved%20Open%20Items) |

---



### Phase 2: `/instinct-status` + Instinct CLI (status)

**Experiment**: "Do users come back to check?"
**Gate**: User checks instinct status after learning
**Validates**: [H2](./3-sequencing-phase/phase3-sequencing-whiteboard.md#Hypotheses%20This%20Port%20Must%20Validate)

**Why second**: Completes the user-facing feedback loop. Phase 1 creates instincts; Phase 2 lets users see what they've learned. Together they validate the core value proposition before investing in infrastructure.

**Components**:

| Component | Source |
|-----------|--------|
| `.claude/scripts/instinct-cli.js` (status cmd only) | [Design Doc](./continous-learning-port-design.md#2.%20instinct-cli.js%20%E2%80%94%20Instinct%20Management%20CLI) — port from instinct-cli.py |
| `.claude/scripts/lib/learning-utils.js` | [Design Doc](./continous-learning-port-design.md#3.%20learning-utils.js%20%E2%80%94%20Shared%20JS%20Utilities), [Phase 2 Whiteboard Decision 5](./2-design-phase/phase2-design-whiteboard.md#Decision%205%20Utils%20→%20New%20`.claude/scripts/lib/learning-utils.js`) |
| `.claude/skills/instinct-status/SKILL.md` | [Design Doc](./continous-learning-port-design.md#/instinct-status%20Skill) |

#### Acceptance Criteria — Phase 2

| AC | Criteria | Traces To | Draft Source |
|----|----------|-----------|--------------|
| ^AC8 | `/instinct-status` displays all instincts grouped by domain | [FR6](./continuous-learning-port-prd.md#^FR6) | [AC-draft-14](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-14) |
| ^AC9 | Visual confidence bars shown for each instinct | [FR6](./continuous-learning-port-prd.md#^FR6) | [AC-draft-15](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-15) |
| ^AC10 | Instinct CLI status subcommand written in JavaScript (no Python dependency) | [NFR4](./continuous-learning-port-prd.md#^NFR4) | [AC-draft-28](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-28) |
| ^AC11 | learning-utils.js provides shared file I/O helpers: ensureDir, readFile, writeFile, appendFile, findFiles, log, output | [NFR4](./continuous-learning-port-prd.md#^NFR4) | [Phase 2 Whiteboard Decision 5](./2-design-phase/phase2-design-whiteboard.md#Decision%205%20Utils%20→%20New%20`.claude/scripts/lib/learning-utils.js`) |

---

### Phase 3: observe.sh + Hook Integration

**Experiment**: Enables Phase 4. User-invisible infrastructure.
**Gate**: observations.jsonl captures clean data, no hook conflicts, <50ms per call
**Validates**: [H3](./3-sequencing-phase/phase3-sequencing-whiteboard.md#Hypotheses%20This%20Port%20Must%20Validate)

**Why third**: User-invisible — observe.sh runs silently on every tool call. Doesn't deliver user value directly, but required before testing automated learning (Phase 4). Highest technical risk component. See [PRD Risk 1](./continuous-learning-port-prd.md#Risk%201%20Hook%20Conflicts%20with%20Existing%20cc-workflows%20Hooks) and [Risk 2](./continuous-learning-port-prd.md#Risk%202%20Performance%20Degradation%20from%20Observation%20Overhead).

**Components**:

| Component | Source |
|-----------|--------|
| `.claude/hooks/observe.sh` | [Design Doc](./continous-learning-port-design.md#1.%20observe.sh%20%E2%80%94%20Observation%20Hook), [Phase 2 Whiteboard Decision 1](./2-design-phase/phase2-design-whiteboard.md#Decision%201%20observe.sh%20JSON%20Parsing%20→%20jq) |
| `.claude/settings.json` (3 new hook entries) | [Design Doc](./continous-learning-port-design.md#Integration%20Points), [Phase 2 Whiteboard](./2-design-phase/phase2-design-whiteboard.md#Settings.json%20Integration) |

#### Acceptance Criteria — Phase 3

| AC | Criteria | Traces To | Draft Source |
|----|----------|-----------|--------------|
| ^AC12 | PreToolUse hook captures tool name, input, and session ID as JSONL entries appended to `.claude/learned/observations.jsonl` | [FR1](./continuous-learning-port-prd.md#^FR1) | [AC-draft-1](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-1) |
| ^AC13 | PostToolUse hook captures tool name, output, and timestamp as JSONL entries | [FR1](./continuous-learning-port-prd.md#^FR1) | [AC-draft-2](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-2) |
| ^AC14 | All tools captured — no filtering at capture time (observer/learn phase decides relevance) | [FR1](./continuous-learning-port-prd.md#^FR1) | [Phase 2 Whiteboard](./2-design-phase/phase2-design-whiteboard.md#Resolved%20Open%20Items) — supersedes AC-draft-3 |
| ^AC15 | Observation inputs and outputs truncated to 5KB max per entry | [FR1](./continuous-learning-port-prd.md#^FR1) | [AC-draft-4](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-4) |
| ^AC16 | Auto-archive `observations.jsonl` when file size exceeds 10MB, no data loss during archive | [FR2](./continuous-learning-port-prd.md#^FR2) | [AC-draft-5](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-5), [AC-draft-6](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-6) |
| ^AC17 | observe.sh registered in settings.json PreToolUse and PostToolUse arrays with `*` matcher — fires independently from existing matchers | [FR3](./continuous-learning-port-prd.md#^FR3) | [AC-draft-7](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-7), [Phase 2 Whiteboard](./2-design-phase/phase2-design-whiteboard.md#Settings.json%20Integration) |
| ^AC18 | Existing hooks (citation-validator, plan-path-sync, smart-lint, etc.) continue to fire correctly after integration | [FR3](./continuous-learning-port-prd.md#^FR3) | [AC-draft-8](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-8) |
| ^AC19 | observe.sh completes in under 50ms per call (jq parse + append) | [NFR1](./continuous-learning-port-prd.md#^NFR1) | [Design Doc Success Criteria](./continous-learning-port-design.md#Success%20Criteria) — tightened from AC-draft-25 (100ms) |
| ^AC20 | Append-only writes for observations — no in-place modification of JSONL file | [NFR2](./continuous-learning-port-prd.md#^NFR2) | [AC-draft-26](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-26) |
| ^AC21 | observe.sh written in pure bash + jq (no Python dependency) | [NFR4](./continuous-learning-port-prd.md#^NFR4) | [AC-draft-27](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-27), [Phase 2 Whiteboard Decision 1](./2-design-phase/phase2-design-whiteboard.md#Decision%201%20observe.sh%20JSON%20Parsing%20→%20jq) |
| ^AC22 | Disabled flag: observe.sh checks for `$LEARNED_DIR/disabled` file and exits early if present | [Design Doc](./continous-learning-port-design.md#1.%20observe.sh%20%E2%80%94%20Observation%20Hook) | New — kill switch from design |

---

### Phase 4: Observer Daemon (POC)

**Experiment**: "Are auto-generated instincts useful?"
**Gate**: At least 1 Haiku-generated instinct the user would keep
**Validates**: [H4](./3-sequencing-phase/phase3-sequencing-whiteboard.md#Hypotheses%20This%20Port%20Must%20Validate)

**Why POC first**: High decision value but medium cost. Test whether Haiku analysis of real observations produces instincts worth keeping before productionizing daemon lifecycle. See [Phase 3 Whiteboard](./3-sequencing-phase/phase3-sequencing-whiteboard.md#Sequence) — "Don't production-ize the daemon until we know it works."

**Components**:

| Component | Source |
|-----------|--------|
| `.claude/agents/observer.md` | [Design Doc](./continous-learning-port-design.md#6.%20Observer%20Daemon) — direct port with path changes |
| `.claude/scripts/start-observer.sh` (minimal POC) | [Design Doc](./continous-learning-port-design.md#6.%20Observer%20Daemon), [Phase 2 Whiteboard Decision 6](./2-design-phase/phase2-design-whiteboard.md#Decision%206%20Observer%20Daemon%20→%20Include%20in%20Port) |

#### Acceptance Criteria — Phase 4

| AC | Criteria | Traces To | Draft Source |
|----|----------|-----------|--------------|
| ^AC23 | Observer daemon analyzes observations.jsonl using Haiku model with observer.md prompt | [FR7](./continuous-learning-port-prd.md#^FR7) | [AC-draft-16](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-16) |
| ^AC24 | Detects four pattern types: user corrections, error resolutions, repeated workflows (3+ occurrences), tool preferences | [FR7](./continuous-learning-port-prd.md#^FR7) | [AC-draft-17](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-17), [Design Doc](./continous-learning-port-design.md#6.%20Observer%20Daemon) |
| ^AC25 | Disabled by default (`config.json: observer.enabled: false`) | [FR7](./continuous-learning-port-prd.md#^FR7) | [AC-draft-21](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-21) |
| ^AC26 | Archives processed observations to `.claude/learned/observations.archive/` after analysis | [FR2](./continuous-learning-port-prd.md#^FR2) | [Design Doc Data Flow 3](./continous-learning-port-design.md#Flow%203%20Automated%20Pattern%20Detection%20(observer%20daemon%2C%20opt-in)) |

---

### Phase 5: Import/Export

**Experiment**: "Do users share instincts?"
**Gate**: Only proceed if Phases 1-2 show adoption
**Validates**: [H5](./3-sequencing-phase/phase3-sequencing-whiteboard.md#Hypotheses%20This%20Port%20Must%20Validate)

**Why fifth**: Low expected weight of evidence. Import/export only matters if users are creating instincts they want to share. Gated on Phase 1-2 adoption evidence.

**Components**:

| Component | Source |
|-----------|--------|
| `.claude/scripts/instinct-cli.js` (import + export cmds) | [Design Doc](./continous-learning-port-design.md#2.%20instinct-cli.js%20%E2%80%94%20Instinct%20Management%20CLI) |

#### Acceptance Criteria — Phase 5

| AC | Criteria | Traces To | Draft Source |
|----|----------|-----------|--------------|
| ^AC27 | Instinct CLI import subcommand detects duplicates and updates only if higher-confidence version found | [FR8](./continuous-learning-port-prd.md#^FR8) | [AC-draft-23](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-23) |
| ^AC28 | Export strips sensitive data: actual code, file paths, session IDs, timestamps older than 1 week | [FR8](./continuous-learning-port-prd.md#^FR8) | [AC-draft-24](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-24) |

---

### Phase 6: Production Daemon + Session Evaluation + Docs

**Experiment**: Productionize only with evidence
**Gate**: Only if Phase 4 POC validates H4
**Validates**: Production readiness

**Why last**: Cleanup and hardening. No new user value — makes existing value production-grade.

**Components**:

| Component | Source |
|-----------|--------|
| `.claude/scripts/start-observer.sh` (full production) | [Design Doc](./continous-learning-port-design.md#6.%20Observer%20Daemon) |
| `.claude/hooks/evaluate-session.sh` | [Design Doc](./continous-learning-port-design.md#4.%20evaluate-session.sh%20%E2%80%94%20Session%20Evaluation%20Hook), [Phase 2 Whiteboard Decision 4](./2-design-phase/phase2-design-whiteboard.md#Decision%204%20evaluate-session%20→%20Standalone%20Hook) |

#### Acceptance Criteria — Phase 6

| AC | Criteria | Traces To | Draft Source |
|----|----------|-----------|--------------|
| ^AC29 | observe.sh signals observer daemon via SIGUSR1 when observations written | [FR7](./continuous-learning-port-prd.md#^FR7) | [AC-draft-18](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-18) |
| ^AC30 | Daemon starts/stops cleanly with PID file management | [FR7](./continuous-learning-port-prd.md#^FR7) | [AC-draft-19](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-19) |
| ^AC31 | evaluate-session.sh counts user messages, skips if session < 10 messages | [Design Doc](./continous-learning-port-design.md#4.%20evaluate-session.sh%20%E2%80%94%20Session%20Evaluation%20Hook) | New — from design |
| ^AC32 | evaluate-session.sh optionally kills observer daemon PID on session end | [FR7](./continuous-learning-port-prd.md#^FR7) | [AC-draft-20](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-20) |
| ^AC33 | Port preserves source system patterns with only path and storage location changes (bash/JS as-is, Python CLI → JS only language translation) | [NFR6](./continuous-learning-port-prd.md#^NFR6) | [AC-draft-31](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-31), [AC-draft-32](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-32) |

---

## AC Traceability Summary

### FR Coverage

| FR | Description | ACs | Phase |
|----|-------------|-----|-------|
| [FR1](./continuous-learning-port-prd.md#^FR1) | Capture tool events | AC12-AC15 | 3 |
| [FR2](./continuous-learning-port-prd.md#^FR2) | Storage management | AC16, AC26 | 3, 4 |
| [FR3](./continuous-learning-port-prd.md#^FR3) | Hook integration | AC17, AC18 | 3 |
| [FR4](./continuous-learning-port-prd.md#^FR4) | Manual pattern extraction | AC1, AC2 | 1 |
| [FR5](./continuous-learning-port-prd.md#^FR5) | Instinct persistence | AC3, AC4 | 1 |
| [FR6](./continuous-learning-port-prd.md#^FR6) | Instinct visibility | AC8, AC9 | 2 |
| [FR7](./continuous-learning-port-prd.md#^FR7) | Background detection | AC23-AC26, AC29-AC32 | 4, 6 |
| [FR8](./continuous-learning-port-prd.md#^FR8) | Import/export | AC27, AC28 | 5 |

### NFR Coverage

| NFR | Description | ACs | Phase |
|-----|-------------|-----|-------|
| [NFR1](./continuous-learning-port-prd.md#^NFR1) | Performance | AC19 | 3 |
| [NFR2](./continuous-learning-port-prd.md#^NFR2) | Data integrity | AC20 | 3 |
| [NFR4](./continuous-learning-port-prd.md#^NFR4) | Convention compliance | AC10, AC11, AC21 | 2, 3 |
| [NFR5](./continuous-learning-port-prd.md#^NFR5) | Per-project scoping | AC5, AC7 | 1 |
| [NFR6](./continuous-learning-port-prd.md#^NFR6) | Translation risk | AC33 | 6 |
| [NFR7](./continuous-learning-port-prd.md#^NFR7) | Configuration | AC6 | 1 |

### Draft ACs Superseded

| Draft AC | Superseded By | Reason |
|----------|--------------|--------|
| [AC-draft-3](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-3) | AC14 | [Phase 2 Whiteboard](./2-design-phase/phase2-design-whiteboard.md#Resolved%20Open%20Items) resolved: capture ALL tools, no filter |
| [AC-draft-25](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-25) | AC19 | [Design Doc](./continous-learning-port-design.md#Success%20Criteria) tightened 100ms → 50ms |
| [AC-draft-13](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#^AC-draft-13) | -- | Deferred — auto-application is out of scope per [PRD Non-Goals](./continuous-learning-port-prd.md#Non-Goals) |

---

## Dependency Graph

```text
Phase 1 ─────→ Phase 2 ─────→ Phase 5
(learn+foundation) (status+CLI)    (import/export)
                        │
                        ▼
Phase 3 ─────→ Phase 4 ─────→ Phase 6
(observe.sh)   (daemon POC)    (prod daemon+eval)
```

**Hard dependencies** (solid arrows):
- Phase 2 depends on Phase 1 (instinct format + storage structure)
- Phase 4 depends on Phase 3 (observations.jsonl must exist)
- Phase 5 depends on Phase 2 (extends instinct-cli.js)
- Phase 6 depends on Phase 4 (only productionize if POC validates)

**No dependency**: Phase 1 and Phase 3 can run in parallel if desired.

---

## References

- **PRD**: [Continuous Learning Port PRD](./continuous-learning-port-prd.md)
- **Design Doc**: [Design Document](./continous-learning-port-design.md)
- **Phase 1 Whiteboard**: [Discovery Whiteboard](./1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md) — source system analysis, draft ACs
- **Phase 2 Whiteboard**: [Design Whiteboard](./2-design-phase/phase2-design-whiteboard.md) — design decisions, target system analysis, resolved items
- **Phase 3 Whiteboard**: [Sequencing Whiteboard](./3-sequencing-phase/phase3-sequencing-whiteboard.md) — methodology discussion, experiment framework, hypothesis development
- **Source Research**: [Session c0b6ce1f](../20260202-agent-output-capture/1-elicit-discover-sense-make-problem-frame/research/agent-output-c0b6ce1f.md) — full source architecture analysis
