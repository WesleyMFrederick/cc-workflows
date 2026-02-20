# evidence-tag-numbering — Baseline

> **Change:** evidence-tag-numbering
> **Domain:** cc-workflows / openspec
> **Date:** 2026-02-19
> **Evidence taxonomy:** See `whiteboard.md` Evidence Glossary section

---

## Artifacts (minimum set for this baseline)

| Artifact | Path | Role in Baseline |
|----------|------|------------------|
| Transcript whiteboard | `openspec/changes/transcript-event-log-extraction/whiteboard.md` | Largest unnumbered artifact (43 tags, 176 lines) — primary specimen |
| Slack-MCP whiteboard | `openspec/changes/slack-mcp-users-search-polish/whiteboard.md` | Shows custom tag extension (`[R]`, `[R-LOCK]`) and mixed escaping |
| Evidence-tag-numbering whiteboard | `openspec/changes/evidence-tag-numbering/whiteboard.md` | Hand-numbered reference — target format with escapes + block anchors |
| Whiteboard template | `openspec/schemas/my-workflow/templates/whiteboard.md` | Glossary table source — defines which tags are "glossary definitions" |
| Baseline template | `openspec/schemas/my-workflow/templates/baseline.md` | Section header labels — defines which tags are "header labels" |
| Schema | `openspec/schemas/my-workflow/schema.yaml` | Evidence taxonomy instructions (lines 20-36), artifact ordering |
| MarkdownParser | `tools/citation-manager/src/core/MarkdownParser/MarkdownParser.ts` | Existing `marked` integration — prior art for AST-based markdown parsing |

---

## Traces

### TRACE: LLM creates evidence tags during artifact authoring (opsx:continue)
```text
TRACE: LLM creates evidence tags during artifact authoring (opsx:continue)
══════════════════════════════════════════════════════════════════════════════

 USER → CLAUDE CODE (skill invocation)
 ─────────────────────────────────────
 1. [O-008: schema.yaml:20-36]
    Schema instruction embeds evidence taxonomy:
    "- **[O]** Observed — code reviewed..."
    "- **[M]** Measured — quantified data..."
    ... (7 tag types total)
    "Rule: No untagged claims."

 2. [O-009: schema.yaml:62-67]
    Baseline artifact instruction says:
    "Use the evidence taxonomy from whiteboard.md. Every claim must be tagged."

 CLAUDE CODE → LLM (artifact generation)
 ────────────────────────────────────────
 3. [O-010: transcript-event-log-extraction/whiteboard.md:19-25]
    LLM writes glossary table with bold tags:
    | **[O]** | **Observed** — code reviewed... |
    | **[M]** | **Measured** — quantified data... |
    (no numbering, no escaping, no block anchors)

 4. [O-011: transcript-event-log-extraction/whiteboard.md:53]
    LLM writes body tag at line start:
    **[O]** Each line in the JSONL is a JSON object...
    (no numbering, no escaping, no block anchor)

 5. [O-012: transcript-event-log-extraction/whiteboard.md:55-58]
    LLM writes body tags mid-line (list items):
    - `type: "user"` — ... **[O]** (line 5, 421, 440)
    - `type: "assistant"` — ... **[O]** (line 6-9...)
    (tags appear after description text, before parenthetical citations)

 6. [O-013: transcript-event-log-extraction/whiteboard.md:169-175]
    LLM writes tags in numbered list context:
    1. **[Q]** What output format?...
    2. **[Q]** Should the extractor live in...
    (tags follow list number prefix)

══════════════════════════════════════════════════════════════════════════════
END TRACE
```

### TRACE: Human hand-numbers tags in evidence-tag-numbering whiteboard (manual)
```text
TRACE: Human hand-numbers tags in evidence-tag-numbering whiteboard (manual)
══════════════════════════════════════════════════════════════════════════════

 1. [O-014: evidence-tag-numbering/whiteboard.md:17-25]
    Glossary definitions use escaped brackets, no numbering:
    | **\[O\]** | **Observed** — ...
    | **\[M\]** | **Measured** — ...

 2. [O-015: evidence-tag-numbering/whiteboard.md:47]
    Body tag hand-numbered with escaped brackets + block anchor:
    **\[O-001\]** Evidence tags appear in 3 distinct... ^O-001

 3. [O-016: evidence-tag-numbering/whiteboard.md:85]
    Ideal bucket tag hand-numbered:
    **\[A-001\]** After running the script... ^A-001

 4. [O-017: evidence-tag-numbering/whiteboard.md:104-108]
    Answered questions show struck-through [Q] + [D] decision:
    **\[Q-002\]** Should it process... ^Q-002
    **\[D-005\]** Whole change directory... ^D-005

══════════════════════════════════════════════════════════════════════════════
END TRACE
```

