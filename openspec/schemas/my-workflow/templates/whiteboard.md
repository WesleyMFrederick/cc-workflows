# {{change-name}} — Whiteboard

> **Change:** {{change-name}}
> **Domain:** {{domain}}
> **Date:** {{date}}

## Original Request

> {{verbatim user request}}

**Goal:** {{synthesized goal statement}}

---

## Evidence Glossary

| Tag | Meaning |
|-----|---------|
| **[OBS]** | **Observation** — code reviewed, behavior confirmed (cite file:line) |
| **[M]** | **Measured** — quantified data exists (cite command + result) |
| **[F-ID]** | **Fact by Identity** — true by definition, math, or structural logic |
| **[F-LK]** | **Fact Locked** — empirical conclusion frozen for analysis |
| **[A]** | **Assumed** — hypothesis, not yet tested |
| **[C]** | **Constraint** — external requirement, cannot change |
| **[D]** | **Decision** — commitment of a resource (time, effort, scope) |
| **[Q]** | **Question** — open unknown, needs investigation |
| **[E]** | **Evidence** — supporting data or artifact |
| **[H]** | **Hypothesis** — testable prediction |
| **[O]** | **Outcome** — result of an action or experiment |
| **[G]** | **Goal** — target objective |
| **[P]** | **Priority** — relative importance ranking |

---

## Artifacts & Paths

### Documentation

<!-- Link every .md file reviewed with markdown links -->
<!-- Use codeblock paths for non-.md files (e.g., `src/foo.ts`) -->

### Source

<!-- Group by concern: CLI, Core, Types, Tests, Hooks, etc. -->
<!-- Include specific line ranges for key sections -->
<!-- Include hooks and consumers — they define constraints -->

---

## Baseline Bucket

<!-- How the system works today. High-level observations, pointers to code,
  initial measurements. Do not go deep — that happens in baseline.md.
  Include [Q] items here for unknowns about the current system. -->

---

## Ideal Bucket

<!-- What the user wants. Target behavior, goals, mockups if provided.
  Capture user intent, not implementation. Deep-dive in ideal.md.
  Include [Q] items here for unknowns about target behavior. -->

---

## Delta Bucket

<!-- Initial notes on what changes. Placeholder — cannot be completed
  until baseline and ideal are done. Deep-dive in delta.md.
  Include [Q] items here for unknowns about what needs to change. -->