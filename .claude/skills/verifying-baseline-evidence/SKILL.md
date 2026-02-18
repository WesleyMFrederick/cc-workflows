---
name: verifying-baseline-evidence
description: Use when writing or reviewing OpenSpec baseline documents to verify every claim is evidence-tagged, properly sourced, and logically sound - catches untagged claims, vague citations, misclassified tags, and broken F-INF derivation chains
---

# Verifying Baseline Evidence

## Overview

Baseline documents are the factual foundation for ideal, delta, and all downstream artifacts. **A weak baseline propagates errors through every artifact that depends on it.** This skill provides a systematic verification pass to ensure every claim is tagged, every tag has valid evidence, and every derivation chain is traceable.

## When to Use

- Writing a new baseline document
- Reviewing an existing baseline before proceeding to ideal
- After editing a baseline — re-verify affected sections

## Evidence Tag Requirements

Each tag type has specific evidence requirements. A claim with the wrong tag or insufficient evidence is **unsound**.

| Tag | Requires | Valid Source Example | Invalid Source Example |
|-----|----------|--------------------|-----------------------|
| **[O]** Observed | file:line in THIS codebase | `[O: extractor.sh:109]` | `[O: Node fetch behavior]` |
| **[M]** Measured | reproduction command + result | `[M: wc -c → 94KB]` | `[M: about 94KB]` |
| **[F-INF]** Inferred | cites specific [O]/[M] it derives from | `[F-INF: from steps 4+9]` | `[F-INF: because it makes sense]` |
| **[A]** Assumed | states what is unknown/untested | `[A: LLM ignores metadata]` | (no invalid form — honesty is valid) |
| **[C]** Constraint | immutable external requirement | `[C: jq required by hook]` | `[C: retry must not add latency]` (this is a design decision) |
| **[D]** Decision | explicit resource commitment | `[D: use --verbose flag]` | (rare in baselines — baselines describe what IS, not what we choose) |
| **[Q]** Question | open unknown needing investigation | `[Q: does header extract use same path?]` | (no invalid form) |

### Critical Distinctions

**[O] vs [A]:** If you didn't read the specific file:line in THIS codebase, it's [A], not [O]. General knowledge about how Node.js or libraries work is [A] unless you verified it in the actual source.

**Secondhand information is [A]:** If someone TOLD you "line 142 uses fetch()", that's [A] until YOU read line 142. Don't invent new tag variants like `[M: provided by context]` — the taxonomy is fixed. Use `[A: reported — not independently verified]` and note the source.

**[C] vs [D]:** Constraints are things you CANNOT change (external APIs, runtime behavior, hook format requirements). If you COULD choose differently, it's a [D]ecision, not a [C]onstraint. Test: "Could a different team reasonably make a different choice here?" If yes → [D].

**[F-INF] derivation rule:** Every F-INF MUST cite specific evidence by reference (step numbers, measurement labels, or [O]/[M] tags). An F-INF that says "because it's obvious" or appeals to general knowledge is NOT an inferred fact — it's an [A]ssumption.

### Writing Mode vs Verify Mode

**When writing a baseline:** Tag as you go. The key discipline is honesty about what you actually observed. If you READ a file → [O]. If you RAN a command and got output → [M]. If you're working from someone else's notes or context → [A]. Promote to [O]/[M] only after you personally verify.

**When verifying a baseline:** Run the 4-pass checklist below. Every finding gets a specific fix recommendation.

## One-Shot: Sound Trace (condensed)

Every step tagged, boundary crossings explicit, F-INF cites step numbers:

```text
TRACE: extractor hook (PostToolUse:Read)
═══════════════════════════════════════

 3. [O: extractor.sh:34-45]
    Resolve: citation-manager binary
    FAIL → exit 0 (silent skip)

 HOOK → CLI (boundary crossing)
 ──────────────────────────────
 6. [O: extractor.sh:92]
    CALL ──→ citation-manager extract links "$file_path"
    │
    │  6d. [O: citation-manager.ts:466]
    │      console.log(JSON.stringify(result, null, 2))
    │      ├── extractedContentBlocks  (50KB)  [M]
    │      ├── outgoingLinksReport     (44KB)  [M]
    │      └── TOTAL: 94KB to stdout           [M]
    │
    RETURN ←── stdout (94KB JSON) + exit code

 9. [O: extractor.sh:109]                    ← KEY LINE
    Parse: jq '.extractedContentBlocks'
    DISCARDS: 44KB (46%)                      [M: 44KB / 94KB]

═══════════════════════════════════════
```