---

## Process Tree

<!-- Workflow is purely linear (LLM writes → human manually fixes) — traces alone are sufficient. -->

---

## Measurements

##### **[M-001]** The transcript whiteboard contains 43 bold-bracketed tag instances across 176 lines 
- **Repro-steps:** `grep -c '\*\*\[' transcript-event-log-extraction/whiteboard.md`

##### **[M-002]** Tag distribution in transcript whiteboard
- `**[O]**` — 13 usages
- `**[Q]**` — 10 usages
- `**[A]**` — 7 usages
- `**[F-INF]**` — 5 usages
- `**[C]**` — 5 usages
- `**[D]**` — 2 usages
- `**[M]**` — 1 usage
- **Total: 43 body + glossary tags**
- **Repro-Steps:** `grep -oE '\*\*\[[A-Z-]+\]\*\*' ... | sort | uniq -c

Of those 43:
- 7 are glossary table rows (lines 19-25)
- 0 are section header labels (no `## X [TAG]` headings in this artifact)
- **36 are body instances that need numbering**

##### **\[M-003\]** The transcript whiteboard has **0** escaped brackets — all tags use raw `[O]` format
- **Repro-steps:** `grep -c '\\\[' transcript-event-log-extraction/whiteboard.md`

##### **\[M-004\]** The transcript whiteboard has **0** block anchors
- **Repro-steps:** `grep -c '\^[A-Z]' transcript-event-log-extraction/whiteboard.md`

##### **\[M-005\]** The hand-numbered whiteboard has **37** escaped bracket occurrences and **29** block anchors — this is the target format
- **Repro-steps:** `grep -c '\\\[' evidence-tag-numbering/whiteboard.md` and `grep -c '\^[A-Z]' evidence-tag-numbering/whiteboard.md`

##### **\[M-006\]** The slack-mcp whiteboard has **2** escaped bracket occurrences (only in glossary `\[O\]`, `\[R-LOCK\]`) — inconsistent escaping, body tags use raw brackets
- **Repro-steps:** `grep -c '\\\[' slack-mcp-users-search-polish/whiteboard.md`

##### **\[M-007\]** `marked` v17.0.1 is already a project dependency (root + citation-manager workspace)
- **Repro-steps:** `grep -r '"marked"' package.json tools/*/package.json`

---

## Inferred Facts [F-INF]

