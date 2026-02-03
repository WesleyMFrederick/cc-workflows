# Phase 3 Whiteboard — Sequencing: Continuous Learning Port

**Feature**: Continuous Learning Port
**Phase**: 3 (Sequencing)
**Date**: 2026-02-02
**Inputs**: [PRD](../continuous-learning-port-prd.md)%%force-extract%%, [Design Doc](../continous-learning-port-design.md), [Phase 2 Whiteboard](../2-design-phase/phase2-design-whiteboard.md)

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

## Hypotheses This Port Must Validate

| ID | Hypothesis | Competing Prediction | If Wrong |
|----|-----------|---------------------|----------|
| H1 | Users will invoke `/learn` to extract patterns mid-session | "Too much friction, nobody uses it" | Core value prop dead |
| H1b | Context window retains enough detail for useful extraction | "Summarization loses early patterns" | Validation: invoke /learn then rewind |
| H2 | Seeing learned instincts motivates continued use | "Users don't check back" | Retention loop broken |
| H3 | Automated capture produces observations worth analyzing | "Noise drowns signal" | Pipeline unjustified |
| H4 | Background Haiku generates instincts users actually value | "Auto-instincts too generic" | Automation not worth the complexity |
| H5 | Users want to share instincts across projects | "Per-project is enough" | Import/export is waste |

---

## Prioritization Matrix

| Experiment | Tests | Weight | Decision Value | Cost | Reversibility | **Priority** |
|-----------|-------|--------|---------------|------|---------------|-------------|
| /learn + foundation | **H1, H1b** | **High** | **Very High** | Low | Good | **1** |
| /instinct-status + CLI status | **H2** | **High** | **High** | Low | Good | **2** |
| observe.sh + hooks | **H3** | **Medium** | **Medium** | Low | Good | **3** |
| Observer daemon POC | **H4** | **High** | **Very High** | Medium | Medium | **4** |
| import/export | **H5** | **Low** | Medium | Low | Good | **5** |
| evaluate-session.sh | -- | **Low** | Low | Low | Good | **6** |

---

## Sequence

| Phase | Ship | Evidence We Get | Gate |
|-------|------|----------------|------|
| **1** | `/learn` skill + foundation (config, instinct format, .gitignore) | **"Do users extract patterns?"** Validate with /learn then rewind workflow | Proceed if: user invokes /learn 3+ times voluntarily |
| **2** | `/instinct-status` + instinct-cli.js status | **"Do users come back to check?"** | Proceed if: user checks status after learning |
| **3** | observe.sh + settings.json hooks | **Enables Phase 4.** User-invisible infrastructure | Proceed if: observations.jsonl captures clean data, no hook conflicts |
| **4** | Observer daemon POC | **"Are auto-generated instincts useful?"** | Proceed if: 1+ Haiku-generated instinct user would keep |
| **5** | import/export | **"Do users share instincts?"** | Only if Phases 1-2 show adoption |
| **6** | evaluate-session.sh + production daemon + docs | **Cleanup.** Productionize only with evidence | Only if Phase 4 POC validates H4 |

---

## Design Insights

### /learn has no script dependencies

From design doc: `/learn` is a pure SKILL.md file. Claude reads the session transcript directly from context window — no JS, no bash, no CLI. Only dependency is `.claude/learned/instincts/personal/` directory and instinct YAML format definition.

This makes it the cheapest experiment to ship first.

### H1b validation strategy

Context window may lose early session patterns due to summarization. Mitigation: user invokes `/learn` mid-session when patterns are fresh, then uses **rewind** to backtrack — captures instincts without polluting the session with /learn interaction.

### observe.sh is user-invisible infrastructure

observe.sh silently records every tool call to JSONL. Users never interact with it. It only matters for the observer daemon (Phase 4). This is why it drops to Phase 3 despite being the highest technical risk — user value comes first, and /learn doesn't depend on it.

---

## Resolved from Prior Phases

- **learning-utils.js** — NOT needed for /learn skill. /learn uses Claude's Write tool directly. learning-utils.js is a dependency of instinct-cli.js only (Phase 2 experiment). See [Design Doc Component 3](../continous-learning-port-design.md#3.%20learning-utils.js%20%E2%80%94%20Shared%20JS%20Utilities).
- **Instinct quality criteria** — Defined in [Design Doc Component 6](../continous-learning-port-design.md#6.%20Observer%20Daemon): user corrections = high-confidence, error resolutions, repeated workflows (3+ occurrences), tool preferences.

## Next Step

- [ ] Write formal sequencing document with `^AC` anchors and FR traceability (ACs are formalized HERE in Phase 3, per workflow)