**Sound F-INF from this trace:**
> [F-INF: from steps 6d + 9] The hook receives 94KB but uses only 50KB. The 44KB is pipe waste — CLI serializes it, hook discards via jq.

For the complete 14-step trace with all F-INF derivations, see [trace-reference.md](trace-reference.md).

## Verification Checklist

Run this pass on every baseline document. Go section by section.

### Pass 1: Tag Completeness

Scan every sentence that makes a factual claim. Ask: "Does this have an evidence tag?"

**What counts as a claim:**
- Any statement about how the system works today
- Any number, size, count, percentage
- Any statement about what code does
- Any assertion about behavior, flow, or output

**What does NOT need a tag:**
- Section headers
- Template boilerplate (blockquote metadata, horizontal rules)
- Markdown comments
- Reproduction commands inside code blocks (the measurement itself is tagged, not the command)

### Pass 2: Tag Correctness

For each tagged claim, verify the tag matches the evidence type:

1. **Every [O]** — Does it cite a specific file:line in this codebase? Not a concept, not a library, not general knowledge.
2. **Every [M]** — Does it include a reproduction command (or reference to one in the Measurements section)? Is the actual measured value stated?
3. **Every [F-INF]** — Does it explicitly cite which [O] or [M] evidence it derives from? Can you trace the derivation chain?
4. **Every [C]** — Is this truly immutable? Apply the "could another team choose differently?" test.
5. **Every [A]** — Good. Honest uncertainty is the correct tag for unverified claims.

### Pass 3: Derivation Chain Integrity

For each [F-INF]:
1. Find the cited source evidence
2. Verify the source evidence actually exists in the document
3. Verify the inference logically follows from the cited evidence
4. Check for missing intermediate steps

**Broken chain example:**
> [F-INF: from step 6d] Compact output would save tokens

This jumps from "CLI outputs 94KB" to "compact output saves tokens" without establishing what "compact" means or how token count relates to byte count. Missing intermediate: what gets removed, and how does removal affect token count?

### Pass 4: Open Questions Audit

- "No open questions" in a baseline is a **red flag**. Baselines almost always surface unknowns.
- Check: Are any [A] assumptions actually [Q] questions that should be resolved before ideal?
- Check: Are there ??? markers anywhere that should be in Open Questions?

## Common Rationalizations

| Rationalization | Reality |
|-----------------|---------|
| "The tag type is close enough" | Wrong tag = misleading evidence strength. [O] vs [A] is the difference between verified and guessed. |
| "Everyone knows how fetch() works" | General knowledge is [A]. Only code you READ in THIS repo is [O]. |
| "Context says line 142 uses fetch()" | Secondhand info is [A]. Promote to [O] only after you read line 142 yourself. |
| "I'll create a custom tag for this" | The taxonomy is fixed. No `[M: provided by context]` or `[O: assumed]`. Use [A] with a source note. |
| "The measurement is approximately right" | [M] requires a reproduction command. "About 94KB" is [A]. `wc -c → 94,231 bytes` is [M]. |
| "The constraint is obvious" | If you could choose differently, it's [D]. Constraints are immutable. |
| "F-INF follows logically" | Logical ≠ cited. F-INF must reference specific evidence, not appeal to reasoning. |
| "No open questions — this is straightforward" | Every baseline surfaces unknowns. Zero questions means you stopped looking. |
| "Time pressure — we need to move to ideal" | A weak baseline makes the ideal, delta, and every downstream artifact wrong. 15 min verification saves hours of rework. |

## Red Flags — STOP and Fix

- Claim without any evidence tag
- [O] citing "behavior" or "how X works" instead of file:line
- [M] without reproduction command
- [F-INF] without explicit derivation reference
- [C] that fails the "could another team choose differently?" test
- Empty Open Questions section
- Process tree with untagged steps
- "About", "roughly", "approximately" in measurements without actual measured value

## Quick Reference: Verification Output Format

When reporting verification results, use this structure:

```
## Verification: [document name]

### Tag Completeness: X untagged claims found
- [location]: "claim text" → suggested tag

### Tag Correctness: X misclassified tags found
- [location]: tagged [O] but source is general knowledge → should be [A]

### Derivation Chains: X broken chains found
- [F-INF-N]: cites step X but inference requires step Y (missing)

### Open Questions Audit: X hidden questions found
- [A-N] should be [Q] because: [reason]

### Verdict: SOUND / UNSOUND (with fix list)
```
