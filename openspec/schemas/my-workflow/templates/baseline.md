# {{change-name}} — Baseline

> **Change:** {{change-name}}
> **Domain:** {{domain}}
> **Date:** {{date}}
> **Evidence taxonomy:** See `whiteboard.md` Evidence Glossary section

---

## Artifacts (minimum set for this baseline)

| Artifact | Path | Role in Baseline |
|----------|------|------------------|
| | | |

---

## Traces

<!-- Write traces FIRST — they are evidence (raw execution records).
  Numbered steps, each tagged with [O: file:line] or [M: command].
  Explicit boundary crossings (HOOK → CLI, RETURN ←──).
  Sub-steps for what happens inside called components.
  See writing-traces skill for gold standard format.
-->

```text
TRACE: <name> (<trigger>)
══════════════════════════

 1. [O: file.ts:line]
    Step description

 COMPONENT A → COMPONENT B (boundary crossing)
 ──────────────────────────────────────────────
 2. [O: file.ts:line]
    CALL ──→ target
    │
    │  2a. [O: inner-file.ts:line]
    │      Sub-step inside called component
    │
    RETURN ←── result

══════════════════════════
END TRACE
```

---

## Process Tree

<!-- OPTIONAL — derive FROM traces. This is inference, tagged with [F-INF].
  Omit if the workflow is purely linear (traces alone are sufficient).
  Operators: → sequential, × exclusive choice, ∧ parallel, ↻ redo loop.
  Every branch must reference trace step(s) that evidence it.
-->

```text
```

---

## Measurements

<!-- Quantified current state. Include reproduction commands. -->

---

## Inferred Facts [F-INF]

<!-- Conclusions from combining O/M evidence. Cite source steps/measurements. -->

---

## Constraints [C]

<!-- External requirements that cannot change. Hard boundaries on the delta. -->

---

## Assumptions [A]

<!-- Hypotheses not yet tested. These are risks. -->

---

## Open Questions [Q]

<!-- Unknowns surfaced during baseline work. Resolve before ideal if they affect same-units comparison. -->