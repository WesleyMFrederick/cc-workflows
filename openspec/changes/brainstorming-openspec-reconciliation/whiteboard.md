# brainstorming-openspec-reconciliation — Whiteboard

> **Change:** brainstorming-openspec-reconciliation
> **Domain:** Skills / Workflow orchestration
> **Date:** 2026-02-26

## Original Request

> The brainstorm skill is conflicting with the OpenSpec schema and the CEO output hook. What are all the conflicting directives and workflows we need to clean up?

**Goal:** Reconcile the brainstorming skill, OpenSpec `my-workflow` schema, and CEO output hook so they form a single coherent workflow with no contradictory directives.

---

## Evidence Glossary

| Tag | Meaning |
|-----|---------|
| **[OBS]** | **Observation** — code reviewed, behavior confirmed (cite file:line) |
| **[M]** | **Measured** — quantified data exists (cite command + result) |
| **[F-LK]** | **Fact Locked** — empirical conclusion frozen for analysis |
| **[F-ID]** | **Fact by Identity** — true by definition, math, or structural logic |
| **[A]** | **Assumed** — hypothesis, not yet tested |
| **[C]** | **Constraint** — external requirement, cannot change |
| **[D]** | **Decision** — commitment of a resource (time, effort, scope) |
| **[Q]** | **Question** — open unknown, needs investigation |

---

## Artifacts & Paths

### Documentation

- [brainstorming SKILL.md](/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/.claude/skills/brainstorming/SKILL.md) — 4-phase brainstorming workflow (Prep → Understanding → Exploration → Design Doc) [View](../../../claude/skills/brainstorming/SKILL.md)
- [my-workflow schema.yaml](/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/openspec/schemas/my-workflow/schema.yaml) — 8-artifact OpenSpec workflow (whiteboard → baseline → ideal → delta → proposal → specs → design → tasks)

### Hooks

- `.claude/hooks/user-prompt-submit.sh` — CEO output modulation hook, injected on every user prompt

### Consumers

- [openspec-continue-change SKILL.md](/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/.claude/skills/openspec-continue-change/SKILL.md) — artifact creation skill, reads schema instructions [View](../../../claude/skills/openspec-continue-change/SKILL.md)
- [opsx:new slash command](/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/.claude/commands/opsx/new.md) — creates change directory, called by brainstorming HARD GATE [View](../../../claude/commands/opsx/new.md)

---

## Baseline Bucket

### Three systems claiming overlapping authority

**System 1: Brainstorming skill** — 4-phase lifecycle [OBS: SKILL.md:119-141]
- Prep: `opsx:new` HARD GATE + autonomous recon + whiteboard creation [OBS: SKILL.md:145-173]
- Phase 1: Understanding — "prefer open-ended questions" in gathering mode [OBS: SKILL.md:182]
- Phase 2: Exploration — propose 2-3 approaches, use `AskUserQuestion` [OBS: SKILL.md:202-218]
- Phase 3: Design Presentation — "200-300 words when introducing new material" [OBS: SKILL.md:221]
- Phase 4: Design Documentation — write to `docs/plans/YYYY-MM-DD-<topic>-design.md`, commit to git [OBS: SKILL.md:229-232]
- Progressive Disclosure table says "<150 words per phase" for chat [OBS: SKILL.md:30]

**System 2: OpenSpec my-workflow schema** — 8-artifact dependency chain [OBS: schema.yaml:1-519]
- whiteboard → baseline → ideal → delta → proposal → specs → design → tasks [OBS: schema.yaml:7-512]
- Whiteboard instruction says "Use the /brainstorming skill" [OBS: schema.yaml:12]
- Each artifact has `requires` dependencies that gate progression [OBS: schema.yaml:60,137-138,178-179]
- Design artifact writes to `openspec/changes/<name>/design.md` [OBS: schema.yaml:386]

