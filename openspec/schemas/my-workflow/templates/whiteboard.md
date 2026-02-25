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
| **[O]** | **Observed** — code reviewed, behavior confirmed (cite file:line) |
| **[M]** | **Measured** — quantified data exists (cite command + result) |
| **[F-INF]** | **Fact Inferred** — conclusion from combining O/M evidence |
| **[A]** | **Assumed** — hypothesis, not yet tested |
| **[C]** | **Constraint** — external requirement, cannot change |
| **[D]** | **Decision** — commitment of a resource (time, effort, scope) |
| **[Q]** | **Question** — open unknown, needs investigation |

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