##### **\[F-INF-001\]** Tags originate as unstructured LLM output — no format enforcement exists
The schema instruction tells the LLM to use the taxonomy but provides no numbering, escaping, or anchor rules. The result is inconsistent: no numbering, no escaping, no block anchors. The 43 tags in the transcript whiteboard are evidence that the LLM follows the "tag everything" instruction but not any formatting discipline.
- [O-010 through O-013: llm creates evidence tags during artifact authoring](#TRACE%20LLM%20creates%20evidence%20tags%20during%20artifact%20authoring%20(opsx%20continue))— Trace 1 steps 3-6
- [M-002](#**%5CM-002%5C]**%20Tag%20distribution%20in%20transcript%20whiteboard) — 43 tags, 7 types, zero formatting

##### **\[F-INF-002\]** Body tags appear in two positions — line-start and mid-line
Tags at line start: `**[O]** Some claim...`. Tags mid-line: `some text **[O]** (citation)`. Lines 55-58 of the transcript whiteboard show 4 mid-line tags used as inline evidence markers at the end of bullet points. The numbering script must handle tags at any position on a line, not just line-start.
- [O-012](#TRACE%20LLM%20creates%20evidence%20tags%20during%20artifact%20authoring%20(opsxcontinue)) — Trace 1 step 5, mid-line tags in list items
  
  [#TRACE%20LLM%20creates%20evidence%20tags%20during%20artifact%20authoring%20(opsx%20continue)]
  [#TRACE%20LLM%20creates%20evidence%20tags%20during%20artifact%20authoring%20(opsxcontinue)]
  

##### **\[F-INF-003\]** Zero consistency in bracket escaping across existing artifacts
Transcript whiteboard: 0 escapes, 0 anchors. Slack-MCP whiteboard: 2 escapes (glossary only), 0 anchors. Evidence-tag-numbering whiteboard (hand-done): 37 escapes, 29 anchors. The script must normalize all these states to the target format.
- [M-003](#**%5CM-003%5C]**%20The%20transcript%20whiteboard%20has%20**0**%20escaped%20brackets) — 0 escapes in transcript 
- [M-004](#**%5CM-004%5C]**%20The%20transcript%20whiteboard%20has%20**0**%20block%20anchors) — 0 anchors in transcript
- [M-005](#**%5CM-005%5C]**%20The%20hand-numbered%20whiteboard%20has%20**37**%20escaped%20bracket) — 37 escapes, 29 anchors in target
- [M-006](#**%5CM-006%5C]**%20The%20slack-mcp%20whiteboard%20has%20**2**%20escaped%20bracket) — 2 escapes, inconsistent

##### **\[F-INF-004\]** The target format has three distinct tag treatments
(1) Glossary rows: `**\[TAG\]**` escaped, no number, no anchor. (2) Section headers: `## Title [TAG]` unescaped, no bold, no number, no anchor. (3) Body instances: `**\[TAG-NNN\]**` escaped, numbered, with `^TAG-NNN` block anchor at line end.
- [O-014](#TRACE:%20Human%20hand-numbers%20tags%20in%20evidence-tag-numbering%20whiteboard) — Trace 2 step 1, glossary format
- [O-015](#TRACE:%20Human%20hand-numbers%20tags%20in%20evidence-tag-numbering%20whiteboard) — Trace 2 step 2, body format with anchor

##### **\[F-INF-005\]** Citation-manager already integrates `marked` for AST parsing
The `MarkdownParser` component demonstrates the project's pattern for markdown AST work (extracting links, headings, anchors). However, it focuses on structural elements, not inline text patterns like bold-wrapped evidence tags.
- [M-007](#**%5CM-007%5C]**%20%60marked%60%20v17.0.1%20is%20already%20a%20project%20dependency) — marked v17 already in workspace
- `tools/citation-manager/src/core/MarkdownParser/MarkdownParser.ts` — existing AST integration

##### **\[F-INF-006\]** No lines in any existing artifact contain multiple bold-wrapped tags on the same line
Lines 55-58 each have one mid-line tag. Q-004 from the whiteboard ("What happens when a tag appears mid-line alongside other tags?") has no evidence of occurring in practice.
- [O-012](#TRACE:%20LLM%20creates%20evidence%20tags%20during%20artifact%20authoring) — mid-line tags are single per line

---

## Constraints [C]

**[C: whiteboard.md C-001]** Obsidian interprets `[text]` as wikilink syntax. Brackets in evidence tags MUST be escaped: `\[` and `\]`. Without escapes, Obsidian renders tags as broken wikilinks.

**[C: schema.yaml:20-36]** The evidence taxonomy defines 7 standard tag types: O, M, F-INF, A, C, D, Q. These are propagated from the whiteboard instruction to all downstream artifacts via "Use the evidence taxonomy from whiteboard.md."

**[C: slack-mcp whiteboard glossary]** The tag set is extensible — individual changes can add custom types (e.g., `[R]`, `[R-LOCK]`). The glossary table in each whiteboard is the authoritative source of valid tag types for that change.

**[C: baseline template lines 69-87]** Section header labels use specific format: `## Inferred Facts [F-INF]`, `## Constraints [C]`, `## Assumptions [A]`, `## Open Questions [Q]`. These are structural markers, not evidence claims — they must not be numbered.

**[C: Obsidian block anchor syntax]** Block anchors use format `^identifier` at line end, preceded by a space. Obsidian uses these for `[[file#^anchor]]` cross-references.

---

## Assumptions [A]

**[A]** The `marked` parser will represent `**[O]**` as a `strong` token containing a `link` child (with `text: "O"` and empty `href`), not as literal text. This is untested — the whiteboard flags this as the primary PoC risk (A-004). If `marked` cannot reliably identify evidence tags in the AST, a regex-based approach on raw text with line-context detection (skip table rows + heading lines) is the fallback.

**[A]** Existing artifacts that have been partially or fully hand-numbered (like the evidence-tag-numbering whiteboard) can be safely renumbered by stripping existing numbers and anchors first (idempotency requirement from whiteboard A-003).

**[A]** The block anchor format `^TAG-NNN` will not collide with any existing Obsidian block anchors in the artifacts. No artifacts currently use block anchors in the tag namespace.

---

## Open Questions [Q]

**[Q]** How does `marked` v17 tokenize `**[O]**`? Is it `strong > link` or `strong > text`? This determines whether AST-based parsing or regex-based parsing is the right approach. Needs a PoC.

**[Q]** Should the script preserve existing hand-numbered tags (e.g., evidence-tag-numbering whiteboard) or always strip-and-renumber? Whiteboard A-003 says idempotent (strip and renumber), but this could disrupt cross-references in other artifacts that link to `^O-001` anchors.

**[Q]** How should the script handle tags inside code blocks (backtick-wrapped)? The whiteboard mentions this: "Tags inside backtick code examples are illustrative and should not be numbered." Need to confirm `marked` fences these appropriately.