**System 3: CEO output hook** — injected on every prompt [OBS: user-prompt-submit.sh:1-57]
- "ALWAYS use numbered lists OR AskUserQuestion tool" [OBS: user-prompt-submit.sh:33]
- "Never present options in prose paragraphs" [OBS: user-prompt-submit.sh:34]
- "Keep responses CONCISE and SCANNABLE" [OBS: user-prompt-submit.sh:16]
- "<150 words per phase" is also stated in brainstorming's own Progressive Disclosure table [OBS: SKILL.md:30]

### Identified Conflicts

| # | Conflict | Sources |
|---|----------|---------|
| 1 | Phase 1 says "prefer open-ended questions" vs CEO hook says "ALWAYS use AskUserQuestion" | [OBS: SKILL.md:182] vs [OBS: user-prompt-submit.sh:33] |
| 2 | Phase 3 says "200-300 words" vs Progressive Disclosure table says "<150 words" (internal contradiction) | [OBS: SKILL.md:221] vs [OBS: SKILL.md:30] |
| 3 | Phase 4 writes design to `docs/plans/` vs OpenSpec writes design to `openspec/changes/<name>/design.md` | [OBS: SKILL.md:229] vs [OBS: schema.yaml:386] |
| 4 | Brainstorming has 4 phases vs OpenSpec has 8 artifacts — brainstorming skips baseline through specs | [OBS: SKILL.md:119-141] vs [OBS: schema.yaml:7-512] |
| 5 | Both systems claim full lifecycle ownership (idea → design doc) | [F-LK: derived from conflicts 3+4] |
| 6 | Brainstorming checklist acknowledges `opsx:new` + whiteboard but ignores dependency chain after | [OBS: SKILL.md:135-136] vs [OBS: schema.yaml:60,137-138] |
| 7 | Phase 4 says "commit design document to git before proceeding" — premature if 5 more OpenSpec artifacts remain | [OBS: SKILL.md:232] vs [OBS: schema.yaml:460-512] |
| 8 | `[Q]` items stored in whiteboard buckets (agreed), but no clarity on resolution mechanism — `AskUserQuestion`? Next artifact phase? | [OBS: SKILL.md:172] + [OBS: schema.yaml:55-59] + [OBS: user-prompt-submit.sh:33] |

### Root cause

- Brainstorming skill was written before OpenSpec existed [A]
- `opsx:new` HARD GATE was bolted on later without reconciling phases 2-4 [F-LK: SKILL.md:135 references opsx:new but phases 2-4 have no OpenSpec awareness]
- CEO hook was added independently and conflicts with Phase 1 gathering mode [F-LK: hook has no awareness of brainstorming phases]

---

## Ideal Bucket

- Single coherent workflow from idea → implementation with no contradictory directives [D]
- Brainstorming scoped to what it's good at: recon + understanding + whiteboard creation [D]
- OpenSpec owns the structured artifact progression after whiteboard [D]
- CEO hook rules respected in ALL phases (AskUserQuestion for choices, <150 words in chat) [C: hook is a global constraint]
- [Q] Should brainstorming skill be completely replaced by OpenSpec whiteboard instructions, or should it remain as the "how to do the whiteboard phase" guide?
- [Q] Should the CEO hook's "ALWAYS use AskUserQuestion" override brainstorming's Phase 1 "gathering mode" entirely, or should gathering mode have a carve-out for truly open-ended discovery?

---

## Delta Bucket

- Brainstorming skill needs phases 2-4 removed or redirected to OpenSpec artifacts [D]
- Phase 1 question format needs alignment with CEO hook [D]
- Design doc output path needs to point to OpenSpec change directory, not `docs/plans/` [D]
- Progressive Disclosure table word count needs to be consistent across phases [D]
- [Q] Is this a refactor of the brainstorming skill alone, or does the OpenSpec whiteboard instruction also need changes to absorb brainstorming's Phase 1 guidance?
